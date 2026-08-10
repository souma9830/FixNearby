import mongoose from 'mongoose';

const userRewardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  totalXp: {
    type: Number,
    default: 120
  },
  currentTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  unlockedVouchers: [{
    code: { type: String, required: true },
    title: { type: String, required: true },
    discountPct: { type: Number, default: 10 },
    xpCost: { type: Number, default: 200 },
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date }
  }],
  history: [{
    action: { type: String, required: true },
    xpEarned: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const UserReward = mongoose.model('UserReward', userRewardSchema);
export default UserReward;
