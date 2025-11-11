const express = require('express');
const router = express.Router();
const { sendContactMessage, getAllMessages, markAsRead, markAsUnread, deleteMessage } = require('../controllers/MessageController');
const { userVerification } = require('../middlewares/AuthMiddleware');
const { requireAdmin } = require('../middlewares/RequireMiddleware');

router.post('/', sendContactMessage);
router.get('/', userVerification, requireAdmin, getAllMessages);
router.put('/:id/read', userVerification,  markAsRead);
router.put('/:id/unread', userVerification, markAsUnread); 
router.delete('/:id', userVerification, requireAdmin, deleteMessage);

module.exports = router;
