import CustomerLoyaltyReward from '../models/CustomerLoyaltyReward.js';

export const getLoyaltyAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let account = await CustomerLoyaltyReward.findOne({ userId });

    if (!account) {
      account = await CustomerLoyaltyReward.create({ userId, pointsBalance: 100, tier: 'bronze' });
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

export const redeemPointsForVoucher = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { pointsToRedeem, discountAmount } = req.body;

    const account = await CustomerLoyaltyReward.findOne({ userId });
    if (!account || account.pointsBalance < pointsToRedeem) {
      return res.status(400).json({ success: false, message: 'Insufficient loyalty points balance' });
    }

    account.pointsBalance -= pointsToRedeem;
    const voucherCode = `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    account.redeemedVouchers.push({
      code: voucherCode,
      discountAmount,
      pointsSpent: pointsToRedeem,
      isUsed: false,
      expiryDate,
    });

    await account.save();

    res.status(201).json({ success: true, message: 'Voucher generated successfully', data: account });
  } catch (error) {
    next(error);
  }
};
