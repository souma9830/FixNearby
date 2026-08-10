import Booking from '../models/Booking.js';
import Worker from '../models/Worker.js';
import Availability from '../models/Availability.js';

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const checkBookingOverlap = async (req, res, next) => {
  try {
    const { workerId, scheduledTime, durationHours } = req.body;

    if (!workerId || !scheduledTime || !durationHours) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workerId, scheduledTime, and durationHours',
      });
    }

    const start = new Date(scheduledTime);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduledTime',
      });
    }

    const end = new Date(start.getTime() + durationHours * 3600000);

    // 1. Check active booking overlaps (Accepted, In-Progress, Pending)
    const overlap = await Booking.findOne({
      workerId,
      status: { $in: ['Accepted', 'In-Progress', 'Pending'] },
      $expr: {
        $and: [
          { $lt: ['$scheduledTime', end] },
          {
            $lt: [
              start,
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

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'Worker has an overlapping accepted or in-progress booking during this time slot.',
      });
    }

    // 2. Check blocked slots in Worker or Availability
    const worker = await Worker.findById(workerId).select('recurringAvailability blockedSlots');
    const availDoc = await Availability.findOne({ workerId });

    const blockedSlots = [
      ...(worker?.blockedSlots || []),
      ...(availDoc?.blockedSlots || []),
    ];

    for (const bs of blockedSlots) {
      if (!bs.date || !bs.startTime || !bs.endTime) continue;

      const bDate = new Date(bs.date);
      const bEndDate = bs.endDate ? new Date(bs.endDate) : new Date(bDate);

      const [sH, sM] = bs.startTime.split(':').map(Number);
      const [eH, eM] = bs.endTime.split(':').map(Number);

      const bStart = new Date(Date.UTC(
        bDate.getUTCFullYear(),
        bDate.getUTCMonth(),
        bDate.getUTCDate(),
        sH,
        sM || 0,
        0,
        0
      ));

      const bEnd = new Date(Date.UTC(
        bEndDate.getUTCFullYear(),
        bEndDate.getUTCMonth(),
        bEndDate.getUTCDate(),
        eH,
        eM || 0,
        0,
        0
      ));

      if (start < bEnd && end > bStart) {
        return res.status(409).json({
          success: false,
          message: 'Time slot unavailable: worker has blocked off this date/time range.',
        });
      }
    }

    // 3. Check recurring weekly schedule templates
    const recurring = availDoc?.weeklySchedule?.length
      ? availDoc.weeklySchedule
      : worker?.recurringAvailability;

    if (recurring && recurring.length > 0) {
      const dayOfWeek = start.getUTCDay();
      const daySlot = recurring.find((s) => s.dayOfWeek === dayOfWeek);

      if (!daySlot || daySlot.isAvailable === false) {
        return res.status(409).json({
          success: false,
          message: 'Worker is not available on this day of the week.',
        });
      }

      const workStartMins = parseTimeToMinutes(daySlot.startTime);
      const workEndMins = parseTimeToMinutes(daySlot.endTime);

      const reqStartMins = start.getUTCHours() * 60 + start.getUTCMinutes();
      const reqEndMins = reqStartMins + (durationHours * 60);

      if (reqStartMins < workStartMins || reqEndMins > workEndMins) {
        return res.status(409).json({
          success: false,
          message: `Requested time slot is outside worker's working hours (${daySlot.startTime} - ${daySlot.endTime}) for this day.`,
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
