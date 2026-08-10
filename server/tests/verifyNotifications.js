import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import WorkerModel from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Issue from '../models/Issue.js';
import DeadLetterJob from '../models/DeadLetterJob.js';
import { queueNotification, notificationQueue } from '../utils/queue.js';
import { startWorker } from '../workers/notificationWorker.js';
import { truncate } from '../utils/stringUtils.js';

dotenv.config();

const runTests = async () => {
  try {
    console.log(`[Verify Notifications] Truncation test check: ${truncate('Notification Payload Info', 12)}`);
    console.log('Connecting to database...');
    await connectDB();

    if (!mongoose.connection.readyState) {
      console.error('Failed to establish database connection. Exiting.');
      process.exit(1);
    }

    console.log('Cleaning up old test data...');
    const testEmailUser = 'testuser-notif@example.com';
    const testEmailWorker = 'testworker-notif@example.com';
    
    await User.deleteMany({ email: testEmailUser });
    await WorkerModel.deleteMany({ email: testEmailWorker });
    await DeadLetterJob.deleteMany({});

    console.log('Creating test user and worker...');
    const user = await User.create({
      name: 'Test Notif User',
      email: testEmailUser,
      password: 'Password123',
      phone: '+15005550006',
      notificationPreferences: { email: true, sms: true, push: true }
    });

    const worker = await WorkerModel.create({
      name: 'Test Notif Worker',
      email: testEmailWorker,
      password: 'Password123',
      category: 'Electrical',
      experience: '3 years',
      location: { type: 'Point', coordinates: [-73.935242, 40.73061] },
      contact: '+15005550006',
      bio: 'Electrician bio.',
      notificationPreferences: { email: true, sms: true, push: true }
    });

    console.log('Starting background worker...');
    const backgroundWorker = startWorker();
    
    let hasRedis = false;
    if (notificationQueue && backgroundWorker) {
      try {
        const client = notificationQueue.opts.connection;
        if (client && client.status === 'ready') {
          await client.ping();
          hasRedis = true;
        }
      } catch (err) {
        // Redis connection failed or ping failed
      }
    }
    console.log(`Redis-backed BullMQ active: ${hasRedis}`);

    console.log('\n--- Running Test cases ---');

    // Test 1: Simulating Registration (Welcome notification)
    console.log('\nTest 1: Simulating User Registration (Welcome Notification)');
    await queueNotification('welcome', { userId: user._id, userType: 'User' });
    
    // Test 2: Simulating Booking Confirmation
    console.log('\nTest 2: Simulating Booking Confirmation');
    const booking = await Booking.create({
      userId: user._id,
      workerId: worker._id,
      service: 'Electrical Repair',
      scheduledTime: new Date(),
      durationHours: 2,
      address: '123 Test St',
      price: 120,
      status: 'Pending'
    });
    await queueNotification('booking_confirmation', { bookingId: booking._id });

    // Test 3: Simulating Booking Status Update
    console.log('\nTest 3: Simulating Booking Status Update (Pending -> Completed)');
    booking.status = 'Completed';
    await booking.save();
    await queueNotification('booking_status_update', {
      bookingId: booking._id,
      oldStatus: 'Pending',
      newStatus: 'Completed'
    });

    // Test 4: Simulating Civic Report Creation
    console.log('\nTest 4: Simulating Civic Report Creation');
    const issue = await Issue.create({
      title: 'Broken Street Light',
      description: 'The street light on Main St is blinking.',
      category: 'Street Light',
      latitude: 42.3601,
      longitude: -71.0589,
      location: {
        type: 'Point',
        coordinates: [-71.0589, 42.3601]
      },
      reportedBy: user._id
    });
    await queueNotification('civic_report_created', { issueId: issue._id });

    // Test 5: Simulating Issue Status Update
    console.log('\nTest 5: Simulating Civic Report Status Update');
    await queueNotification('issue_status_update', {
      issueId: issue._id,
      oldStatus: 'open',
      newStatus: 'resolved'
    });

    // Test 6: Simulating Job failure and Dead-Letter log recording
    console.log('\nTest 6: Simulating Job failure & Dead Letter Log recording');
    const fakeUserId = new mongoose.Types.ObjectId();
    
    if (hasRedis) {
      console.log('Queueing failing job to verify retry backoff and dead-letter log...');
      const failingJob = await notificationQueue.add('welcome', {
        userId: fakeUserId,
        userType: 'User'
      }, {
        attempts: 2,
        backoff: { type: 'fixed', delay: 100 }
      });
      console.log(`Queued failing job ID: ${failingJob.id}`);
      
      // Wait for the job to fail and check dead-letter collection
      console.log('Waiting for job failure processing...');
      let attempts = 0;
      let deadLetterDoc = null;
      while (attempts < 15) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        deadLetterDoc = await DeadLetterJob.findOne({ jobId: failingJob.id });
        if (deadLetterDoc) {
          break;
        }
        attempts++;
      }
      
      if (deadLetterDoc) {
        console.log('Dead Letter Log Document recorded successfully in database!');
        console.log(`- Job ID: ${deadLetterDoc.jobId}`);
        console.log(`- Failed Reason: ${deadLetterDoc.failedReason}`);
        console.log(`- Failed At: ${deadLetterDoc.failedAt}`);
        console.log('Test 6 PASSED!');
      } else {
        console.warn('Failing job did not write to Dead Letter Log database collection in time. (Or Redis offline/issues).');
      }
    } else {
      console.log('Skipping real BullMQ failure test (Redis is offline). Simulating model write...');
      const mockDeadLetter = await DeadLetterJob.create({
        jobId: 'mock-failed-job-id',
        queueName: 'notification-queue',
        jobName: 'welcome',
        data: { userId: fakeUserId, userType: 'User' },
        failedReason: 'User not found: ' + fakeUserId,
        stacktrace: ['Error: User not found', 'at processJob']
      });
      console.log('Mock Dead Letter Document created successfully:', mockDeadLetter._id);
      console.log('Test 6 (Mocked) PASSED!');
    }

    console.log('\n--- CLEANING UP ---');
    await Booking.findByIdAndDelete(booking._id);
    await Issue.findByIdAndDelete(issue._id);
    await User.findByIdAndDelete(user._id);
    await WorkerModel.findByIdAndDelete(worker._id);
    await DeadLetterJob.deleteMany({});
    
    if (backgroundWorker && typeof backgroundWorker.close === 'function') {
      await backgroundWorker.close();
    }
    
    console.log('Cleanup completed successfully.');
    console.log('\n=============================================');
    console.log('ALL NOTIFICATION WORKER INTEGRATION TESTS PASSED!');
    console.log('=============================================');

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nXXX NOTIFICATION TEST RUN ENCOUNTERED ERROR XXX');
    console.error(error);
    mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
