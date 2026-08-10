import rateLimit from 'express-rate-limit';

export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP. Please try again later."
    });
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "TOO_MANY_AUTH_ATTEMPTS",
      message: "Too many login/register attempts. Please try again in 15 minutes."
    });
  }
});

export const bookingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Booking request limit exceeded. Please try again in an hour."
    });
  }
});

