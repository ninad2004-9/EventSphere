const Booking = require('../models/Booking');
const Event   = require('../models/Event');
const { generateBookingRef } = require('../utils/bookingRef');

// Convenience fees per tier (mirrors frontend constants fees=[150,299,499])
const CONVENIENCE_FEES = {
  'General Admission': 150,
  'VIP Experience':    299,
  'Platinum Pass':     499,
};

// ── POST /api/bookings ─────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    // --- Validation ---
    if (!eventId || !ticketType || !quantity) {
      return res.status(400).json({ success: false, message: 'eventId, ticketType, and quantity are required.' });
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 10) {
      return res.status(400).json({ success: false, message: 'Quantity must be between 1 and 10.' });
    }
    if (!['General Admission', 'VIP Experience', 'Platinum Pass'].includes(ticketType)) {
      return res.status(400).json({ success: false, message: 'Invalid ticket type.' });
    }

    // --- Load event ---
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    if (event.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This event is not available for booking.' });
    }

    // --- Check ticket type exists and has availability ---
    const tier = event.ticketTypes.find((t) => t.name === ticketType);
    if (!tier) {
      return res.status(404).json({ success: false, message: 'Ticket type not found for this event.' });
    }
    if (tier.availableQuantity < qty) {
      return res.status(409).json({
        success: false,
        message: `Only ${tier.availableQuantity} ticket(s) available for ${ticketType}.`,
      });
    }

    // --- Calculate price on the backend (never trust frontend amounts) ---
    const ticketPrice    = tier.price;
    const convenienceFee = CONVENIENCE_FEES[ticketType] ?? 150;
    const totalAmount    = ticketPrice * qty + convenienceFee;

    // --- Generate unique booking reference ---
    let bookingReference;
    let attempts = 0;
    do {
      bookingReference = generateBookingRef();
      const exists = await Booking.findOne({ bookingReference });
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    // --- Atomic inventory update using findOneAndUpdate ---
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        'ticketTypes.name': ticketType,
        'ticketTypes.availableQuantity': { $gte: qty },
      },
      { $inc: { 'ticketTypes.$.availableQuantity': -qty } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(409).json({
        success: false,
        message: 'Tickets sold out or unavailable. Please try again.',
      });
    }

    // --- Create booking record ---
    const booking = await Booking.create({
      user:             req.user.id,
      event:            eventId,
      ticketType,
      quantity:         qty,
      ticketPrice,
      convenienceFee,
      totalAmount,
      bookingStatus:    'confirmed',
      paymentStatus:    'paid',
      bookingReference,
    });

    // Populate event details for the response
    await booking.populate('event', 'title emoji date venue category');
    await booking.populate('user', 'firstName lastName email');

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error('CreateBooking error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── GET /api/bookings/my-bookings ─────────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event', 'title emoji date venue category bg cc')
      .sort({ bookedAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('GetMyBookings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/bookings/:id ─────────────────────────────────────────────────────
// User can only view their own booking
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title emoji date venue category')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Prevent users from viewing another user's booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error('GetBookingById error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/admin/bookings ────────────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user',  'firstName lastName email city')
      .populate('event', 'title emoji category date venue')
      .sort({ bookedAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    console.error('GetAllBookings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, getAllBookings };
