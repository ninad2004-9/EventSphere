const Booking = require('../models/Booking');
const Event   = require('../models/Event');
const User    = require('../models/User');

// ── GET /api/admin/analytics ───────────────────────────────────────────────────
// Summary statistics for admin dashboard
const getSummaryAnalytics = async (req, res) => {
  try {
    // Only count confirmed bookings for revenue
    const revenueAgg = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue:      { $sum: '$totalAmount' },
          totalTicketsSold:  { $sum: '$quantity' },
          totalBookings:     { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
    ]);

    const stats = revenueAgg[0] || {
      totalRevenue: 0,
      totalTicketsSold: 0,
      totalBookings: 0,
      averageOrderValue: 0,
    };

    const totalUsers  = await User.countDocuments({ role: 'user' });
    const totalEvents = await Event.countDocuments();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const activeEvents = await Event.countDocuments({ status: 'active', date: { $gte: today } });
    const expiredOrDraft = await Event.countDocuments({
      $or: [{ status: 'draft' }, { date: { $lt: today } }],
    });

    // Recent bookings (last 5)
    const recentBookings = await Booking.find({ bookingStatus: 'confirmed' })
      .populate('user',  'firstName lastName email')
      .populate('event', 'title emoji category')
      .sort({ bookedAt: -1 })
      .limit(5);

    // Recent users (last 5)
    const recentUsers = await User.find({ role: 'user' })
      .select('firstName lastName email city createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue:      Math.round(stats.totalRevenue),
        totalTicketsSold:  stats.totalTicketsSold,
        totalBookings:     stats.totalBookings,
        averageOrderValue: Math.round(stats.averageOrderValue * 100) / 100,
        totalUsers,
        totalEvents,
        activeEvents,
        expiredOrDraft,
      },
      recentBookings,
      recentUsers,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/admin/analytics/events ───────────────────────────────────────────
// Sales grouped by event
const getEventSalesAnalytics = async (req, res) => {
  try {
    const eventSales = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } },
      {
        $group: {
          _id:         '$event',
          ticketsSold: { $sum: '$quantity' },
          revenue:     { $sum: '$totalAmount' },
          bookings:    { $sum: 1 },
        },
      },
      {
        $lookup: {
          from:         'events',
          localField:   '_id',
          foreignField: '_id',
          as:           'eventInfo',
        },
      },
      { $unwind: '$eventInfo' },
      {
        $project: {
          _id:         0,
          eventId:     '$_id',
          eventName:   '$eventInfo.title',
          category:    '$eventInfo.category',
          emoji:       '$eventInfo.emoji',
          ticketsSold: 1,
          revenue:     1,
          bookings:    1,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({ success: true, eventSales });
  } catch (err) {
    console.error('EventSales analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/admin/analytics/revenue ──────────────────────────────────────────
// Revenue grouped by date (last 30 days)
const getRevenueByDate = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueByDate = await Booking.aggregate([
      {
        $match: {
          bookingStatus: 'confirmed',
          paymentStatus: 'paid',
          bookedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$bookedAt' },
          },
          revenue:  { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          tickets:  { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id:      0,
          date:     '$_id',
          revenue:  1,
          bookings: 1,
          tickets:  1,
        },
      },
    ]);

    res.status(200).json({ success: true, revenueByDate });
  } catch (err) {
    console.error('Revenue analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getSummaryAnalytics, getEventSalesAnalytics, getRevenueByDate };
