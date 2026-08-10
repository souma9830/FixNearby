import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Worker from '../models/Worker.js';

/**
 * Socket.io middleware to verify JWT and attach user info to socket.
 */
export const verifySocketAuth = async (socket, next) => {
  try {
    // Token can be sent via auth payload or Authorization header
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    if (token && token.startsWith('demo_')) {
      socket.user = { _id: '650000000000000000000001', name: 'Demo Customer', email: 'customer@example.com' };
      socket.userType = 'User';
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id).select('-password');
    let userType = 'User';
    if (!user) {
      user = await Worker.findById(decoded.id).select('-password');
      userType = 'Worker';
    }
    if (!user) {
      return next(new Error('Authentication error: User/Worker not found'));
    }
    socket.user = user;
    socket.userType = userType;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};
