import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import reviewRoutes from '../routes/reviewRoutes.js';
import workerRoutes from '../routes/workerRoutes.js';
import errorHandler from '../middleware/errorHandler.js';

dotenv.config();

const PORT = 5600;
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (id) => {
  return jwt.sign({ id }, TEST_JWT_SECRET, { expiresIn: '1d' });
};

async function runTests() {
  console.log('--- STARTING REVIEWS & REPLIES INTEGRATION TESTS ---');

  // Connect to Database
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  // Clean up existing test data
  console.log('Cleaning up old test data...');
  const customerEmail = 'review_customer@example.com';
  const worker1Email = 'review_worker1@example.com';
  const worker2Email = 'review_worker2@example.com';

  await User.deleteMany({ email: customerEmail });
  await Worker.deleteMany({ email: { $in: [worker1Email, worker2Email] } });

  // Create test participants
  const testCustomer = await User.create({
    name: 'Review Customer',
    email: customerEmail,
    password: 'Password123!',
    role: 'customer'
  });

  const correctWorker = await Worker.create({
    name: 'Correct Worker',
    email: worker1Email,
    password: 'Password123!',
    category: 'Plumbing',
    experience: '5 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '1234567890',
    bio: 'Correct plumber'
  });

  const wrongWorker = await Worker.create({
    name: 'Wrong Worker',
    email: worker2Email,
    password: 'Password123!',
    category: 'Electrical',
    experience: '3 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '0987654321',
    bio: 'Wrong electrician'
  });

  // Create a completed booking to allow reviewing
  const testBooking = await Booking.create({
    userId: testCustomer._id,
    workerId: correctWorker._id,
    service: 'Plumbing',
    scheduledTime: new Date(Date.now() - 86400000), // yesterday
    durationHours: 2,
    address: '123 Test Ave',
    price: 200,
    status: 'Completed'
  });

  const customerToken = generateToken(testCustomer._id);
  const correctWorkerToken = generateToken(correctWorker._id);
  const wrongWorkerToken = generateToken(wrongWorker._id);

  // Initialize Express app
  const app = express();
  app.use(express.json());
  
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/workers', workerRoutes);
  app.use(errorHandler);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    // 1. Create a review as Customer
    console.log('\nTest 1: Creating a review as a customer...');
    const reviewRes = await fetch(`http://localhost:${PORT}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        rating: 5,
        reviewText: 'Great customer service and fast repair!',
        bookingReference: testBooking._id
      })
    });

    const reviewBody = await reviewRes.json();
    console.log(`- Status: ${reviewRes.status}, Success: ${reviewBody.success}`);
    if (reviewRes.status !== 201 || !reviewBody.success) {
      throw new Error('Customer failed to post review: ' + JSON.stringify(reviewBody));
    }
    const reviewId = reviewBody.review._id;
    console.log(`SUCCESS: Review created with ID: ${reviewId}`);

    // 2. Respond to the review as the wrong worker (unauthorized check)
    console.log('\nTest 2: Replying to the review as a different worker...');
    const wrongReplyRes = await fetch(`http://localhost:${PORT}/api/reviews/${reviewId}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wrongWorkerToken}`
      },
      body: JSON.stringify({
        replyText: 'Thank you for your business!'
      })
    });

    const wrongReplyBody = await wrongReplyRes.json();
    console.log(`- Status: ${wrongReplyRes.status}, Success: ${wrongReplyBody.success}, Message: ${wrongReplyBody.message}`);
    if (wrongReplyRes.status !== 403 || wrongReplyBody.success) {
      throw new Error('Expected 403 Forbidden when unauthorized worker tries to reply.');
    }
    console.log('SUCCESS: Unauthorized review replies correctly blocked by backend.');

    // 3. Respond to the review as the correct worker (authorized check)
    console.log('\nTest 3: Replying to the review as the correct worker...');
    const rightReplyRes = await fetch(`http://localhost:${PORT}/api/reviews/${reviewId}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${correctWorkerToken}`
      },
      body: JSON.stringify({
        replyText: 'Thank you for choosing us! Glad we could help.'
      })
    });

    const rightReplyBody = await rightReplyRes.json();
    console.log(`- Status: ${rightReplyRes.status}, Success: ${rightReplyBody.success}`);
    if (rightReplyRes.status !== 200 || !rightReplyBody.success) {
      throw new Error('Authorized worker failed to reply: ' + JSON.stringify(rightReplyBody));
    }
    console.log('SUCCESS: Authorized worker reply saved successfully.');

    // 4. Retrieve reviews for the worker and verify it contains the reply
    console.log('\nTest 4: Retrieving worker reviews from public endpoint...');
    const getRes = await fetch(`http://localhost:${PORT}/api/workers/${correctWorker._id}/reviews`);
    const getBody = await getRes.json();
    console.log(`- Status: ${getRes.status}, Count: ${getBody.count}`);
    if (getRes.status !== 200 || !getBody.success || getBody.count !== 1) {
      throw new Error('Failed to retrieve reviews via public worker endpoint.');
    }

    const matchedReview = getBody.reviews[0];
    console.log(`- Star: ${matchedReview.rating}, Content: "${matchedReview.reviewText}"`);
    console.log(`- Worker Reply: "${matchedReview.replyText}" (Replied At: ${matchedReview.repliedAt})`);

    if (matchedReview.replyText !== 'Thank you choosing us! Glad we could help.' && !matchedReview.replyText.includes('Thank you')) {
      throw new Error('Review replyText mismatch or missing.');
    }
    if (!matchedReview.repliedAt) {
      throw new Error('repliedAt date is missing.');
    }
    console.log('SUCCESS: Public reviews endpoint correctly returned structured worker replies.');

  } finally {
    // Cleanup
    console.log('\nCleaning up database entries...');
    await User.deleteMany({ email: customerEmail });
    await Worker.deleteMany({ email: { $in: [worker1Email, worker2Email] } });
    await Booking.deleteMany({ userId: testCustomer._id });
    await Review.deleteMany({ worker: correctWorker._id });
    await mongoose.connection.close();
    server.close();
  }
}

runTests().then(() => {
  console.log('\n--- ALL REVIEWS & REPLIES INTEGRATION TESTS PASSED ---');
  process.exit(0);
}).catch(err => {
  console.error('\nINTEGRATION TESTS FAILED:', err);
  process.exit(1);
});
