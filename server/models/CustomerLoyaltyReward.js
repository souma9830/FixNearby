import mongoose from 'mongoose';

const customerLoyaltyRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pointsBalance: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    redeemedVouchers: [
      {
        code: { type: String, required: true },
        discountAmount: { type: Number, required: true },
        pointsSpent: { type: Number, required: true },
        isUsed: { type: Boolean, default: false },
        expiryDate: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

const CustomerLoyaltyReward = mongoose.model('CustomerLoyaltyReward', customerLoyaltyRewardSchema);
export default CustomerLoyaltyReward;
