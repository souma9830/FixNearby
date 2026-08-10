import { rankFavoriteWorkers, sanitizeFavoriteWorkerPayload } from '../services/favoriteWorkerRankingService.js';

console.log('=== STARTING FAVORITE WORKER RANKING ENGINE TEST ===\n');

// 1. Test ranking favorites by rating & completed jobs
console.log('1. Testing sorting favorite workers by rating & job count...');
const rawList = [
  { _id: '1', worker: { name: 'Worker B', rating: 4.5, completedJobsCount: 10 } },
  { _id: '2', worker: { name: 'Worker A', rating: 4.9, completedJobsCount: 50 } },
  { _id: '3', worker: { name: 'Worker C', rating: 4.5, completedJobsCount: 30 } }
];

const ranked = rankFavoriteWorkers(rawList);
console.log('Ranked Result:', ranked.map(r => r.worker.name));

if (ranked[0].worker.name === 'Worker A' && ranked[1].worker.name === 'Worker C') {
  console.log('✅ SUCCESS: Worker A (4.9 rating) ranked #1, Worker C (higher job count tiebreaker) ranked #2!');
} else {
  console.error('❌ FAIL: Favorite worker ranking failed!');
  process.exit(1);
}

// 2. Test worker ID validation
console.log('\n2. Testing MongoDB ObjectId workerId sanitizer...');
const invalidId = sanitizeFavoriteWorkerPayload('invalid-worker-id');
console.log('Invalid WorkerId Result:', invalidId);

if (!invalidId.valid) {
  console.log('✅ SUCCESS: Invalid worker ObjectId rejected cleanly!');
} else {
  console.error('❌ FAIL: WorkerId validator failed!');
  process.exit(1);
}

console.log('\n=============================================');
console.log('✅ ALL FAVORITE WORKER RANKING TESTS PASSED!');
console.log('=============================================\n');
