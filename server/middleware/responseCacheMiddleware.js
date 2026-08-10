import cacheService from '../services/cacheService.js';

/**
 * Middleware factory for response caching.
 * @param {number} ttlSeconds Time to live in seconds.
 * @returns {Function} Express middleware function.
 */
export const responseCache = (ttlSeconds) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if requested by client
    if (req.headers['cache-control'] === 'no-cache') {
      return next();
    }

    const key = `${req.method}:${req.originalUrl}:${req.user?.role || 'anonymous'}`;

    try {
      const cachedResponse = await cacheService.get(key);

      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedResponse);
      }

      res.setHeader('X-Cache', 'MISS');

      // Monkey-patch res.json to intercept and cache the response
      const originalJson = res.json;
      res.json = function (body) {
        // Restore original function to avoid recursion or duplicate calls
        res.json = originalJson;

        // Only cache 2xx successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(key, body, ttlSeconds).catch(err => {
            console.error('Error setting cache in middleware:', err);
          });
        }

        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      // Graceful fallback on any cache error
      console.warn('Response cache middleware error:', error.message);
      next();
    }
  };
};

/**
 * Middleware factory for invalidating cache patterns on mutation.
 * @param {string} pattern Pattern to invalidate.
 * @returns {Function} Express middleware function.
 */
export const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    // Invalidate AFTER the request completes successfully
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.invalidatePattern(pattern).catch(err => {
          console.error('Error invalidating cache pattern:', err);
        });
      }
    });
    
    next();
  };
};
