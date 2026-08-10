/**
 * Middleware for validating reward redemption
 */
import { sanitizeRewardRedemptionPayload } from '../services/loyaltyRewardMultiplierService.js';

export const rewardRedemptionValidator = (req, res, next) => {
  const { points } = req.body || {};

  if (req.method === 'POST' && points !== undefined) {
    const check = sanitizeRewardRedemptionPayload(points);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.reason });
    }
  }

  next();
};
