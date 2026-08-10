import { checkPasswordStrength } from '../utils/passwordPolicy.js';
import Worker from "../models/Worker.js";
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { writeAuditLog } from '../models/AuditLog.js';
import crypto from "crypto";
import { generateRefreshToken, rotateRefreshToken } from '../services/refreshTokenService.js';

import sendEmail from "../utils/sendEmail.js";
import { queueNotification } from "../utils/queue.js";
// Generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Follows same rules as in already existing login controller
const isValidEmail = (email) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

// Follows same rules as already existing login controller
const isValidPassword = (password) => {
  if (typeof password !== 'string' || password.length < 6) {
    return false;
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

  return passwordRegex.test(password);
};

export const registerUser = async (req, res) => {
  if (!checkPasswordStrength(req.body.password)) { return res.status(400).json({ success: false, message: 'Password is too weak. Must contain uppercase, lowercase, numbers, and symbols.' }); }
  try {
    const { name, email, password, phone } = req.body;
    console.log(`[Security Audit] Registration attempt for email: ${email}`);

    // 1. Check all fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // 2. Name validation
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const normalizedEmail = email.toLowerCase();

    // 4. Password validation
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase and a number"
      });
    }

    // 5. Check existing user
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // 6. Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone ? phone.trim() : undefined,
    });

    // Queue welcome notification job
    await queueNotification('welcome', { userId: user._id, userType: 'User' });

    // Write audit log
    writeAuditLog({
      actorId: user._id,
      actorType: 'User',
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user._id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // 7. Response 
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      notificationPreferences: user.notificationPreferences,
      token: token,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const normalizedEmail = email.toLowerCase();

    // 2. Find user
    const user = await User.findOne({ email: normalizedEmail });

    // 3. Check password
    if (user && (await user.matchPassword(password))) {
      if (user.twoFactorEnabled) {
        return res.status(200).json({
          success: true,
          require2FA: true,
          userId: user._id,
          userType: 'User',
          message: '2FA authentication code required to complete login'
        });
      }

      writeAuditLog({
        actorId: user._id,
        actorType: 'User',
        action: 'USER_LOGGED_IN',
        resource: 'User',
        resourceId: user._id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        notificationPreferences: user.notificationPreferences,
        twoFactorEnabled: !!user.twoFactorEnabled,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    //  No extra DB call (already in req.user)
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      notificationPreferences: req.user.notificationPreferences,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const normalizeNotificationPreferences = (preferences) => {
  const allowed = ['email', 'sms', 'push'];
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
    throw new TypeError('Notification preferences must be an object');
  }

  const entries = Object.entries(preferences).filter(([key]) => allowed.includes(key));
  if (entries.length === 0 || entries.some(([, value]) => typeof value !== 'boolean')) {
    throw new TypeError('At least one boolean notification preference is required');
  }

  return Object.fromEntries(entries);
};

export const updateNotificationPreferences = async (req, res) => {
  let preferences;
  try {
    preferences = normalizeNotificationPreferences(req.body);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const current = user.notificationPreferences?.toObject?.() || user.notificationPreferences || {};
    user.notificationPreferences = { ...current, ...preferences };
    await user.save();

    return res.status(200).json({
      success: true,
      notificationPreferences: user.notificationPreferences,
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    if (req.body.password && !isValidPassword(req.body.password)) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase and a number and be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        notificationPreferences: updatedUser.notificationPreferences,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};




export const forgotUserPassword = async (req, res) => {
  try {
    const brevoConfigured =
      process.env.BREVO_API_KEY &&
      process.env.BREVO_SENDER_EMAIL &&
      process.env.BREVO_SENDER_NAME;

    if (!brevoConfigured) {
      return res.status(503).json({
        success: false,
        message:
          "Password reset email service is not configured.",
      });
    }
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }


    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (user) {
      const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire =
        Date.now() + 15 * 60 * 1000; //15 minutes

      await user.save();

      const resetUrl =
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      await sendEmail({
        toEmail: user.email,
        subject: "Reset Your Password",
        htmlContent: `
          <h2>Password Reset Request</h2>
          <p>Click below to reset your password.</p>
          <a href="${resetUrl}">
            Reset Password
          </a>
          <p>This link expires in 15 minutes.</p>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase and a number and be at least 6 characters long",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired reset token",
      });
    }

    user.password = password;
    user.passwordChangedAt = new Date();

    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


export const forgotWorkerPassword = async (req, res) => {
  try {

    const brevoConfigured =
      process.env.BREVO_API_KEY &&
      process.env.BREVO_SENDER_EMAIL &&
      process.env.BREVO_SENDER_NAME;

    if (!brevoConfigured) {
      return res.status(503).json({
        success: false,
        message:
          "Password reset email service is not configured.",
      });
    }


    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const worker = await Worker.findOne({
      email: email.toLowerCase(),
    });

    if (worker) {
      const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      worker.resetPasswordToken =
        hashedToken;

      worker.resetPasswordExpire =
        Date.now() + 15 * 60 * 1000;

      await worker.save();

      const resetUrl =
        `${process.env.CLIENT_URL}/worker/reset-password/${resetToken}`;

      await sendEmail({
        toEmail: worker.email,
        subject: "Reset Your Password",
        htmlContent: `
          <h2>Password Reset Request</h2>
          <p>Click below to reset your password.</p>
          <a href="${resetUrl}">
            Reset Password
          </a>
          <p>This link expires in 15 minutes.</p>
        `,
      });
    }

    res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, a reset link has been sent.",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};


export const resetWorkerPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase and a number and be at least 6 characters long",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const worker = await Worker.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!worker) {
      return res.status(400).json({
        message:
          "Invalid or expired reset token",
      });
    }

    worker.password = password;
    worker.passwordChangedAt = new Date();

    worker.resetPasswordToken = undefined;
    worker.resetPasswordExpire = undefined;

    await worker.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

import Blacklist from "../models/Blacklist.js";

export const logoutUser = async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(400).json({ success: false, message: "No token provided" });
    }
    
    const decoded = jwt.decode(token);
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Blacklist.create({ token, expiresAt });
    
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during logout"
    });
  }
};

/**
 * REST HTTP fallback to update active presence status and lastActive timestamp.
 * PATCH /api/presence/status
 */
export const updateUserPresenceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['online', 'offline', 'busy', 'available'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status parameter' });
    }

    const userId = req.user?._id || req.worker?._id;
    const isWorker = !!req.worker;
    const lastActive = new Date();

    if (isWorker) {
      const dbStatus = status === 'online' ? 'available' : status;
      await Worker.findByIdAndUpdate(userId, { availabilityStatus: dbStatus, lastActive });
    } else {
      const dbStatus = status === 'available' ? 'online' : status;
      await User.findByIdAndUpdate(userId, { status: dbStatus, lastActive });
    }

    res.status(200).json({
      success: true,
      presence: { userId, status, lastActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch last active status and online state of a user/worker.
 * GET /api/presence/active-status/:userId
 */
export const getUserActiveStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    let target = await User.findById(userId).select('name status lastActive role');
    let userType = 'User';

    if (!target) {
      target = await Worker.findById(userId).select('name availabilityStatus lastActive category');
      userType = 'Worker';
    }

    if (!target) {
      return res.status(404).json({ success: false, message: 'User or Worker not found' });
    }

    const status = userType === 'Worker' ? target.availabilityStatus : target.status;
    const isOnline = status === 'online' || status === 'available';

    res.status(200).json({
      success: true,
      userId,
      userType,
      status,
      isOnline,
      lastActive: target.lastActive
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
