/**
 * Middleware to enforce strict Content-Type requirements for data-submitting requests.
 */
export const validateContentType = (req, res, next) => {
  // Only apply to methods that typically carry a payload
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    
    // Allow JSON or Multipart Form Data
    const isJson = contentType.includes('application/json');
    const isMultipart = contentType.includes('multipart/form-data');
    const isUrlEncoded = contentType.includes('application/x-www-form-urlencoded'); // Sometimes needed, but strictly limiting per requirements
    
    if (!isJson && !isMultipart) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported Media Type. Expected application/json or multipart/form-data'
      });
    }
  }
  
  // Let GET, DELETE, HEAD, OPTIONS, etc pass through
  next();
};

/**
 * Middleware factory to limit the maximum request size based on Content-Length.
 * 
 * @param {number} maxSizeBytes Maximum allowed size in bytes (default: 10MB)
 * @returns {Function} Express middleware
 */
export const validateRequestSize = (maxSizeBytes = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxSizeBytes) {
        return res.status(413).json({
          success: false,
          message: 'Payload Too Large'
        });
      }
    }
    
    next();
  };
};
