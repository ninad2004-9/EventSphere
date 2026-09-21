const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: sign a JWT ─────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// ── Helper: build the response object ─────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

// ── POST /api/auth/register ────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, city, phone } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This email is already registered. Please sign in.' });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      city: city?.trim() || '',
      phone: phone?.trim() || '',
      role: 'user',
    });

    sendToken(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    // Explicitly select password (it is hidden by default via select:false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please register first.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── PUT /api/auth/me ───────────────────────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    const { firstName, lastName, city, phone } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName  && { lastName:  lastName.trim()  }),
        ...(city      && { city:      city.trim()      }),
        ...(phone     && { phone:     phone.trim()     }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user: updated });
  } catch (err) {
    console.error('UpdateMe error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/auth/check-email?email= ──────────────────────────────────────────
const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    res.status(200).json({ success: true, available: !exists });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, updateMe, checkEmail };
