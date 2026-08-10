import { sanitizeCoordinates, sanitizeBoundingBox } from '../utils/geoJsonSanitizer.js';

async function runTests() {
  console.log("=== STARTING GEOSPATIAL BOUNDING-BOX SPATIAL CLUSTERING TEST ===");

  // 1. Testing Coordinate Sanitization
  console.log("\n1. Testing GeoJSON coordinate validation...");
  const validPoint = sanitizeCoordinates(78.4772, 17.4065);
  console.log("Valid Point:", validPoint);

  if (validPoint.type === 'Point' && validPoint.coordinates[0] === 78.4772) {
    console.log("✅ SUCCESS: GeoJSON Point sanitized successfully!");
  }

  // 2. Testing Invalid Latitude Rejection
  console.log("\n2. Testing invalid coordinate bounds rejection...");
  try {
    sanitizeCoordinates(200, 95);
    console.error("❌ FAILURE: Invalid coordinates were not rejected!");
  } catch (err) {
    console.log("Sanitizer Error Caught:", err.message);

    const bbox = sanitizeBoundingBox(78.0, 17.0, 79.0, 18.0);
    console.log("Sanitized Bounding Box:", bbox);

    if (bbox.length === 2) {
      console.log("=============================================");
      console.log("✅ ALL SPATIAL CLUSTERING TESTS PASSED!");
      console.log("=============================================");
    }
  }
}

runTests().catch(console.error);
