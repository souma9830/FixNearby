import auditEngine from '../services/auditTelemetryService.js';

describe('Audit Telemetry Engine PII Sanitization Test', () => {
  it('should mask user email PII data cleanly', () => {
    const masked = auditEngine.maskPii('john.doe@company.org');
    expect(masked).toBe('j***@company.org');
  });

  it('should produce correlation IDs for log records', () => {
    const record = auditEngine.createLogRecord('ADMIN_LOGIN', { email: 'admin@company.com' });
    expect(record.correlationId).toMatch(/^CORR_/);
    expect(record.user.email).toBe('a***@company.com');
  });
});
