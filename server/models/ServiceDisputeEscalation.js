import mongoose from 'mongoose';

const serviceDisputeEscalationSchema = new mongoose.Schema(
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
    reasonCategory: {
      type: String,
      enum: ['incomplete_work', 'damaged_property', 'overcharging', 'unprofessional_conduct', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    claimAmount: {
      type: Number,
      default: 0,
    },
    evidenceUrls: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved_refunded', 'resolved_dismissed', 'escalated_legal'],
      default: 'pending',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    assignedArbitratorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const ServiceDisputeEscalation = mongoose.model('ServiceDisputeEscalation', serviceDisputeEscalationSchema);
export default ServiceDisputeEscalation;

