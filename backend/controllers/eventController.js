const Event = require('../models/Event');

// ── Category → CSS mapping (mirrors frontend) ─────────────────────────────────
const catBg = {
  Music:    'linear-gradient(135deg,#1e1b4b,#4c1d95)',
  Tech:     'linear-gradient(135deg,#064e3b,#065f46)',
  Food:     'linear-gradient(135deg,#451a03,#78350f)',
  Art:      'linear-gradient(135deg,#4a044e,#831843)',
  Sports:   'linear-gradient(135deg,#064e3b,#166534)',
  Comedy:   'linear-gradient(135deg,#1c1917,#44403c)',
  Wellness: 'linear-gradient(135deg,#052e16,#14532d)',
};
const catCls = {
  Music: 'cm', Tech: 'ct', Food: 'cf', Art: 'ca',
  Sports: 'cs', Comedy: 'cc', Wellness: 'bw2',
};

// ── GET /api/events ────────────────────────────────────────────────────────────
// Public — returns active events whose date is today or later
const getEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = { status: 'active', date: { $gte: today } };

    // Optional category filter: GET /api/events?category=Music
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    // Optional search: GET /api/events?q=neon
    if (req.query.q) {
      filter.$or = [
        { title:    { $regex: req.query.q, $options: 'i' } },
        { venue:    { $regex: req.query.q, $options: 'i' } },
        { category: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.status(200).json({ success: true, count: events.length, events });
  } catch (err) {
    console.error('GetEvents error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/events/all  (admin — includes draft + expired) ───────────────────
const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/events/:id ────────────────────────────────────────────────────────
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.status(200).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── POST /api/events  (admin only) ────────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    const { emoji, title, description, category, date, venue, city, basePrice, totalCapacity, status } = req.body;

    if (!title || !category || !date || !venue || basePrice === undefined) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }

    const event = await Event.create({
      emoji: emoji || '🎵',
      title,
      description: description || '',
      category,
      date: new Date(date),
      venue,
      city: city || '',
      basePrice: Number(basePrice),
      totalCapacity: Number(totalCapacity) || 500,
      status: status || 'active',
      bg: catBg[category] || catBg.Music,
      cc: catCls[category] || 'cm',
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    console.error('CreateEvent error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── PUT /api/events/:id  (admin only) ─────────────────────────────────────────
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const { emoji, title, description, category, date, venue, city, basePrice, totalCapacity, status } = req.body;

    if (emoji)         event.emoji       = emoji;
    if (title)         event.title       = title;
    if (description !== undefined) event.description = description;
    if (category)      { event.category  = category; event.bg = catBg[category] || event.bg; event.cc = catCls[category] || event.cc; }
    if (date)          event.date        = new Date(date);
    if (venue)         event.venue       = venue;
    if (city  !== undefined) event.city  = city;
    if (status)        event.status      = status;
    if (totalCapacity) event.totalCapacity = Number(totalCapacity);

    // If basePrice changes, regenerate ticket tiers
    if (basePrice !== undefined) {
      event.basePrice  = Number(basePrice);
      event.ticketTypes = []; // triggers pre-save hook to regenerate
    }

    await event.save();
    res.status(200).json({ success: true, event });
  } catch (err) {
    console.error('UpdateEvent error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── DELETE /api/events/:id  (admin only) ──────────────────────────────────────
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    await event.deleteOne();
    res.status(200).json({ success: true, message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('DeleteEvent error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getEvents, getAllEventsAdmin, getEventById, createEvent, updateEvent, deleteEvent };
