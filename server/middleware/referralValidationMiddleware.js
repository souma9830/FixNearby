/**
 * Middleware for validating referral code parameters
 */
import { sanitizeReferralCode } from '../services/referralTierEvaluatorService.js';

export const referralCodeValidator = (req, res, next) => {
  const { referralCode } = req.body || req.params || {};

  if (referralCode !== undefined) {
    const clean = sanitizeReferralCode(referralCode);
    if (!clean || clean.length < 3) {
      return res.status(400).json({ success: false, message: 'Invalid referral code format format' });
    }
    req.sanitizedReferralCode = clean;
  }

  next();
};
