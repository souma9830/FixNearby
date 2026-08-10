import { calculateServicePriceEstimate, sanitizeEstimateInput } from '../services/priceEstimateMatrixService.js';

console.log('=== STARTING PRICE ESTIMATE MATRIX CALCULATOR TEST ===\n');

// 1. Test standard rate calculation ($50/hr, 3 hrs labor, 1.5x urgency, 10km travel)
console.log('1. Testing dynamic price estimate matrix ($50/hr, 3 hrs, 1.5x urgency, 10km travel)...');
const estimateResult = calculateServicePriceEstimate(50, 3, 1.5, 10);
console.log('Estimate Matrix Result:', estimateResult);

if (estimateResult.totalEstimate > 0 && estimateResult.travelFee === 7.5 && estimateResult.urgencyMultiplier === 1.5) {
  console.log('✅ SUCCESS: Service price estimate matrix calculated cleanly with travel & urgency fees!');
} else {
  console.error('❌ FAIL: Estimate calculation failed!');
  process.exit(1);
}

// 2. Test note sanitization
console.log('\n2. Testing estimate notes sanitization...');
const cleanInput = sanitizeEstimateInput({ notes: 'Urgent plumbing repair <script>alert(1)</script>' });
console.log('Sanitized Input:', cleanInput);

if (!cleanInput.notes.includes('<script>')) {
  console.log('✅ SUCCESS: Estimate notes sanitized cleanly!');
} else {
  console.error('❌ FAIL: Note sanitization failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL PRICE ESTIMATE MATRIX CALCULATOR TESTS PASSED!');
console.log('=============================================\n');
