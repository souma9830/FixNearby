/**
 * Geofence Breach Auditor Service
 */
export const verifyGeofenceBoundary = (lat, lng, centerLat, centerLng, radiusMeters) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (centerLat * Math.PI) / 180;
  const Δφ = ((centerLat - lat) * Math.PI) / 180;
  const Δλ = ((centerLng - lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));
  const distance = R * c;

  return {
    isInside: distance <= radiusMeters,
    distanceMeters: Math.round(distance),
    breachMeters: distance > radiusMeters ? Math.round(distance - radiusMeters) : 0
  };
};

export const sanitizeCoordinates = (lat, lng) => {
  const nLat = Number(lat);
  const nLng = Number(lng);

  if (isNaN(nLat) || nLat < -90 || nLat > 90) {
    return { valid: false, reason: 'Latitude must be a valid number between -90 and 90' };
  }
  if (isNaN(nLng) || nLng < -180 || nLng > 180) {
    return { valid: false, reason: 'Longitude must be a valid number between -180 and 180' };
  }

  return { valid: true, lat: nLat, lng: nLng };
};
