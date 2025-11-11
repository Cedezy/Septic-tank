const express = require('express');
const router = express.Router();
const { signup, login, verifyOtp, resendOtp, logout, forgotPassword, resetPassword, checkLoginUser } = require('../controllers/AuthController');
const { userVerification } = require('../middlewares/AuthMiddleware');

router.post('/', userVerification);
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/check', userVerification, checkLoginUser);

module.exports = router