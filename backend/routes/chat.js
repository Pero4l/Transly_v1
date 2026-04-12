const express = require('express');
const { startOrGetConversation, getConversations, getMessages } = require('../controllers/chat.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/conversation', startOrGetConversation);
router.get('/conversations', getConversations);
router.get('/:conversationId/messages', getMessages);

module.exports = router;
