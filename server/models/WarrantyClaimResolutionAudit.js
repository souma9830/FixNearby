import mongoose from 'mongoose';

const warrantyClaimResolutionAuditSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceWarrantyClaim',
      required: true,
      index: true,
    },
    actionTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousClaimStatus: {
      type: String,
      required: true,
    },
    newClaimStatus: {
      type: String,
      required: true,
    },
    resolutionSummary: {
      type: String,
      required: true,
    },
    dispatchedWorkerRevisitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      default: null,
    },
  },
  { timestamps: true }
);

const WarrantyClaimResolutionAudit = mongoose.model('WarrantyClaimResolutionAudit', warrantyClaimResolutionAuditSchema);
export default WarrantyClaimResolutionAudit;
