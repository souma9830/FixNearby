import Message from '../models/Message.js';

export class ChatUnreadMetricsService {
  async getUnreadMessageCount(userId) {
    if (!userId) return 0;
    return await Message.countDocuments({
      recipientId: userId,
      read: false
    });
  }

  async markThreadMessagesAsRead(conversationId, recipientId) {
    return await Message.updateMany(
      { conversationId, recipientId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
  }
}

export default new ChatUnreadMetricsService();
