const { Server } = require('socket.io');
const { Message } = require('../models');

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected to socket');

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const msg = await Message.create({
          conversationId: data.conversationId,
          senderId: data.senderId,
          text: data.text
        });
        io.to(data.conversationId).emit('receive_message', msg);
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { init, getIO };
