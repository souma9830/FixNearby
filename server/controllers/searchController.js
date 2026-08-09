import Worker from '../models/Worker.js';

/**
 * Calculate Haversine distance in kilometers between two coordinates
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

/**
 * Advanced search controller with filtering, sorting, and text search
 */

/**
 * Search workers with advanced filters
 * @route GET /api/search
 * @query {string} q - Search query
 * @query {string} category - Category filter
 * @query {number} minPrice - Minimum price filter
 * @query {number} maxPrice - Maximum price filter
 * @query {number} minRating - Minimum rating filter
 * @query {number} maxDistance - Maximum distance in km
 * @query {string} availability - Availability filter (all, available, busy, offline)
 * @query {string} sort - Sort by (distance, rating, price, availability)
 * @query {number} lat - User latitude for distance calculation
 * @query {number} lon - User longitude for distance calculation
 */
export const searchWorkers = async (req, res) => {
  try {
    const {
      q = '',
      category = 'All',
      minPrice = 0,
      maxPrice = 1000,
      minRating = 0,
      maxDistance = 50,
      availability = 'all',
      sort = 'distance',
      lat,
      lon,
      page = 1,
      limit = 20,
    } = req.query;

    // Build search query
    const searchQuery = {};

    // Text search on name, category, and location
    if (q && q.trim()) {
      searchQuery.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { category: { $regex: q.trim(), $options: 'i' } },
        { location: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      searchQuery.category = { $regex: category, $options: 'i' };
    }

    // Availability filter
    if (availability && availability !== 'all') {
      searchQuery.availabilityStatus = availability;
    }

    // Price range filter
    const minPriceNum = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : 0;
    const maxPriceNum = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : 1000;
    if (minPriceNum > 0 || maxPriceNum < 1000) {
      searchQuery.hourlyRate = { $gte: minPriceNum, $lte: maxPriceNum };
    }

    // Execute query (real filtering/sorting based on stored fields)
    // Worker schema fields used:
    // - category: string
    // - availabilityStatus: available|busy|offline
    // - averageRating: number
    // - location.coordinates: GeoJSON Point => [longitude, latitude]

    const reqLon = req.query.lon || req.query.lng;
    const reqRadius = req.query.maxDistance || req.query.radius || req.query.radiusKm;
    const unitStr = (req.query.unit || req.query.distanceUnit || 'km').toLowerCase();
    const isMiles = unitStr === 'miles' || unitStr === 'mile' || unitStr === 'mi';

    const hasGeo = lat !== undefined && reqLon !== undefined && lat !== '' && reqLon !== '';
    const latNum = hasGeo ? Number(lat) : null;
    const lonNum = hasGeo ? Number(reqLon) : null;

    // Normalize numeric filters (convert miles to km if requested in miles)
    const minRatingNum = minRating !== undefined && minRating !== '' ? Number(minRating) : 0;
    const rawMaxDistance = reqRadius !== undefined && reqRadius !== '' ? Number(reqRadius) : null;
    const maxDistanceKm = rawMaxDistance !== null ? (isMiles ? rawMaxDistance * 1.609344 : rawMaxDistance) : null;

    // Build base workers list
    let workers = [];

    // Real distance using $geoNear when geo coords available
    if (hasGeo) {
      try {
        const pipeline = [
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lonNum, latNum] },
              distanceField: 'distanceKm',
              spherical: true,
              query: searchQuery,
              distanceMultiplier: 0.001, // meters -> km
              ...(maxDistanceKm ? { maxDistance: maxDistanceKm * 1000 } : {}),
            },
          },
        ];

        if (sort === 'rating') {
          pipeline.push({ $sort: { averageRating: -1 } });
        } else if (sort === 'price') {
          pipeline.push({ $sort: { hourlyRate: 1 } });
        }

        pipeline.push({
          $project: {
            name: 1,
            category: 1,
            availabilityStatus: 1,
            bio: 1,
            profilePicture: 1,
            averageRating: 1,
            slaResponseMins: 1,
            serviceCoverage: 1,
            cancellationPolicy: 1,
            refundPolicy: 1,
            verificationStatus: 1,
            contact: 1,
            responsiveness: 1,
            karmaScore: 1,
            experience: 1,
            portfolio: 1,
            certifications: 1,
            faqs: 1,
            location: 1,
            distanceKm: 1,
            hourlyRate: 1,
            services: 1,
          },
        });

        workers = await Worker.aggregate(pipeline);
      } catch (geoErr) {
        console.warn('GeoNear aggregation fallback to standard query:', geoErr.message);
        workers = await Worker.find(searchQuery).lean();
      }
    } else {
      workers = await Worker.find(searchQuery).lean();
    }

    // Dynamic distance calculation & geofence threshold filtering
    workers = workers.map(w => {
      const coords = w.location?.coordinates;
      const workerLat = Array.isArray(coords) && coords.length === 2 ? coords[1] : null;
      const workerLon = Array.isArray(coords) && coords.length === 2 ? coords[0] : null;

      // Preserve distanceKm calculated by $geoNear if present; otherwise compute via Haversine
      let calculatedDist = w.distanceKm;
      if (calculatedDist === undefined || calculatedDist === null) {
        if (hasGeo && workerLat !== null && workerLon !== null) {
          calculatedDist = calculateDistance(latNum, lonNum, workerLat, workerLon);
        }
      }

      const distFixed = calculatedDist !== undefined && calculatedDist !== null && !isNaN(calculatedDist) ? Number(calculatedDist.toFixed(1)) : undefined;

      return {
        ...w,
        id: w._id,
        profession: w.category,
        rating: Number(w.averageRating || 0) || 0,
        distanceKm: distFixed,
        distanceText: distFixed !== undefined ? `${distFixed} km away` : 'Distance unknown',
        mockOffset: workerLat !== null && workerLon !== null ? { lat: workerLat, lon: workerLon } : null,
        coordinates: workerLat !== null && workerLon !== null ? { lat: workerLat, lon: workerLon } : undefined,
      };
    });

    // Geofenced Radius Filter (ensure strict distance cut-off)
    if (hasGeo && maxDistanceKm && maxDistanceKm > 0) {
      workers = workers.filter(w => w.distanceKm !== undefined && !isNaN(w.distanceKm) && w.distanceKm <= maxDistanceKm);
    }

    // Rating filter post-processing
    if (minRatingNum > 0) {
      workers = workers.filter(w => (Number(w.averageRating || w.rating || 0)) >= minRatingNum);
    }

    // Price range filter post-processing
    if (minPriceNum > 0 || maxPriceNum < 1000) {
      workers = workers.filter(w => {
        const rate = Number(w.hourlyRate || 0);
        return rate >= minPriceNum && rate <= maxPriceNum;
      });
    }

    // Availability sort post-processing (since aggregation order-by via enum is not added above)
    if (sort === 'availability') {
      const availabilityOrder = { available: 0, busy: 1, offline: 2 };
      workers.sort((a, b) =>
        availabilityOrder[a.availabilityStatus] - availabilityOrder[b.availabilityStatus]
      );
    }

    // Distance sort (when no geoNear sorting happened)
    if (sort === 'distance' && !hasGeo) {
      // No distance computed without geo coords; keep DB order.
    }

    // Rating sort (when no $geoNear sort happened)
    if (sort === 'rating' && !hasGeo) {
      workers.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    // Price sort by hourlyRate
    if (sort === 'price') {
      if (!hasGeo) {
        workers.sort((a, b) => Number(a.hourlyRate || 0) - Number(b.hourlyRate || 0));
      }
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedWorkers = workers.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: workers.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(workers.length / Number(limit)),
      data: paginatedWorkers,
    });

    return;

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching workers',
      error: error.message,
    });
  }
};

/**
 * Get autocomplete suggestions
 * @route GET /api/search/suggestions
 * @query {string} q - Search query
 */
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q = '' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }

    const query = q.trim();

    // Get unique categories
    const categories = await Worker.distinct('category', {
      category: { $regex: query, $options: 'i' },
    });

    // Get worker names
    const workers = await Worker.find(
      { name: { $regex: query, $options: 'i' } },
      { name: 1 }
    ).limit(5);

    // Get locations
    const locations = await Worker.distinct('location', {
      location: { $regex: query, $options: 'i' },
    });

    // Combine and format suggestions
    const suggestions = [
      ...categories.map(cat => ({ type: 'category', value: cat })),
      ...workers.map(w => ({ type: 'worker', value: w.name })),
      ...locations.slice(0, 3).map(loc => ({ type: 'location', value: loc })),
    ].slice(0, 10);

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions',
      error: error.message,
    });
  }
};

/**
 * Get popular searches
 * @route GET /api/search/popular
 */
export const getPopularSearches = async (req, res) => {
  try {
    // Get most common categories
    const popularCategories = await Worker.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    res.status(200).json({
      success: true,
      popular: popularCategories.map(item => item.category),
    });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular searches',
      error: error.message,
    });
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = (unit === 'miles' || unit === 'mi' || unit === 'mile') ? 3958.8 : 6371; // Earth's radius in miles or km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  // Guard against domain errors (floating point inaccuracies where a > 1 or a < 0)
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
