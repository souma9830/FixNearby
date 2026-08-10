/**
 * Middleware for validating dispute payload parameters
 */
import { validateClaimAmount } from '../services/disputeWorkflowService.js';

export const disputePayloadValidator = (req, res, next) => {
  const { reason, claimAmount } = req.body;
  
  if (req.method === 'POST') {
    const validReasons = ['INCOMPLETE_WORK', 'PROPERTY_DAMAGE', 'UNPROFESSIONAL_BEHAVIOR', 'OVERCHARGED', 'NON_PAYMENT', 'OTHER'];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing dispute reason' });
    }

    if (claimAmount !== undefined) {
      const check = validateClaimAmount(claimAmount);
      if (!check.valid) {
        return res.status(400).json({ success: false, message: check.reason });
      }
    }
  }

  next();
};
