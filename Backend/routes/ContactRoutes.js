const express = require('express');
const router = express.Router();
const { getContactUs, updateContactUs } = require('../controllers/ContactController');

router.get('/', getContactUs);
router.put('/', updateContactUs);

module.exports = router;