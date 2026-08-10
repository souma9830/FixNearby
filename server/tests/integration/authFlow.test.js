import assert from 'assert';
import { generateTestUser, assertApiResponse } from '../helpers/testUtils.js';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let passed = 0;
  let total = 8;
  const user = generateTestUser();
  let token = '';

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

  await runTest('Register a new user -> verify success response with user data', async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    assertApiResponse(res, 201);
    const data = await res.json();
    assert(data.success);
    assert(data.data.email === user.email);
  });

  await runTest('Register with duplicate email -> verify 400 error', async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    assertApiResponse(res, 400);
  });

  await runTest('Login with valid credentials -> verify token returned', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: user.password })
    });
    assertApiResponse(res, 200);
    const data = await res.json();
    assert(data.success);
    assert(data.token);
    token = data.token;
  });

  await runTest('Login with wrong password -> verify 401', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: 'wrongpassword' })
    });
    assertApiResponse(res, 401);
  });

  await runTest('Login with non-existent email -> verify 401', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notfound@example.com', password: 'password123' })
    });
    assertApiResponse(res, 401);
  });

  await runTest('Access protected route with valid token -> verify success', async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assertApiResponse(res, 200);
  });

  await runTest('Access protected route without token -> verify 401', async () => {
    const res = await fetch(`${API_URL}/auth/me`);
    assertApiResponse(res, 401);
  });

  await runTest('Access protected route with malformed token -> verify 401', async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer invalidtoken123` }
    });
    assertApiResponse(res, 401);
  });

  console.log(`\nSummary: ${passed}/${total} tests passed`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
