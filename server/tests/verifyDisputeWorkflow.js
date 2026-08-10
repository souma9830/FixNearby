import { processDisputeEvidence, validateClaimAmount } from '../services/disputeWorkflowService.js';

console.log('=== STARTING DISPUTE EVIDENCE WORKFLOW INTEGRATION TEST ===\n');

// 1. Test evidence URL sanitization
console.log('1. Testing evidence URL sanitization...');
const testUrls = [
  'https://s3.amazonaws.com/bucket/evidence1.jpg',
  'invalid-url-schema',
  'http://cdn.fixnearby.com/proof.png',
  'javascript:alert(1)'
];

const evidenceResult = processDisputeEvidence(testUrls);
console.log('Sanitization Result:', evidenceResult);

if (evidenceResult.validUrls.length === 2 && evidenceResult.rejectedCount === 2) {
  console.log('✅ SUCCESS: Invalid/malicious evidence URLs successfully sanitized!');
} else {
  console.error('❌ FAIL: Evidence sanitization failed!');
  process.exit(1);
}

// 2. Test claim amount boundary validation
console.log('\n2. Testing claim amount boundary validation...');
const invalidClaim = validateClaimAmount(15000, 10000);
console.log('Excessive Claim Result:', invalidClaim);

if (!invalidClaim.valid) {
  console.log('✅ SUCCESS: Excessive claim amount rejected cleanly!');
} else {
  console.error('❌ FAIL: Claim validation failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL DISPUTE EVIDENCE WORKFLOW TESTS PASSED!');
console.log('=============================================\n');
