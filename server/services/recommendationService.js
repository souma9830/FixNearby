import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { getRedis } from '../utils/redis.js';

/**
 * Calculate Haversine distance in kilometers between two geo coordinates
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lat1 === null || lon1 === undefined || lon1 === null ||
      lat2 === undefined || lat2 === null || lon2 === undefined || lon2 === null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  return parseFloat((R * c).toFixed(1));
};

/**
 * AI-Powered Personalization Engine to generate smart worker recommendations.
 * 
 * @param {object} options
 * @param {string} [options.userId] - Optional authenticated user ID
 * @param {number} [options.lat] - User latitude
 * @param {number} [options.lng] - User longitude
 * @param {number} [options.limit=12] - Number of recommendations
 */
export const getSmartRecommendations = async ({ userId, lat, lng, limit = 12 }) => {
  const userLat = lat ? Number(lat) : null;
  const userLng = lng ? Number(lng) : null;

  // 1. Redis Cache Lookup (1-hour TTL)
  const cacheKey = `recommendations:${userId || 'guest'}:${userLat ? userLat.toFixed(2) : '0'}:${userLng ? userLng.toFixed(2) : '0'}`;
  try {
    const redis = await getRedis();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[RecommendationService] Cache HIT for key: ${cacheKey}`);
        return JSON.parse(cached);
      }
    }
  } catch (err) {
    console.warn('[RecommendationService] Redis cache lookup failed:', err.message);
  }

  // 2. Extract User History & Behavior
  let userName = 'Friend';
  let bookedCategoryCounts = {};
  let recentWorkerIds = new Set();
  let topCategory = null;

  if (userId) {
    try {
      const user = await User.findById(userId).select('name');
      if (user) userName = user.name.split(' ')[0];

      const userBookings = await Booking.find({ userId }).sort({ createdAt: -1 }).limit(20);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      userBookings.forEach((booking) => {
        if (booking.service) {
          bookedCategoryCounts[booking.service] = (bookedCategoryCounts[booking.service] || 0) + 1;
        }
        if (booking.workerId) {
          if (new Date(booking.createdAt) >= thirtyDaysAgo) {
            recentWorkerIds.add(booking.workerId.toString());
          }
        }
      });

      // Identify top category
      let maxCount = 0;
      Object.entries(bookedCategoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCategory = cat;
        }
      });
    } catch (err) {
      console.error('[RecommendationService] Error reading user history:', err.message);
    }
  }

  // 3. Query Active Workers
  const workers = await Worker.find({ availabilityStatus: { $ne: 'offline' } })
    .select('name email category experience location averageRating reviewCount contact bio profilePicture availabilityStatus responsiveness karmaScore')
    .lean();

  // If no available workers found, fallback to all workers
  const pool = workers.length > 0 ? workers : await Worker.find({}).lean();

  // 4. Scoring Algorithm (0 - 100)
  const scoredWorkers = pool.map((worker) => {
    const workerIdStr = worker._id.toString();
    const category = worker.category || 'General';

    // A. History Score (0 - 30 pts)
    let historyScore = 0;
    if (topCategory && category.toLowerCase().includes(topCategory.toLowerCase())) {
      historyScore = 30;
    } else if (bookedCategoryCounts[category]) {
      historyScore = 20;
    }

    // B. Location Score (0 - 25 pts)
    let distanceKm = null;
    let locationScore = 12; // default neutral
    if (userLat && userLng && worker.location?.coordinates?.length === 2) {
      const [wLng, wLat] = worker.location.coordinates;
      distanceKm = calculateDistanceKm(userLat, userLng, wLat, wLng);
      if (distanceKm !== null) {
        locationScore = Math.max(0, 25 - distanceKm * 1.5);
      }
    }

    // C. Rating & Review Score (0 - 30 pts)
    const ratingScore = ((worker.averageRating || 4.5) / 5) * 20; // 0 - 20 pts
    const reviewScore = Math.min(10, ((worker.reviewCount || 5) / 20) * 10); // 0 - 10 pts

    // D. Recency Boost (0 - 15 pts)
    let recencyScore = 0;
    if (recentWorkerIds.has(workerIdStr)) {
      recencyScore = 15;
    } else if (topCategory && category.toLowerCase().includes(topCategory.toLowerCase())) {
      recencyScore = 10;
    }

    // Total Score
    const rawScore = historyScore + locationScore + ratingScore + reviewScore + recencyScore;
    const aiScore = Math.min(100, Math.round(rawScore));

    // Match Reasons & Badges
    const matchReasons = [];
    if (recentWorkerIds.has(workerIdStr)) {
      matchReasons.push('Booked Recently');
    }
    if (topCategory && category.toLowerCase().includes(topCategory.toLowerCase())) {
      matchReasons.push(`Top Category: ${category}`);
    }
    if (distanceKm !== null && distanceKm <= 5) {
      matchReasons.push(`Nearby (${distanceKm} km)`);
    }
    if ((worker.averageRating || 0) >= 4.7) {
      matchReasons.push(`${worker.averageRating}★ Highly Rated`);
    }
    if ((worker.reviewCount || 0) >= 20) {
      matchReasons.push('Popular Choice');
    }
    if (matchReasons.length === 0) {
      matchReasons.push('Verified Professional');
    }

    return {
      ...worker,
      id: worker._id.toString(),
      distanceKm,
      aiScore,
      matchReasons,
    };
  });

  // Sort by AI Score descending
  scoredWorkers.sort((a, b) => b.aiScore - a.aiScore);

  // 5. Categorize collections for UI rows
  const becauseYouBooked = scoredWorkers.filter((w) =>
    topCategory ? w.category.toLowerCase().includes(topCategory.toLowerCase()) || bookedCategoryCounts[w.category] : w.aiScore >= 70
  ).slice(0, 6);

  const popularInArea = [...scoredWorkers].sort((a, b) => {
    const distA = a.distanceKm ?? 99;
    const distB = b.distanceKm ?? 99;
    if (distA !== distB) return distA - distB;
    return (b.reviewCount || 0) - (a.reviewCount || 0);
  }).slice(0, 6);

  const topRated = [...scoredWorkers]
    .filter((w) => (w.averageRating || 0) >= 4.5)
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 6);

  // Greeting payload
  const greeting = {
    userName,
    topCategory: topCategory || 'Home Improvement',
    insight: topCategory
      ? `Based on your interest in ${topCategory}, here are top-rated local specialists.`
      : 'Explore top-rated professionals matched to your location and preferences.',
  };

  const responsePayload = {
    success: true,
    greeting,
    becauseYouBooked,
    popularInArea,
    topRated,
    recommended: scoredWorkers.slice(0, limit),
    total: scoredWorkers.length,
  };

  // 6. Cache in Redis (TTL: 1 hour = 3600 seconds)
  try {
    const redis = await getRedis();
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(responsePayload), 'EX', 3600);
      console.log(`[RecommendationService] Cached recommendations for key: ${cacheKey} (TTL: 3600s)`);
    }
  } catch (err) {
    console.warn('[RecommendationService] Failed to set Redis cache:', err.message);
  }

  return responsePayload;
};

export default {
  getSmartRecommendations,
};
