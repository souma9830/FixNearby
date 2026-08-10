import mongoose from 'mongoose';

export class MessageSchemaOptimizationService {
  static applyCompoundIndexes(schema) {
    schema.index({ conversationId: 1, createdAt: -1 });
    schema.index({ recipientId: 1, read: 1 });
    schema.index({ senderId: 1, createdAt: -1 });
  }
}

export default MessageSchemaOptimizationService;
