export class MultiTenantWorkspaceIsolationEngine {
  extractTenantContext(req) {
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || 'default-tenant';
    if (!tenantId || tenantId.trim() === '') {
      throw new Error('Tenant context missing: X-Tenant-ID header required');
    }
    return tenantId;
  }

  scopeQuery(query = {}, tenantId) {
    return { ...query, tenantId };
  }

  validateAccess(resourceTenantId, requestTenantId) {
    if (resourceTenantId !== requestTenantId) {
      throw new Error(`Security Violation: Cross-tenant access forbidden (${requestTenantId} -> ${resourceTenantId})`);
    }
    return true;
  }
}

export default new MultiTenantWorkspaceIsolationEngine();
