import { ipReputationEngine } from '../services/ipReputationStore.js';

export const createSlidingWindowLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60000;
  const maxRequests = options.maxRequests || 10;

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const reqCount = ipReputationEngine.recordRequest(ip, windowMs);
    const reputation = ipReputationEngine.getReputation(ip);

    // Adjust limit dynamically based on client IP reputation
    const effectiveLimit = Math.floor(maxRequests * reputation);

    res.setHeader('X-RateLimit-Limit', effectiveLimit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, effectiveLimit - reqCount));

    if (reqCount > effectiveLimit) {
      ipReputationEngine.penalize(ip, 0.1);
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Adaptive rate limit exceeded.',
        retryAfterSeconds: Math.ceil(windowMs / 1000)
      });
    }

    next();
  };
};
