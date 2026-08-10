/**
 * Middleware for validating payout requests
 */
import { calculatePayoutSplit } from '../services/payoutSplitService.js';

export const payoutValidationMiddleware = (req, res, next) => {
  const { amount } = req.body || {};
  if (req.method === 'POST' && amount !== undefined) {
    const split = calculatePayoutSplit(amount);
    if (!split.valid) {
      return res.status(400).json({ success: false, message: split.reason });
    }
  }
  next();
};
