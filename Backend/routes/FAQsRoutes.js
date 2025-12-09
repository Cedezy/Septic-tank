const express = require('express');
const router = express.Router();
const { createFaq, getFaqs, updateFaq } = require('../controllers/FAQsController');
const { userVerification } = require('../middlewares/AuthMiddleware');
const { requireAdmin } = require('../middlewares/RequireMiddleware');

router.post('/', userVerification, requireAdmin, createFaq);
router.get('/', getFaqs);
router.put('/:id', userVerification, requireAdmin, updateFaq);

module.exports = router;