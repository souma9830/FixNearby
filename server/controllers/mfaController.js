import User from '../models/User.js';
import Worker from '../models/Worker.js';
import MfaBackupCode from '../models/MfaBackupCode.js';
import { generateTotpSecret, generateBackupCodes, verifyTotpToken } from '../services/mfaService.js';
import crypto from 'crypto';

// @desc    Setup 2FA TOTP secret & QR code URI
// @route   POST /api/mfa/setup
// @access  Private
export const setupMfa = async (req, res, next) => {
  try {
    const userEmail = req.user.email || 'user@fixnearby.com';
    const { secret, otpauthUrl } = generateTotpSecret(userEmail);

    res.status(200).json({
      success: true,
      secret,
      otpauthUrl,
      message: 'TOTP 2FA secret generated. Scan QR code or enter secret into your Authenticator app.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify TOTP token and enable 2FA on account
// @route   POST /api/mfa/enable
// @access  Private
export const enableMfa = async (req, res, next) => {
  try {
    const { token, secret } = req.body;

    if (!token || !secret) {
      return res.status(400).json({ success: false, message: 'Token and secret are required' });
    }

    const isValid = verifyTotpToken(token, secret);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit TOTP code' });
    }

    // Generate emergency backup codes
    const { rawCodes, hashedCodes } = generateBackupCodes();

    await MfaBackupCode.deleteMany({ userId: req.user._id });
    const backupDocs = hashedCodes.map(hash => ({
      userId: req.user._id,
      codeHash: hash,
      isUsed: false
    }));
    await MfaBackupCode.insertMany(backupDocs);

    // Save secret & enable MFA state
    let account = await User.findById(req.user._id);
    if (account) {
      account.mfaEnabled = true;
      account.mfaSecret = secret;
      await account.save({ validateBeforeSave: false });
    } else {
      account = await Worker.findById(req.user._id);
      if (account) {
        account.mfaEnabled = true;
        account.mfaSecret = secret;
        await account.save({ validateBeforeSave: false });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Multi-Factor Authentication enabled successfully!',
      backupCodes: rawCodes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disable 2FA on account
// @route   POST /api/mfa/disable
// @access  Private
export const disableMfa = async (req, res, next) => {
  try {
    const { token } = req.body;

    let account = await User.findById(req.user._id);
    if (!account) account = await Worker.findById(req.user._id);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.mfaEnabled = false;
    account.mfaSecret = null;
    await account.save({ validateBeforeSave: false });
    await MfaBackupCode.deleteMany({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'MFA 2FA has been disabled for your account.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA TOTP token or backup recovery code during login/action challenge
// @route   POST /api/mfa/verify-challenge
// @access  Private / Public
export const verifyMfaChallenge = async (req, res, next) => {
  try {
    const { code, isBackupCode = false } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'MFA Code is required' });
    }

    if (isBackupCode) {
      const codeHash = crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
      const backupDoc = await MfaBackupCode.findOne({ userId: req.user._id, codeHash, isUsed: false });

      if (!backupDoc) {
        return res.status(400).json({ success: false, message: 'Invalid or already used backup code' });
      }

      backupDoc.isUsed = true;
      backupDoc.usedAt = new Date();
      await backupDoc.save();

      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Backup code accepted. MFA challenge passed.'
      });
    }

    const isValid = verifyTotpToken(code, 'SECRET');
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit TOTP code' });
    }

    res.status(200).json({
      success: true,
      verified: true,
      message: 'MFA TOTP challenge verified successfully.'
    });
  } catch (error) {
    next(error);
  }
};
