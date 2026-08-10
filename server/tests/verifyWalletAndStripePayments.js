import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import express from 'express';
import { createServer } from 'http';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Wallet from '../models/Wallet.js';
import paymentRoutes from '../routes/paymentRoutes.js';
import walletRoutes from '../routes/walletRoutes.js';

dotenv.config();

const PORT = 5578;
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
process.env.JWT_SECRET = JWT_SECRET;

async function runTests() {
  console.log('--- STARTING IN-APP WALLET & STRIPE PAYMENTS TESTS ---');

  // 1. Connect DB
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  const testUserEmail = 'test_wallet_user@example.com';
  const testWorkerEmail = 'test_wallet_worker@example.com';

  await User.deleteMany({ email: testUserEmail });
  await Worker.deleteMany({ email: testWorkerEmail });

  // 2. Create Test User, Worker, and Booking
  console.log('Creating test user, worker, and booking...');
  const testUser = await User.create({
    name: 'Bob WalletUser',
    email: testUserEmail,
    password: 'Password123'
  });

  const testWorker = await Worker.create({
    name: 'Charlie Handyman',
    email: testWorkerEmail,
    password: 'Password123',
    category: 'Handyman',
    experience: '5 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '9998887777',
    bio: 'Test worker for wallet payments'
  });

  await Wallet.deleteMany({ userId: testUser._id });

  const testBooking = await Booking.create({
    userId: testUser._id,
    workerId: testWorker._id,
    service: 'Handyman Repair',
    scheduledTime: new Date(),
    durationHours: 2,
    address: '100 Main Street',
    price: 80,
    status: 'Pending'
  });

  // Setup test Express server
  const app = express();
  app.use(express.json());
  app.use('/api/payments', paymentRoutes);
  app.use('/api/wallet', walletRoutes);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test payment server running on port ${PORT}`);

  const userToken = jwt.sign({ id: testUser._id }, JWT_SECRET, { expiresIn: '1d' });
  const authHeaders = {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  };

  const baseUrl = `http://localhost:${PORT}/api`;

  // Test 1: GET /api/wallet/balance
  console.log('Testing GET /api/wallet/balance (initial bonus balance)...');
  const balRes = await fetch(`${baseUrl}/wallet/balance`, { headers: authHeaders });
  const balData = await balRes.json();

  if (!balData.success || balData.balance !== 100) {
    throw new Error(`Expected initial balance 100, got ${balData.balance}`);
  }
  console.log('PASSED: Initial Wallet balance ($100 welcome bonus)!');

  // Test 2: POST /api/wallet/topup
  console.log('Testing POST /api/wallet/topup (adding $50)...');
  const topupRes = await fetch(`${baseUrl}/wallet/topup`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ amount: 50, method: 'card' })
  });
  const topupData = await topupRes.json();

  if (!topupData.success || topupData.balance !== 150) {
    throw new Error(`Expected balance 150 after topup, got ${topupData.balance}`);
  }
  console.log('PASSED: Wallet top-up endpoint ($150 balance)!');

  // Test 3: POST /api/payments/create-intent (Stripe PaymentIntent)
  console.log('Testing POST /api/payments/create-intent...');
  const intentRes = await fetch(`${baseUrl}/payments/create-intent`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      bookingId: testBooking._id.toString(),
      amount: 80,
      method: 'card'
    })
  });
  const intentData = await intentRes.json();

  if (!intentData.success || !intentData.clientSecret) {
    throw new Error(`PaymentIntent creation failed: ${intentData.message}`);
  }
  console.log('PaymentIntent Client Secret:', intentData.clientSecret?.slice(0, 25) + '...');
  console.log('PASSED: Stripe PaymentIntent creation!');

  // Test 4: POST /api/wallet/pay (1-Click Wallet Checkout)
  console.log('Testing POST /api/wallet/pay (1-Click Wallet checkout)...');
  const payRes = await fetch(`${baseUrl}/wallet/pay`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      bookingId: testBooking._id.toString(),
      amount: 80
    })
  });
  const payData = await payRes.json();

  if (!payData.success || payData.newBalance !== 70) {
    throw new Error(`Expected new balance 70 after $80 payment, got ${payData.newBalance}`);
  }

  const updatedBooking = await Booking.findById(testBooking._id);
  if (updatedBooking.status !== 'Accepted') {
    throw new Error(`Expected booking status 'Accepted', got '${updatedBooking.status}'`);
  }

  console.log('PASSED: 1-Click Wallet checkout & instant booking confirmation!');

  // Test 5: POST /api/payments/webhook (Stripe Webhook simulation)
  console.log('Testing POST /api/payments/webhook...');
  const webhookRes = await fetch(`${baseUrl}/payments/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: intentData.stripePaymentIntentId,
          metadata: { bookingId: testBooking._id.toString() }
        }
      }
    })
  });
  const webhookData = await webhookRes.json();

  if (!webhookData.received) {
    throw new Error('Stripe Webhook response missing received: true');
  }
  console.log('PASSED: Stripe Webhook handler!');

  // Test 6: POST /api/payments/:id/refund
  console.log('Testing POST /api/payments/:id/refund...');
  const refundRes = await fetch(`${baseUrl}/payments/${payData.payment._id}/refund`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ reason: 'Customer requested cancellation' })
  });
  const refundData = await refundRes.json();

  if (!refundData.success || refundData.payment.status !== 'refunded') {
    throw new Error(`Refund failed: ${refundData.message}`);
  }
  console.log('PASSED: Refund processing via Stripe API!');

  // Clean up
  server.close();
  await Payment.deleteMany({ userId: testUser._id });
  await Wallet.deleteMany({ userId: testUser._id });
  await Booking.deleteMany({ userId: testUser._id });
  await User.deleteMany({ email: testUserEmail });
  await Worker.deleteMany({ email: testWorkerEmail });
  await mongoose.disconnect();

  console.log('--- ALL IN-APP WALLET & STRIPE PAYMENTS TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
