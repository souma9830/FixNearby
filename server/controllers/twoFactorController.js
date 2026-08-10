import User from '../models/User.js';
import Worker from '../models/Worker.js';
import jwt from 'jsonwebtoken';
import {
  generateSecret,
  verifyToken,
  generateRecoveryCodes,
} from '../services/twoFactorService.js';
import { writeAuditLog } from '../models/AuditLog.js';

// Helper to determine active account from request (User or Worker)
const getAccountFromReq = async (req) => {
  if (req.user) {
    const user = await User.findById(req.user._id);
    return { account: user, type: 'User' };
  }
  if (req.worker) {
    const worker = await Worker.findById(req.worker._id);
    return { account: worker, type: 'Worker' };
  }
  return { account: null, type: null };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Initiate 2FA Setup (generates TOTP secret & QR Code Data URL)
// @route   POST /api/auth/2fa/setup (or /api/auth/2fa/enable)
// @access  Private (User or Worker)
export const setupTwoFactor = async (req, res) => {
  try {
    const { account, type } = await getAccountFromReq(req);
    if (!account) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { secret, otpauthUrl, qrCodeUrl } = await generateSecret(account.email);

    account.twoFactorTempSecret = secret;
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Scan QR code in your authenticator app (Google Authenticator, Authy, etc.)',
      secret,
      otpauthUrl,
      qrCodeUrl,
    });
  } catch (error) {
    console.error('[twoFactorController] setupTwoFactor error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate 2FA setup' });
  }
};

// @desc    Verify TOTP token and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private (User or Worker)
export const verifyTwoFactorSetup = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Please provide 6-digit authenticator code' });
    }

    const { account, type } = await getAccountFromReq(req);
    if (!account) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const targetSecret = account.twoFactorTempSecret || account.twoFactorSecret;
    if (!targetSecret) {
      return res.status(400).json({ success: false, message: 'No 2FA setup in progress. Please click Enable 2FA first.' });
    }

    const isValid = verifyToken(targetSecret, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid code. Please check your authenticator app and try again.' });
    }

    const recoveryCodes = generateRecoveryCodes();

    account.twoFactorEnabled = true;
    account.twoFactorSecret = targetSecret;
    account.twoFactorTempSecret = '';
    account.twoFactorRecoveryCodes = recoveryCodes;
    await account.save();

    writeAuditLog({
      actorId: account._id,
      actorType: type,
      action: 'TWO_FACTOR_ENABLED',
      resource: type,
      resourceId: account._id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Two-Factor Authentication is now enabled on your account!',
      twoFactorEnabled: true,
      recoveryCodes: recoveryCodes.map((r) => r.code),
    });
  } catch (error) {
    console.error('[twoFactorController] verifyTwoFactorSetup error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify 2FA token' });
  }
};

// @desc    Disable 2FA on account
// @route   POST /api/auth/2fa/disable
// @access  Private (User or Worker)
export const disableTwoFactor = async (req, res) => {
  try {
    const { token, password } = req.body;
    const { account, type } = await getAccountFromReq(req);
    if (!account) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!account.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not currently enabled' });
    }

    // Verify password if provided
    if (password) {
      const isMatch = await account.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect password' });
      }
    }

    // Verify TOTP token or recovery code if token provided
    if (token) {
      const isTotpValid = verifyToken(account.twoFactorSecret, token);
      const cleanToken = String(token).replace(/[\s-]/g, '').toUpperCase();
      const isRecoveryValid = account.twoFactorRecoveryCodes?.some(
        (r) => !r.used && r.code.replace(/[\s-]/g, '').toUpperCase() === cleanToken
      );

      if (!isTotpValid && !isRecoveryValid) {
        return res.status(400).json({ success: false, message: 'Invalid 2FA code or recovery code' });
      }
    }

    account.twoFactorEnabled = false;
    account.twoFactorSecret = '';
    account.twoFactorTempSecret = '';
    account.twoFactorRecoveryCodes = [];
    await account.save();

    writeAuditLog({
      actorId: account._id,
      actorType: type,
      action: 'TWO_FACTOR_DISABLED',
      resource: type,
      resourceId: account._id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
      twoFactorEnabled: false,
    });
  } catch (error) {
    console.error('[twoFactorController] disableTwoFactor error:', error);
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
};

// @desc    Pre-login 2FA challenge (verifies TOTP or recovery code after password check)
// @route   POST /api/auth/2fa/challenge (or /api/auth/2fa/verify-login)
// @access  Public
export const challengeTwoFactorLogin = async (req, res) => {
  try {
    const { userId, userType, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ success: false, message: 'Please provide userId and 2FA code' });
    }

    let account = null;
    let type = userType || 'User';

    if (type === 'Worker') {
      account = await Worker.findById(userId);
    } else {
      account = await User.findById(userId);
      if (!account) {
        account = await Worker.findById(userId);
        if (account) type = 'Worker';
      }
    }

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    if (!account.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled for this account' });
    }

    // 1. Try TOTP token match
    let isValid = verifyToken(account.twoFactorSecret, code);
    let usedRecoveryCode = false;

    // 2. If TOTP failed, try single-use recovery code match
    if (!isValid && account.twoFactorRecoveryCodes?.length) {
      const cleanCode = String(code).replace(/[\s-]/g, '').toUpperCase();
      const codeIndex = account.twoFactorRecoveryCodes.findIndex(
        (r) => !r.used && r.code.replace(/[\s-]/g, '').toUpperCase() === cleanCode
      );

      if (codeIndex >= 0) {
        isValid = true;
        usedRecoveryCode = true;
        account.twoFactorRecoveryCodes[codeIndex].used = true;
        await account.save();
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid authentication code or recovery code' });
    }

    const token = generateToken(account._id);

    writeAuditLog({
      actorId: account._id,
      actorType: type,
      action: usedRecoveryCode ? 'USER_LOGGED_IN_RECOVERY_CODE' : 'USER_LOGGED_IN_2FA',
      resource: type,
      resourceId: account._id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      _id: account._id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      category: account.category,
      role: account.role || (type === 'Worker' ? 'worker' : 'customer'),
      userType: type,
      token,
      usedRecoveryCode,
    });
  } catch (error) {
    console.error('[twoFactorController] challengeTwoFactorLogin error:', error);
    res.status(500).json({ success: false, message: '2FA authentication challenge failed' });
  }
};

// @desc    Get current 2FA status for logged in account
// @route   GET /api/auth/2fa/status
// @access  Private
export const getTwoFactorStatus = async (req, res) => {
  try {
    const { account, type } = await getAccountFromReq(req);
    if (!account) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const recoveryCodesLeft = (account.twoFactorRecoveryCodes || []).filter((c) => !c.used).length;

    res.status(200).json({
      success: true,
      twoFactorEnabled: !!account.twoFactorEnabled,
      recoveryCodesLeft,
    });
  } catch (error) {
    console.error('[twoFactorController] getTwoFactorStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch 2FA status' });
  }
};
