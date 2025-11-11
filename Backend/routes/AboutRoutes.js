const express = require('express');
const router = express.Router();
const { getAboutUs, updateAboutUs } = require('../controllers/AboutController');

router.get('/', getAboutUs);
router.put('/', updateAboutUs);

module.exports = router;
