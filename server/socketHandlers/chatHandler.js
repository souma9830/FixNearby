import Message from '../models/Message.js';

const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const handleSendMessage = (io, socket, userId, userType) => async (data, callback) => {
  try {
    const { receiverId, receiverModel, text, attachment, timestamp } = data;
    if (!receiverId || !receiverModel || (!text && !attachment)) {
      if (callback) callback({ success: false, error: 'Invalid message payload' });
      return;
    }

    const sanitizedText = sanitizeText(text || '');
    if (!sanitizedText.trim() && !attachment) {
      if (callback) callback({ success: false, error: 'Message contains invalid or empty content' });
      return;
    }

    if (!['User', 'Worker'].includes(receiverModel)) {
      if (callback) callback({ success: false, error: 'Invalid receiver model' });
      return;
    }
    // Simple ordering check – reject if timestamp older than last stored (optional)
    if (timestamp) {
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId }
        ]
      }).sort({ createdAt: -1 });
      if (lastMsg && new Date(timestamp) < lastMsg.createdAt) {
        if (callback) callback({ success: false, error: 'Out‑of‑order message' });
        return;
      }
    }
    // Persist message with sanitized text and optional image attachment
    const message = await Message.create({
      senderId: userId,
      senderModel: userType,
      receiverId,
      receiverModel,
      text: sanitizedText,
      attachment: attachment ? {
        fileUrl: attachment.fileUrl,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize
      } : null,
      createdAt: timestamp ? new Date(timestamp) : undefined
    });
    const msgData = {
      _id: message._id,
      senderId: message.senderId,
      senderModel: message.senderModel,
      receiverId: message.receiverId,
      receiverModel: message.receiverModel,
      text: message.text,
      attachment: message.attachment,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    };
    io.to(receiverId).emit('receiveMessage', msgData);
    io.to(userId).emit('receiveMessage', msgData);
    // Ack to sender
    socket.emit('message_ack', { messageId: message._id });
    if (callback) callback({ success: true, message: msgData });
  } catch (err) {
    if (callback) callback({ success: false, error: err.message });
  }
};

export const handleTyping = (io, socket, userId) => (data) => {
  const { receiverId } = data;
  if (receiverId) {
    io.to(receiverId).emit('typing', { senderId: userId });
  }
};

export const handleJoinConversation = (io, socket) => (data) => {
  const { conversationId } = data || {};
  if (conversationId) {
    socket.join(`conv_${conversationId}`);
    socket.emit('joined_conversation', { conversationId });
  }
};

export const handleLeaveConversation = (io, socket) => (data) => {
  const { conversationId } = data || {};
  if (conversationId) {
    socket.leave(`conv_${conversationId}`);
    socket.emit('left_conversation', { conversationId });
  }
};

export const handleMessageRead = (io, socket, userId) => async (data) => {
  try {
    const { partnerId } = data;
    if (!partnerId) return;

    await Message.updateMany(
      { senderId: partnerId, receiverId: userId, status: { $ne: 'read' } },
      { $set: { status: 'read', readAt: new Date() } }
    );

    io.to(partnerId).emit('message_read', { readerId: userId, partnerId });
    io.to(userId).emit('message_read', { readerId: userId, partnerId });
  } catch (err) {
    console.error('Error handling message read event:', err);
  }
};

export const handlePingCheck = (io, socket) => (data, callback) => {
  const clientTimestamp = data?.clientTimestamp || Date.now();
  const serverTimestamp = Date.now();
  const payload = {
    status: 'ok',
    clientTimestamp,
    serverTimestamp,
    latencyMs: Math.max(0, serverTimestamp - clientTimestamp)
  };

  socket.emit('pong_reply', payload);
  if (typeof callback === 'function') callback(payload);
};
