import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from "../models/Worker.js";
import Blacklist from '../models/Blacklist.js';

/**
 * Protect middleware: Verifies JWT token and populates req.user.
 * Works for both User (Customer/Admin/Worker) and Worker models.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Check token blacklist
      const isBlacklisted = await Blacklist.findOne({ token });
      if (isBlacklisted) {
        return res.status(401).json({ success: false, message: 'Token has been invalidated' });
      }
      
      // Verify token payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try resolving User model first
      let principal = await User.findById(decoded.id).select('-password');
      
      if (!principal) {
        // Fallback to Worker model
        const workerDoc = await Worker.findById(decoded.id).select('-password');
        if (workerDoc) {
          principal = workerDoc.toObject ? workerDoc.toObject() : workerDoc;
          principal.role = principal.role || 'worker';
        }
      } else {
        principal = principal.toObject ? principal.toObject() : principal;
        principal.role = principal.role || 'customer';
      }
      
      if (!principal) {
        return res.status(401).json({ success: false, message: 'Not authorized: User or Worker account not found' });
      }

      // Invalidate JWT tokens issued prior to password reset
      if (principal.passwordChangedAt && decoded.iat) {
        const passwordChangedTime = Math.floor(new Date(principal.passwordChangedAt).getTime() / 1000);
        if (decoded.iat < passwordChangedTime) {
          return res.status(401).json({ success: false, message: 'Session expired due to recent password reset. Please log in again.' });
        }
      }
      
      req.user = principal;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no authorization token provided' });
  }
};

/**
 * Dedicated Worker auth middleware: Ensures req.worker & req.user are populated.
 */
export const protectWorker = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const isBlacklisted = await Blacklist.findOne({ token });
      if (isBlacklisted) {
        return res.status(401).json({ success: false, message: 'Token has been invalidated' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const worker = await Worker.findById(decoded.id).select("-password");

      if (!worker) {
        return res.status(401).json({
          success: false,
          message: "Worker account not found",
        });
      }

      // Invalidate JWT tokens issued prior to password reset
      if (worker.passwordChangedAt && decoded.iat) {
        const passwordChangedTime = Math.floor(new Date(worker.passwordChangedAt).getTime() / 1000);
        if (decoded.iat < passwordChangedTime) {
          return res.status(401).json({ success: false, message: 'Session expired due to recent password reset. Please log in again.' });
        }
      }

      const workerObj = worker.toObject ? worker.toObject() : worker;
      workerObj.role = workerObj.role || 'worker';

      req.worker = workerObj;
      req.user = workerObj;

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Not authorized, no token provided",
  });
};

/**
 * Role-Based Access Control (RBAC) middleware:
 * Usage:
 *   requireRole('admin')
 *   requireRole('provider', 'worker')
 *   requireRole(['admin', 'provider'])
 */
export const authorize = (...allowedRoles) => {
  // Flatten array if passed as single array argument (e.g., requireRole(['admin', 'provider']))
  const flatRoles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Forbidden: Authentication required before authorization check'
      });
    }

    const currentRole = (req.user.role || 'customer').toLowerCase();

    // Map role aliases: 'provider' <-> 'worker', 'customer' <-> 'user'
    const normalizedAllowedRoles = flatRoles.flatMap(r => {
      const lowerR = r.toLowerCase();
      if (lowerR === 'provider') return ['provider', 'worker'];
      if (lowerR === 'worker') return ['worker', 'provider'];
      if (lowerR === 'customer') return ['customer', 'user'];
      return [lowerR];
    });

    const isAuthorized = normalizedAllowedRoles.includes(currentRole) || currentRole === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${currentRole}' is not authorized to access this route.`
      });
    }

    next();
  };
};

export const requireRole = authorize;
export const requireProvider = authorize('provider', 'worker');
export const requireWorker = authorize('worker', 'provider');
export const requireCustomer = authorize('customer');
export const requireAdmin = authorize('admin');
export const adminOnly = authorize('admin');

export default protect;
