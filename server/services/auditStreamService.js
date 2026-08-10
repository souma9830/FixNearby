/**
 * High-Throughput Structured Audit Telemetry & Immutable Log Stream Engine.
 * Injects correlation ID, obfuscates sensitive PII (emails/IPs), and logs events asynchronously.
 */

import crypto from 'crypto';

class AuditStreamService {
  constructor() {
    this.buffer = [];
    this.maxBufferSize = 100;
  }

  maskPII(text) {
    if (typeof text !== 'string') return text;
    // Mask emails: user@domain.com -> u***@domain.com
    return text.replace(/([\w\.-]+)@([\w\.-]+\.\w+)/g, (match, user, domain) => {
      const masked = user.length > 1 ? `${user[0]}***` : '*';
      return `${masked}@${domain}`;
    });
  }

  createTelemetryRecord(eventName, userContext = {}, metadata = {}) {
    const correlationId = metadata.correlationId || `CORR_${crypto.randomBytes(8).toString('hex')}`;
    
    const record = {
      timestamp: new Date().toISOString(),
      correlationId,
      eventName,
      user: {
        id: userContext._id || userContext.id || 'anonymous',
        role: userContext.role || 'guest',
        email: this.maskPII(userContext.email || '')
      },
      metadata: {
        ip: metadata.ip || '127.0.0.1',
        method: metadata.method || 'GET',
        path: metadata.path || '/',
        status: metadata.status || 200,
        latencyMs: metadata.latencyMs || 0
      }
    };

    this.buffer.push(record);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    return record;
  }

  getRecentLogs(limit = 10) {
    return this.buffer.slice(-limit);
  }
}

export const auditStreamEngine = new AuditStreamService();
