import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { sendNotification } from '../services/notificationService.js';

dotenv.config();

const isDbConnected = () => mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;

export const checkUpcomingBookings = async () => {
  try {
    if (!isDbConnected()) {
      console.warn('[Booking Reminder] MongoDB unavailable — skipping reminder check.');
      return 0;
    }

    const now = new Date();
    const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const bookings = await Booking.find({
      scheduledTime: { $gte: now, $lte: targetTime },
      status: 'Accepted',
      reminderSent: { $ne: true }
    });

    for (const booking of bookings) {
      try {
        await sendNotification(booking.userId, {
          title: "Upcoming Service Reminder",
          message: `Your service booking for ${booking.service} is scheduled in less than 24 hours.`
        });
        booking.reminderSent = true;
        await booking.save();
      } catch (err) {
        console.error(`[Booking Reminder] Failed to process booking ${booking._id}:`, err.message);
      }
    }
    return bookings.length;
  } catch (err) {
    console.error('[Booking Reminder] checkUpcomingBookings error:', err.message);
    return 0;
  }
};
