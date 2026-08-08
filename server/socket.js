import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Worker from './models/Worker.js';
import Message from './models/Message.js';
import allowedOrigins from './config/corsOrigins.js';
import { verifySocketAuth } from './utils/verifySocketAuth.js';
import { socketAuthMiddleware } from './middleware/socketAuthMiddleware.js';
import { initSocketLifecycle } from './utils/socketLifecycle.js';
import { messageRetryService } from './services/messageRetryService.js';
import { handleSendMessage, handleTyping, handleJoinConversation, handleLeaveConversation, handleMessageRead, handlePingCheck } from './socketHandlers/chatHandler.js';
import { handlePresenceUpdate } from './socketHandlers/presenceHandler.js';
import { registerBookingHandlers } from './socketHandlers/bookingHandler.js';
import { handleSocketStateMachine } from './socketHandlers/socketStateMachine.js';


// Map to track active user socket mappings
// Map format: userId -> Set of socket.ids
const userSockets = new Map();

let ioInstance;
let lifecycleManager;

export const getIo = () => ioInstance;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  ioInstance = io;

  // Socket middleware for authentication
  io.use(socketAuthMiddleware);

  // Initialize connection lifecycle heartbeat monitor
  lifecycleManager = initSocketLifecycle(io);

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    const userType = socket.userType;

    // Register socket with lifecycle heartbeat monitor
    lifecycleManager.registerSocket(socket);

    // Track active connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join personal room for targeting user directly
    socket.join(userId);


    // Set online status in database and broadcast
    try {
      if (userType === 'Worker') {
        await Worker.findByIdAndUpdate(userId, { availabilityStatus: 'available', lastActive: new Date() });
        io.emit('user-presence', { userId, status: 'available', userType });
      } else {
        await User.findByIdAndUpdate(userId, { status: 'online' });
        io.emit('user-presence', { userId, status: 'online', userType });
      }
    } catch (err) {
      console.error('Error setting status on connect:', err);
    }

    // Message transmission
    // Presence update from client
    socket.on('presence_update', handlePresenceUpdate(io, socket, userId, userType));

    // Message transmission with ordering & ack
    socket.on('sendMessage', handleSendMessage(io, socket, userId, userType));
    socket.on('join_conversation', handleJoinConversation(io, socket));
    socket.on('leave_conversation', handleLeaveConversation(io, socket));

    // Typing indicators
    socket.on('typing', handleTyping(io, io, userId));

    socket.on('mark_read', handleMessageRead(io, socket, userId));

    socket.on('ping_check', handlePingCheck(io, socket));

    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      if (receiverId) {
        io.to(receiverId).emit('stop_typing', { senderId: userId });
      }
    });

    // Presence management toggles
    registerBookingHandlers(io, socket);

    socket.on('update_status', async (data) => {
      try {
        const { status } = data; // 'online' / 'available', 'busy', 'offline'
        if (!['online', 'available', 'busy', 'offline'].includes(status)) return;

        let dbStatus = status;
        if (userType === 'Worker') {
          // Map online to available for workers
          if (status === 'online') dbStatus = 'available';
          await Worker.findByIdAndUpdate(userId, { availabilityStatus: dbStatus, lastActive: new Date() });
        } else {
          // Map available to online for users
          if (status === 'available') dbStatus = 'online';
          await User.findByIdAndUpdate(userId, { status: dbStatus });
        }

        io.emit('user-presence', { userId, status: dbStatus, userType });
      } catch (err) {
        console.error('Error updating status:', err);
      }
    });

    // Handle Socket Disconnection
    socket.on('disconnect', async () => {
      if (lifecycleManager) {
        lifecycleManager.unregisterSocket(socket.id);
      }
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          
          try {
            if (userType === 'Worker') {
              await Worker.findByIdAndUpdate(userId, { availabilityStatus: 'offline', lastActive: new Date() });
              io.emit('user-presence', { userId, status: 'offline', userType });
            } else {
              await User.findByIdAndUpdate(userId, { status: 'offline' });
              io.emit('user-presence', { userId, status: 'offline', userType });
            }
          } catch (err) {
            console.error('Error setting offline status on disconnect:', err);
          }
        }
      }
    });
  });

  return io;
};
