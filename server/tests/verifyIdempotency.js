import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import IdempotencyKey from '../models/IdempotencyKey.js';
import bookingRoutes from '../routes/bookingRoutes.js';
import errorHandler from '../middleware/errorHandler.js';

dotenv.config();

const PORT = 5599;
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (id) => {
  return jwt.sign({ id }, TEST_JWT_SECRET, { expiresIn: '1d' });
};

async function runTests() {
  console.log('--- STARTING IDEMPOTENCY INTEGRATION TESTS ---');

  // Connect to Database
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  // Clean up existing test data
  console.log('Cleaning up old test data...');
  const userEmail = 'idemp_user@example.com';
  const workerEmail = 'idemp_worker@example.com';
  await User.deleteMany({ email: userEmail });
  await Worker.deleteMany({ email: workerEmail });

  // Create test user and worker
  const testUser = await User.create({
    name: 'Idempotency User',
    email: userEmail,
    password: 'Password123!',
    role: 'customer'
  });

  const testWorker = await Worker.create({
    name: 'Idempotency Worker',
    email: workerEmail,
    password: 'Password123!',
    category: 'Plumbing',
    experience: '5 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '1234567890',
    bio: 'Test bio content'
  });

  const token = generateToken(testUser._id);

  // Initialize Express and HTTP Server
  const app = express();
  app.use(express.json());
  
  // Register routes
  app.use('/api/bookings', bookingRoutes);
  app.use(errorHandler);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    const idempotencyKey = 'test_key_' + Date.now();

    // 1. First booking creation submission
    console.log('\nTest 1: Sending first booking creation request...');
    const firstRes = await fetch(`http://localhost:${PORT}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        workerId: testWorker._id,
        service: 'Leak Repair',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        durationHours: 2,
        address: '123 Test St, NY',
        price: 150
      })
    });

    const firstBody = await firstRes.json();
    console.log(`- Status: ${firstRes.status}, Success: ${firstBody.success}, Body: ${JSON.stringify(firstBody)}`);
    if (firstRes.status !== 201 || !firstBody.success) {
      throw new Error('First booking submission failed: ' + JSON.stringify(firstBody));
    }
    const bookingId = firstBody.booking._id;
    console.log(`SUCCESS: Booking created with ID: ${bookingId}`);

    // 2. Second booking creation submission with IDENTICAL idempotency key
    console.log('\nTest 2: Sending duplicate booking creation request...');
    const secondRes = await fetch(`http://localhost:${PORT}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        workerId: testWorker._id,
        service: 'Leak Repair',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        durationHours: 2,
        address: '123 Test St, NY',
        price: 150
      })
    });

    const secondBody = await secondRes.json();
    console.log(`- Status: ${secondRes.status}, Success: ${secondBody.success}`);
    if (secondRes.status !== 201 || !secondBody.success) {
      throw new Error('Duplicate booking request failed to return cached successful response.');
    }
    if (secondBody.booking._id !== bookingId) {
      throw new Error('Duplicate key request returned a different booking ID!');
    }
    console.log('SUCCESS: Duplicate booking submission correctly resolved with cached output.');

    // Verify duplicate booking document wasn't actually created in the DB
    const dbBookings = await Booking.find({ userId: testUser._id });
    console.log(`- Total bookings in DB for user: ${dbBookings.length}`);
    if (dbBookings.length !== 1) {
      throw new Error('Expected exactly 1 booking in database, but duplicate was created!');
    }
    console.log('SUCCESS: Duplicate booking document creation prevented in database.');

    // 3. Test booking cancellation idempotency
    const cancelKey = 'cancel_key_' + Date.now();
    console.log('\nTest 3: Sending first cancel request...');
    const cancel1Res = await fetch(`http://localhost:${PORT}/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Idempotency-Key': cancelKey
      },
      body: JSON.stringify({ reason: 'Found another provider' })
    });
    const cancel1Body = await cancel1Res.json();
    console.log(`- Status: ${cancel1Res.status}, Success: ${cancel1Body.success}`);
    if (cancel1Res.status !== 200 || !cancel1Body.success) {
      throw new Error('First cancel request failed.');
    }

    console.log('\nTest 4: Sending duplicate cancel request with same key...');
    const cancel2Res = await fetch(`http://localhost:${PORT}/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Idempotency-Key': cancelKey
      },
      body: JSON.stringify({ reason: 'Found another provider' })
    });
    const cancel2Body = await cancel2Res.json();
    console.log(`- Status: ${cancel2Res.status}, Success: ${cancel2Body.success}`);
    if (cancel2Res.status !== 200 || !cancel2Body.success) {
      throw new Error('Duplicate cancel request was rejected.');
    }
    console.log('SUCCESS: Duplicate cancellation request resolved with cached output.');

  } finally {
    // Cleanup
    console.log('\nCleaning up database entries...');
    await User.deleteMany({ email: userEmail });
    await Worker.deleteMany({ email: workerEmail });
    await Booking.deleteMany({ userId: testUser._id });
    await IdempotencyKey.deleteMany({ userId: testUser._id });
    await mongoose.connection.close();
    server.close();
  }
}

runTests().then(() => {
  console.log('\n--- ALL IDEMPOTENCY INTEGRATION TESTS PASSED ---');
  process.exit(0);
}).catch(err => {
  console.error('\nINTEGRATION TESTS FAILED:', err);
  process.exit(1);
});
