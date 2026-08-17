import crypto from 'crypto';

/**
 * Double-Submit CSRF Token & SameSite Cookie Protection Middleware
 */
const readCookie = (req, name) => {
  const fromParsed = req.cookies?.[name];
  if (fromParsed) return fromParsed;
  const header = req.headers?.cookie || '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
};

export const csrfProtection = (req, res, next) => {
  // Generate CSRF token cookie if missing
  let csrfToken = readCookie(req, 'csrf-token');
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf-token', csrfToken, {
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
      message: 'CSRF token validation failed'
    });
  }

  next();
};