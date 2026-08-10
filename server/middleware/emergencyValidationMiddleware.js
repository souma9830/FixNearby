/**
 * Middleware for validating emergency dispatch alerts
 */
import { calculateEmergencyPriority, sanitizeEmergencyPayload } from '../services/emergencyDispatchService.js';

export const emergencyAlertValidator = (req, res, next) => {
  const { severity } = req.body;
  const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  if (req.method === 'POST' && (!severity || !validSeverities.includes(severity))) {
    return res.status(400).json({
      success: false,
      message: 'Emergency alert requires a valid severity level (CRITICAL, HIGH, MEDIUM, LOW)'
    });
  }

  if (req.body) {
    req.sanitizedEmergency = sanitizeEmergencyPayload(req.body);
  }

  next();
};
