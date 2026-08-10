import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import express from 'express';
import { createServer } from 'http';
import Worker from '../models/Worker.js';
import Booking from '../models/Booking.js';
import Earning from '../models/Earning.js';
import earningRoutes from '../routes/earningRoutes.js';

dotenv.config();

const PORT = 5576;
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret123';
process.env.JWT_SECRET = JWT_SECRET;

async function runTests() {
  console.log('--- STARTING WORKER EARNINGS DASHBOARD & ANALYTICS TESTS ---');

  // 1. Connect DB
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  const testEmail = 'test_earning_worker@example.com';
  await Worker.deleteMany({ email: testEmail });

  // 2. Create Test Worker
  const testWorker = await Worker.create({
    name: 'Earning Test Worker',
    email: testEmail,
    password: 'Password123',
    category: 'Plumbing',
    experience: '5 years',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    contact: '1122334455',
    bio: 'Test worker for earnings analytics'
  });

  const workerId = testWorker._id;
  await Earning.deleteMany({ workerId });

  // Sign worker token
  const workerToken = jwt.sign({ id: workerId, model: 'Worker' }, JWT_SECRET, { expiresIn: '1d' });
  const authHeaders = {
    'Authorization': `Bearer ${workerToken}`,
    'Content-Type': 'application/json'
  };

  // Create sample earnings across different dates
  console.log('Creating sample earning records for worker analytics...');
  await Earning.create([
    {
      workerId,
      amount: 2000,
      platformFee: 200,
      netAmount: 1800,
      type: 'booking_income',
      status: 'paid',
      description: 'Plumbing repair service #1',
      createdAt: new Date()
    },
    {
      workerId,
      amount: 3500,
      platformFee: 350,
      netAmount: 3150,
      type: 'booking_income',
      status: 'paid',
      description: 'Pipe installation service #2',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000)
    },
    {
      workerId,
      amount: 1500,
      platformFee: 150,
      netAmount: 1350,
      type: 'booking_income',
      status: 'pending',
      description: 'Faucet fix service #3',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000)
    }
  ]);

  // 3. Create express server with routes
  const app = express();
  app.use(express.json());
  app.use('/api/earnings', earningRoutes);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Earning test server running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api/earnings`;

  // Test 1: GET /api/earnings/summary
  console.log('Testing GET /api/earnings/summary...');
  const summaryRes = await fetch(`${baseUrl}/summary`, { headers: authHeaders });
  const summaryData = await summaryRes.json();

  if (!summaryData.success) {
    throw new Error(`Summary API failed: ${summaryData.message}`);
  }
  console.log('Summary output:', {
    totalEarnings: summaryData.totalEarnings,
    paidAmount: summaryData.paidAmount,
    bookingCount: summaryData.bookingCount,
    avgEarningPerJob: summaryData.avgEarningPerJob,
    weeklyTrendsLength: summaryData.analytics?.weeklyTrends?.length
  });

  if (summaryData.totalEarnings !== 6300) {
    throw new Error(`Expected totalEarnings 6300, got ${summaryData.totalEarnings}`);
  }
  if (summaryData.paidAmount !== 4950) {
    throw new Error(`Expected paidAmount 4950, got ${summaryData.paidAmount}`);
  }
  if (summaryData.bookingCount !== 3) {
    throw new Error(`Expected bookingCount 3, got ${summaryData.bookingCount}`);
  }

  console.log('PASSED: Summary & analytics aggregation endpoint!');

  // Test 2: GET /api/earnings/history
  console.log('Testing GET /api/earnings/history...');
  const historyRes = await fetch(`${baseUrl}/history?page=1&limit=5`, { headers: authHeaders });
  const historyData = await historyRes.json();

  if (!historyData.success || historyData.earnings.length !== 3) {
    throw new Error(`Expected 3 earning items, got ${historyData.earnings?.length}`);
  }
  console.log('PASSED: Paginated history endpoint!');

  // Test 3: POST /api/earnings/payout-methods
  console.log('Testing POST /api/earnings/payout-methods (Bank Account)...');
  const addPmRes = await fetch(`${baseUrl}/payout-methods`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      type: 'bank_account',
      isDefault: true,
      details: { bankName: 'HDFC Bank', accountNumber: '9876543210', ifscCode: 'HDFC0001234' }
    })
  });
  const addPmData = await addPmRes.json();

  if (!addPmData.success || addPmData.payoutMethods.length !== 1) {
    throw new Error(`Failed to add payout method: ${addPmData.message}`);
  }
  console.log('PASSED: Add Payout Method endpoint!');

  // Test 4: POST /api/earnings/request-payout (Stripe Connect mock)
  console.log('Testing POST /api/earnings/request-payout (Stripe Connect mock)...');
  const payoutRes = await fetch(`${baseUrl}/request-payout`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 1000,
      payoutMethodType: 'stripe_connect',
      payoutMethodDetails: { stripeAccountId: 'acct_mock_test_123' }
    })
  });
  const payoutData = await payoutRes.json();

  if (!payoutData.success || !payoutData.transactionId) {
    throw new Error(`Payout request failed: ${payoutData.message}`);
  }
  console.log('Payout response transaction ID:', payoutData.transactionId);
  console.log('PASSED: Payout request & Stripe Connect mock!');

  // Test 5: GET /api/earnings/export-csv
  console.log('Testing GET /api/earnings/export-csv...');
  const csvRes = await fetch(`${baseUrl}/export-csv`, { headers: { 'Authorization': `Bearer ${workerToken}` } });
  const csvText = await csvRes.text();

  if (!csvRes.headers.get('content-type')?.includes('text/csv')) {
    throw new Error('Expected Content-Type text/csv header');
  }
  if (!csvText.includes('ID,Date,Type,Description')) {
    throw new Error('CSV content missing expected header row');
  }
  console.log('PASSED: Downloadable CSV report export!');

  // Clean up
  server.close();
  await Earning.deleteMany({ workerId });
  await Worker.deleteMany({ email: testEmail });
  await mongoose.disconnect();

  console.log('--- ALL WORKER EARNINGS DASHBOARD & ANALYTICS TESTS PASSED SUCCESSFULLY ---');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
