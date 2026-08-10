import { ipReputationEngine } from '../services/ipReputationStore.js';
import { createSlidingWindowLimiter } from '../middleware/adaptiveRateLimiter.js';

async function runTests() {
  console.log("=== STARTING SLIDING-WINDOW ADAPTIVE RATE LIMITER TEST ===");

  const limiter = createSlidingWindowLimiter({ windowMs: 10000, maxRequests: 3 });
  const testIp = '198.51.100.42';

  let lastStatus = 200;
  const mockRes = {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) {
      lastStatus = code;
      return { json: (d) => d };
    }
  };

  // 1. Sending 3 allowed requests
  console.log("\n1. Sending 3 allowed requests within window limit...");
  for (let i = 1; i <= 3; i++) {
    limiter({ ip: testIp }, mockRes, () => {});
    console.log(`Request ${i} Remaining Limit Header:`, mockRes.headers['X-RateLimit-Remaining']);
  }

  // 2. Sending 4th request (triggers HTTP 429 Rate Limit Exceeded)
  console.log("\n2. Sending 4th request exceeding threshold...");
  limiter({ ip: testIp }, mockRes, () => {});
  console.log(`4th Request HTTP Status: ${lastStatus}`);

  if (lastStatus === 429) {
    console.log("✅ SUCCESS: 4th request rejected with HTTP 429!");
    const rep = ipReputationEngine.getReputation(testIp);
    console.log("IP Reputation after violation penalty:", rep);

    if (rep < 1.0) {
      console.log("=============================================");
      console.log("✅ ALL ADAPTIVE RATE LIMITER TESTS PASSED!");
      console.log("=============================================");
    }
  }
}

runTests().catch(console.error);
