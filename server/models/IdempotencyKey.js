import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'resolved'],
    default: 'processing'
  },
  responseStatus: {
    type: Number
  },
  responseBody: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness per user
idempotencyKeySchema.index({ key: 1, userId: 1 }, { unique: true });

// TTL index to automatically delete records after 24 hours (86400 seconds)
idempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencyKeySchema);
export default IdempotencyKey;
