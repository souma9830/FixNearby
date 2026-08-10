/**
 * Utility to recursively clean objects from dangerous MongoDB operator keys
 * and prototype pollution attempts.
 * 
 * @param {Object} obj The object to clean
 * @returns {Object} The cleaned object
 */
export const sanitizeDeep = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeDeep(item));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block keys starting with $ or containing .
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    
    // Check if value is a string containing MongoDB operators
    if (typeof value === 'string') {
      const dangerousStringOperators = [
        '$where', '$gt', '$gte', '$lt', '$lte', '$ne', 
        '$nin', '$in', '$regex', '$exists', '$or', '$and', '$not'
      ];
      
      const containsDangerousOperator = dangerousStringOperators.some(op => value.includes(op));
      if (containsDangerousOperator) {
        continue;
      }
    }
    
    cleaned[key] = sanitizeDeep(value);
  }
  
  return cleaned;
};

/**
 * Helper function to detect if an object contains malicious MongoDB operators
 * 
 * @param {any} data The data to inspect
 * @returns {Object|null} The offending key/value pair if found, else null
 */
const detectMaliciousPayload = (data) => {
  if (data === null || typeof data !== 'object') {
    return null;
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const match = detectMaliciousPayload(data[i]);
      if (match) return match;
    }
    return null;
  }

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('$') || key.includes('.')) {
      return { key, value };
    }

    if (typeof value === 'string') {
      const dangerousStringOperators = [
        '$where', '$gt', '$gte', '$lt', '$lte', '$ne', 
        '$nin', '$in', '$regex', '$exists', '$or', '$and', '$not'
      ];
      
      if (dangerousStringOperators.some(op => value.includes(op))) {
        return { key, value };
      }
    } else if (typeof value === 'object') {
      const match = detectMaliciousPayload(value);
      if (match) return match;
    }
  }

  return null;
};

/**
 * Middleware to protect against MongoDB injection attacks.
 * Scans req.body, req.query, and req.params for malicious keys and values.
 */
export const mongoInjectionGuard = (req, res, next) => {
  const sources = ['body', 'query', 'params'];
  
  for (const source of sources) {
    if (req[source]) {
      const malicious = detectMaliciousPayload(req[source]);
      
      if (malicious) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.warn(`[SECURITY] MongoDB Injection blocked! IP: ${ip}, Path: ${req.originalUrl}, Source: ${source}, Offending Key: ${malicious.key}`);
        
        return res.status(400).json({
          success: false,
          message: 'Malicious input detected and blocked'
        });
      }
    }
  }
  
  next();
};
