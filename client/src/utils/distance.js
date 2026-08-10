/**
 * getDistanceKm
 * Haversine formula – returns distance in km between two lat/lng points.
 */
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  // Validate coordinates boundaries
  if (
    typeof lat1 !== 'number' || isNaN(lat1) || lat1 < -90 || lat1 > 90 ||
    typeof lat2 !== 'number' || isNaN(lat2) || lat2 < -90 || lat2 > 90 ||
    typeof lon1 !== 'number' || isNaN(lon1) || lon1 < -180 || lon1 > 180 ||
    typeof lon2 !== 'number' || isNaN(lon2) || lon2 < -180 || lon2 > 180
  ) {
    console.warn('[Distance Calculation] Invalid coordinate boundaries received:', { lat1, lon1, lat2, lon2 });
    return 0;
  }
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
  return R * c;
};

import { roundTo } from './mathUtils.js';

/**
 * formatDistance
 * Converts km to a human-readable string (e.g. "0.8 km" or "450 m").
 */
export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${roundTo(km, 1)} km`;
};
