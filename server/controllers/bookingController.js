import Booking, { STATUS_ENUM } from '../models/Booking.js';
import Referral from '../models/Referral.js';
import Reward from '../models/Reward.js';
import User from '../models/User.js';
import WorkerModel from '../models/Worker.js';
import { queueNotification } from '../utils/queue.js';
import mongoose from 'mongoose';
import { getPrincipal } from '../middleware/bookingMiddleware.js';
import { getIo } from '../socket.js';
import { emitBookingStatusUpdate } from '../socketHandlers/bookingHandler.js';
import { acquireLock, releaseLock } from '../utils/lockManager.js';

// @desc    Create a new booking with concurrency control, transactions, and standalone DB fallback
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  const executeCreate = async (useSession) => {
    let session = null;
    if (useSession) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch (err) {
        session = null;
      }
    }

    const { workerId, service, scheduledTime, durationHours, address, price } = req.body;
    const start = new Date(scheduledTime);
    const end = new Date(start.getTime() + durationHours * 3600000);
    console.log(`[BookingController] Creating booking: start=${start.toISOString()}, end=${end.toISOString()}, worker=${workerId}`);

    // Overlap condition query for all active/pending slots
    const query = {
      workerId,
      status: { $nin: ['Cancelled', 'Expired'] },
      $expr: {
        $and: [
          { $lt: ['$scheduledTime', end] },
          {
            $lt: [
              start,
              {
                $add: [
                  '$scheduledTime',
                  { $multiply: ['$durationHours', 3600000] }
                ]
              }
            ]
          }
        ]
      }
    };

    const lockAcquired = await acquireLock(workerId, start.getTime());
    if (!lockAcquired) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return {
        status: 423,
        data: {
          success: false,
          message: 'This time slot is temporarily locked for booking. Please try again shortly.'
        }
      };
    }

    try {
      const overlap = session
        ? await Booking.findOne(query).session(session)
        : await Booking.findOne(query);

      if (overlap) {
        releaseLock(workerId, start.getTime());
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return {
          status: 409,
          data: {
            success: false,
            message: 'Worker has an overlapping accepted or in-progress booking during this time slot.'
          }
        };
      }

      const bookingData = {
        userId: req.user._id,
        workerId,
        service,
        scheduledTime: start,
        durationHours,
        address,
        price,
        status: 'Pending',
        statusHistory: [{
          status: 'Pending',
          changedBy: req.user._id,
          changedByModel: 'User',
          note: 'Booking created'
        }]
      };

      const bookingArray = session
        ? await Booking.create([bookingData], { session })
        : [await Booking.create(bookingData)];

      const booking = bookingArray[0];

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }

      releaseLock(workerId, start.getTime());

      return {
        status: 201,
        data: {
          success: true,
          message: 'Booking created successfully',
          booking
        }
      };
    } catch (createErr) {
      releaseLock(workerId, start.getTime());
      if (session) {
        try {
          await session.abortTransaction();
          session.endSession();
        } catch (abortErr) {
          // ignore
        }
      }
      throw createErr;
    }
  };

  try {
    const { workerId, service, scheduledTime, durationHours, address, price } = req.body;

    if (!workerId || !service || !scheduledTime || !durationHours || !address || !price) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: workerId, service, scheduledTime, durationHours, address, price'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID'
      });
    }

    const start = new Date(scheduledTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduledTime'
      });
    }

    let result;
    try {
      result = await executeCreate(true);
    } catch (err) {
      if (err.message.includes('Transaction numbers are only allowed') || err.code === 20) {
        console.warn('MongoDB transactions not supported (standalone mode). Retrying creation without session...');
        result = await executeCreate(false);
      } else {
        throw err;
      }
    }

    if (result.status === 201) {
      const { booking } = result.data;

      // Queue booking confirmation notification
      try {
        await queueNotification('booking_confirmation', { bookingId: booking._id });
      } catch (notifyErr) {
        console.error('Failed to queue notification:', notifyErr.message);
      }

      // Emit availability update socket event
      try {
        const io = getIo();
        if (io) {
          io.emit('availability-update', { workerId: booking.workerId });
          emitBookingStatusUpdate(io, booking, { oldStatus: null });
        }
      } catch (ioErr) {
        console.error('Failed to emit availability update:', ioErr.message);
      }

      // Setup a timeout to automatically transition status to 'Expired' in 15 minutes
      const expiryTimeMs = req.body._testExpiryTimeMs || 15 * 60 * 1000;
      setTimeout(async () => {
        try {
          const pendingBooking = await Booking.findById(booking._id);
          if (pendingBooking && pendingBooking.status === 'Pending') {
            pendingBooking.status = 'Expired';
            await pendingBooking.save();
            console.log(`Booking ${booking._id} has expired due to worker response timeout.`);
            emitBookingStatusUpdate(getIo(), pendingBooking, { oldStatus: 'Pending' });
          }
        } catch (err) {
          console.error('Error running booking expiry timeout:', err.message);
        }
      }, expiryTimeMs);
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
};

// @desc    Worker accepts booking
// @route   PATCH /api/bookings/:id/accept
// @access  Private
export const acceptBooking = async (req, res, next) => {
  try {
    const booking = req.booking;
    const principal = getPrincipal(req);

    booking.status = 'Accepted';
    booking.statusHistory.push({
      status: 'Accepted',
      changedBy: principal.ref._id,
      changedByModel: principal.model,
      note: 'Booking accepted by worker'
    });
    await booking.save();

    try {
      await queueNotification('booking_status_update', {
        bookingId: booking._id,
        oldStatus: 'Pending',
        newStatus: 'Accepted'
      });
    } catch (notifyErr) {
      console.error('Failed to queue status update notification:', notifyErr.message);
    }

    try {
      const io = getIo();
      if (io) {
        io.emit('availability-update', { workerId: booking.workerId });
        emitBookingStatusUpdate(io, booking, { oldStatus: 'Pending' });
      }
    } catch (ioErr) {
      console.error('Failed to emit availability update:', ioErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

const processReferralsAndRewardsOnCompletion = async (booking) => {
  try {
    // 1. Process Referral Credit for the customer's referrer
    const customer = await User.findById(booking.userId);
    if (customer && customer.email) {
      const referral = await Referral.findOne({
        referredEmail: customer.email.toLowerCase(),
        status: { $in: ['pending', 'joined'] }
      });

      if (referral) {
        referral.status = 'credited';
        referral.referredUserId = customer._id;
        referral.creditedAt = new Date();
        await referral.save();

        // Credit referrer (User or Worker)
        let referrer = await User.findById(referral.referrerId);
        if (!referrer) {
          referrer = await WorkerModel.findById(referral.referrerId);
        }
        if (referrer) {
          referrer.walletBalance = (referrer.walletBalance || 0) + referral.rewardAmount;
          await referrer.save({ validateBeforeSave: false });
          console.log(`[Referral] Credited ₹${referral.rewardAmount} to referrer ${referrer.name} for booking completion by ${customer.email}`);
        }
      }
    }

    // 2. Process Worker Monthly Job Milestone & Reward Badge
    const worker = await WorkerModel.findById(booking.workerId);
    if (worker) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      let reward = await Reward.findOne({ workerId: worker._id, month: currentMonth });

      if (!reward) {
        reward = await Reward.create({
          workerId: worker._id,
          month: currentMonth,
          jobsCompleted: 0,
          milestoneTarget: 10,
          bonusAmount: 1000,
          claimed: false,
          badgeEarned: 'Top Performer'
        });
      }

      reward.jobsCompleted += 1;
      await reward.save();

      worker.monthlyCompletedJobs = (worker.monthlyCompletedJobs || 0) + 1;
      if (reward.jobsCompleted >= reward.milestoneTarget) {
        worker.topPerformerBadge = true;
      }
      await worker.save({ validateBeforeSave: false });
      console.log(`[Reward] Worker ${worker.name} completed job ${reward.jobsCompleted}/${reward.milestoneTarget} for ${currentMonth}`);
    }
  } catch (err) {
    console.error('[Referral/Reward] Failed to process completion reward logic:', err.message);
  }
};

// @desc    Complete booking
// @route   PATCH /api/bookings/:id/complete
// @access  Private
export const completeBooking = async (req, res, next) => {
  try {
    const booking = req.booking;
    const principal = getPrincipal(req);
    const oldStatus = booking.status;

    booking.status = 'Completed';
    booking.statusHistory.push({
      status: 'Completed',
      changedBy: principal.ref._id,
      changedByModel: principal.model,
      note: 'Booking completed by worker'
    });
    await booking.save();

    // Trigger referral crediting and worker milestone rewards asynchronously
    processReferralsAndRewardsOnCompletion(booking).catch(err =>
      console.error('[Referral/Reward] Background completion handler failed:', err.message)
    );

    try {
      await queueNotification('booking_status_update', {
        bookingId: booking._id,
        oldStatus,
        newStatus: 'Completed'
      });
    } catch (notifyErr) {
      console.error('Failed to queue status update notification:', notifyErr.message);
    }

    try {
      const io = getIo();
      if (io) {
        io.emit('availability-update', { workerId: booking.workerId });
        emitBookingStatusUpdate(io, booking, { oldStatus });
      }
    } catch (ioErr) {
      console.error('Failed to emit availability update:', ioErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = req.booking;
    const principal = getPrincipal(req);
    const oldStatus = booking.status;

    booking.status = 'Cancelled';
    booking.statusHistory.push({
      status: 'Cancelled',
      changedBy: principal.ref._id,
      changedByModel: principal.model,
      note: req.body.note || 'Booking cancelled'
    });
    await booking.save();

    try {
      await queueNotification('booking_status_update', {
        bookingId: booking._id,
        oldStatus,
        newStatus: 'Cancelled'
      });
    } catch (notifyErr) {
      console.error('Failed to queue status update notification:', notifyErr.message);
    }

    try {
      const io = getIo();
      if (io) {
        io.emit('availability-update', { workerId: booking.workerId });
        emitBookingStatusUpdate(io, booking, { oldStatus, note: req.body.note || 'Booking cancelled' });
      }
    } catch (ioErr) {
      console.error('Failed to emit availability update:', ioErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for user or worker
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res, next) => {
  try {
    const principal = getPrincipal(req);
    const query = {};

    if (principal.model === 'Worker') {
      query.workerId = principal.id;
    } else {
      query.userId = principal.id;
    }

    const { status } = req.query;
    if (status) {
      const normalized = String(status).trim();
      if (!STATUS_ENUM.includes(normalized)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed: ${STATUS_ENUM.join(', ')}`
        });
      }
      query.status = normalized;
    }

    const bookings = await Booking.find(query)
      .populate('workerId', 'name category')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single booking by ID (participant-only)
// @route   GET /api/bookings/:id
// @access  Private (participant)
export const getBookingById = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      booking: req.booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule a booking
// @route   PATCH /api/bookings/:id/reschedule
// @access  Private (User/Customer only)
export const rescheduleBooking = async (req, res, next) => {
  try {
    const booking = req.booking;
    const principal = getPrincipal(req);

    // Only the customer who created the booking can reschedule it
    if (principal.model !== 'User' || String(booking.userId) !== principal.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: only the customer can reschedule this booking'
      });
    }

    // Only Pending bookings can be rescheduled
    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be rescheduled'
      });
    }

    const { scheduledTime } = req.body;
    if (!scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide scheduledTime'
      });
    }

    const start = new Date(scheduledTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduledTime'
      });
    }

    // Must be in the future
    if (start.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled time must be in the future'
      });
    }

    const durationHours = booking.durationHours;
    const end = new Date(start.getTime() + durationHours * 3600000);

    // Overlap query for the worker, excluding current booking
    const query = {
      workerId: booking.workerId,
      _id: { $ne: booking._id },
      status: { $in: ['Accepted', 'In-Progress'] },
      $expr: {
        $and: [
          { $lt: ['$scheduledTime', end] },
          {
            $lt: [
              start,
              {
                $add: [
                  '$scheduledTime',
                  { $multiply: ['$durationHours', 3600000] }
                ]
              }
            ]
          }
        ]
      }
    };

    const overlap = await Booking.findOne(query);
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'Worker has an overlapping accepted or in-progress booking during this new time slot.'
      });
    }

    // Update scheduledTime, reset reminderSent and log in statusHistory
    const oldTime = booking.scheduledTime;
    booking.scheduledTime = start;
    booking.reminderSent = false;
    booking.statusHistory.push({
      status: 'Pending',
      changedBy: principal.ref._id,
      changedByModel: 'User',
      note: `Booking rescheduled from ${new Date(oldTime).toLocaleString()} to ${start.toLocaleString()}`
    });

    await booking.save();

    // Queue notification
    try {
      await queueNotification('booking_rescheduled', { bookingId: booking._id });
    } catch (notifyErr) {
      console.error('Failed to queue rescheduling notification:', notifyErr.message);
    }

    // Socket update
    try {
      const io = getIo();
      if (io) {
        io.emit('availability-update', { workerId: booking.workerId });
        emitBookingStatusUpdate(io, booking, { oldStatus: 'Pending', note: 'Booking rescheduled' });
      }
    } catch (ioErr) {
      console.error('Failed to emit availability update:', ioErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status generically
// @route   PATCH /api/bookings/:id/status
// @access  Private (Participant only)
export const updateBookingStatusController = async (req, res, next) => {
  try {
    const booking = req.booking;
    const principal = getPrincipal(req);
    const oldStatus = booking.status;
    const to = req.body.status;

    booking.status = to;
    booking.statusHistory.push({
      status: to,
      changedBy: principal.ref._id,
      changedByModel: principal.model,
      note: req.body.note || `Booking status updated to ${to}`
    });
    await booking.save();

    try {
      await queueNotification('booking_status_update', {
        bookingId: booking._id,
        oldStatus,
        newStatus: to
      });
    } catch (notifyErr) {
      console.error('Failed to queue status update notification:', notifyErr.message);
    }

    try {
      const io = getIo();
      if (io) {
        io.emit('availability-update', { workerId: booking.workerId });
        emitBookingStatusUpdate(io, booking, { oldStatus, note: req.body.note || `Booking status updated to ${to}` });
      }
    } catch (ioErr) {
      console.error('Failed to emit availability update:', ioErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${to} successfully`,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the status change timeline for a booking
// @route   GET /api/bookings/:id/timeline
// @access  Private (Participant)
export const getBookingTimeline = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .select('status statusHistory updatedAt createdAt')
      .populate('statusHistory.changedBy', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const steps = booking.statusHistory.map((h) => ({
      status: h.status,
      label: h.status,
      timestamp: h.changedAt,
      actor: h.changedBy?.name || 'System',
      note: h.note || '',
    }));

    // Make sure the current status is represented as a step
    const hasCurrent = steps.some((s) => s.status === booking.status);
    if (!hasCurrent) {
      steps.push({
        status: booking.status,
        label: booking.status,
        timestamp: booking.updatedAt || booking.createdAt,
        actor: 'Current',
        note: 'Current status',
      });
    }

    // Sort chronologically
    steps.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({ success: true, steps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
