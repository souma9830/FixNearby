import assert from 'assert';
import { assertApiResponse } from '../helpers/testUtils.js';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let total = 8;
  let paymentIntentId = '';
  const bookingId = 'booking_123';
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

  await runTest('Create payment intent -> verify paymentIntentId returned', async () => {
    const res = await fetch(`${API_URL}/payments/intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookingId, amount: 500 })
    });
    assertApiResponse(res, 201);
    const data = await res.json();
    assert(data.success);
    assert(data.data.paymentIntentId);
    paymentIntentId = data.data.paymentIntentId;
  });

  await runTest('Create payment intent with invalid bookingId -> verify error', async () => {
    const res = await fetch(`${API_URL}/payments/intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookingId: 'invalid', amount: 500 })
    });
    assertApiResponse(res, 400);
  });

  await runTest('Confirm payment -> verify transactionId and receiptUrl', async () => {
    const res = await fetch(`${API_URL}/payments/confirm`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentIntentId })
    });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(data.data.transactionId);
    assert(data.data.receiptUrl);
  });

  await runTest('Get payment history -> verify array of payments', async () => {
    const res = await fetch(`${API_URL}/payments/history`, { headers });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(Array.isArray(data.data));
  });

  await runTest('Get single payment by ID -> verify payment details', async () => {
    const res = await fetch(`${API_URL}/payments/${paymentIntentId}`, { headers });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(data.data.paymentIntentId === paymentIntentId);
  });

  await runTest('Request refund with valid reason -> verify refund status', async () => {
    const res = await fetch(`${API_URL}/payments/${paymentIntentId}/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason: 'Service not provided' })
    });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert.strictEqual(data.data.status, 'Refunded');
  });

  await runTest('Request refund without reason -> verify validation error', async () => {
    const res = await fetch(`${API_URL}/payments/${paymentIntentId}/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    assertApiResponse(res, 400);
  });

  await runTest('Duplicate payment for same booking -> verify rejection', async () => {
    const res = await fetch(`${API_URL}/payments/intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bookingId, amount: 500 })
    });
    assertApiResponse(res, 400);
  });

  console.log(`\nSummary: ${passed}/${total} tests passed`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
