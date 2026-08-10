export class SpatialBoundingBoxQueryEngine {
  validateGeoJsonCoordinates(lng, lat) {
    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      throw new Error('Invalid longitude coordinate. Must be between -180 and 180.');
    }
    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      throw new Error('Invalid latitude coordinate. Must be between -90 and 90.');
    }
    return true;
  }

  buildBoxQuery(sw, ne) {
    this.validateGeoJsonCoordinates(sw[0], sw[1]);
    this.validateGeoJsonCoordinates(ne[0], ne[1]);
    return {
      location: {
        $geoWithin: {
          $box: [sw, ne]
        }
      }
    };
  }
}

export default new SpatialBoundingBoxQueryEngine();
