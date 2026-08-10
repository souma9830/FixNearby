import { calculateEmergencyPriority, sanitizeEmergencyPayload } from '../services/emergencyDispatchService.js';

console.log('=== STARTING EMERGENCY ALERT PRIORITY DISPATCH TEST ===\n');

// 1. Test CRITICAL priority scoring
console.log('1. Testing CRITICAL alert priority calculation...');
const criticalScore = calculateEmergencyPriority('CRITICAL', null, 0);
console.log('Critical Score Result:', criticalScore);

if (criticalScore.requiresImmediateDispatch && criticalScore.priorityScore >= 100) {
  console.log('✅ SUCCESS: Critical alert immediate dispatch verified!');
} else {
  console.error('❌ FAIL: Priority scoring failed!');
  process.exit(1);
}

// 2. Test Escalation for aged unresolved alert
console.log('\n2. Testing emergency alert escalation boost (age > 15 mins)...');
const agedScore = calculateEmergencyPriority('CRITICAL', null, 25);
console.log('Aged Score Result:', agedScore);

if (agedScore.escalationLevel === 'TIER_1_EMERGENCY') {
  console.log('✅ SUCCESS: Alert automatically escalated to TIER_1_EMERGENCY!');
} else {
  console.error('❌ FAIL: Escalation check failed!');
  process.exit(1);
}

// 3. Test note sanitization
console.log('\n3. Testing emergency note sanitization...');
const cleanPayload = sanitizeEmergencyPayload({ notes: 'Plumbing leak <script>bad()</script>', contactPhone: '+1 (555) 019-2831' });
console.log('Sanitized Payload:', cleanPayload);

if (!cleanPayload.notes.includes('<script>') && cleanPayload.contactPhone === '+15550192831') {
  console.log('✅ SUCCESS: Sanitized payload notes and contact phone number!');
} else {
  console.error('❌ FAIL: Sanitization failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL EMERGENCY DISPATCH TESTS PASSED!');
console.log('=============================================\n');
