import crypto from 'crypto';

/**
 * Double-Submit CSRF Token & SameSite Cookie Protection Middleware
 */

export const csrfProtection = (req, res, next) => {
  // Generate CSRF token cookie if missing
  let csrfToken = req.cookies?.['XSRF-TOKEN'];
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Accessible by frontend JavaScript for request headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400000 // 24h
    });
  }

  // Exempt safe HTTP methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Validate header against cookie
  const clientHeaderToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  if (!clientHeaderToken || clientHeaderToken !== csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF Validation Failed: Invalid or missing X-CSRF-Token header.'
    });
  }

  next();
};
