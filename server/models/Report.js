import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['worker', 'review'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    enum: ['inappropriate_content', 'fraud', 'spam', 'harassment', 'other'],
    required: true
  },
  details: {
    type: String,
    trim: true,
    maxlength: [1000, 'Details must be less than 1000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'reviewing', 'resolved', 'dismissed'],
    default: 'open'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

reportSchema.index({ targetType: 1, targetId: 1 });

export default mongoose.model('Report', reportSchema);