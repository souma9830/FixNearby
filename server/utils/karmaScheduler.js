import cron from 'node-cron';
import mongoose from 'mongoose';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import { writeAuditLog } from '../models/AuditLog.js';
import { evaluateExpiredBookings } from '../services/bookingWatchdogService.js';

// Calculate and update Karma/Reliability Score for all workers
export const calculateKarmaScores = async () => {
  try {
    const workers = await Worker.find();
    console.log(`[Karma Job] Calculating karma scores for ${workers.length} workers...`);

    for (const worker of workers) {
      try {
        // Get completed and cancelled bookings
        const completedCount = await Booking.countDocuments({ workerId: worker._id, status: 'Completed' });
        const cancelledCount = await Booking.countDocuments({ workerId: worker._id, status: 'Cancelled' });

        const totalCompletedAndCancelled = completedCount + cancelledCount;
        const completionRate = totalCompletedAndCancelled === 0 ? 1.0 : completedCount / totalCompletedAndCancelled;

        const ratingPercentage = (worker.averageRating || 0) / 5; // 0.0 to 1.0
        const responsivenessRate = (worker.responsiveness || 100) / 100; // 0.0 to 1.0

        // Weights: 40% completion rate, 40% rating, 20% responsiveness
        const weightedScore = (completionRate * 0.4) + (ratingPercentage * 0.4) + (responsivenessRate * 0.2);

        // Scale to 0-100 and round
        const karmaScore = Math.min(100, Math.max(0, Math.round(weightedScore * 100)));

        worker.karmaScore = karmaScore;
        await worker.save({ validateBeforeSave: false }); // Bypass password validation/re-hashing
        console.log(`[Karma Job] Worker: ${worker.name}, Completion Rate: ${Math.round(completionRate*100)}%, Rating: ${worker.averageRating}/5, Karma: ${karmaScore}`);
      } catch (workerError) {
        console.error(`[Karma Job Error] Failed to calculate score for worker ${worker.name || worker._id}:`, workerError.message);
        writeAuditLog({
          actorId: worker._id,
          actorType: 'Worker',
          action: 'KARMA_CALCULATION_FAILED',
          resource: 'Worker',
          resourceId: worker._id,
          metadata: { error: workerError.message },
        });
      }
    }

    console.log('[Karma Job] Weekly Karma scores update completed successfully.');
    writeAuditLog({
      actorId: new mongoose.Types.ObjectId("000000000000000000000000"), // System placeholder ID
      actorType: 'System',
      action: 'KARMA_SCHEDULER_COMPLETED',
      resource: 'Worker',
      metadata: { workersCount: workers.length },
    });
  } catch (error) {
    console.error('[Karma Job] Error calculating karma scores:', error);
  }
};

// Initialize weekly scheduler
export const initKarmaScheduler = () => {
  // Run weekly on Sunday at midnight: 0 0 * * 0
  cron.schedule('0 0 * * 0', () => {
    console.log('[Karma Job] Starting weekly Karma score update...');
    calculateKarmaScores();
  });
  console.log('[Karma Job] Weekly scheduler initialized successfully.');
};
