import { calculateWorkerQualityMetrics } from '../services/qualityAnalyticsService.js';

function runTests() {
  console.log('Running Quality Analytics Service Tests...');

  // Test 1: High Quality Worker
  const high = calculateWorkerQualityMetrics([
    { rating: 5 }, { rating: 5 }, { rating: 4 }
  ]);
  if (high.averageRating !== 4.7 || high.riskFlag !== false) {
    throw new Error(`Test 1 Failed: Got ${high.averageRating}`);
  }
  console.log('✓ Test 1 Passed: High quality metrics computed accurately.');

  // Test 2: High Risk Worker
  const risk = calculateWorkerQualityMetrics([
    { rating: 1 }, { rating: 2 }, { rating: 5 }
  ]);
  if (!risk.riskFlag) {
    throw new Error('Test 2 Failed: Low rating trend not flagged as risk');
  }
  console.log('✓ Test 2 Passed: High risk worker correctly flagged.');

  console.log('All Quality Analytics Service tests passed successfully!');
}

runTests();
