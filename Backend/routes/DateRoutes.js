const express = require('express');
const router = express.Router();
const { getBlockedDates, addBlockedDate, deleteBlockedDate } = require('../controllers/DateController');
const { userVerification } = require('../middlewares/AuthMiddleware');
const { requireAdmin } = require('../middlewares/RequireMiddleware');

router.get('/', userVerification, getBlockedDates);
router.post('/', userVerification, addBlockedDate);
router.delete('/:id', userVerification, deleteBlockedDate);

module.exports = router;
