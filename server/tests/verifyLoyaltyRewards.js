import { calculateLoyaltyPointsEarned, sanitizeRewardRedemptionPayload } from '../services/loyaltyRewardMultiplierService.js';

console.log('=== STARTING LOYALTY REWARDS MULTIPLIER TEST ===\n');

// 1. Test VIP tier (3.0x multiplier) on $150 booking
console.log('1. Testing loyalty points earning for VIP user on $150 booking (3.0x multiplier)...');
const vipPoints = calculateLoyaltyPointsEarned(150, 'VIP');
console.log('VIP Points Result:', vipPoints);

if (vipPoints.totalPointsEarned === 450 && vipPoints.multiplier === 3.0) {
  console.log('✅ SUCCESS: VIP points earned correctly (450 pts for $150 booking)!');
} else {
  console.error('❌ FAIL: Loyalty multiplier calculation failed!');
  process.exit(1);
}

// 2. Test redemption increment validation (points must be divisible by 50)
console.log('\n2. Testing point redemption increment validation (must be multiple of 50)...');
const invalidRedemption = sanitizeRewardRedemptionPayload(75);
console.log('Invalid Redemption Result:', invalidRedemption);

if (!invalidRedemption.valid && invalidRedemption.reason.includes('increments of 50')) {
  console.log('✅ SUCCESS: Non-multiple points redemption (75 pts) rejected cleanly!');
} else {
  console.error('❌ FAIL: Redemption validation failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL LOYALTY REWARDS MULTIPLIER TESTS PASSED!');
console.log('=============================================\n');
