import assert from 'assert';
import { generateTestBooking, assertApiResponse } from '../helpers/testUtils.js';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let total = 9;
  let bookingId = '';
  const userId = 'user_123';
  const workerId = 'worker_123';
  const token = 'fake_token';

  const runTest = async (name, testFn) => {
    try {
      await testFn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ ${name}`);
      console.error(err.message);
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  await runTest('Create booking with valid data -> verify 201 with booking ID', async () => {
    const booking = generateTestBooking(userId, workerId);
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(booking)
    });
    assertApiResponse(res, 201);
    const data = await res.json();
    assert(data.success);
    assert(data.data._id);
    bookingId = data.data._id;
  });

  await runTest('Create booking with missing required fields -> verify 400', async () => {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    assertApiResponse(res, 400);
  });

  await runTest('Get booking by ID -> verify all fields present', async () => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, { headers });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(data.success);
    assert(data.data.userId);
    assert(data.data.workerId);
    assert(data.data.service);
  });

  await runTest('Update booking status to Accepted -> verify status change', async () => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'Accepted' })
    });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert.strictEqual(data.data.status, 'Accepted');
  });

  await runTest('Update booking status to In-Progress -> verify status change', async () => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'In-Progress' })
    });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert.strictEqual(data.data.status, 'In-Progress');
  });

  await runTest('Update booking status to Completed -> verify status change', async () => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'Completed' })
    });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert.strictEqual(data.data.status, 'Completed');
  });

  await runTest('Get booking timeline -> verify statusHistory entries', async () => {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/timeline`, { headers });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(Array.isArray(data.data.statusHistory));
  });

  await runTest('Cancel a booking -> verify status is Cancelled', async () => {
    const booking = generateTestBooking(userId, workerId);
    const createRes = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(booking)
    });
    const createData = await createRes.json();
    const newBookingId = createData.data._id;
    
    const cancelRes = await fetch(`${API_URL}/bookings/${newBookingId}/cancel`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ reason: 'Changed mind' })
    });
    assertApiResponse(cancelRes, 200);
    const data = await cancelRes.json();
    assert.strictEqual(data.data.status, 'Cancelled');
  });

  await runTest('Create duplicate booking for same time slot -> verify appropriate response', async () => {
    const booking = generateTestBooking(userId, workerId);
    await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(booking)
    });
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(booking)
    });
    assertApiResponse(res, 400); // Expecting error 400 or similar
  });

  console.log(`\nSummary: ${passed}/${total} tests passed`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
