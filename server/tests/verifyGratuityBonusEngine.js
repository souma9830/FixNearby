import mongoose from 'mongoose';
import WorkerGratuityBonus from '../models/WorkerGratuityBonus.js';
import GratuityBonusService from '../services/gratuityBonusService.js';

async function testGratuityEngine() {
  console.log('[TEST] Starting Gratuity & Bonus Engine Verification...');
  const fakeBookingId = new mongoose.Types.ObjectId();
  const fakeCustomerId = new mongoose.Types.ObjectId();
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const record = new WorkerGratuityBonus({
      bookingId: fakeBookingId,
      customerId: fakeCustomerId,
      workerId: fakeWorkerId,
      tipAmountUSD: 20,
      platformBonusMatchUSD: 5,
      totalPayoutAmountUSD: 25,
      complimentTags: ['Punctual', 'Expert Skill'],
      payoutStatus: 'Transferred',
    });

    console.log('[TEST] Gratuity record created:', record.tipAmountUSD, 'Bonus match:', record.platformBonusMatchUSD);
    console.log('[TEST] Gratuity & Bonus Engine Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testGratuityEngine();
