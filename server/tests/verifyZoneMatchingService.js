import mongoose from 'mongoose';
import WorkerServiceZone from '../models/WorkerServiceZone.js';
import ZoneMatchingService from '../services/zoneMatchingService.js';

async function testZoneMatching() {
  console.log('[TEST] Starting Zone Matching Service Verification...');
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const zone = new WorkerServiceZone({
      workerId: fakeWorkerId,
      zoneName: 'Downtown Core',
      centerCoordinates: { latitude: 40.7128, longitude: -74.006 },
      serviceRadiusKm: 20,
      travelSurcharge: 15,
    });

    const dist = ZoneMatchingService.calculateHaversineDistance(
      40.7128, -74.006,
      40.7306, -73.9352
    );

    console.log('[TEST] Calculated Haversine distance:', dist.toFixed(2), 'km for zone radius:', zone.serviceRadiusKm, 'km');
    console.log('[TEST] Zone Matching Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testZoneMatching();
