import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  evidenceType: {
    type: String,
    enum: ['Photo', 'Receipt', 'MessageLog', 'Video', 'Other'],
    default: 'Photo',
  },
  fileUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const bookingDisputeEscalationSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true,
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  disputeReason: {
    type: String,
    required: true,
    enum: ['Incomplete Work', 'Property Damage', 'Unsatisfactory Quality', 'Billing Discrepancy', 'No Show', 'Safety Violation'],
  },
  claimAmountRequested: {
    type: Number,
    required: true,
    min: 0,
  },
  detailedStatement: {
    type: String,
    required: true,
    minlength: 20,
  },
  escalationStatus: {
    type: String,
    enum: ['Filed', 'Under Review', 'Evidence Requested', 'Arbitration Pending', 'Resolved Refunded', 'Resolved Released', 'Dismissed'],
    default: 'Filed',
    index: true,
  },
  evidenceList: [evidenceSchema],
  resolutionNotes: {
    type: String,
    default: null,
  },
  resolvedByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  arbitrationDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
}, {
  timestamps: true,
});

export default mongoose.model('BookingDisputeEscalation', bookingDisputeEscalationSchema);
