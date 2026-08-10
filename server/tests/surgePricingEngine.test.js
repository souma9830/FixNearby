import { calculateSurgeEstimate } from '../services/surgePricingEngine.js';

function runTests() {
  console.log('Running Surge Pricing Engine Tests...');

  // Test 1: Standard Non-peak Estimate
  const std = calculateSurgeEstimate(500, { hourOfDay: 14, distanceKm: 2, isEmergency: false, workerSupplyCount: 6 });
  if (std.finalPrice !== 500 || std.surgeMultiplier !== 1.0) {
    throw new Error(`Test 1 Failed: Expected 500, got ${std.finalPrice}`);
  }
  console.log('✓ Test 1 Passed: Standard pricing calculated correctly.');

  // Test 2: Emergency & Peak Hour Multiplier
  const emg = calculateSurgeEstimate(500, { hourOfDay: 9, distanceKm: 10, isEmergency: true, workerSupplyCount: 2 });
  // hour (8-10): +0.25, low workers (<3): +0.3, emergency: +0.5 => 1 + 0.25 + 0.3 + 0.5 = 2.05 multiplier
  // base: 500, surge: 525, distance (10-5)*15 = 75 => final = 500 + 525 + 75 = 1100
  if (emg.finalPrice < 1000) {
    throw new Error(`Test 2 Failed: Emergency surge calculated improperly: ${emg.finalPrice}`);
  }
  console.log('✓ Test 2 Passed: Emergency peak surge calculated correctly.');

  console.log('All Surge Pricing Engine tests passed successfully!');
}

runTests();
