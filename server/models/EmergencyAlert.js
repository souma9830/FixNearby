import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    issueType: {
      type: String,
      required: true
    },
    description: String,
    location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['broadcasting', 'accepted', 'resolved', 'cancelled'],
      default: 'broadcasting'
    },
    acceptedByWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker'
    },
    notifiedWorkersCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('EmergencyAlert', emergencyAlertSchema);
