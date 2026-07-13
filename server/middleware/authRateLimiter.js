import rateLimit from "express-rate-limit";

const createRateLimitHandler = (message, retryAfter) => {
  return (req, res) => {
    res.status(429).json({
      success: false,
      message,
      retryAfter: retryAfter || Math.ceil(req.rateLimit?.windowMs / 1000) || 900,
    });
  };
};

const TIER_STANDARD = { windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, skipSuccessfulRequests: true };
const TIER_STRICT  = { windowMs: 60 * 60 * 1000, max: 5,  standardHeaders: true, legacyHeaders: false, skipSuccessfulRequests: true };
const TIER_SEVERE  = { windowMs: 24 * 60 * 60 * 1000, max: 3,  standardHeaders: true, legacyHeaders: false };

export const userLoginLimiter = rateLimit({
  ...TIER_STRICT,
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: createRateLimitHandler(
    "Too many login attempts. Please try again after 15 minutes.", 900
  ),
});

export const workerLoginLimiter = rateLimit({
  ...TIER_STRICT,
  windowMs: 15 * 60 * 1000,
  max: 5000,
  handler: createRateLimitHandler(
    "Too many worker login attempts. Please try again after 15 minutes.", 900
  ),
});

export const userRegisterLimiter = rateLimit({
  ...TIER_SEVERE,
  windowMs: 60 * 60 * 1000,
  max: 3,
  handler: createRateLimitHandler(
    "Too many registration attempts. Please try again after 1 hour.", 3600
  ),
});

export const workerRegisterLimiter = rateLimit({
  ...TIER_SEVERE,
  windowMs: 60 * 60 * 1000,
  max: 3,
  handler: createRateLimitHandler(
    "Too many worker registration attempts. Please try again after 1 hour.", 3600
  ),
});

export const passwordResetLimiter = rateLimit({
  ...TIER_SEVERE,
  windowMs: 60 * 60 * 1000,
  max: 2,
  handler: createRateLimitHandler(
    "Too many password-reset requests from this IP. Please try again after 1 hour.", 3600
  ),
});

export const profileUpdateLimiter = rateLimit({
  ...TIER_STANDARD,
  handler: createRateLimitHandler(
    "Too many profile update requests. Please try again later.", 900
  ),
});

export const logoutLimiter = rateLimit({
  ...TIER_STANDARD,
  max: 20,
  handler: createRateLimitHandler(
    "Too many logout requests.", 900
  ),
});
