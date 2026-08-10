import { enqueueOfflineEvent, getOfflineQueue, clearOfflineQueue, flushOfflineQueue } from '../utils/socketOfflineQueue.js';

// Mock localStorage for node test runner
if (typeof localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

function runTests() {
  console.log('Running Socket Offline Queue Tests...');
  clearOfflineQueue();

  // Test 1: Enqueue event
  enqueueOfflineEvent('chat:send_message', { text: 'Hello offline' });
  const q = getOfflineQueue();
  if (q.length !== 1 || q[0].eventName !== 'chat:send_message') {
    throw new Error('Test 1 Failed: Offline event not enqueued');
  }
  console.log('✓ Test 1 Passed: Offline event stored.');

  // Test 2: Flush queue
  let emitted = 0;
  const mockSocket = {
    connected: true,
    emit: () => { emitted++; }
  };
  const count = flushOfflineQueue(mockSocket);
  if (count !== 1 || emitted !== 1 || getOfflineQueue().length !== 0) {
    throw new Error('Test 2 Failed: Flush failed to emit or clear queue');
  }
  console.log('✓ Test 2 Passed: Offline queue flushed cleanly.');

  console.log('All Socket Offline Queue tests passed successfully!');
}

runTests();
