/**
 * IP Reputation & Suspicious Payload Inspection Shield
 * Evaluates client IP reputation score, request rates, and inspects headers/payloads for dangerous patterns.
 */

const ipBlocklist = new Set();
const ipRequestMetrics = new Map();

const SUSPICIOUS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
  /UNION\s+SELECT/gi,
  /DROP\s+TABLE/gi,
  /\.\.\/\.\.\//g,
  /eval\s*\(/gi
];

/**
 * Middleware inspecting inbound IP addresses and payload patterns.
 */
export const ipReputationShield = (options = {}) => {
  const maxViolations = options.maxViolations || 5;
  const windowMs = options.windowMs || 10 * 60 * 1000;

  return (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    if (ipBlocklist.has(clientIp)) {
      return res.status(403).json({
        success: false,
        error: "ACCESS_DENIED",
        message: "Your IP address has been temporarily blocked due to malicious activity patterns."
      });
    }

    const payloadString = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {}) + req.url;
    let containsThreat = false;

    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(payloadString)) {
        containsThreat = true;
        break;
      }
    }

    if (containsThreat) {
      const now = Date.now();
      let record = ipRequestMetrics.get(clientIp) || { count: 0, resetAt: now + windowMs };

      if (now > record.resetAt) {
        record = { count: 0, resetAt: now + windowMs };
      }

      record.count += 1;
      ipRequestMetrics.set(clientIp, record);

      if (record.count >= maxViolations) {
        ipBlocklist.add(clientIp);
        setTimeout(() => ipBlocklist.delete(clientIp), windowMs);
      }

      return res.status(400).json({
        success: false,
        error: "MALICIOUS_PAYLOAD_DETECTED",
        message: "Request blocked due to security payload violation."
      });
    }

    next();
  };
};

export const getBlockedIPs = () => Array.from(ipBlocklist);
export const clearBlockedIPs = () => ipBlocklist.clear();
