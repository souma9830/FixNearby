import { Worker } from 'bullmq';
import User from '../models/User.js';
import WorkerModel from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Issue from '../models/Issue.js';
import DeadLetterJob from '../models/DeadLetterJob.js';
import sendEmail from '../utils/sendEmail.js';
import sendSMS from '../utils/sendSMS.js';
import { getRedis } from '../utils/redis.js';
import dotenv from 'dotenv';
import Notification from '../models/Notification.js';
import { getIo } from '../socket.js';
import { notificationQueueEngine } from '../services/notificationQueueEngine.js';


dotenv.config();

const processJob = async (job) => {
  const { name, data } = job;
  console.log(`[Worker] Processing Job: "${name}", ID: ${job.id}`);

  switch (name) {
    case 'welcome': {
      const { userId, userType } = data;
      let userObj;
      if (userType === 'Worker') {
        userObj = await WorkerModel.findById(userId);
      } else {
        userObj = await User.findById(userId);
      }

      if (!userObj) {
        throw new Error(`User not found: ${userId} (${userType})`);
      }

      const prefs = userObj.notificationPreferences || { email: true, sms: true, push: true };

      if (prefs.email && userObj.email) {
        await sendEmail({
          toEmail: userObj.email,
          subject: 'Welcome to FixNearby!',
          htmlContent: `<h2>Welcome ${userObj.name}!</h2><p>Thank you for registering with FixNearby. We are excited to have you on board!</p>`
        });
      }

      if (prefs.sms && userObj.contact) {
        await sendSMS({
          toPhone: userObj.contact,
          message: `Hello ${userObj.name}, welcome to FixNearby! Your account has been registered successfully.`
        });
      } else if (prefs.sms && userObj.phone) {
        await sendSMS({
          toPhone: userObj.phone,
          message: `Hello ${userObj.name}, welcome to FixNearby! Your account has been registered successfully.`
        });
      }

      if (prefs.push) {
        console.log(`[Push Notification Mock] Sent welcome push to ${userObj.name}`);
      }
      break;
    }

    case 'booking_confirmation': {
      const { bookingId } = data;
      const booking = await Booking.findById(bookingId).populate('userId').populate('workerId');
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const user = booking.userId;
      const worker = booking.workerId;

      if (user) {
        const userPrefs = user.notificationPreferences || { email: true, sms: true, push: true };

        // Email
        if (userPrefs.email && user.email) {
          await sendEmail({
            toEmail: user.email,
            subject: 'Booking Confirmation - FixNearby',
            htmlContent: `<h2>Booking Confirmed!</h2><p>Your booking for service <strong>${booking.service}</strong> with worker <strong>${worker.name}</strong> is confirmed.</p><p>Price: ₹${booking.price}</p>`
          });
        }

        // SMS
        if (userPrefs.sms && (user.contact || user.phone)) {
          await sendSMS({
            toPhone: user.contact || user.phone,
            message: `FixNearby Booking Confirmed! Service: ${booking.service} with ${worker.name}. Price: ₹${booking.price}.`
          });
        }

        // In-app notification (DB + socket)
        const notification = await Notification.create({
          recipientId: user._id,
          recipientModel: 'User',
          type: 'booking_confirmed',
          title: 'Booking confirmed',
          message: `Your booking for ${booking.service} with ${worker.name} is confirmed.`,
          entityId: booking._id,
          status: 'unread',
          readAt: null,
        });

        try {
          const io = getIo();
          io?.to(String(user._id)).emit('notification:new', { notification });
        } catch {}

        if (userPrefs.push) {
          console.log(`[Push Notification Mock] Sent booking confirmation push to User: ${user.name}`);
        }
      }


      // 2. Notify Worker
      if (worker) {
        const workerPrefs = worker.notificationPreferences || { email: true, sms: true, push: true };

        // Email
        if (workerPrefs.email && worker.email) {
          await sendEmail({
            toEmail: worker.email,
            subject: 'New Booking Assigned - FixNearby',
            htmlContent: `<h2>New Booking Assigned</h2><p>You have a new booking for service <strong>${booking.service}</strong> with customer <strong>${user.name}</strong>.</p><p>Price: ₹${booking.price}</p>`
          });
        }

        // SMS
        if (workerPrefs.sms && (worker.contact || worker.phone)) {
          await sendSMS({
            toPhone: worker.contact || worker.phone,
            message: `FixNearby New Booking! Service: ${booking.service} with customer ${user.name}. Price: ₹${booking.price}.`
          });
        }

        // In-app notification (DB + socket)
        const notification = await Notification.create({
          recipientId: worker._id,
          recipientModel: 'Worker',
          type: 'booking_confirmed',
          title: 'New booking assigned',
          message: `You have a new booking for ${booking.service} with ${user.name}.`,
          entityId: booking._id,
          status: 'unread',
          readAt: null,
        });

        try {
          const io = getIo();
          io?.to(String(worker._id)).emit('notification:new', { notification });
        } catch {}

        if (workerPrefs.push) {
          console.log(`[Push Notification Mock] Sent booking assigned push to Worker: ${worker.name}`);
        }
      }
      break;
    }

    case 'booking_status_update': {
      const { bookingId, oldStatus, newStatus } = data;
      const booking = await Booking.findById(bookingId).populate('userId').populate('workerId');
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const user = booking.userId;
      const worker = booking.workerId;

      // User
      if (user) {
        const prefs = user.notificationPreferences || { email: true, sms: true, push: true };

        if (prefs.email && user.email) {
          await sendEmail({
            toEmail: user.email,
            subject: `Booking Status Update - ${newStatus}`,
            htmlContent: `<h2>Booking Status Updated</h2><p>Your booking for service <strong>${booking.service}</strong> has been updated from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>`
          });
        }

        if (prefs.sms && (user.contact || user.phone)) {
          await sendSMS({
            toPhone: user.contact || user.phone,
            message: `FixNearby Booking Status: ${booking.service} updated to ${newStatus}.`
          });
        }

        const notification = await Notification.create({
          recipientId: user._id,
          recipientModel: 'User',
          type: 'booking_status_update',
          title: `Booking ${newStatus}`,
          message: `Your booking for ${booking.service} was updated from ${oldStatus} to ${newStatus}.`,
          entityId: booking._id,
          status: 'unread',
          readAt: null,
        });

        try {
          const io = getIo();
          io?.to(String(user._id)).emit('notification:new', { notification });
        } catch {}

        if (prefs.push) {
          console.log(`[Push Notification Mock] Sent status update push to User: ${user.name}`);
        }
      }

      // Worker
      if (worker) {
        const prefs = worker.notificationPreferences || { email: true, sms: true, push: true };

        const notification = await Notification.create({
          recipientId: worker._id,
          recipientModel: 'Worker',
          type: 'booking_status_update',
          title: `Booking ${newStatus}`,
          message: `Your booking for ${booking.service} is now ${newStatus}.`,
          entityId: booking._id,
          status: 'unread',
          readAt: null,
        });

        try {
          const io = getIo();
          io?.to(String(worker._id)).emit('notification:new', { notification });
        } catch {}

        if (prefs.push) {
          console.log(`[Push Notification Mock] Sent status update push to Worker: ${worker.name}`);
        }
      }

      break;
    }

    case 'booking_reminder': {
      const { bookingId } = data;
      const booking = await Booking.findById(bookingId).populate('userId').populate('workerId');
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      const user = booking.userId;
      const worker = booking.workerId;

      if (user) {
        const userPrefs = user.notificationPreferences || { email: true, sms: true, push: true };

        if (userPrefs.email && user.email) {
          await sendEmail({
            toEmail: user.email,
            subject: 'Upcoming Booking Reminder - FixNearby',
            htmlContent: `<h2>Booking Reminder</h2><p>This is a reminder that your booking for service <strong>${booking.service}</strong> with worker <strong>${worker.name}</strong> is scheduled for <strong>${new Date(booking.scheduledTime).toLocaleString()}</strong>.</p>`
          });
        }

        if (userPrefs.sms && (user.contact || user.phone)) {
          await sendSMS({
            toPhone: user.contact || user.phone,
            message: `FixNearby Booking Reminder! Service: ${booking.service} with ${worker.name} is scheduled for ${new Date(booking.scheduledTime).toLocaleString()}.`
          });
        }

        const notification = await Notification.create({
          recipientId: user._id,
          recipientModel: 'User',
          type: 'booking_reminder',
          title: 'Booking reminder',
          message: `Your booking for ${booking.service} is scheduled for ${new Date(booking.scheduledTime).toLocaleString()}.`,
          entityId: booking._id,
          status: 'unread',
          readAt: null,
        });

        try {
          const io = getIo();
          io?.to(String(user._id)).emit('notification:new', { notification });
        } catch {}

        if (userPrefs.push) {
          console.log(`[Push Notification Mock] Sent booking reminder push to User: ${user.name}`);
        }
      }

      break;
    }

    case 'booking_rescheduled': {
      const { bookingId } = data;
      const booking = await Booking.findById(bookingId).populate('userId').populate('workerId');
      if (!booking) {
        throw new Error(`Booking not found: ${bookingId}`);
      }

      // In-app + socket notifications will be created after existing email/SMS logic below.


      const user = booking.userId;
      const worker = booking.workerId;

      if (user) {
        const userPrefs = user.notificationPreferences || { email: true, sms: true, push: true };

        if (userPrefs.email && user.email) {
          await sendEmail({
            toEmail: user.email,
            subject: 'Booking Rescheduled - FixNearby',
            htmlContent: `<h2>Booking Rescheduled</h2><p>Your booking for service <strong>${booking.service}</strong> has been rescheduled to <strong>${new Date(booking.scheduledTime).toLocaleString()}</strong>.</p>`
          });
        }

        if (userPrefs.sms && (user.contact || user.phone)) {
          await sendSMS({
            toPhone: user.contact || user.phone,
            message: `FixNearby: Booking rescheduled successfully. Service: ${booking.service} is now scheduled for ${new Date(booking.scheduledTime).toLocaleString()}.`
          });
        }

        const notification = await Notification.create({
          recipientId: user._id,
          recipientModel: 'User',
          type: 'booking_rescheduled',
          title: 'Reschedule accepted',
          message: `Your booking for ${booking.service} has been rescheduled to ${new Date(booking.scheduledTime).toLocaleString()}.`,
          entityId: booking._id,
          status: 'unread',
          readAt: null,
        });

        try {
          const io = getIo();
          io?.to(String(user._id)).emit('notification:new', { notification });
        } catch {}

        if (userPrefs.push) {
          console.log(`[Push Notification Mock] Sent booking rescheduled push to User: ${user.name}`);
        }
      }

      if (worker) {
        const workerPrefs = worker.notificationPreferences || { email: true, sms: true, push: true };

        if (workerPrefs.email && worker.email) {
          await sendEmail({
            toEmail: worker.email,
            subject: 'Booking Rescheduled - FixNearby',
            htmlContent: `<h2>Booking Rescheduled</h2><p>Your booking for service <strong>${booking.service}</strong> with customer <strong>${user.name}</strong> has been rescheduled to <strong>${new Date(booking.scheduledTime).toLocaleString()}</strong>.</p>`
          });
        }

        if (workerPrefs.sms && (worker.contact || worker.phone)) {
          await sendSMS({
            toPhone: worker.contact || worker.phone,
            message: `FixNearby: Booking rescheduled. Service: ${booking.service} with ${user.name} is now scheduled for ${new Date(booking.scheduledTime).toLocaleString()}.`
          });
        }

        const notification = await Notification.create({
          recipientId: worker._id,
          recipientModel: 'Worker',
          type: 'booking_rescheduled',
          title: 'Booking rescheduled',
          message: `Your booking for ${booking.service} with ${user.name} has been rescheduled to ${new Date(booking.scheduledTime).toLocaleString()}.`,
          entityId: booking._id,
          status: 'unread',
          readAt: null,
        });

        try {
          const io = getIo();
          io?.to(String(worker._id)).emit('notification:new', { notification });
        } catch {}

        if (workerPrefs.push) {
          console.log(`[Push Notification Mock] Sent booking rescheduled push to Worker: ${worker.name}`);
        }
      }
      break;
    }

    case 'civic_report_created': {
      const { issueId } = data;
      const issue = await Issue.findById(issueId).populate('reportedBy');
      if (!issue) {
        throw new Error(`Issue not found: ${issueId}`);
      }

      const user = issue.reportedBy;
      if (user) {
        const prefs = user.notificationPreferences || { email: true, sms: true, push: true };
        if (prefs.email && user.email) {
          await sendEmail({
            toEmail: user.email,
            subject: 'Civic Report Received - FixNearby',
            htmlContent: `<h2>Civic Report Submitted</h2><p>Thank you for reporting <strong>${issue.title}</strong> in the category <strong>${issue.category}</strong>. Our team is looking into it.</p>`
          });
        }
        if (prefs.sms && (user.contact || user.phone)) {
          await sendSMS({
            toPhone: user.contact || user.phone,
            message: `FixNearby: Your civic report for "${issue.title}" has been received. Thank you!`
          });
        }
        if (prefs.push) {
          console.log(`[Push Notification Mock] Sent report creation push to ${user.name}`);
        }
      }
      break;
    }

    case 'issue_status_update': {
      const { issueId, oldStatus, newStatus } = data;
      const issue = await Issue.findById(issueId).populate('reportedBy');
      if (!issue) {
        throw new Error(`Issue not found: ${issueId}`);
      }

      const user = issue.reportedBy;
      if (user) {
        const prefs = user.notificationPreferences || { email: true, sms: true, push: true };
        if (prefs.email && user.email) {
          await sendEmail({
            toEmail: user.email,
            subject: `Civic Report Status Update - ${newStatus}`,
            htmlContent: `<h2>Report Status Updated</h2><p>Your civic report for <strong>${issue.title}</strong> has been updated to <strong>${newStatus}</strong>.</p>`
          });
        }
        if (prefs.sms && (user.contact || user.phone)) {
          await sendSMS({
            toPhone: user.contact || user.phone,
            message: `FixNearby Report Update: "${issue.title}" is now "${newStatus}".`
          });
        }
        if (prefs.push) {
          console.log(`[Push Notification Mock] Sent status update push to ${user.name}`);
        }
      }
      break;
    }

    default:
      console.warn(`[Worker] Unhandled Job Name: ${name}`);
  }
};

let worker = null;

export const startWorker = async () => {
  const conn = await getRedis();
  if (!conn || conn.status !== 'ready') {
    console.warn('[Worker] Gracefully skipping worker start: Redis is offline.');
    return null;
  }

  try {
    worker = new Worker('notification-queue', processJob, {
      connection: conn,
      concurrency: 5
    });
  } catch (err) {
    console.warn('[Worker] Failed to create BullMQ Worker:', err.message);
    return null;
  }

  worker.on('completed', (job) => {
    console.log(`[Worker] Job completed: ${job.id}`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`[Worker] Job failed: ${job?.id || 'unknown'}, Error: ${err.message}`);

    if (job && job.attemptsMade >= job.opts.attempts) {
      console.log(`[Worker] Logging job ${job.id} to Dead Letter Queue (MDB) after ${job.attemptsMade} failed attempts.`);
      try {
        await DeadLetterJob.create({
          jobId: job.id,
          queueName: job.queueName,
          jobName: job.name,
          data: job.data,
          failedReason: err.message,
          stacktrace: job.stacktrace
        });
        console.log(`[Worker] Job ${job.id} recorded in MDB Dead Letter Job collection.`);
      } catch (dlqErr) {
        console.error('[Worker] Failed to write to Dead Letter Job collection:', dlqErr);
      }
    }
  });

  console.log('[Worker] Notification background worker listening to Redis-backed BullMQ queue.');
  return worker;
};
