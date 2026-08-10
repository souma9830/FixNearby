import RewardPoints from '../models/RewardPoints.js';
import { calculateLoyaltyPointsEarned } from '../services/loyaltyRewardMultiplierService.js';

export const getUserRewards = async (req, res) => {
  try {
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

    const availableCoupons = [
      { _id: 'c1', title: '$10 Off Plumbing Services', discount: 10, pointsCost: 50 },
      { _id: 'c2', title: '$25 Off Electrical Repair', discount: 25, pointsCost: 100 },
      { _id: 'c3', title: '50% Off House Cleaning', discount: 50, pointsCost: 200 }
    ];

    const loyaltyPreview = calculateLoyaltyPointsEarned(100, userRewards.tier.toUpperCase());

    res.status(200).json({
      balance: userRewards.balance,
      tier: userRewards.tier,
      lifetimeEarned: userRewards.lifetimeEarned,
      history: userRewards.transactions,
      activeCoupons: userRewards.activeCoupons || [],
      availableCoupons,
      loyaltyPreview
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rewards', error: error.message });
  }
};

export const redeemCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const userRewards = await RewardPoints.findOne({ user: req.user.id });

    const catalog = {
      c1: { title: '$10 Off Plumbing Services', discount: 10, pointsCost: 50 },
      c2: { title: '$25 Off Electrical Repair', discount: 25, pointsCost: 100 },
      c3: { title: '50% Off House Cleaning', discount: 50, pointsCost: 200 }
    };

    const targetCoupon = catalog[couponId] || catalog.c1;

    if (!userRewards || userRewards.balance < targetCoupon.pointsCost) {
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
    res.status(500).json({ message: 'Redemption failed', error: error.message });
  }
};

export default {
  getUserRewards,
  redeemCoupon
};
