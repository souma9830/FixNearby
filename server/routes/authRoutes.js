import { globalApiLimiter } from '../middleware/rateLimiter.js';
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
  logoutUser
} from '../controllers/authController.js';
import {
  registerWorker,
  loginWorker,
  getWorkerProfile
} from '../controllers/workerController.js';

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
  profileUpdateLimiter,
  logoutLimiter
} from '../middleware/authRateLimiter.js';
import { validateRegistration, validateLogin } from '../middleware/validationMiddleware.js';
import { generateCsrfToken } from '../utils/csrfHelper.js';

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

{/* USER AUTH ROUTES */}

router.post('/register', userRegisterLimiter, validateRegistration, registerUser);
router.post('/login', userLoginLimiter, validateLogin, loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, profileUpdateLimiter, updateUserProfile);
router.post('/logout', protect, logoutLimiter, logoutUser);

{/* WORKER AUTH ROUTES */}

// WORKER REGISTER
router.post(
  '/worker/register',
  workerRegisterLimiter,
  upload.single('profilePicture'),
  validateRegistration,
  registerWorker
);

// WORKER LOGIN
router.post(
  '/worker/login',
  workerLoginLimiter,
  validateLogin,
  loginWorker
);

// WORKER PROFILE
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
  resetUserPassword
);

router.post(
  '/worker/forgot-password',
  passwordResetLimiter,
  forgotWorkerPassword
);

router.put(
  '/worker/reset-password/:token',
  resetWorkerPassword
);

export default router;
