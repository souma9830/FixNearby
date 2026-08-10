import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  month: {
    type: String, // Format: YYYY-MM (e.g. '2026-07')
    required: true
  },
  jobsCompleted: {
    type: Number,
    default: 0
  },
  milestoneTarget: {
    type: Number,
    default: 10 // Milestone: 10 jobs per month
  },
  bonusAmount: {
    type: Number,
    default: 1000 // ₹1000 bonus for hitting 10 jobs/month
  },
  claimed: {
    type: Boolean,
    default: false
  },
  badgeEarned: {
    type: String,
    default: 'Top Performer'
  },
  claimedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

rewardSchema.index({ workerId: 1, month: 1 }, { unique: true });

const Reward = mongoose.model('Reward', rewardSchema);

export default Reward;
