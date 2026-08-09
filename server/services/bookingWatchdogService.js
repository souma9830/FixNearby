/**
 * Booking Expiry Watchdog Service
 * Automatically sweeps unconfirmed/stale bookings past their acceptance window, updating status to 'Expired'.
 */

export const evaluateExpiredBookings = async (BookingModel, options = {}) => {
  const timeoutMinutes = options.timeoutMinutes || 60;
  const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

  if (!BookingModel || typeof BookingModel.find !== 'function') {
    return { expiredCount: 0, processedAt: new Date() };
  }

  const staleBookings = await BookingModel.find({
    status: 'Pending',
    createdAt: { $lte: cutoffTime }
  });

  let expiredCount = 0;

  for (const booking of staleBookings) {
    booking.status = 'Expired';
    await booking.save();
    expiredCount++;
  }

  return {
    expiredCount,
    processedAt: new Date()
  };
};
