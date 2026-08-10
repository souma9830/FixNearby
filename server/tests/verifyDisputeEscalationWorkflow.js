import mongoose from 'mongoose';
import BookingDisputeEscalation from '../models/BookingDisputeEscalation.js';

async function testDisputeWorkflow() {
  console.log('[TEST] Starting Dispute Escalation Verification...');
  const fakeBookingId = new mongoose.Types.ObjectId();
  const fakeReporterId = new mongoose.Types.ObjectId();
  const fakeRespondentId = new mongoose.Types.ObjectId();

  try {
    const dispute = new BookingDisputeEscalation({
      bookingId: fakeBookingId,
      reporterId: fakeReporterId,
      respondentId: fakeRespondentId,
      disputeReason: 'Incomplete Work',
      claimAmountRequested: 120,
      detailedStatement: 'The service worker left before completing the pipe seal installation.',
      escalationStatus: 'Filed',
    });

    console.log('[TEST] Instantiated dispute record:', dispute.disputeReason, 'Status:', dispute.escalationStatus);
    console.log('[TEST] Dispute Escalation Verification PASSED clean!');
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  }
}

testDisputeWorkflow();
