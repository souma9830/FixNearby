/**
 * Core function to log security-related events with a standard format.
 * 
 * @param {string} eventType The type of security event (e.g., 'FAILED_LOGIN', 'RATE_LIMIT')
 * @param {Object} details Additional context for the event
 */
export const logSecurityEvent = (eventType, details) => {
  const timestamp = new Date().toISOString();
  const safeDetails = { ...details };
  
  // Don't log sensitive info like passwords
  if (safeDetails.password) {
    safeDetails.password = '[REDACTED]';
  }
  if (safeDetails.token) {
    safeDetails.token = '[REDACTED]';
  }

  console.log(`[SECURITY] ${timestamp} ${eventType}: ${JSON.stringify(safeDetails)}`);
};

/**
 * Middleware that intercepts and logs specific security events.
 * Note: It overrides res.status and res.json/send temporarily to catch specific responses.
 */
export const securityAuditMiddleware = (req, res, next) => {
  const originalJson = res.json;
  const originalSend = res.send;
  const originalStatus = res.status;

  let capturedStatusCode = res.statusCode;

  // Intercept status changes
  res.status = function (code) {
    capturedStatusCode = code;
    return originalStatus.call(this, code);
  };

  // Intercept responses to log specific security failures
  const interceptResponse = (body) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const details = {
      ip,
      path: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'] || 'Unknown'
    };

    // Failed login (401 on /auth/login or /api/auth/login)
    if (capturedStatusCode === 401 && req.originalUrl.includes('/auth/login')) {
      logSecurityEvent('FAILED_LOGIN', { ...details, body });
    }
    
    // Rate limit hit
    if (capturedStatusCode === 429) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', details);
    }
    
    // CSRF failure (403 with specific message or from typical CSRF paths)
    if (capturedStatusCode === 403) {
      const isCsrfError = (typeof body === 'string' && body.toLowerCase().includes('csrf')) || 
                          (body && typeof body === 'object' && body.message && body.message.toLowerCase().includes('csrf'));
      
      if (isCsrfError) {
        logSecurityEvent('CSRF_FAILURE', { ...details, message: body?.message || 'CSRF validation failed' });
      }
    }

    // Injection blocked (handled explicitly in the guard, but can also catch general 400 with our specific message)
    if (capturedStatusCode === 400 && body && body.message === 'Malicious input detected and blocked') {
      logSecurityEvent('INJECTION_BLOCKED', details);
    }
  };

  res.json = function (body) {
    interceptResponse(body);
    return originalJson.call(this, body);
  };

  res.send = function (body) {
    interceptResponse(body);
    return originalSend.call(this, body);
  };

  next();
};
