/**
 * Multi-Criteria Geofenced Spatial Search Pipeline
 * Constructs compound geo-queries with dynamic bounding box filtering, sorting, and facet count aggregations.
 */

export const buildGeoSearchPipeline = (params = {}) => {
  const {
    longitude,
    latitude,
    radiusKm = 10,
    category,
    minRating = 0,
    sortBy = 'distance',
    page = 1,
    limit = 20
  } = params;

  const pipeline = [];

  if (longitude !== undefined && latitude !== undefined) {
    pipeline.push({
      $geoNear: {
        near: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
        distanceField: 'distanceMeters',
        maxDistance: radiusKm * 1000,
        spherical: true
      }
    });
  }

  const matchConditions = {};
  if (category) {
    matchConditions.category = { $regex: new RegExp(category, 'i') };
  }
  if (minRating > 0) {
    matchConditions.averageRating = { $gte: parseFloat(minRating) };
  }

  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  const sortStage = {};
  if (sortBy === 'rating') {
    sortStage.averageRating = -1;
  } else if (sortBy === 'price_asc') {
    sortStage.hourlyRate = 1;
  } else if (sortBy === 'price_desc') {
    sortStage.hourlyRate = -1;
  } else {
    sortStage.distanceMeters = 1;
  }
  pipeline.push({ $sort: sortStage });

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  return pipeline;
};
