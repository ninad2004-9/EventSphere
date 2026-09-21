const express = require('express');
const router  = express.Router();
const {
  getEvents, getAllEventsAdmin, getEventById,
  createEvent, updateEvent, deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Public routes
router.get('/',    getEvents);
router.get('/all', protect, adminOnly, getAllEventsAdmin); // admin: all events incl. draft/expired
router.get('/:id', getEventById);

// Admin-only routes
router.post('/',       protect, adminOnly, createEvent);
router.put('/:id',     protect, adminOnly, updateEvent);
router.delete('/:id',  protect, adminOnly, deleteEvent);

module.exports = router;
