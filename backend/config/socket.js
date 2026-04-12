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

    socket.on('join_personal_room', (userId) => {
       socket.join(userId);
       console.log(`User ${userId} joined their personal room`);
    });

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
        
        // Find the other user in the conversation
        const { Conversation } = require('../models');
        const conversation = await Conversation.findByPk(data.conversationId);
        if (conversation) {
           const recipientId = conversation.user1Id === data.senderId ? conversation.user2Id : conversation.user1Id;
           
           // Emit to the conversation room
           io.to(data.conversationId).emit('receive_message', msg);
           
           // Emit notification to the recipient specifically
           io.to(recipientId).emit('new_message_notification', {
              conversationId: data.conversationId,
              text: data.text,
              senderId: data.senderId
           });
        }
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('mark_as_read', async (data) => {
        try {
            await Message.update({ read: true }, {
                where: {
                    conversationId: data.conversationId,
                    senderId: { [Op.ne]: data.userId },
                    read: false
                }
            });
            // Optionally notify sender that message was read
        } catch (err) {
            console.error('Socket mark_as_read error:', err);
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
