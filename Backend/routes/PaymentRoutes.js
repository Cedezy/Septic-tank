const express = require('express');
const router = express.Router();
const { initiateGcashPayment } = require('../controllers/PaymentController');
const { userVerification } = require('../middlewares/AuthMiddleware');

router.post('/pay-gcash', userVerification, initiateGcashPayment);

module.exports = router;
