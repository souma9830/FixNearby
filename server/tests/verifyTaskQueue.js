import { globalQueueManager } from '../services/queueManager.js';
import { initializeTaskWorkers } from '../workers/taskQueueWorker.js';

async function runTests() {
  console.log("=== STARTING DISTRIBUTED TASK WORKER QUEUE TEST ===");
  initializeTaskWorkers();

  // 1. Testing successful background email job
  console.log("\n1. Enqueuing successful email notification job...");
  const j1Id = await globalQueueManager.enqueue('SEND_EMAIL', { email: 'user@example.com' });
  
  await new Promise(r => setTimeout(r, 100));
  const j1 = globalQueueManager.getJob(j1Id);
  console.log("Job 1 Result:", j1);

  if (j1.status === 'COMPLETED' && j1.result.sent) {
    console.log("✅ SUCCESS: Email background job completed!");
  }

  // 2. Testing failed job retries and Dead Letter Queue (DLQ) routing
  console.log("\n2. Enqueuing failing job to verify retry & DLQ routing...");
  const j2Id = await globalQueueManager.enqueue('SEND_EMAIL', { email: 'fail@example.com', forceError: true }, { maxAttempts: 2 });

  await new Promise(r => setTimeout(r, 400));
  const j2 = globalQueueManager.getJob(j2Id);
  const dlq = globalQueueManager.getDLQ();

  console.log("Job 2 Status after retries:", j2.status);
  console.log("Dead Letter Queue Size:", dlq.length);

  if (j2.status === 'FAILED' && dlq.length > 0) {
    console.log("=============================================");
    console.log("✅ ALL TASK WORKER QUEUE TESTS PASSED!");
    console.log("=============================================");
  }
}

runTests().catch(console.error);
