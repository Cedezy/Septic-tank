const express = require('express');
const router = express.Router();
const { getCustomersFromBookings } = require('../controllers/CustomerController');
const { userVerification } = require('../middlewares/AuthMiddleware');
const { requireRoles } = require('../middlewares/RequireMiddleware');

router.get('/', userVerification, requireRoles('admin', 'manager'), getCustomersFromBookings);

module.exports = router;