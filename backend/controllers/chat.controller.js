const { Conversation, Message, User } = require('../models');
const { Op } = require('sequelize');

exports.startOrGetConversation = async (req, res) => {
  const { user2Id } = req.body;
  const user1Id = req.user.id;

  try {
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
      ]
    });
    res.status(200).json({ success: true, conversations });
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
