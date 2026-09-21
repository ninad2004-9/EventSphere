const express = require('express');
const router  = express.Router();
const {
  createBooking, getMyBookings, getBookingById, getAllBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// User routes (require login)
router.post('/',            protect, createBooking);
router.get('/my-bookings',  protect, getMyBookings);
router.get('/:id',          protect, getBookingById);

// Admin route
router.get('/admin/all',    protect, adminOnly, getAllBookings);

module.exports = router;
