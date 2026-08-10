import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import Worker from '../models/Worker.js';
import workerRoutes from '../routes/workerRoutes.js';
import errorHandler from '../middleware/errorHandler.js';

dotenv.config();

const PORT = 5585;

async function runTests() {
  console.log('--- STARTING SLA, TRUST & POLICIES INTEGRATION TESTS ---');

  // Connect to Database
  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FixNearby');
  console.log('Connected to MongoDB.');

  // Clean up existing test data
  console.log('Cleaning up old test data...');
  const testEmails = [
    'test_sla_valid@example.com',
    'test_sla_invalid@example.com'
  ];
  await Worker.deleteMany({ email: { $in: testEmails } });

  // Initialize Express and HTTP Server
  const app = express();
  app.use(express.json());
  
  // Register routes
  app.use('/api/workers', workerRoutes);
  app.use(errorHandler);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    // 1. Verify invalid SLA minutes validation
    console.log('\nTest 1: Registering worker with invalid SLA minutes...');
    const invalidSlaRes = await fetch(`http://localhost:${PORT}/api/workers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid SLA Worker',
        email: 'test_sla_invalid@example.com',
        password: 'Password123!',
        category: 'Plumbing',
        experience: '5 years',
        location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
        contact: '1234567890',
        bio: 'Valid bio content',
        slaResponseMins: -10, // Invalid: negative number
        serviceCoverage: ['Local Metro Area'],
        cancellationPolicy: 'Free cancellation',
        refundPolicy: 'Full refund',
        verificationStatus: 'verified'
      })
    });
    const invalidSlaBody = await invalidSlaRes.json();
    console.log(`- Status: ${invalidSlaRes.status}, Message: ${invalidSlaBody.message}`);
    if (invalidSlaRes.status !== 400 || invalidSlaBody.success) {
      throw new Error('Expected 400 Bad Request for negative response SLA minutes.');
    }
    console.log('SUCCESS: Validation correctly blocked negative SLA minutes.');

    // 2. Verify invalid verification status validation
    console.log('\nTest 2: Registering worker with invalid verification status...');
    const invalidStatusRes = await fetch(`http://localhost:${PORT}/api/workers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Status Worker',
        email: 'test_sla_invalid@example.com',
        password: 'Password123!',
        category: 'Plumbing',
        experience: '5 years',
        location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
        contact: '1234567890',
        bio: 'Valid bio content',
        slaResponseMins: 30,
        serviceCoverage: ['Local Metro Area'],
        cancellationPolicy: 'Free cancellation',
        refundPolicy: 'Full refund',
        verificationStatus: 'invalid_status_value' // Invalid: not in enum
      })
    });
    const invalidStatusBody = await invalidStatusRes.json();
    console.log(`- Status: ${invalidStatusRes.status}, Message: ${invalidStatusBody.message}`);
    if (invalidStatusRes.status !== 400 || invalidStatusBody.success) {
      throw new Error('Expected 400 Bad Request for invalid verificationStatus enum value.');
    }
    console.log('SUCCESS: Validation correctly blocked invalid verificationStatus values.');

    // 3. Register valid worker with all fields
    console.log('\nTest 3: Registering worker with valid SLA & Policy fields...');
    const validRes = await fetch(`http://localhost:${PORT}/api/workers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid SLA Worker',
        email: 'test_sla_valid@example.com',
        password: 'Password123!',
        category: 'Plumbing',
        experience: '5 years',
        location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
        contact: '1234567890',
        bio: 'Valid bio content',
        slaResponseMins: 45,
        serviceCoverage: ['Downtown NYC', 'Brooklyn Area'],
        cancellationPolicy: 'Cancel up to 12 hours free.',
        refundPolicy: 'Full refund inside 48 hours.',
        verificationStatus: 'verified'
      })
    });
    const validBody = await validRes.json();
    console.log(`- Status: ${validRes.status}, Message: ${validBody.message}`);
    if (validRes.status !== 201 || !validBody.success) {
      throw new Error('Expected 201 Created for valid worker registration payload.');
    }
    console.log('SUCCESS: Worker successfully registered with new fields.');

    // 4. Verify fields returned by getWorkers query projection
    console.log('\nTest 4: Verifying new fields are returned in getWorkers list API...');
    const listRes = await fetch(`http://localhost:${PORT}/api/workers`);
    const listBody = await listRes.json();
    if (listRes.status !== 200 || !listBody.success) {
      throw new Error('Failed to retrieve workers list.');
    }
    const matchedWorker = listBody.workers.find(w => w.email === 'test_sla_valid@example.com');
    if (!matchedWorker) {
      throw new Error('Registered worker not found in list response.');
    }
    console.log(`- SLA: ${matchedWorker.slaResponseMins}, Coverage: ${JSON.stringify(matchedWorker.serviceCoverage)}`);
    console.log(`- Cancellation: ${matchedWorker.cancellationPolicy}, Refund: ${matchedWorker.refundPolicy}`);
    console.log(`- Verification Status: ${matchedWorker.verificationStatus}`);

    if (matchedWorker.slaResponseMins !== 45) {
      throw new Error(`slaResponseMins expected 45, got ${matchedWorker.slaResponseMins}`);
    }
    if (!matchedWorker.serviceCoverage.includes('Downtown NYC')) {
      throw new Error('serviceCoverage not saved or returned correctly.');
    }
    if (matchedWorker.cancellationPolicy !== 'Cancel up to 12 hours free.') {
      throw new Error('cancellationPolicy not saved or returned correctly.');
    }
    if (matchedWorker.refundPolicy !== 'Full refund inside 48 hours.') {
      throw new Error('refundPolicy not saved or returned correctly.');
    }
    if (matchedWorker.verificationStatus !== 'verified') {
      throw new Error('verificationStatus not saved or returned correctly.');
    }
    console.log('SUCCESS: New SLA, Policy, and Verification fields correctly projected in list response.');

  } finally {
    // Clean up test database documents
    console.log('\nCleaning up test worker documents...');
    await Worker.deleteMany({ email: { $in: testEmails } });
    await mongoose.connection.close();
    server.close();
  }
}

runTests().then(() => {
  console.log('\n--- ALL SLA, TRUST & POLICIES INTEGRATION TESTS PASSED ---');
  process.exit(0);
}).catch(err => {
  console.error('\nINTEGRATION TESTS FAILED:', err);
  process.exit(1);
});
