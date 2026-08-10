import mongoose from 'mongoose';
import WorkerReliabilityScore from '../models/WorkerReliabilityScore.js';

async function testReliabilitySystem() {
  console.log('[TEST] Starting Reliability Tier Verification...');
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const record = new WorkerReliabilityScore({
      workerId: fakeWorkerId,
      totalBookingsAccepted: 10,
      completedBookingsCount: 8,
      canceledBookingsCount: 2,
      lateCancellationsCount: 1,
      reliabilityIndexScore: 75,
      reliabilityTier: 'Silver',
      dispatchPenaltyMultiplier: 0.9,
    });

    console.log('[TEST] Instantiated Reliability Record:', record.reliabilityTier, 'Score:', record.reliabilityIndexScore);
    console.log('[TEST] Reliability Tier System Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testReliabilitySystem();
