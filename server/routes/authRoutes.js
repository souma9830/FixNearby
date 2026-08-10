import { globalApiLimiter } from '../middleware/rateLimiter.js';
import { createSlidingWindowLimiter } from '../middleware/adaptiveRateLimiter.js';
import express from 'express';

import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotUserPassword,
  resetUserPassword,
  forgotWorkerPassword,
  resetWorkerPassword,
  logoutUser,
  updateNotificationPreferences,
  updateUserPresenceStatus,
  getUserActiveStatus
} from '../controllers/authController.js';
import {
  registerWorker,
  loginWorker,
  getWorkerProfile
} from '../controllers/workerController.js';

import {
  setupTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
  challengeTwoFactorLogin,
  getTwoFactorStatus
} from '../controllers/twoFactorController.js';

import {
  protect,
  protectWorker,
} from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

import {
  userLoginLimiter,
  userRegisterLimiter,
  workerLoginLimiter,
  workerRegisterLimiter,
  passwordResetLimiter,
  twoFactorChallengeLimiter,
  profileUpdateLimiter,
  logoutLimiter
} from '../middleware/authRateLimiter.js';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';
import { generateCsrfToken } from '../utils/csrfHelper.js';

// Auth union middleware that checks either user or worker token
const protectAny = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    protect(req, res, (err) => {
      if (!err && req.user) return next();
      protectWorker(req, res, (wErr) => {
        if (!wErr && req.worker) return next();
        return res.status(401).json({ success: false, message: 'Not authorized' });
      });
    });
  } else {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }
};

const router = express.Router();
router.use(globalApiLimiter);

// CSRF token endpoint — used by the client to recover from expired tokens
router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken();
  res.cookie('csrf-token', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: false,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ token });
});

/* USER AUTH ROUTES */

router.post('/register', userRegisterLimiter, validateRegistration, registerUser);
router.post('/login', userLoginLimiter, validateLogin, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, profileUpdateLimiter, updateUserProfile);
router.patch('/preferences/notifications', protect, profileUpdateLimiter, updateNotificationPreferences);
router.post('/logout', protect, logoutLimiter, logoutUser);

/* WORKER AUTH ROUTES */

router.post(
  '/worker/register',
  workerRegisterLimiter,
  upload.single('profilePicture'),
  validateRegistration,
  registerWorker
);

router.post(
  '/worker/login',
  workerLoginLimiter,
  validateLogin,
  loginWorker
);

router.get(
  '/worker/profile',
  protectWorker,
  getWorkerProfile
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotUserPassword
);

router.put(
  '/reset-password/:token',
  passwordResetLimiter,
  resetUserPassword
);

router.post(
  '/worker/forgot-password',
  passwordResetLimiter,
  forgotWorkerPassword
);

router.put(
  '/worker/reset-password/:token',
  passwordResetLimiter,
  resetWorkerPassword
);

/* TWO-FACTOR AUTHENTICATION (2FA) ROUTES */
router.post('/2fa/setup', protectAny, setupTwoFactor);
router.post('/2fa/enable', protectAny, setupTwoFactor);
router.post('/2fa/verify', protectAny, verifyTwoFactorSetup);
router.post('/2fa/disable', protectAny, disableTwoFactor);
router.post('/2fa/challenge', twoFactorChallengeLimiter, challengeTwoFactorLogin);
router.post('/2fa/verify-login', twoFactorChallengeLimiter, challengeTwoFactorLogin);
router.get('/2fa/status', protectAny, getTwoFactorStatus);

/* PRESENCE & ACTIVE STATUS ROUTES */
router.patch('/presence/status', protectAny, updateUserPresenceStatus);
router.get('/presence/active-status/:userId', protectAny, getUserActiveStatus);

export default router;
