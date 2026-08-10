/**
 * Middleware for validating worker badge request parameters
 */
import { sanitizeBadgeRequestPayload } from '../services/badgeAccreditationService.js';

export const badgeRequestValidator = (req, res, next) => {
  const { badgeType, notes } = req.body || {};

  if (req.method === 'POST') {
    const check = sanitizeBadgeRequestPayload(badgeType, notes);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: 'Invalid or unsupported badge accreditation type requested' });
    }
    req.sanitizedBadge = check;
  }

  next();
};
