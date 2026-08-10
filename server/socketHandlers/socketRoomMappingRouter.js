export class SocketRoomMappingRouter {
  constructor(io) {
    this.io = io;
  }

  registerHandlers(socket) {
    socket.on('join_conversation_room', ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(`room_${conversationId}`);
    });

    socket.on('send_targeted_message', ({ conversationId, message }) => {
      this.io.to(`room_${conversationId}`).emit('new_message_received', message);
    });
  }
}

export default SocketRoomMappingRouter;
