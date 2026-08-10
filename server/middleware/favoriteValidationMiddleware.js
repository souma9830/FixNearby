/**
 * Middleware for validating favorite worker actions
 */
import { sanitizeFavoriteWorkerPayload } from '../services/favoriteWorkerRankingService.js';

export const favoriteWorkerValidator = (req, res, next) => {
  const { workerId } = req.body || req.params || {};

  if (workerId !== undefined) {
    const check = sanitizeFavoriteWorkerPayload(workerId);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.reason });
    }
  }

  next();
};
