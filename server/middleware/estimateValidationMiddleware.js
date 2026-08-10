/**
 * Middleware for validating estimate parameters
 */
import { calculateServicePriceEstimate } from '../services/priceEstimateMatrixService.js';

export const estimateValidationMiddleware = (req, res, next) => {
  const { baseRate, duration } = req.body || {};

  if (req.method === 'POST') {
    if (baseRate !== undefined && Number(baseRate) <= 0) {
      return res.status(400).json({ success: false, message: 'Base hourly rate must be greater than zero' });
    }
  }

  next();
};
