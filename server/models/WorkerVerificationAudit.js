import mongoose from 'mongoose';

const workerVerificationAuditSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PARTIALLY_COMPLIANT', 'FULLY_COMPLIANT'],
      required: true,
    },
    newStatus: {
      type: String,
      enum: ['UNVERIFIED', 'PARTIALLY_COMPLIANT', 'FULLY_COMPLIANT'],
      required: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    documentsVerified: [{
      docType: { type: String, required: true },
      verifiedAt: { type: Date, default: Date.now },
      verifiedBy: { type: String, default: 'Admin' }
    }],
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

workerVerificationAuditSchema.index({ workerId: 1, createdAt: -1 });

const WorkerVerificationAudit = mongoose.model('WorkerVerificationAudit', workerVerificationAuditSchema);
export default WorkerVerificationAudit;
