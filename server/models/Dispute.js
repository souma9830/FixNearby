import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  againstWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  reasonCategory: {
    type: String,
    enum: ['service_quality', 'no_show', 'damage_claim', 'pricing_dispute', 'delayed_sla', 'other'],
    default: 'service_quality'
  },
  description: {
    type: String,
    required: true
  },
  claimAmount: {
    type: Number,
    default: 0
  },
  evidenceImages: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved_refund', 'resolved_payout', 'resolved_split', 'rejected'],
    default: 'pending'
  },
  resolutionOutcome: {
    refundAmount: { type: Number, default: 0 },
    payoutAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    resolvedAt: { type: Date }
  },
  resolvedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

disputeSchema.index({ bookingId: 1 });
disputeSchema.index({ status: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;
