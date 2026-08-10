import { verifyWarrantyCoverage, sanitizeWarrantyClaimPayload } from '../services/serviceWarrantyCoverageService.js';

console.log('=== STARTING SERVICE WARRANTY COVERAGE VERIFIER TEST ===\n');

// 1. Test active warranty coverage within 30 days
console.log('1. Testing active warranty coverage for completion date 10 days ago...');
const tenDaysAgo = new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString();
const activeCheck = verifyWarrantyCoverage(tenDaysAgo, 30);
console.log('Active Coverage Result:', activeCheck);

if (activeCheck.isCovered && activeCheck.daysRemaining >= 19) {
  console.log('✅ SUCCESS: Service verified covered under 30-day warranty!');
} else {
  console.error('❌ FAIL: Active warranty check failed!');
  process.exit(1);
}

// 2. Test expired warranty coverage (completion date 45 days ago)
console.log('\n2. Testing expired warranty coverage (completion date 45 days ago)...');
const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString();
const expiredCheck = verifyWarrantyCoverage(fortyFiveDaysAgo, 30);
console.log('Expired Coverage Result:', expiredCheck);

if (!expiredCheck.isCovered && expiredCheck.daysRemaining === 0) {
  console.log('✅ SUCCESS: Expired warranty cleanly identified!');
} else {
  console.error('❌ FAIL: Expired warranty check failed!');
  process.exit(1);
}

// 3. Test claim notes sanitization
console.log('\n3. Testing claim notes sanitization...');
const cleanClaim = sanitizeWarrantyClaimPayload('Water pipe leaked again <script>alert("hack")</script>');
console.log('Sanitized Claim Notes:', cleanClaim);

if (!cleanClaim.includes('<script>')) {
  console.log('✅ SUCCESS: Warranty claim notes sanitized cleanly!');
} else {
  console.error('❌ FAIL: Notes sanitization failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL SERVICE WARRANTY COVERAGE TESTS PASSED!');
console.log('=============================================\n');
