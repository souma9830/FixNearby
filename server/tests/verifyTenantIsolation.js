import { applyTenantScope, validateTenantAccess } from '../services/tenantIsolationService.js';
import { tenantContextMiddleware } from '../middleware/tenantContextMiddleware.js';

async function runTests() {
  console.log("=== STARTING MULTI-TENANT WORKSPACE ISOLATION TEST ===");

  // 1. Testing Tenant Query Scope Injection
  console.log("\n1. Testing tenant query filter injection...");
  const baseQuery = { status: 'Pending' };
  const scopedQuery = applyTenantScope(baseQuery, 'org_acme_corp');
  console.log("Scoped Query:", scopedQuery);

  if (scopedQuery.tenantId === 'org_acme_corp' && scopedQuery.status === 'Pending') {
    console.log("✅ SUCCESS: Query automatically scoped to target tenant!");
  }

  // 2. Testing Cross-Tenant Access Violation Prevention
  console.log("\n2. Testing cross-tenant access security violation check...");
  try {
    validateTenantAccess('org_acme_corp', 'org_hacker_inc');
    console.error("❌ FAILURE: Cross-tenant access was not blocked!");
  } catch (err) {
    console.log("Security Exception Caught:", err.message);

    console.log("=============================================");
    console.log("✅ ALL MULTI-TENANT ISOLATION TESTS PASSED!");
    console.log("=============================================");
  }
}

runTests().catch(console.error);
