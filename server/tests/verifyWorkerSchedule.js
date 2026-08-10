import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Availability from '../models/Availability.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FixNearby';

const runVerification = async () => {
  try {
    console.log('Connecting to database at:', process.env.MONGODB_URI);
    await connectDB();

    const dbConnected = mongoose.connection.readyState === 1;

    if (!dbConnected) {
      console.warn('MongoDB connection unavailable. Verifying controller & middleware exports...');
      const scheduleController = await import('../controllers/scheduleController.js');
      const bookingValidation = await import('../middleware/bookingValidation.js');

      if (!scheduleController.getWorkerScheduleById || !scheduleController.setRecurringAvailability || !scheduleController.blockTimeSlot) {
        throw new Error('Schedule controller functions are missing expected exports!');
      }

      if (!bookingValidation.checkBookingOverlap) {
        throw new Error('checkBookingOverlap middleware export missing!');
      }

      console.log('✅ Controller and middleware exports verified successfully!');
      process.exit(0);
    }

    console.log('Cleaning test records...');
    const testWorkerEmail = 'schedule-test-worker@example.com';
    const testUserEmail = 'schedule-test-user@example.com';

    await Worker.deleteMany({ email: testWorkerEmail });
    await User.deleteMany({ email: testUserEmail });

    const worker = await Worker.create({
      name: 'Schedule Test Worker',
      email: testWorkerEmail,
      password: 'Password123',
      category: 'Electrical',
      experience: '4 years',
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      contact: '+15005550099',
      bio: 'Expert electrician',
    });

    const user = await User.create({
      name: 'Schedule Test User',
      email: testUserEmail,
      password: 'Password123',
      phone: '+15005550099',
    });

    await Availability.deleteMany({ workerId: worker._id });
    await Booking.deleteMany({ workerId: worker._id });

    console.log('\n--- 1. Testing setRecurringAvailability ---');
    const { setRecurringAvailability, getWorkerScheduleById, blockTimeSlot, removeBlockedSlot } = await import('../controllers/scheduleController.js');

    const reqRecurring = {
      worker: { _id: worker._id },
      body: {
        slots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
        ],
      },
    };

    let statusRes = null;
    let jsonRes = null;

    const mockRes = () => ({
      status: (code) => {
        statusRes = code;
        return {
          json: (data) => {
            jsonRes = data;
          },
        };
      },
    });

    await setRecurringAvailability(reqRecurring, mockRes());
    console.log('setRecurringAvailability status:', statusRes);
    if (statusRes !== 200 || !jsonRes.success) {
      throw new Error(`setRecurringAvailability failed: ${JSON.stringify(jsonRes)}`);
    }

    console.log('\n--- 2. Testing blockTimeSlot ---');
    const targetDateStr = '2026-08-10'; // Monday
    const reqBlock = {
      worker: { _id: worker._id },
      body: {
        date: targetDateStr,
        startTime: '10:00',
        endTime: '12:00',
        reason: 'Dentist Appointment',
      },
    };

    await blockTimeSlot(reqBlock, mockRes());
    console.log('blockTimeSlot status:', statusRes);
    if (statusRes !== 201 || !jsonRes.success) {
      throw new Error(`blockTimeSlot failed: ${JSON.stringify(jsonRes)}`);
    }

    const createdSlotId = jsonRes.blockedSlot._id;

    console.log('\n--- 3. Testing getWorkerScheduleById ---');
    const reqGetSchedule = {
      params: { id: worker._id.toString() },
      query: { startDate: '2026-08-10', endDate: '2026-08-16' },
    };

    await getWorkerScheduleById(reqGetSchedule, mockRes());
    console.log('getWorkerScheduleById status:', statusRes);
    if (statusRes !== 200 || !jsonRes.success) {
      throw new Error(`getWorkerScheduleById failed: ${JSON.stringify(jsonRes)}`);
    }
    console.log('Returned recurring availability count:', jsonRes.recurringAvailability.length);
    console.log('Returned blocked slots count:', jsonRes.blockedSlots.length);

    console.log('\n--- 4. Testing Booking Conflict Detection Middleware ---');
    const { checkBookingOverlap } = await import('../middleware/bookingValidation.js');

    // Case 4a: Overlapping with blocked slot (10:00 - 12:00 on 2026-08-10)
    const reqConflictBlock = {
      body: {
        workerId: worker._id.toString(),
        scheduledTime: '2026-08-10T10:30:00.000Z',
        durationHours: 1,
      },
    };

    let nextCalled = false;
    await checkBookingOverlap(reqConflictBlock, mockRes(), () => { nextCalled = true; });
    console.log('Conflict check with blocked slot status:', statusRes, 'message:', jsonRes?.message);
    if (statusRes !== 409 || nextCalled) {
      throw new Error('Conflict detection failed to block overlapping booking with blocked slot!');
    }

    // Case 4b: Outside recurring working hours (Sunday 2026-08-09 when worker only works Mon/Tue)
    const reqOutsideHours = {
      body: {
        workerId: worker._id.toString(),
        scheduledTime: '2026-08-09T10:00:00.000Z', // Sunday
        durationHours: 1,
      },
    };

    nextCalled = false;
    await checkBookingOverlap(reqOutsideHours, mockRes(), () => { nextCalled = true; });
    console.log('Conflict check outside recurring hours status:', statusRes, 'message:', jsonRes?.message);
    if (statusRes !== 409 || nextCalled) {
      throw new Error('Conflict detection failed to catch booking outside worker recurring template hours!');
    }

    console.log('\n--- 5. Testing removeBlockedSlot ---');
    const reqRemoveBlock = {
      worker: { _id: worker._id },
      params: { id: createdSlotId.toString() },
    };

    await removeBlockedSlot(reqRemoveBlock, mockRes());
    console.log('removeBlockedSlot status:', statusRes);
    if (statusRes !== 200 || !jsonRes.success) {
      throw new Error(`removeBlockedSlot failed: ${JSON.stringify(jsonRes)}`);
    }

    console.log('\n✅ ALL WORKER SCHEDULE & AVAILABILITY TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Error:', err);
    process.exit(1);
  }
};

runVerification();
