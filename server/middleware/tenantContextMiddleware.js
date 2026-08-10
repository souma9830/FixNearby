/**
 * Multi-Tenant Security Context Middleware.
 * Extracts and validates tenant header (`X-Tenant-ID` or domain scope) to enforce isolation.
 */

export const tenantContextMiddleware = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'] || 'default_tenant';

  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(tenantId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid X-Tenant-ID header format.'
    });
  }

  req.tenantId = tenantId;
  res.setHeader('X-Tenant-ID', tenantId);
  next();
};
