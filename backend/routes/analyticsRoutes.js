const express = require('express');
const router  = express.Router();
const {
  getSummaryAnalytics, getEventSalesAnalytics, getRevenueByDate,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/',        protect, adminOnly, getSummaryAnalytics);
router.get('/events',  protect, adminOnly, getEventSalesAnalytics);
router.get('/revenue', protect, adminOnly, getRevenueByDate);

module.exports = router;
