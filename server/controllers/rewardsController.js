import UserReward from '../models/UserReward.js';
import crypto from 'crypto';
import RewardPoints from '../models/RewardPoints.js';
import { calculateLoyaltyPointsEarned } from '../services/loyaltyRewardMultiplierService.js';

// @desc    Get customer loyalty XP profile & unlocked vouchers
// @route   GET /api/rewards/profile
// @access  Private
export const getLoyaltyProfile = async (req, res, next) => {
  try {
    let reward = await UserReward.findOne({ userId: req.user._id });
    let userRewards = await RewardPoints.findOne({ user: req.user.id });
    if (!userRewards) {
      userRewards = new RewardPoints({ user: req.user.id, balance: 100, lifetimeEarned: 100 });
      await userRewards.save();
    }

    const points = userRewards.balance || 0;
    let computedTier = 'Bronze';
    if (userRewards.lifetimeEarned >= 1000) computedTier = 'Platinum';
    else if (userRewards.lifetimeEarned >= 500) computedTier = 'Gold';
    else if (userRewards.lifetimeEarned >= 200) computedTier = 'Silver';

    if (userRewards.tier !== computedTier) {
      userRewards.tier = computedTier;
      await userRewards.save();
    }

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

    const loyaltyPreview = calculateLoyaltyPointsEarned(100, userRewards.tier.toUpperCase());
    const availableCoupons = (userRewards.activeCoupons || []).filter((c) => !c.isUsed);

    res.status(200).json({
      success: true,
      reward,
      balance: userRewards.balance,
      tier: userRewards.tier,
      lifetimeEarned: userRewards.lifetimeEarned,
      history: userRewards.transactions,
      activeCoupons: userRewards.activeCoupons || [],
      availableCoupons,
      loyaltyPreview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's reward points profile
// @route   GET /api/rewards/my-rewards
// @access  Private
export const getUserRewards = async (req, res, next) => {
  try {
    let userRewards = await RewardPoints.findOne({ user: req.user.id });
    if (!userRewards) {
      userRewards = new RewardPoints({ user: req.user.id, balance: 100, lifetimeEarned: 100 });
      await userRewards.save();
    }

    const availableCoupons = (userRewards.activeCoupons || []).filter((c) => !c.isUsed);

    res.status(200).json({
      success: true,
      balance: userRewards.balance,
      tier: userRewards.tier,
      lifetimeEarned: userRewards.lifetimeEarned,
      history: userRewards.transactions,
      activeCoupons: userRewards.activeCoupons || [],
      availableCoupons
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

const catalog = {
  c1: { title: '$10 Off Plumbing Services', discount: 10, pointsCost: 50 },
  c2: { title: '$25 Off Electrical Repair', discount: 25, pointsCost: 100 },
  c3: { title: '50% Off House Cleaning', discount: 50, pointsCost: 200 }
};

// @desc    Redeem points for a discount coupon
// @route   POST /api/rewards/redeem
// @access  Private
export const redeemCoupon = async (req, res, next) => {
  try {
    const { couponId } = req.body;

    const targetCoupon = catalog[couponId] || catalog.c1;

    let userRewards = await RewardPoints.findOne({ user: req.user.id });
    if (!userRewards) {
      userRewards = new RewardPoints({ user: req.user.id, balance: 100, lifetimeEarned: 100 });
      await userRewards.save();
    }

    if (userRewards.balance < targetCoupon.pointsCost) {
      return res.status(400).json({ message: `Insufficient points! Required: ${targetCoupon.pointsCost}` });
    }

    const generatedCode = `ELUSOC-${targetCoupon.discount}-${Math.floor(1000 + Math.random() * 9000)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    userRewards.balance -= targetCoupon.pointsCost;
    userRewards.activeCoupons.push({
      code: generatedCode,
      discount: targetCoupon.discount,
      title: targetCoupon.title,
      expiresAt,
      isUsed: false
    });

    userRewards.transactions.push({
      type: 'redeemed',
      points: targetCoupon.pointsCost,
      description: `Redeemed ${targetCoupon.title} (Code: ${generatedCode})`
    });

    await userRewards.save();

    res.status(200).json({
      success: true,
      code: generatedCode,
      coupon: targetCoupon,
      newBalance: userRewards.balance,
      activeCoupons: userRewards.activeCoupons
    });
  } catch (error) {
    next(error);
  }
};
