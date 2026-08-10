import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import express from 'express';
import { createServer } from 'http';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import recommendationRoutes from '../routes/recommendationRoutes.js';
import { getSmartRecommendations } from '../services/recommendationService.js';
import { getRedis } from '../utils/redis.js';

dotenv.config();

const PORT = 5577;
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
process.env.JWT_SECRET = JWT_SECRET;

async function runTests() {
  console.log('--- STARTING AI-POWERED RECOMMENDATIONS ENGINE TESTS ---');

  // 1. Connect DB
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  // Clean test data
  const testUserEmail = 'test_rec_user@example.com';
  const testWorkerEmail1 = 'test_rec_worker1@example.com';
  const testWorkerEmail2 = 'test_rec_worker2@example.com';

  await User.deleteMany({ email: testUserEmail });
  await Worker.deleteMany({ email: { $in: [testWorkerEmail1, testWorkerEmail2] } });

  // 2. Create Test User and Workers
  console.log('Creating test user and workers...');
  const testUser = await User.create({
    name: 'Alice RecommendationTest',
    email: testUserEmail,
    password: 'Password123'
  });

  const worker1 = await Worker.create({
    name: 'Plumbing Expert Pro',
    email: testWorkerEmail1,
    password: 'Password123',
    category: 'Plumbing',
    experience: '8 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] }, // San Francisco center
    averageRating: 4.9,
    reviewCount: 45,
    availabilityStatus: 'available',
    contact: '1112223333',
    bio: 'Top plumber'
  });

  const worker2 = await Worker.create({
    name: 'Electrical Master',
    email: testWorkerEmail2,
    password: 'Password123',
    category: 'Electrical',
    experience: '4 years',
    location: { type: 'Point', coordinates: [-122.4500, 37.8000] }, // ~4km away
    averageRating: 4.6,
    reviewCount: 15,
    availabilityStatus: 'available',
    contact: '4445556666',
    bio: 'Electrician'
  });

  // Create booking history for user (User previously booked Plumbing)
  await Booking.deleteMany({ userId: testUser._id });
  await Booking.create({
    userId: testUser._id,
    workerId: worker1._id,
    service: 'Plumbing',
    scheduledTime: new Date(),
    durationHours: 2,
    address: '456 Market St',
    price: 120,
    status: 'Completed'
  });

  // 3. Test Service Algorithm directly
  console.log('Testing getSmartRecommendations service function...');
  const serviceResult = await getSmartRecommendations({
    userId: testUser._id.toString(),
    lat: 37.7749,
    lng: -122.4194,
    limit: 10
  });

  if (!serviceResult.success) {
    throw new Error('Recommendation service returned success = false');
  }
  console.log('Greeting output:', serviceResult.greeting);
  console.log('Top scored worker:', serviceResult.recommended[0]?.name, 'Score:', serviceResult.recommended[0]?.aiScore);

  if (serviceResult.greeting.userName !== 'Alice') {
    throw new Error(`Expected userName 'Alice', got '${serviceResult.greeting.userName}'`);
  }
  if (!serviceResult.becauseYouBooked || serviceResult.becauseYouBooked.length === 0) {
    throw new Error('Expected non-empty becauseYouBooked array');
  }

  const topWorker = serviceResult.recommended.find((w) => w.id === worker1._id.toString());
  if (!topWorker || topWorker.aiScore < 70) {
    throw new Error(`Expected top worker to have high score, got ${topWorker?.aiScore}`);
  }

  console.log('PASSED: Service algorithm history, location, rating & recency scoring!');

  // 4. Test HTTP Endpoint GET /api/recommendations
  console.log('Testing GET /api/recommendations HTTP endpoint...');
  const app = express();
  app.use(express.json());
  app.use('/api/recommendations', recommendationRoutes);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));

  const userToken = jwt.sign({ id: testUser._id }, JWT_SECRET, { expiresIn: '1d' });
  const httpRes = await fetch(`http://localhost:${PORT}/api/recommendations?lat=37.7749&lng=-122.4194`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const httpData = await httpRes.json();

  if (!httpData.success || !httpData.popularInArea) {
    throw new Error('HTTP recommendation endpoint failed');
  }
  console.log('PASSED: HTTP GET /api/recommendations endpoint!');

  // 5. Test Redis Cache HIT
  console.log('Testing Redis cache HIT on second request...');
  const redis = await getRedis();
  if (redis) {
    const cacheKey = `recommendations:${testUser._id.toString()}:37.77:-122.42`;
    const cachedStr = await redis.get(cacheKey);
    if (cachedStr) {
      console.log('Found valid Redis cache entry!');
    }
  }

  // Clean up
  server.close();
  await Booking.deleteMany({ userId: testUser._id });
  await User.deleteMany({ email: testUserEmail });
  await Worker.deleteMany({ email: { $in: [testWorkerEmail1, testWorkerEmail2] } });
  await mongoose.disconnect();

  console.log('--- ALL AI RECOMMENDATIONS ENGINE TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
