const memoryCache = new Map();

/**
 * Server-Side Response Caching & Redis Query Optimization Middleware
 */
export const cacheResponse = (ttlSeconds = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedEntry = memoryCache.get(key);

    if (cachedEntry && Date.now() < cachedEntry.expiry) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedEntry.data);
    }

    // Intercept res.json to store in cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.setHeader('X-Cache', 'MISS');
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(key, {
          data: body,
          expiry: Date.now() + ttlSeconds * 1000
        });
      }
      return originalJson(body);
    };

    next();
  };
};

export const clearCacheKey = (keyPattern) => {
  for (const key of memoryCache.keys()) {
    if (key.includes(keyPattern)) {
      memoryCache.delete(key);
    }
  }
};
