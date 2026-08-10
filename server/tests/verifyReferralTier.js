import { evaluateReferralTier, sanitizeReferralCode } from '../services/referralTierEvaluatorService.js';

console.log('=== STARTING REFERRAL REWARD TIER EVALUATOR TEST ===\n');

// 1. Test tier evaluation for 12 referrals (GOLD Tier)
console.log('1. Testing referral tier calculation for 12 successful referrals...');
const goldTier = evaluateReferralTier(12);
console.log('Gold Tier Result:', goldTier);

if (goldTier.tier === 'GOLD' && goldTier.bonusPoints === 500 && goldTier.discountPercent === 15) {
  console.log('✅ SUCCESS: User correctly awarded GOLD tier with 500 bonus points!');
} else {
  console.error('❌ FAIL: Tier evaluation failed!');
  process.exit(1);
}

// 2. Test PLATINUM Tier (25 referrals)
console.log('\n2. Testing referral tier calculation for 25 successful referrals (PLATINUM)...');
const platTier = evaluateReferralTier(25);
console.log('Platinum Tier Result:', platTier);

if (platTier.tier === 'PLATINUM' && platTier.badge === 'COMMUNITY_AMBASSADOR') {
  console.log('✅ SUCCESS: User awarded PLATINUM tier & COMMUNITY_AMBASSADOR badge!');
} else {
  console.error('❌ FAIL: Platinum tier check failed!');
  process.exit(1);
}

// 3. Test referral code sanitization
console.log('\n3. Testing referral code sanitization...');
const dirtyCode = 'ref-john-12!@#$';
const cleanCode = sanitizeReferralCode(dirtyCode);
console.log('Sanitized Referral Code:', cleanCode);

if (cleanCode === 'REF-JOHN-12') {
  console.log('✅ SUCCESS: Referral code uppercase and special characters sanitized!');
} else {
  console.error('❌ FAIL: Code sanitization failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL REFERRAL TIER EVALUATOR TESTS PASSED!');
console.log('=============================================\n');
