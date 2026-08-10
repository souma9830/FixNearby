import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import { getRedis } from '../utils/redis.js';
import { getIo } from '../socket.js';
import { expirePendingBookings } from '../services/bookingExpiryService.js';
import dotenv from 'dotenv';

dotenv.config();

const isDbConnected = () => mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;

export const startBookingExpiryScheduler = async () => {
  console.log('[BullMQ Expiry Worker]: Initializing booking expiry check worker...');

  if (!isDbConnected()) {
    console.warn('[Expiry Worker] MongoDB not connected — skipping BullMQ expiry worker initialization.');
    return;
  }

  const performExpiryCheck = async () => {
    try {
      if (!isDbConnected()) {
        console.warn('[Expiry Worker] MongoDB unavailable — skipping expiry check.');
        return;
      }

      const expiredCount = await expirePendingBookings(24);
      if (expiredCount > 0) {
        console.log(`[BullMQ Expiry Worker]: Successfully auto-expired and refunded ${expiredCount} stale pending service bookings.`);
      }
    } catch (err) {
      console.error('[Expiry Worker] performExpiryCheck error:', err.message);
    }
  };

  const conn = await getRedis();
  if (conn && conn.status === 'ready') {
    try {
      const expiryWorker = new Worker(
        'booking-expiry-queue',
        async (job) => {
          if (job.name === 'check_expiry') {
            console.log('[BullMQ Expiry Worker]: Executing scheduled expiry scan...');
            await performExpiryCheck();
          }
        },
        { connection: conn }
      );

      expiryWorker.on('completed', (job) => {
        console.log(`[BullMQ Expiry Worker]: Job completed successfully: ${job.id}`);
      });

      expiryWorker.on('failed', (job, err) => {
        console.error(`[BullMQ Expiry Worker]: Job failed for ID ${job?.id}:`, err.message);
      });

      console.log('[BullMQ Expiry Worker]: Registered BullMQ consumer.');
    } catch (err) {
      console.warn('[Expiry Worker] Failed to create BullMQ Worker:', err.message);
      console.log('[BullMQ Expiry Worker]: Fallback to standard setInterval loop.');
    }
  } else {
    console.log('[BullMQ Expiry Worker]: Fallback to standard setInterval loop.');
  }

  setInterval(async () => {
    try {
      await performExpiryCheck();
    } catch (err) {
      console.error('[Expiry Scheduler Fallback Error]: Failed to expire stale bookings:', err.message);
    }
  }, 60000);
};
