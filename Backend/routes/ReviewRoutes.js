const express = require('express');
const router = express.Router();
const { createReview, getReviewsByTechnician, getReviewsByCustomer, getAllReviews, updateReviewStatus } = require('../controllers/ReviewController');
const { userVerification } = require('../middlewares/AuthMiddleware'); 

router.post('/', userVerification, createReview);
router.get('/', getAllReviews);
router.get('/technician/:techId', getReviewsByTechnician);
router.get('/customer', userVerification, getReviewsByCustomer);
router.put('/:id/update', userVerification, updateReviewStatus);

module.exports = router;
