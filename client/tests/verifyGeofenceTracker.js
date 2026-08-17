import assert from 'node:assert/strict';
import { haversineDistanceMeters } from '../src/utils/geoUtils.js';

const close = (actual, expected, tolerancePct = 1.0) => {
  const diff = Math.abs(actual - expected) / expected * 100;
  assert.ok(diff <= tolerancePct, `expected ~${expected}m, got ${actual}m (${diff.toFixed(2)}% off)`);
};

// Known reference values from an independent haversine implementation
console.log('1. Zero distance at identical coordinates');
assert.equal(haversineDistanceMeters(-73.9851, 40.7589, -73.9851, 40.7589), 0);

console.log('2. ~111km per degree of latitude (0.5 deg lat)');
close(haversineDistanceMeters(-73.9851, 40.7589, -73.9851, 41.2589), 55573, 0.5);

console.log('3. 1-degree longitude at equator ~111.2km');
close(haversineDistanceMeters(0, 0, 1, 0), 111195, 0.5);

console.log('4. Greenwich-to-New-York reference distance');
close(haversineDistanceMeters(0, 51.4778, -73.9851, 40.7589), 5572388, 1.0);

console.log('5. Symmetry: A->B equals B->A');
const ab = haversineDistanceMeters(10, 20, 30, 40);
const ba = haversineDistanceMeters(30, 40, 10, 20);
assert.ok(Math.abs(ab - ba) < 1, 'haversine must be symmetric');

console.log('6. Southern hemisphere / negative coords sanity');
assert.ok(haversineDistanceMeters(151.2093, -33.8688, 151.2093, -33.8688) === 0, 'zero-distance for negative coords');

console.log('7. Within 500m geofence vs beyond (boundary semantics for check-in)');
const ny = [-73.9851, 40.7589];
const near = haversineDistanceMeters(ny[0], ny[1], ny[0] + 0.001, ny[1]); // ~84m east
const far = haversineDistanceMeters(ny[0], ny[1], ny[0] + 0.05, ny[1]);  // ~4.2km east
assert.ok(near < 500 && far > 500, `near=${near.toFixed(0)}m must be <500, far=${far.toFixed(0)}m must be >500`);

console.log('\nResult: ALL PASS (7 geofence distance checks)');
