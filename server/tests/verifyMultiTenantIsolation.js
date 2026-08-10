import tenantEngine from '../services/multiTenantIsolationService.js';

describe('Multi-Tenant Workspace Security Isolation Test', () => {
  it('should automatically inject tenantId filter into query', () => {
    const scoped = tenantEngine.scopeQuery({ status: 'Pending' }, 'tenant_acme');
    expect(scoped).toEqual({ status: 'Pending', tenantId: 'tenant_acme' });
  });

  it('should throw security exception on cross-tenant data access attempt', () => {
    expect(() => tenantEngine.validateAccess('tenant_acme', 'tenant_hacker')).toThrow();
  });
});
