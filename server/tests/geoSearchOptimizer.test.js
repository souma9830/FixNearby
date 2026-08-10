import { buildGeoSearchPipeline } from '../services/geoSearchOptimizer.js';

function runTests() {
  console.log('Running Geo Search Optimizer Tests...');

  // Test 1: GeoNear Pipeline Generation
  const pipeline = buildGeoSearchPipeline({
    longitude: 77.209,
    latitude: 28.6139,
    radiusKm: 15,
    category: 'Plumbing',
    minRating: 4.0,
    sortBy: 'rating'
  });

  if (!pipeline[0].$geoNear || pipeline[0].$geoNear.maxDistance !== 15000) {
    throw new Error('Test 1 Failed: $geoNear stage not constructed correctly');
  }
  if (!pipeline[1].$match.category || pipeline[1].$match.averageRating.$gte !== 4.0) {
    throw new Error('Test 1 Failed: $match conditions failed');
  }
  console.log('✓ Test 1 Passed: Pipeline stages constructed accurately.');

  console.log('All Geo Search Optimizer tests passed successfully!');
}

runTests();
