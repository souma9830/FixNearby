import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const socketJwtLifecycleGuard = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: JWT bearer token required'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new Error('Authentication error: User session invalidated'));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error(`Socket Authentication Exception: ${err.message}`));
  }
};

export default socketJwtLifecycleGuard;
