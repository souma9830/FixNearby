import { getRedis } from '../utils/redis.js';

export const CACHE_TTL = {
  WORKER_LIST: 300,
  WORKER_PROFILE: 600,
  CATEGORIES: 3600,
  SEARCH_RESULTS: 120
};

/**
 * CacheService for handling Redis operations with graceful degradation.
 */
class CacheService {
  /**
   * Check if Redis is available.
   * @returns {boolean} True if Redis is available.
   */
  async isAvailable() {
    const redis = await getRedis();
    return redis !== null && redis.status === 'ready';
  }

  /**
   * Get a value from the cache.
   * @param {string} key Cache key.
   * @returns {Promise<any>} The parsed value, or null if not found or error.
   */
  async get(key) {
    try {
      const redis = await getRedis();
      if (!redis) return null;
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set a value in the cache.
   * @param {string} key Cache key.
   * @param {any} value Value to store.
   * @param {number} ttlSeconds Time to live in seconds.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async set(key, value, ttlSeconds) {
    try {
      const redis = await getRedis();
      if (!redis) return false;
      const data = JSON.stringify(value);
      await redis.setex(key, ttlSeconds, data);
      return true;
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Delete a value from the cache.
   * @param {string} key Cache key.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async del(key) {
    try {
      const redis = await getRedis();
      if (!redis) return false;
      await redis.del(key);
      return true;
    } catch (error) {
      console.warn(`Cache del error for key ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Invalidate cache keys matching a pattern.
   * @param {string} pattern Glob pattern for keys.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async invalidatePattern(pattern) {
    try {
      const redis = await getRedis();
      if (!redis) return false;
      
      // Using SCAN to avoid blocking Redis with KEYS
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== '0');
      
      return true;
    } catch (error) {
      console.warn(`Cache invalidatePattern error for pattern ${pattern}:`, error.message);
      return false;
    }
  }
}

const cacheService = new CacheService();
export default cacheService;
