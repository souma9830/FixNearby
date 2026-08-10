import dbSupervisor from '../config/dbPoolHealthSupervisorService.js';

describe('Database Connection Pool Supervisor Test', () => {
  it('should retrieve DB pool metrics cleanly', () => {
    const metrics = dbSupervisor.getDbMetrics();
    expect(metrics).toHaveProperty('readyState');
    expect(metrics).toHaveProperty('status');
  });

  it('should generate system health report structure', () => {
    const report = dbSupervisor.generateSystemReport();
    expect(report).toHaveProperty('database');
    expect(report).toHaveProperty('system.heapUsedMb');
  });
});
