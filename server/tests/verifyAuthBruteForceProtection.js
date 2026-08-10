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

async function runSecurityTest() {
  console.log("--- STARTING AUTH BRUTE-FORCE RATE LIMITING SECURITY TEST (#833) ---");

  const app = express();
  app.use(express.json());

  // Attach auth rate limiters to routes
  app.post('/api/auth/login', userLoginLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/register', userRegisterLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/worker/login', workerLoginLimiter, (req, res) => res.status(200).json({ success: true }));
  app.post('/api/auth/2fa/challenge', twoFactorChallengeLimiter, (req, res) => res.status(200).json({ success: true }));

  const server = createServer(app);
  const PORT = 5594;
  await new Promise(r => server.listen(PORT, r));
  console.log(`Security test server listening on port ${PORT}`);

  try {
    // Test login brute force protection
    console.log("Executing 6 continuous login attempts against /api/auth/login...");
    let blockedByRateLimiter = false;
    let responseStatus = 0;
    let responseBody = null;

    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      });

      if (res.status === 429) {
        blockedByRateLimiter = true;
        responseStatus = res.status;
        responseBody = await res.json();
        console.log(`Attempt ${i}: Blocked by Rate Limiter (HTTP 429)`);
        break;
      }
    }

    assert.strictEqual(blockedByRateLimiter, true, 'Server must block excessive login attempts with HTTP 429');
    assert.strictEqual(responseStatus, 429, 'Status code must be 429 Too Many Requests');
    assert.strictEqual(responseBody.success, false, 'Response payload must contain success: false');
    assert(responseBody.error && responseBody.error.includes('Too many login attempts'), 'Response payload must contain error message');
    assert(typeof responseBody.retryAfter === 'number', 'Response payload must contain retryAfter duration');

    console.log("✅ PASS: Server successfully blocked brute-force attack and returned 429 Too Many Requests!");
    console.log("🎉 ALL AUTH BRUTE-FORCE SECURITY TESTS PASSED!");
  } finally {
    await new Promise(r => server.close(r));
  }
}

runSecurityTest().catch(err => {
  console.error("❌ SECURITY TEST FAILED:", err);
  process.exit(1);
});
