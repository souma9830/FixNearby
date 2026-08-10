import mongoose from 'mongoose';

const badgeRequestSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true
    },
    badgeType: {
      type: String,
      enum: ['Master Certified', 'Background Checked', 'Licensed Electrician', 'Top Rated'],
      required: true
    },
    documentNumber: String,
    documentUrl: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: String,
    expiresAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('BadgeRequest', badgeRequestSchema);
