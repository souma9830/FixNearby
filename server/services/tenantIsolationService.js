/**
 * Tenant Isolation Query Helper.
 * Wraps database queries with strict tenant scope filters.
 */

export const applyTenantScope = (queryObj = {}, tenantId = 'default_tenant') => {
  return {
    ...queryObj,
    tenantId: tenantId
  };
};

export const validateTenantAccess = (resourceTenantId, requestTenantId) => {
  if (resourceTenantId !== requestTenantId) {
    throw new Error(`Security Violation: Cross-tenant access forbidden (${requestTenantId} -> ${resourceTenantId})`);
  }
  return true;
};
