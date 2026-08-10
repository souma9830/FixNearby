import { auditStreamEngine } from '../services/auditStreamService.js';
import crypto from 'crypto';

export const auditStreamMiddleware = (req, res, next) => {
  const start = Date.now();
  const correlationId = req.headers['x-correlation-id'] || `CORR_${crypto.randomBytes(8).toString('hex')}`;
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  res.on('finish', () => {
    const latencyMs = Date.now() - start;
    auditStreamEngine.createTelemetryRecord('HTTP_REQUEST_PROCESSED', req.user, {
      correlationId,
      ip: req.ip || req.connection?.remoteAddress,
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      latencyMs
    });
  });

  next();
};
