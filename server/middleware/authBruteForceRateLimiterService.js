import rateLimit from 'express-rate-limit';

export const authBruteForceRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default authBruteForceRateLimiter;
