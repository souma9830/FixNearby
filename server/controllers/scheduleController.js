import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Availability from '../models/Availability.js';
import mongoose from 'mongoose';
import { getIo } from '../socket.js';

// Helper: generate time slots between two times in 1-hour increments
const generateSlots = (startTime, endTime) => {
  const slots = [];
  const [startH] = startTime.split(':').map(Number);
  const [endH] = endTime.split(':').map(Number);
  for (let h = startH; h < endH; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
};

// Internal helper to build schedule data for a worker and date range
const buildScheduleData = async (workerId, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Fetch bookings in the range
  const bookings = await Booking.find({
    workerId,
    scheduledTime: { $gte: start, $lte: end },
    status: { $in: ['Accepted', 'In-Progress', 'Pending'] },
  }).select('scheduledTime durationHours service status');

  // Fetch worker and availability document
  const worker = await Worker.findById(workerId).select('name category availabilityStatus recurringAvailability blockedSlots');
  if (!worker) {
    throw new Error('Worker not found');
  }

  const availDoc = await Availability.findOne({ workerId });

  // Merge blocked slots from both sources
  const workerBlocked = worker.blockedSlots || [];
  const availBlocked = availDoc?.blockedSlots || [];

  const combinedBlockedMap = new Map();
  [...workerBlocked, ...availBlocked].forEach((slot) => {
    const key = `${new Date(slot.date).toISOString().split('T')[0]}_${slot.startTime}_${slot.endTime}`;
    combinedBlockedMap.set(key, {
      _id: slot._id,
      date: slot.date,
      endDate: slot.endDate || slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason || '',
    });
  });

  const blockedSlotsList = Array.from(combinedBlockedMap.values()).filter((slot) => {
    const slotDate = new Date(slot.date);
    return slotDate >= start && slotDate <= end;
  });

  // Format bookings into day-keyed structure
  const schedule = {};
  const dayMs = 24 * 60 * 60 * 1000;
  let current = new Date(start);
  while (current <= end) {
    const dateKey = current.toISOString().split('T')[0];
    schedule[dateKey] = {
      date: dateKey,
      bookings: [],
      blocked: [],
      available: true,
    };
    current = new Date(current.getTime() + dayMs);
  }

  // Populate bookings
  for (const b of bookings) {
    const dateKey = new Date(b.scheduledTime).toISOString().split('T')[0];
    if (schedule[dateKey]) {
      schedule[dateKey].bookings.push({
        _id: b._id,
        time: b.scheduledTime,
        duration: b.durationHours,
        service: b.service,
        status: b.status,
      });
      schedule[dateKey].available = false;
    }
  }

  // Populate blocked slots
  for (const bs of blockedSlotsList) {
    const dateKey = new Date(bs.date).toISOString().split('T')[0];
    if (schedule[dateKey]) {
      schedule[dateKey].blocked.push({
        _id: bs._id,
        startTime: bs.startTime,
        endTime: bs.endTime,
        reason: bs.reason,
      });
    }
  }

  const recurring = availDoc?.weeklySchedule?.length
    ? availDoc.weeklySchedule
    : worker.recurringAvailability || [];

  return {
    worker: {
      _id: worker._id,
      name: worker.name,
      category: worker.category,
      availabilityStatus: worker.availabilityStatus,
    },
    schedule,
    recurringAvailability: recurring,
    blockedSlots: blockedSlotsList,
  };
};

// @desc    Get logged in worker's schedule for a date range
// @route   GET /api/schedule/
// @access  Private (Worker)
export const getWorkerSchedule = async (req, res) => {
  try {
    const workerId = req.worker._id;
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const now = new Date();
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
    }

    const data = await buildScheduleData(workerId, startDate, endDate);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching worker schedule:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching schedule',
    });
  }
};

// @desc    Get public / customer-facing schedule for a worker by ID
// @route   GET /api/schedule/worker/:id
// @access  Public / Private
export const getWorkerScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid worker ID' });
    }

    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      const now = new Date();
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      startDate = start.toISOString().split('T')[0];
      endDate = end.toISOString().split('T')[0];
    }

    const data = await buildScheduleData(id, startDate, endDate);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching worker schedule by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch worker schedule',
    });
  }
};

// @desc    Set recurring weekly availability
// @route   POST /api/schedule/set-recurring (or /api/schedule/recurring)
// @access  Private (Worker)
export const setRecurringAvailability = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const slots = req.body.slots || req.body.weeklySchedule || req.body.recurringAvailability;

    if (!Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: 'Slots must be an array of { dayOfWeek, startTime, endTime }',
      });
    }

    // Validate each slot
    for (const slot of slots) {
      if (slot.dayOfWeek === undefined || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        return res.status(400).json({
          success: false,
          message: `Invalid dayOfWeek value: ${slot.dayOfWeek}. Must be 0-6.`,
        });
      }
      if (!slot.startTime || !slot.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Each slot must have startTime and endTime (e.g. "09:00", "17:00")',
        });
      }
    }

    // Update Worker document
    await Worker.findByIdAndUpdate(workerId, {
      $set: { recurringAvailability: slots },
    });

    // Update or upsert Availability document
    await Availability.findOneAndUpdate(
      { workerId },
      { $set: { weeklySchedule: slots } },
      { upsert: true, new: true }
    );

    // Emit availability update event
    try {
      const io = getIo();
      if (io) io.emit('availability-update', { workerId });
    } catch (ioErr) {
      console.warn('Socket update failed:', ioErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Recurring availability updated successfully',
      recurringAvailability: slots,
    });
  } catch (error) {
    console.error('Error setting recurring availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update recurring availability',
    });
  }
};

// @desc    Block a specific time slot / range
// @route   POST /api/schedule/block
// @access  Private (Worker)
export const blockTimeSlot = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const { date, startDate, endDate, startTime, endTime, reason } = req.body;

    const blockDateStr = date || startDate;
    if (!blockDateStr || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, startTime, and endTime',
      });
    }

    const slotDate = new Date(blockDateStr);
    const slotEndDate = endDate ? new Date(endDate) : new Date(slotDate);

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const slotStart = new Date(slotDate);
    slotStart.setHours(startH, startM || 0, 0, 0);

    const slotEnd = new Date(slotEndDate);
    slotEnd.setHours(endH, endM || 0, 0, 0);

    if (slotEnd <= slotStart) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Check for overlapping active bookings
    const overlappingBooking = await Booking.findOne({
      workerId,
      status: { $in: ['Accepted', 'Pending', 'In-Progress'] },
      $expr: {
        $and: [
          { $lt: ['$scheduledTime', slotEnd] },
          {
            $lt: [
              slotStart,
              {
                $add: [
                  '$scheduledTime',
                  { $multiply: ['$durationHours', 3600000] },
                ],
              },
            ],
          },
        ],
      },
    });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Cannot block slot: an active booking exists during this time period.',
      });
    }

    const blockData = {
      date: slotDate,
      endDate: slotEndDate,
      startTime,
      endTime,
      reason: reason || '',
    };

    // Update Worker schema
    const updatedWorker = await Worker.findByIdAndUpdate(
      workerId,
      { $push: { blockedSlots: blockData } },
      { new: true }
    );

    // Update Availability model
    await Availability.findOneAndUpdate(
      { workerId },
      { $push: { blockedSlots: blockData } },
      { upsert: true, new: true }
    );

    // Emit availability update socket event
    try {
      const io = getIo();
      if (io) io.emit('availability-update', { workerId });
    } catch (ioErr) {
      console.warn('Socket update failed:', ioErr.message);
    }

    const createdSlot = updatedWorker?.blockedSlots?.[updatedWorker.blockedSlots.length - 1] || blockData;

    res.status(201).json({
      success: true,
      message: 'Time slot blocked successfully',
      blockedSlot: createdSlot,
    });
  } catch (error) {
    console.error('Error blocking time slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block time slot',
    });
  }
};

// @desc    Get blocked slots for a date range
// @route   GET /api/schedule/blocked
// @access  Private (Worker)
export const getBlockedSlots = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const { startDate, endDate } = req.query;

    const worker = await Worker.findById(workerId).select('blockedSlots');
    const availDoc = await Availability.findOne({ workerId });

    let blocked = [
      ...(worker?.blockedSlots || []),
      ...(availDoc?.blockedSlots || []),
    ];

    // Deduplicate by string ID or date+time
    const map = new Map();
    blocked.forEach((b) => {
      const key = b._id ? b._id.toString() : `${b.date}_${b.startTime}_${b.endTime}`;
      map.set(key, b);
    });
    blocked = Array.from(map.values());

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      blocked = blocked.filter((slot) => {
        const d = new Date(slot.date);
        return d >= start && d <= end;
      });
    }

    // Sort by date descending
    blocked.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      blockedSlots: blocked,
    });
  } catch (error) {
    console.error('Error fetching blocked slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked slots',
    });
  }
};

// @desc    Remove a blocked slot
// @route   DELETE /api/schedule/block/:id
// @access  Private (Worker)
export const removeBlockedSlot = async (req, res) => {
  try {
    const workerId = req.worker._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid slot ID' });
    }

    // Update Worker
    await Worker.findByIdAndUpdate(workerId, {
      $pull: { blockedSlots: { _id: id } },
    });

    // Update Availability
    await Availability.findOneAndUpdate(
      { workerId },
      { $pull: { blockedSlots: { _id: id } } }
    );

    // Emit availability update event
    try {
      const io = getIo();
      if (io) io.emit('availability-update', { workerId });
    } catch (ioErr) {
      console.warn('Socket update failed:', ioErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Blocked slot removed successfully',
    });
  } catch (error) {
    console.error('Error removing blocked slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove blocked slot',
    });
  }
};
