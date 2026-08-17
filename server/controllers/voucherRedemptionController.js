import RewardVoucher from '../models/RewardVoucher.js';
import User from '../models/User.js';
import crypto from 'crypto';

export const generateVoucher = async (req, res) => {
  try {
    const { pointsCost, discountAmount, title } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user || (user.rewardPoints || 0) < pointsCost) {
      return res.status(400).json({ success: false, message: 'Insufficient loyalty reward points' });
    }

    user.rewardPoints -= pointsCost;
    await user.save();

    const code = `REWARD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const voucher = await RewardVoucher.create({
      userId,
      code,
      title: title || `$${discountAmount} Service Discount`,
      discountAmount,
      pointsCost,
      expiresAt
    });

    return res.status(201).json({
      success: true,
      message: 'Reward voucher generated successfully',
      data: voucher
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserVouchers = async (req, res) => {
  try {
    const vouchers = await RewardVoucher.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: vouchers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
