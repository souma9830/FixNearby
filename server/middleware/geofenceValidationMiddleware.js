/**
 * Middleware for validating geofence coordinates
 */
import { sanitizeCoordinates } from '../services/geofenceAuditorService.js';

export const geofenceCoordinateValidator = (req, res, next) => {
  const { lat, lng, latitude, longitude } = req.body || {};
  const checkLat = lat ?? latitude;
  const checkLng = lng ?? longitude;

  if (checkLat !== undefined && checkLng !== undefined) {
    const check = sanitizeCoordinates(checkLat, checkLng);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.reason });
    }
  }

  next();
};
