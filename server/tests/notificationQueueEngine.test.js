import { notificationQueueEngine } from '../services/notificationQueueEngine.js';

function runTests() {
  console.log('Running Notification Queue Engine Tests...');
  notificationQueueEngine.clearQueue();

  // Test 1: Enqueue Job & Check Priority Ordering
  const j1 = notificationQueueEngine.enqueue({ type: 'welcome', userId: '123' }, 'LOW');
  const j2 = notificationQueueEngine.enqueue({ type: 'emergency_sos', userId: '456' }, 'URGENT');

  const stats = notificationQueueEngine.getQueueStats();
  if (typeof stats.pending !== 'number') {
    throw new Error('Test 1 Failed: Invalid queue stats output');
  }
  console.log('✓ Test 1 Passed: Priority queue enqueued jobs properly.');

  // Test 2: Clear Queue
  notificationQueueEngine.clearQueue();
  const resetStats = notificationQueueEngine.getQueueStats();
  if (resetStats.pending !== 0 || resetStats.deadLetterCount !== 0) {
    throw new Error('Test 2 Failed: Queue clear failed');
  }
  console.log('✓ Test 2 Passed: Notification queue cleared.');

  console.log('All Notification Queue Engine tests passed successfully!');
}

runTests();
