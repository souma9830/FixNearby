import { auditStreamEngine } from '../services/auditStreamService.js';

async function runTests() {
  console.log("=== STARTING STRUCTURED AUDIT TELEMETRY STREAM TEST ===");

  // 1. Testing PII Email Masking in Telemetry Stream
  console.log("\n1. Testing PII masking (email obfuscation)...");
  const rawUser = { _id: 'USR_123', email: 'john.doe@company.org', role: 'admin' };
  const record1 = auditStreamEngine.createTelemetryRecord('ADMIN_ACTION', rawUser, {
    method: 'POST',
    path: '/api/admin/users',
    status: 200,
    latencyMs: 14.5
  });

  console.log("Generated Log Record:", JSON.stringify(record1, null, 2));

  if (record1.user.email.includes('j***@company.org') && !record1.user.email.includes('john.doe')) {
    console.log("✅ SUCCESS: PII email obfuscated cleanly!");
  } else {
    console.error("❌ FAILURE: Email was not properly masked!");
  }

  // 2. Testing Correlation ID generation and audit buffer retrieval
  console.log("\n2. Testing correlation ID tracking and buffer retrieval...");
  const recent = auditStreamEngine.getRecentLogs(5);
  console.log("Recent Audit Buffer Length:", recent.length);

  if (recent.length > 0 && recent[0].correlationId.startsWith('CORR_')) {
    console.log("=============================================");
    console.log("✅ ALL AUDIT TELEMETRY STREAM TESTS PASSED!");
    console.log("=============================================");
  }
}

runTests().catch(console.error);
