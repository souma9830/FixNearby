import JobTelemetry from '../models/JobTelemetry.js';
import Booking from '../models/Booking.js';

const GEOFENCE_RADIUS_METERS = 500;
const EARTH_RADIUS_METERS = 6371000;

/**
 * Haversine distance in meters between two [lng, lat] coordinate pairs.
 */
export const haversineDistanceMeters = (lng1, lat1, lng2, lat2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const isValidCoordinates = (coords) =>
  Array.isArray(coords) &&
  coords.length === 2 &&
  coords.every((n) => Number.isFinite(n)) &&
  coords[0] >= -180 && coords[0] <= 180 &&
  coords[1] >= -90 && coords[1] <= 90;

// @desc    Geofenced worker check-in (starts the job + telemetry timer)
// @route   POST /api/telemetry/check-in
// @access  Private (assigned worker/provider/admin)
export const workerCheckIn = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const rawCoords = req.body.coordinates;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }
    if (!isValidCoordinates(rawCoords)) {
      return res.status(400).json({ success: false, message: 'coordinates must be [lng, lat] within bounds' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const workerId = String(req.user._id || req.user.id);
    if (String(booking.workerId) !== workerId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this booking' });
    }

    const activeTelemetry = await JobTelemetry.findOne({ bookingId, status: 'checked_in' });
    if (activeTelemetry) {
      return res.status(409).json({ success: false, message: 'Job is already checked in', telemetry: activeTelemetry });
    }

    const target = booking.location?.coordinates;
    if (!target || target.length !== 2) {
      return res.status(400).json({ success: false, message: 'Booking has no saved location coordinates to validate against' });
    }

    const distanceMeters = haversineDistanceMeters(rawCoords[0], rawCoords[1], target[0], target[1]);

    if (distanceMeters > GEOFENCE_RADIUS_METERS) {
      return res.status(403).json({
        success: false,
        message: `You are ${Math.round(distanceMeters)}m from the job location — must be within ${GEOFENCE_RADIUS_METERS}m to start`,
        distanceMeters: Math.round(distanceMeters),
        geofenceRadiusMeters: GEOFENCE_RADIUS_METERS
      });
    }

    const telemetry = await JobTelemetry.create({
      bookingId,
      workerId,
      checkInCoordinates: { type: 'Point', coordinates: rawCoords },
      distanceFromTargetMeters: Math.round(distanceMeters),
      geofenceRadiusMeters: GEOFENCE_RADIUS_METERS,
      status: 'checked_in',
      checkInAt: new Date()
    });

    if (booking.status !== 'In-Progress') {
      booking.status = 'In-Progress';
      booking.statusHistory = booking.statusHistory || [];
      booking.statusHistory.push({
        status: 'In-Progress',
        changedBy: req.user._id || req.user.id,
        changedByModel: 'Worker',
        note: 'Worker geofenced check-in verified — job started'
      });
      await booking.save();
    }

    res.status(201).json({
      success: true,
      message: 'Check-in verified within geofence — job started',
      distanceMeters: Math.round(distanceMeters),
      telemetry,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Worker check-out (stops the telemetry timer and records duration)
// @route   POST /api/telemetry/check-out
// @access  Private (assigned worker/provider/admin)
export const workerCheckOut = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const rawCoords = req.body.coordinates;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const telemetry = await JobTelemetry.findOne({ bookingId, status: 'checked_in' });
    if (!telemetry) {
      return res.status(404).json({ success: false, message: 'No active check-in found for this booking' });
    }

    const workerId = String(req.user._id || req.user.id);
    if (String(telemetry.workerId) !== workerId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this booking' });
    }

    if (rawCoords && !isValidCoordinates(rawCoords)) {
      return res.status(400).json({ success: false, message: 'coordinates must be [lng, lat] within bounds' });
    }

    const checkOutAt = new Date();
    const durationMinutes = Math.max(0, Math.round((checkOutAt - telemetry.checkInAt) / 60000));

    telemetry.status = 'checked_out';
    telemetry.checkOutAt = checkOutAt;
    telemetry.durationMinutes = durationMinutes;
    if (rawCoords) {
      telemetry.checkOutCoordinates = { type: 'Point', coordinates: rawCoords };
    }
    await telemetry.save();

    res.status(200).json({
      success: true,
      message: 'Check-out recorded',
      durationMinutes,
      telemetry
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get telemetry history for a booking (auditability)
// @route   GET /api/telemetry/:bookingId
// @access  Private (participants)
export const getBookingTelemetry = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const telemetry = await JobTelemetry.find({ bookingId }).sort({ checkInAt: -1 });
    res.status(200).json({ success: true, telemetry });
  } catch (error) {
    next(error);
  }
};
