import mongoose from 'mongoose';

const rewardPointsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze'
    },
    lifetimeEarned: {
      type: Number,
      default: 0
    },
    activeCoupons: [
      {
        code: { type: String, required: true },
        discount: { type: Number, required: true },
        title: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        isUsed: { type: Boolean, default: false }
      }
    ],
    transactions: [
      {
        type: { type: String, enum: ['earned', 'redeemed', 'expired'] },
        points: Number,
        description: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('RewardPoints', rewardPointsSchema);
