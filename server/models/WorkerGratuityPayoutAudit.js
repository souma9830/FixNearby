import mongoose from 'mongoose';

const workerGratuityPayoutAuditSchema = new mongoose.Schema(
  {
    tipBonusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerTipBonus',
      required: true,
      index: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    netGratuityAmount: {
      type: Number,
      required: true,
    },
    platformFeeDeducted: {
      type: Number,
      default: 0,
    },
    payoutBatchId: {
      type: String,
      required: true,
    },
    transferStatus: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

const WorkerGratuityPayoutAudit = mongoose.model('WorkerGratuityPayoutAudit', workerGratuityPayoutAuditSchema);
export default WorkerGratuityPayoutAudit;
