import mongoose from 'mongoose';

const serviceWarrantyClaimSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    warrantyPeriodDays: {
      type: Number,
      default: 30,
    },
    issueDescription: {
      type: String,
      required: true,
    },
    claimStatus: {
      type: String,
      enum: ['submitted', 'approved_free_revisit', 'rejected', 'resolved'],
      default: 'submitted',
    },
    scheduledRevisitDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ServiceWarrantyClaim = mongoose.model('ServiceWarrantyClaim', serviceWarrantyClaimSchema);
export default ServiceWarrantyClaim;
