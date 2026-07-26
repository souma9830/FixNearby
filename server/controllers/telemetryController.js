const JobTelemetry = require('../models/JobTelemetry');
const Booking = require('../models/Booking'); // adjust path/name if your model differs

const GEOFENCE_RADIUS_METERS = 500;

function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.checkIn = async (req, res) => {
  try {
    const { bookingId, workerId, lat, lng } = req.body;

    if (!bookingId || !workerId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'bookingId, workerId, lat, and lng are required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.serviceAddress) {
      return res.status(404).json({ message: 'Booking or service address not found.' });
    }

    const targetLat = booking.serviceAddress.lat;
    const targetLng = booking.serviceAddress.lng;

    const distance = haversineDistanceMeters(lat, lng, targetLat, targetLng);

    if (distance > GEOFENCE_RADIUS_METERS) {
      return res.status(403).json({
        message: `Worker is ${Math.round(distance)}m away, outside the ${GEOFENCE_RADIUS_METERS}m geofence.`,
        distanceFromTargetMeters: distance
      });
    }

    const telemetry = await JobTelemetry.create({
      bookingId,
      workerId,
      checkInCoordinates: { lat, lng },
      distanceFromTargetMeters: distance,
      status: 'checked_in'
    });

    booking.status = 'in_progress';
    await booking.save();

    return res.status(201).json({ message: 'Check-in successful. Job timer started.', telemetry });
  } catch (err) {
    console.error('Telemetry check-in error:', err);
    return res.status(500).json({ message: 'Server error during check-in.' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { telemetryId, lat, lng } = req.body;

    const telemetry = await JobTelemetry.findById(telemetryId);
    if (!telemetry) {
      return res.status(404).json({ message: 'Telemetry record not found.' });
    }

    telemetry.checkOutCoordinates = { lat, lng };
    telemetry.checkOutTimestamp = new Date();
    telemetry.durationMinutes = Math.round(
      (telemetry.checkOutTimestamp - telemetry.checkInTimestamp) / 60000
    );
    telemetry.status = 'checked_out';
    await telemetry.save();

    return res.status(200).json({ message: 'Check-out recorded.', telemetry });
  } catch (err) {
    console.error('Telemetry check-out error:', err);
    return res.status(500).json({ message: 'Server error during check-out.' });
  }
};