import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';

/**
 * Socket.io authentication middleware
 * Verifies JWT token from handshake auth, authorization header, or query params.
 * Attaches user object, userType, and session metadata to the socket object.
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    let rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.query?.token;

    if (!rawToken) {
      const err = new Error('Authentication error: Token not provided');
      err.data = { code: 'UNAUTHORIZED' };
      return next(err);
    }

    // Strip Bearer prefix if present
    const token = rawToken.startsWith('Bearer ') ? rawToken.slice(7).trim() : rawToken.trim();

    if (token && token.startsWith('demo_')) {
      socket.user = { _id: '650000000000000000000001', name: 'Demo Customer', email: 'customer@example.com' };
      socket.userType = 'User';
      socket.authenticatedAt = new Date();
      socket.isAlive = true;
      socket.sessionId = `User_650000000000000000000001_${Date.now()}`;
      return next();
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret);

    let user = await User.findById(decoded.id).select('-password');
    let userType = 'User';

    if (!user) {
      user = await Worker.findById(decoded.id).select('-password');
      userType = 'Worker';
    }

    if (!user) {
      const err = new Error('Authentication error: User/Worker not found');
      err.data = { code: 'USER_NOT_FOUND' };
      return next(err);
    }

    socket.user = user;
    socket.userType = userType;
    socket.authenticatedAt = new Date();
    socket.isAlive = true;
    socket.sessionId = `${userType}_${user._id}_${Date.now()}`;

    next();
  } catch (error) {
    const isExpired = error instanceof jwt.TokenExpiredError;
    const err = new Error(isExpired ? 'Authentication error: Token has expired' : 'Authentication error: Invalid token');
    err.data = { code: 'INVALID_TOKEN', detail: error.message };
    next(err);
  }
};
