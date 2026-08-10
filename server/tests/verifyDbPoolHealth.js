import { dbSupervisor } from '../config/dbPoolSupervisor.js';
import { getSystemHealthReport } from '../services/healthCheckService.js';

async function runTests() {
  console.log("=== STARTING DATABASE CONNECTION POOL & HEALTH CHECK TEST ===");

  dbSupervisor.startSupervisor();

  // 1. Testing DB Pool Metrics
  console.log("\n1. Testing DB pool metrics retrieval...");
  const metrics = dbSupervisor.getPoolMetrics();
  console.log("DB Pool Metrics:", metrics);

  if (metrics.status && typeof metrics.isHealthy === 'boolean') {
    console.log("✅ SUCCESS: DB Pool metrics retrieved cleanly!");
  }

  // 2. Testing System Health Report Generation
  console.log("\n2. Testing comprehensive system health report...");
  const report = getSystemHealthReport();
  console.log("System Health Report:", JSON.stringify(report, null, 2));

  if (report.status && report.system.totalMemoryMb > 0) {
    console.log("=============================================");
    console.log("✅ ALL DATABASE POOL HEALTH TESTS PASSED!");
    console.log("=============================================");
  }
}

runTests().catch(console.error);
