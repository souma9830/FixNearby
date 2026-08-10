import crypto from 'crypto';

export class AuditTelemetryStreamEngine {
  constructor() {
    this.buffer = [];
  }

  maskPii(text) {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, p1, p2) => {
      return `${p1[0]}***@${p2}`;
    });
  }

  createLogRecord(eventName, user = {}, metadata = {}) {
    const record = {
      correlationId: `CORR_${crypto.randomBytes(8).toString('hex')}`,
      timestamp: new Date().toISOString(),
      eventName,
      user: {
        id: user.id || 'anonymous',
        role: user.role || 'guest',
        email: this.maskPii(user.email || '')
      },
      metadata
    };
    this.buffer.push(record);
    if (this.buffer.length > 500) this.buffer.shift();
    return record;
  }
}

export default new AuditTelemetryStreamEngine();
