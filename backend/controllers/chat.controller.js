const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

exports.startOrGetConversation = async (req, res) => {
  let { user2Id } = req.body;
  const user1Id = req.user.id;

  try {
    // If no recipient provided and current user is a customer or driver, find an admin to chat with
    if (!user2Id && (req.user.role === 'customer' || req.user.role === 'driver')) {
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (!admin) {
        return res.status(404).json({ success: false, error: 'No support agent available' });
      }
      user2Id = admin.id;
    }

    if (!user2Id) {
      return res.status(400).json({ success: false, error: 'Recipient ID required' });
    }

    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: user1Id, user2Id: user2Id },
          { user1Id: user2Id, user2Id: user1Id }
        ]
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({ user1Id, user2Id });
    }

    res.status(200).json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'admin';
    let whereClause = {};
    if (!isSuperAdmin) {
      whereClause = { [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }] };
    }

    const conversations = await Conversation.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'role'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'role'] }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const conversationWithUnread = await Promise.all(conversations.map(async (conv) => {
        const unreadCount = await Message.count({
            where: {
                conversationId: conv.id,
                senderId: { [Op.ne]: req.user.id },
                read: false
            }
        });
        
        // Get last message text
        const lastMsg = await Message.findOne({
            where: { conversationId: conv.id },
            order: [['createdAt', 'DESC']]
        });

        return {
            ...conv.toJSON(),
            unreadCount,
            lastMessage: lastMsg ? lastMsg.text : null,
            lastMessageTime: lastMsg ? lastMsg.createdAt : null
        };
    }));

    res.status(200).json({ success: true, conversations: conversationWithUnread });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) return res.status(404).json({ success: false, error: 'Conversation not found' });
    
    // Check access
    const isSuperAdmin = req.user.role === 'admin';
    if (!isSuperAdmin && conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id) {
       return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const messages = await Message.findAll({ 
      where: { conversationId }, 
      order: [['createdAt', 'ASC']],
      include: [{ model: User, as: 'sender', attributes: ['name', 'role'] }] 
    });

    // Mark as read
    await Message.update({ read: true }, { 
      where: { conversationId, senderId: { [Op.ne]: req.user.id }, read: false } 
    });

    res.status(200).json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
