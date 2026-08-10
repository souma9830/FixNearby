/**
 * Bounding-Box Spatial Clustering & Worker Density Aggregation Engine.
 */

import Worker from '../models/Worker.js';
import { sanitizeBoundingBox } from '../utils/geoJsonSanitizer.js';

export const computeSpatialWorkerClusters = async (minLng, minLat, maxLng, maxLat) => {
  const bbox = sanitizeBoundingBox(minLng, minLat, maxLng, maxLat);

  // MongoDB $geoWithin $box spatial aggregation query
  const aggregation = await Worker.aggregate([
    {
      $match: {
        location: {
          $geoWithin: {
            $box: bbox
          }
        },
        availabilityStatus: 'available'
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgRating: { $avg: '$averageRating' }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        avgRating: { $round: ['$avgRating', 2] },
        _id: 0
      }
    }
  ]);

  return {
    boundingBox: bbox,
    clusters: aggregation,
    totalAvailableWorkers: aggregation.reduce((acc, curr) => acc + curr.count, 0)
  };
};
