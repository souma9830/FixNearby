import spatialEngine from '../services/spatialBoxQueryService.js';

describe('Spatial Bounding Box Query Engine Test', () => {
  it('should construct MongoDB $geoWithin $box queries cleanly', () => {
    const query = spatialEngine.buildBoxQuery([78, 17], [79, 18]);
    expect(query).toHaveProperty('location.$geoWithin.$box');
  });

  it('should reject out-of-bound latitude/longitude values', () => {
    expect(() => spatialEngine.validateGeoJsonCoordinates(200, 40)).toThrow();
  });
});
