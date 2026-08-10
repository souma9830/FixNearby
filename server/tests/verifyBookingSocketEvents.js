import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { io as Client } from 'socket.io-client';
import express from 'express';
import { createServer } from 'http';
import { initSocket } from '../socket.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import { emitBookingStatusUpdate } from '../socketHandlers/bookingHandler.js';

dotenv.config();

const PORT = 5575;
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
process.env.JWT_SECRET = JWT_SECRET;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('--- STARTING WEBSOCKET REAL-TIME BOOKING STATUS TRACKING TESTS ---');

  // 1. Connect to Database
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  // Clean up existing test data
  const testEmails = ['test_socket_user@example.com', 'test_socket_worker@example.com'];
  await User.deleteMany({ email: { $in: testEmails } });
  await Worker.deleteMany({ email: { $in: testEmails } });
  await Booking.deleteMany({ service: 'Socket Status Test Service' });

  // 2. Create test User, Worker, and Booking
  console.log('Creating test user, worker, and booking...');
  const testUser = await User.create({
    name: 'Socket Test User',
    email: 'test_socket_user@example.com',
    password: 'Password123'
  });

  const testWorker = await Worker.create({
    name: 'Socket Test Worker',
    email: 'test_socket_worker@example.com',
    password: 'Password123',
    category: 'Electrical',
    experience: '3 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '9876543210',
    bio: 'Electrician test bio'
  });

  const testBooking = await Booking.create({
    userId: testUser._id,
    workerId: testWorker._id,
    service: 'Socket Status Test Service',
    scheduledTime: new Date(Date.now() + 86400000),
    durationHours: 2,
    address: '123 Test St',
    price: 150,
    status: 'Pending',
    statusHistory: [{
      status: 'Pending',
      changedBy: testUser._id,
      changedByModel: 'User',
      note: 'Booking created'
    }]
  });

  // 3. Create HTTP & Socket Server
  const app = express();
  const server = createServer(app);
  const io = initSocket(server);

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test Socket Server listening on port ${PORT}`);

  // 4. Generate user JWT and connect socket client
  const userToken = jwt.sign({ id: testUser._id }, JWT_SECRET, { expiresIn: '1d' });
  const clientSocket = Client(`http://localhost:${PORT}`, {
    auth: { token: userToken },
    transports: ['websocket'],
    reconnection: false
  });

  let receivedEvent = null;
  const eventPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout waiting for booking:statusUpdate socket event')), 5000);
    clientSocket.on('booking:statusUpdate', (data) => {
      clearTimeout(timeout);
      receivedEvent = data;
      resolve(data);
    });
  });

  await new Promise((resolve, reject) => {
    clientSocket.on('connect', resolve);
    clientSocket.on('connect_error', (err) => reject(new Error(`Connection error: ${err.message}`)));
  });
  console.log('Socket client connected successfully with ID:', clientSocket.id);

  // Join booking room
  clientSocket.emit('join_booking', { bookingId: testBooking._id.toString() });
  await sleep(200);

  // 5. Trigger booking status transition: Pending -> Accepted
  console.log('Triggering booking status transition: Pending -> Accepted...');
  testBooking.status = 'Accepted';
  testBooking.statusHistory.push({
    status: 'Accepted',
    changedBy: testWorker._id,
    changedByModel: 'Worker',
    note: 'Worker accepted booking'
  });
  await testBooking.save();

  // Emit status update socket event
  emitBookingStatusUpdate(io, testBooking, { oldStatus: 'Pending' });

  // 6. Assert socket event payload
  const eventData = await eventPromise;
  console.log('Received socket event data:', eventData);

  if (!eventData || eventData.status !== 'Accepted') {
    throw new Error(`Expected status 'Accepted', got ${eventData?.status}`);
  }
  if (String(eventData.bookingId) !== String(testBooking._id)) {
    throw new Error(`Expected bookingId '${testBooking._id}', got ${eventData?.bookingId}`);
  }
  if (eventData.oldStatus !== 'Pending') {
    throw new Error(`Expected oldStatus 'Pending', got ${eventData?.oldStatus}`);
  }

  console.log('PASSED: Status update Pending -> Accepted received via WebSocket!');

  // 7. Trigger second transition: Accepted -> Technician En Route
  let secondEvent = null;
  const secondPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout waiting for second status update')), 5000);
    clientSocket.on('booking:statusUpdate', (data) => {
      if (data.status === 'Technician En Route') {
        clearTimeout(timeout);
        secondEvent = data;
        resolve(data);
      }
    });
  });

  console.log('Triggering second transition: Accepted -> Technician En Route...');
  testBooking.status = 'Technician En Route';
  testBooking.statusHistory.push({
    status: 'Technician En Route',
    changedBy: testWorker._id,
    changedByModel: 'Worker',
    note: 'Technician is en route'
  });
  await testBooking.save();

  emitBookingStatusUpdate(io, testBooking, { oldStatus: 'Accepted' });

  const secondData = await secondPromise;
  console.log('Received second socket event data:', secondData);

  if (secondData.status !== 'Technician En Route') {
    throw new Error(`Expected status 'Technician En Route', got ${secondData?.status}`);
  }

  console.log('PASSED: Status update Accepted -> Technician En Route received via WebSocket!');

  // Clean up
  clientSocket.disconnect();
  server.close();
  await Booking.deleteMany({ service: 'Socket Status Test Service' });
  await User.deleteMany({ email: { $in: testEmails } });
  await Worker.deleteMany({ email: { $in: testEmails } });
  await mongoose.disconnect();

  console.log('--- ALL WEBSOCKET BOOKING STATUS TRACKING TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
