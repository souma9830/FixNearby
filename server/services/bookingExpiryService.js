import Booking from '../models/Booking.js';
import Wallet from '../models/Wallet.js';
import { getIo } from '../socket.js';
import crypto from 'crypto';

export const expirePendingBookings = async (thresholdHours = 24) => {
  const cutoff = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

  // Find all stale pending bookings
  const staleBookings = await Booking.find({
    status: 'Pending',
    createdAt: { $lte: cutoff }
  });

  if (staleBookings.length === 0) return 0;

  let expiredCount = 0;

  for (const booking of staleBookings) {
    booking.status = 'Expired';
    booking.statusHistory.push({
      status: 'Expired',
      note: `Automated timeout: Worker did not respond within ${thresholdHours}h`,
      changedAt: new Date()
    });

    await booking.save();
    expiredCount++;

    // Release held wallet funds back to user
    if (booking.price && booking.price > 0) {
      try {
        const wallet = await Wallet.findOne({ userId: booking.userId });
        if (wallet) {
          wallet.balance += booking.price;
          wallet.transactions.push({
            transactionId: `txn_${crypto.randomBytes(8).toString('hex')}`,
            type: 'refund',
            amount: booking.price,
            status: 'completed',
            bookingId: booking._id,
            description: `Auto-refund for expired booking ${booking._id}`
          });
          await wallet.save();
        }
      } catch (walletErr) {
        console.error(`[Expiry Service] Wallet refund failed for booking ${booking._id}:`, walletErr.message);
      }
    }

    // Trigger real-time socket notifications to customer & worker
    try {
      const io = getIo();
      if (io) {
        const payload = {
          bookingId: booking._id,
          status: 'Expired',
          message: 'Booking request expired due to worker inactivity. Funds refunded to wallet.'
        };
        io.to(booking.userId.toString()).emit('booking-expired', payload);
        io.to(booking.workerId.toString()).emit('booking-expired', payload);
        io.to(booking.workerId.toString()).emit('availability-update', { workerId: booking.workerId, reason: 'slot_released' });
      }
    } catch (socketErr) {
      console.warn(`[Expiry Service] Socket alert failed for booking ${booking._id}:`, socketErr.message);
    }
  }

  return expiredCount;
};

export const checkAndExpireBooking = async (bookingId, thresholdHours = 24) => {
  if (!bookingId) return false;
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.status !== 'Pending') return false;

  const cutoff = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);
  if (booking.createdAt <= cutoff) {
    booking.status = 'Expired';
    booking.statusHistory.push({
      status: 'Expired',
      note: `Single check timeout: Exceeded ${thresholdHours}h limit`,
      changedAt: new Date()
    });
    await booking.save();
    return true;
  }
  return false;
};
