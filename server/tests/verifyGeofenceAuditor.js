import { verifyGeofenceBoundary, sanitizeCoordinates } from '../services/geofenceAuditorService.js';

console.log('=== STARTING GEOFENCE BREACH AUDITOR INTEGRATION TEST ===\n');

// 1. Test coordinate distance inside boundary
console.log('1. Testing coordinate inside 5km geofence radius...');
const insideCheck = verifyGeofenceBoundary(17.4065, 78.4772, 17.4000, 78.4700, 5000);
console.log('Inside Boundary Result:', insideCheck);

if (insideCheck.isInside) {
  console.log('✅ SUCCESS: Location verified inside geofence boundary!');
} else {
  console.error('❌ FAIL: Geofence calculation failed!');
  process.exit(1);
}

// 2. Test breach detection
console.log('\n2. Testing breach detection (location > 10km away)...');
const breachCheck = verifyGeofenceBoundary(17.5000, 78.6000, 17.4000, 78.4700, 5000);
console.log('Breach Check Result:', breachCheck);

if (!breachCheck.isInside && breachCheck.breachMeters > 0) {
  console.log('✅ SUCCESS: Geofence breach detected with breach distance!');
} else {
  console.error('❌ FAIL: Breach detection failed!');
  process.exit(1);
}

// 3. Test invalid coordinates
console.log('\n3. Testing coordinate bounds sanitizer...');
const invalidCoord = sanitizeCoordinates(95, 180);
console.log('Invalid Coord Result:', invalidCoord);

if (!invalidCoord.valid) {
  console.log('✅ SUCCESS: Out of bounds latitude cleanly rejected!');
} else {
  console.error('❌ FAIL: Coordinate sanitizer failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL GEOFENCE AUDITOR TESTS PASSED!');
console.log('=============================================\n');
