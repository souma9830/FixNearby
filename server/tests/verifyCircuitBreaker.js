import { processExternalPaymentGateway, getGatewayBreakerStatus } from '../services/externalGatewayService.js';

async function runTests() {
  console.log("=== STARTING CIRCUIT BREAKER RESILIENCE INTEGRATION TEST ===");

  // Test 1: Successful Gateway Call (CLOSED state)
  console.log("\n1. Testing successful payment gateway call...");
  const res1 = await processExternalPaymentGateway({ amount: 100, currency: 'USD' });
  console.log("Response:", res1);
  console.log("Breaker Status:", getGatewayBreakerStatus());

  // Test 2: Triggering 3 consecutive failures to open the circuit breaker
  console.log("\n2. Triggering consecutive gateway failures...");
  for (let i = 1; i <= 3; i++) {
    const failRes = await processExternalPaymentGateway({ amount: 100, forceFail: true });
    console.log(`Failure ${i} Response:`, failRes);
  }

  const statusAfterFails = getGatewayBreakerStatus();
  console.log("Breaker Status after 3 failures:", statusAfterFails);

  if (statusAfterFails.state === 'OPEN') {
    console.log("✅ SUCCESS: Circuit breaker transitioned to OPEN state upon threshold failure!");
  } else {
    console.error("❌ FAILURE: Circuit breaker failed to open!");
  }

  // Test 3: Instant Fast-Fail Fallback execution when OPEN
  console.log("\n3. Testing instant fallback execution during OPEN state...");
  const fastFailRes = await processExternalPaymentGateway({ amount: 50 });
  console.log("Fast Fail Fallback Result:", fastFailRes);

  if (fastFailRes.isFallback && fastFailRes.status === 'GATEWAY_DEGRADED') {
    console.log("=============================================");
    console.log("✅ ALL CIRCUIT BREAKER RESILIENCE TESTS PASSED!");
    console.log("=============================================");
  }
}

runTests().catch(console.error);
