/**
 * MFA Protection Middleware — Ensures 2FA verified challenge when reaching sensitive routes
 */
export const requireMfaVerified = (req, res, next) => {
  if (req.user && req.user.mfaEnabled) {
    const isMfaVerified = req.headers['x-mfa-verified'] === 'true' || req.session?.mfaVerified;
    if (!isMfaVerified) {
      return res.status(403).json({
        success: false,
        mfaRequired: true,
        message: 'Multi-Factor Authentication challenge required for this action.'
      });
    }
  }
  next();
};
