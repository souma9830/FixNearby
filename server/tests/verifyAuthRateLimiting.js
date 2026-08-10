import express from 'express';
import { createServer } from 'http';
import {
  userLoginLimiter,
  userRegisterLimiter,
  workerLoginLimiter,
  workerRegisterLimiter,
  passwordResetLimiter,
  twoFactorChallengeLimiter
} from '../middleware/authRateLimiter.js';
import assert from 'assert';

async function runAuthRateLimitingTest() {
  console.log("--- STARTING AUTH ENDPOINT RATE LIMITING TESTS (#832) ---");

  const app = express();
  app.use(express.json());

  // Test endpoints protected by auth rate limiters
  app.post('/api/auth/login', userLoginLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/register', userRegisterLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/worker/login', workerLoginLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/worker/register', workerRegisterLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/forgot-password', passwordResetLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/2fa/challenge', twoFactorChallengeLimiter, (req, res) => res.status(200).json({ success: true }));

  const server = createServer(app);
  const PORT = 5583;
  await new Promise(r => server.listen(PORT, r));
  console.log(`Auth rate limiting test server listening on port ${PORT}`);

  try {
    // 1. Test User Login Rate Limiter (Max 5 attempts)
    console.log("Testing /api/auth/login rate limiter (max 5 attempts)...");
    let loginHitLimit = false;
    let limitResponseBody = null;

    for (let i = 0; i < 7; i++) {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'testbrute@example.com', password: 'wrongpassword' }),
      });

      if (res.status === 429) {
        loginHitLimit = true;
        limitResponseBody = await res.json();
        break;
      }
    }

    assert.strictEqual(loginHitLimit, true, 'User login endpoint must trigger HTTP 429 after 5 requests');
    assert.strictEqual(limitResponseBody.success, false, 'Rate limit error response must contain success: false');
    assert(typeof limitResponseBody.retryAfter === 'number', 'Rate limit error response must include retryAfter number');
    console.log("✅ PASS: User login rate limiter correctly enforced HTTP 429 Too Many Requests!");

    // 2. Test User Registration Rate Limiter (Max 5 attempts)
    console.log("Testing /api/auth/register rate limiter...");
    let registerHitLimit = false;

    for (let i = 0; i < 7; i++) {
      const res = await fetch(`http://localhost:${PORT}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Bot User', email: `bot${i}@example.com`, password: 'password123' }),
      });

      if (res.status === 429) {
        registerHitLimit = true;
        break;
      }
    }

    assert.strictEqual(registerHitLimit, true, 'User registration endpoint must trigger HTTP 429 after 5 requests');
    console.log("✅ PASS: User registration rate limiter correctly enforced HTTP 429!");

    // 3. Test 2FA Challenge Rate Limiter (Max 5 attempts)
    console.log("Testing /api/auth/2fa/challenge rate limiter...");
    let challengeHitLimit = false;

    for (let i = 0; i < 7; i++) {
      const res = await fetch(`http://localhost:${PORT}/api/auth/2fa/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: '123456' }),
      });

      if (res.status === 429) {
        challengeHitLimit = true;
        break;
      }
    }

    assert.strictEqual(challengeHitLimit, true, '2FA challenge endpoint must trigger HTTP 429 after 5 requests');
    console.log("✅ PASS: 2FA challenge rate limiter correctly enforced HTTP 429!");

    console.log("🎉 ALL AUTH RATE LIMITING TESTS PASSED CLEANLY!");
  } finally {
    await new Promise(r => server.close(r));
  }
}

runAuthRateLimitingTest().catch(err => {
  console.error("❌ AUTH RATE LIMITING TEST FAILED:", err);
  process.exit(1);
});
