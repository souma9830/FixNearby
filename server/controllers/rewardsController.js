import UserReward from '../models/UserReward.js';
import crypto from 'crypto';

// @desc    Get customer loyalty XP profile & unlocked vouchers
// @route   GET /api/rewards/profile
// @access  Private
export const getLoyaltyProfile = async (req, res, next) => {
  try {
    let reward = await UserReward.findOne({ userId: req.user._id });

    if (!reward) {
      reward = await UserReward.create({
        userId: req.user._id,
        totalXp: 350,
        currentTier: 'Silver',
        history: [
          { action: 'Completed Plumbing Booking #101', xpEarned: 150 },
          { action: 'Left 5-Star Review', xpEarned: 50 },
          { action: 'App Setup Bonus', xpEarned: 150 }
        ]
      });
    }

    res.status(200).json({
      success: true,
      reward
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem XP for a discount voucher
// @route   POST /api/rewards/redeem
// @access  Private
export const redeemVoucher = async (req, res, next) => {
  try {
    const { xpCost = 200, title = '15% Off Next Booking', discountPct = 15 } = req.body;

    let reward = await UserReward.findOne({ userId: req.user._id });
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward profile not found' });
    }

    if (reward.totalXp < xpCost) {
      return res.status(400).json({ success: false, message: `Insufficient XP balance. Need ${xpCost} XP.` });
    }

    const code = `SAVE${discountPct}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    reward.totalXp -= xpCost;
    reward.unlockedVouchers.push({
      code,
      title,
      discountPct,
      xpCost,
      isRedeemed: false
    });
    reward.history.push({
      action: `Redeemed ${title} Voucher`,
      xpEarned: -xpCost
    });

    await reward.save();

    res.status(200).json({
      success: true,
      message: `Voucher "${code}" unlocked for ${xpCost} XP!`,
      voucher: { code, title, discountPct }
    });
  } catch (error) {
    next(error);
  }
};
