import { calculatePayoutSplit } from '../services/payoutSplitService.js';

console.log('=== STARTING PAYOUT SPLIT CALCULATOR INTEGRATION TEST ===\n');

// 1. Test standard $100 gross payout split (10% fee, 5% tax)
console.log('1. Testing standard $100 gross payout split calculation...');
const splitResult = calculatePayoutSplit(100, 10, 5);
console.log('Payout Split Result:', splitResult);

if (splitResult.netWorkerPayout === 85 && splitResult.platformFee === 10 && splitResult.taxDeduction === 5) {
  console.log('✅ SUCCESS: Net worker payout ($85) cleanly calculated!');
} else {
  console.error('❌ FAIL: Payout calculation failed!');
  process.exit(1);
}

// 2. Test negative amount rejection
console.log('\n2. Testing negative payout amount rejection...');
const invalidSplit = calculatePayoutSplit(-50);
console.log('Invalid Split Result:', invalidSplit);

if (!invalidSplit.valid) {
  console.log('✅ SUCCESS: Negative payout amount rejected!');
} else {
  console.error('❌ FAIL: Negative payout check failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL PAYOUT SPLIT CALCULATOR TESTS PASSED!');
console.log('=============================================\n');
