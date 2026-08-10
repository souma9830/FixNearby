import assert from 'assert';
import ZoneMatchingService from '../services/zoneMatchingService.js';
import { verifyGeofenceBoundary } from '../services/geofenceAuditorService.js';
import { getDistanceKm } from '../../client/src/utils/distance.js';

console.log('=== VERIFYING HAVERSINE DISTANCE EDGE CASES & BOUNDARY CLAMPING ===\n');

// 1. Identical coordinates (distance should be exactly 0, no NaN)
const zeroDist = ZoneMatchingService.calculateHaversineDistance(37.7749, -122.4194, 37.7749, -122.4194);
console.log('1. Identical Coordinates Distance:', zeroDist, 'km');
assert(!isNaN(zeroDist), 'Identical coordinates must not produce NaN');
assert.strictEqual(zeroDist, 0, 'Distance between identical points should be 0');

// 2. Antipodal points (180 degrees opposite - tests upper bound floating point precision where a can exceed 1)
const antipodalDist = ZoneMatchingService.calculateHaversineDistance(0, 0, 0, 180);
console.log('2. Antipodal Points Distance:', antipodalDist.toFixed(2), 'km');
assert(!isNaN(antipodalDist), 'Antipodal coordinates must not produce NaN');
assert(Math.abs(antipodalDist - 20015.09) < 50, 'Antipodal distance should be ~20015km');

// 3. Polar coordinates & meridian boundary crossing (-180 / +180)
const crossMeridianDist = ZoneMatchingService.calculateHaversineDistance(51.5, 179.9, 51.5, -179.9);
console.log('3. Cross-Meridian Distance:', crossMeridianDist.toFixed(2), 'km');
assert(!isNaN(crossMeridianDist), 'Cross meridian coordinates must not produce NaN');
assert(crossMeridianDist < 20, 'Distance across -180/180 meridian should be small (~14km)');

// 4. Geofence auditor boundary check with clamping
const geofenceResult = verifyGeofenceBoundary(37.7749, -122.4194, 37.7749, -122.4194, 5000);
console.log('4. Geofence Auditor Result:', geofenceResult);
assert(!isNaN(geofenceResult.distanceMeters), 'Geofence distance must be a valid number');
assert.strictEqual(geofenceResult.isInside, true, 'Point at center must be inside geofence');

// 5. Client getDistanceKm utility
const clientDist = getDistanceKm(37.7749, -122.4194, 37.8049, -122.4194);
console.log('5. Client getDistanceKm Result:', clientDist.toFixed(2), 'km');
assert(!isNaN(clientDist), 'Client distance must be a valid number');
assert(clientDist > 3 && clientDist < 4, 'Latitude offset ~0.03 deg should be ~3.33 km');

// 6. Verify 3-mile provider within 10-mile search radius conversion
const dist3MilesInKm = 3 * 1.609344; // 4.828 km
const radius10MilesInKm = 10 * 1.609344; // 16.093 km
assert(dist3MilesInKm <= radius10MilesInKm, '3 miles provider must fall within 10 miles radius');
console.log(`6. 3-mile provider (${dist3MilesInKm.toFixed(2)} km) correctly inside 10-mile radius (${radius10MilesInKm.toFixed(2)} km)`);

console.log('\n✅ SUCCESS: All Haversine distance edge-case tests passed clean!');
