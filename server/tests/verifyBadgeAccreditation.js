import { verifyBadgeEligibility, sanitizeBadgeRequestPayload } from '../services/badgeAccreditationService.js';

console.log('=== STARTING BADGE ACCREDITATION VERIFIER TEST ===\n');

// 1. Test TOP_RATED_PRO badge eligibility (50+ jobs, 4.9 rating)
console.log('1. Testing badge eligibility for worker (60 completed jobs, 4.9 rating)...');
const topRatedCheck = verifyBadgeEligibility(60, 4.9, true);
console.log('Top Rated Check Result:', topRatedCheck);

if (topRatedCheck.eligibleBadges.includes('TOP_RATED_PRO') && topRatedCheck.eligibleBadges.includes('VERIFIED_BACKGROUND')) {
  console.log('✅ SUCCESS: Worker correctly verified eligible for TOP_RATED_PRO & VERIFIED_BACKGROUND!');
} else {
  console.error('❌ FAIL: Badge eligibility check failed!');
  process.exit(1);
}

// 2. Test payload sanitization
console.log('\n2. Testing badge request payload sanitizer...');
const sanitizeCheck = sanitizeBadgeRequestPayload('COMMUNITY_TRUSTED', 'Verified documents <script>evil()</script>');
console.log('Sanitize Result:', sanitizeCheck);

if (sanitizeCheck.valid && !sanitizeCheck.notes.includes('<script>')) {
  console.log('✅ SUCCESS: Badge payload notes sanitized cleanly!');
} else {
  console.error('❌ FAIL: Badge payload sanitizer failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL BADGE ACCREDITATION VERIFIER TESTS PASSED!');
console.log('=============================================\n');
