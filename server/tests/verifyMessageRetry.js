import { calculateMessageRetryDelay, sanitizeChatMessagePayload } from '../services/messageRetryService.js';

console.log('=== STARTING CHAT MESSAGE RETRY EXPONENTIAL BACKOFF TEST ===\n');

// 1. Test exponential backoff calculation across 3 retry attempts
console.log('1. Testing exponential backoff delays for attempts 1, 2, and 3...');
const retry1 = calculateMessageRetryDelay(1, 1000);
const retry2 = calculateMessageRetryDelay(2, 1000);
const retry3 = calculateMessageRetryDelay(3, 1000);

console.log('Attempt 1 Delay:', retry1.delayMs, 'ms');
console.log('Attempt 2 Delay:', retry2.delayMs, 'ms');
console.log('Attempt 3 Delay:', retry3.delayMs, 'ms');

if (retry2.delayMs >= 2000 && retry3.delayMs >= 4000) {
  console.log('✅ SUCCESS: Exponential backoff delay correctly doubled per retry attempt!');
} else {
  console.error('❌ FAIL: Exponential backoff calculation failed!');
  process.exit(1);
}

// 2. Test chat message sanitization
console.log('\n2. Testing chat message HTML tag sanitization...');
const cleanMsg = sanitizeChatMessagePayload('Hello world <script>alert("hack")</script>');
console.log('Sanitized Message:', cleanMsg);

if (!cleanMsg.includes('<script>') && cleanMsg.includes('Hello world')) {
  console.log('✅ SUCCESS: Chat message script tags stripped!');
} else {
  console.error('❌ FAIL: Message sanitization failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL CHAT MESSAGE RETRY BACKOFF TESTS PASSED!');
console.log('=============================================\n');
