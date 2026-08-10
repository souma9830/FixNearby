export class SocketReadReceiptsEventEmitter {
  constructor(io) {
    this.io = io;
  }

  handleReadReceiptEvent(socket) {
    socket.on('mark_messages_read', ({ conversationId, readerId, messageIds }) => {
      if (!conversationId) return;
      socket.to(`room_${conversationId}`).emit('messages_read_receipt_updated', {
        conversationId,
        readerId,
        messageIds,
        readTimestamp: new Date().toISOString()
      });
    });
  }
}

export default SocketReadReceiptsEventEmitter;
