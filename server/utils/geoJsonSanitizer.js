/**
 * Sanitizes and validates GeoJSON coordinates (longitude [-180, 180], latitude [-90, 90]).
 */

export const sanitizeCoordinates = (lng, lat) => {
  const numLng = parseFloat(lng);
  const numLat = parseFloat(lat);

  if (isNaN(numLng) || numLng < -180 || numLng > 180) {
    throw new Error('Invalid longitude coordinate. Must be between -180 and 180.');
  }

  if (isNaN(numLat) || numLat < -90 || numLat > 90) {
    throw new Error('Invalid latitude coordinate. Must be between -90 and 90.');
  }

  return {
    type: 'Point',
    coordinates: [numLng, numLat]
  };
};

export const sanitizeBoundingBox = (minLng, minLat, maxLng, maxLat) => {
  const p1 = sanitizeCoordinates(minLng, minLat);
  const p2 = sanitizeCoordinates(maxLng, maxLat);

  return [
    p1.coordinates,
    p2.coordinates
  ];
};
