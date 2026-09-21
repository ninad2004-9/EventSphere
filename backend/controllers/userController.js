const User = require('../models/User');
const Booking = require('../models/Booking');

// ── GET /api/admin/users ───────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    // Attach booking count for each user
    const usersWithBookings = await Promise.all(
      users.map(async (u) => {
        const bookingCount = await Booking.countDocuments({ user: u._id, bookingStatus: 'confirmed' });
        return {
          id:        u._id,
          firstName: u.firstName,
          lastName:  u.lastName,
          email:     u.email,
          city:      u.city,
          phone:     u.phone,
          createdAt: u.createdAt,
          bookingCount,
        };
      })
    );

    res.status(200).json({ success: true, count: usersWithBookings.length, users: usersWithBookings });
  } catch (err) {
    console.error('GetAllUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllUsers };
