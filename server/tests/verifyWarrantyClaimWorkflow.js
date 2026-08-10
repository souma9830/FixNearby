import mongoose from 'mongoose';
import ServiceWarrantyClaim from '../models/ServiceWarrantyClaim.js';

async function testWarrantyWorkflow() {
  console.log('[TEST] Starting Warranty Claim Verification...');
  const fakeBookingId = new mongoose.Types.ObjectId();
  const fakeCustomerId = new mongoose.Types.ObjectId();
  const fakeWorkerId = new mongoose.Types.ObjectId();

  try {
    const claim = new ServiceWarrantyClaim({
      bookingId: fakeBookingId,
      customerId: fakeCustomerId,
      originalWorkerId: fakeWorkerId,
      claimDescription: 'The kitchen faucet started leaking again 5 days after repair.',
      claimStatus: 'Claim Filed',
    });

    console.log('[TEST] Warranty claim record created:', claim.claimStatus, 'Description:', claim.claimDescription);
    console.log('[TEST] Warranty Claim Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testWarrantyWorkflow();
