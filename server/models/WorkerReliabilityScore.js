import mongoose from 'mongoose';

const workerReliabilityScoreSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  totalBookingsAccepted: {
    type: Number,
    default: 0,
  },
  completedBookingsCount: {
    type: Number,
    default: 0,
  },
  canceledBookingsCount: {
    type: Number,
    default: 0,
  },
  lateCancellationsCount: {
    type: Number,
    default: 0,
  },
  reliabilityIndexScore: {
    type: Number,
    default: 100, // 0 - 100
    min: 0,
    max: 100,
  },
  reliabilityTier: {
    type: String,
    enum: ['Gold', 'Silver', 'Bronze', 'Probation'],
    default: 'Gold',
    index: true,
  },
  dispatchPenaltyMultiplier: {
    type: Number,
    default: 1.0, // 1.0 = normal, 0.5 = delayed dispatch priority
  },
  lastPenaltyAppliedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.model('WorkerReliabilityScore', workerReliabilityScoreSchema);
