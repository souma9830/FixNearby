/**
 * Customer Loyalty Reward Multiplier Service
 */
export const calculateLoyaltyPointsEarned = (bookingAmount, userTier = 'BRONZE') => {
  const amount = Math.max(0, Number(bookingAmount) || 0);
  const multipliers = {
    VIP: 3.0,
    GOLD: 2.0,
    SILVER: 1.5,
    BRONZE: 1.0
  };

  const multiplier = multipliers[userTier] || 1.0;
  const basePoints = Math.floor(amount);
  const totalPointsEarned = Math.floor(basePoints * multiplier);

  return {
    bookingAmount: amount,
    userTier,
    multiplier,
    basePoints,
    totalPointsEarned
  };
};

export const sanitizeRewardRedemptionPayload = (pointsToRedeem) => {
  const points = Number(pointsToRedeem);
  if (isNaN(points) || points <= 0) {
    return { valid: false, reason: 'Points to redeem must be a positive integer' };
  }
  if (points % 50 !== 0) {
    return { valid: false, reason: 'Points must be redeemed in increments of 50' };
  }
  return { valid: true, points, discountDollarValue: Math.floor(points / 50) * 5 };
};
