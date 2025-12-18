const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByCustomer, getAllBookings, updateBookingStatus, assignTechnician, getAssignedTechnician, updateBookingStatusByTechnician, getAvailableTimeSlots, respondToBooking, getBookingHistoryByCustomer, cancelBookingByCustomer, uploadProof, cancelBookingByTechnician, updateServiceTypeByTechnician  } = require('../controllers/BookController');
const { userVerification } = require('../middlewares/AuthMiddleware');
const { requireRoles } = require('../middlewares/RequireMiddleware');
const upload = require('../middlewares/upload')

router.post('/', userVerification, createBooking);
router.get('/', userVerification, getAllBookings);
router.get('/customer', userVerification, getBookingsByCustomer);
router.get('/technician/assigned', userVerification, getAssignedTechnician);
router.get('/available-time', userVerification, getAvailableTimeSlots);
router.get('/history/:customerId', userVerification, getBookingHistoryByCustomer);
router.put('/:bookingId', userVerification, updateBookingStatus);
router.put('/assign/:bookingId', userVerification, requireRoles('admin', 'manager'), assignTechnician);
router.put('/cancel/:bookingId', userVerification, cancelBookingByCustomer);
router.put('/technician/respond/:bookingId', userVerification, respondToBooking);
router.put('/technician/update/:bookingId', userVerification, updateBookingStatusByTechnician);
router.put('/technician/service/:bookingId', userVerification, updateServiceTypeByTechnician);
router.put('/technician/cancel/:bookingId', userVerification, cancelBookingByTechnician);
router.post('/technician/proof/:bookingId', upload.single("proofImages"), userVerification, uploadProof);

module.exports = router; 

