/**
 * Security Configuration Policy
 * Defines helmet configuration, CORS options, and IP reputation parameters.
 */

export const securityPolicyConfig = {
  helmetOptions: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "wss:", "ws:"]
      }
    },
    referrerPolicy: { policy: 'same-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  },
  ipShieldOptions: {
    maxViolations: 5,
    windowMs: 15 * 60 * 1000
  }
};
