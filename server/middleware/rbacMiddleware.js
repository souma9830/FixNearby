import RolePermission from '../models/RolePermission.js';

/**
 * Zero-Trust Dynamic Scope Permission Middleware
 */
export const checkScope = (requiredScope) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // SuperAdmin has full access override
      if (req.user.role === 'admin' || req.user.role === 'SuperAdmin') {
        return next();
      }

      const roleName = req.user.role || 'SupportAgent';
      const roleDoc = await RolePermission.findOne({ roleName });

      if (!roleDoc) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Role "${roleName}" has no RBAC permissions configured.`
        });
      }

      const scopeMatch = roleDoc.scopes.find(s => s.scope === requiredScope);
      if (!scopeMatch || !scopeMatch.isAllowed) {
        return res.status(403).json({
          success: false,
          requiredScope,
          message: `Forbidden: Access denied. Missing required scope permission "${requiredScope}".`
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
