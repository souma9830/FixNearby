/**
 * Middleware for validating wallet transaction inputs
 */
import { validateWalletAmount } from '../services/walletVerificationService.js';

export const walletTransactionValidator = (req, res, next) => {
  const { amount } = req.body;
  if (amount !== undefined) {
    const check = validateWalletAmount(amount);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.reason });
    }
  }
  next();
};
