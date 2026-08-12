import mongoose from 'mongoose';

const disputeArbitrationAuditSchema = new mongoose.Schema(
  {
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceDisputeEscalation',
      required: true,
      index: true,
    },
    arbitratorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
    refundAmountApproved: {
      type: Number,
      default: 0,
    },
    arbitrationNotes: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const DisputeArbitrationAudit = mongoose.model('DisputeArbitrationAudit', disputeArbitrationAuditSchema);
export default DisputeArbitrationAudit;
