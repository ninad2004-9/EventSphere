const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const eventRoutes     = require('./routes/eventRoutes');
const bookingRoutes   = require('./routes/bookingRoutes');
const userRoutes      = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// ── Connect to MongoDB ─────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
// Disable contentSecurityPolicy so the frontend HTML (with inline scripts/fonts) works
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ───────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://localhost:3000'],
    credentials: true,
  })
);

// ── Body parser ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve frontend static files ────────────────────────────────────────────────
// The three HTML files live in ../frontend relative to this server.js
app.use(
  express.static(path.join(__dirname, '..', 'frontend'), {
    // Do NOT cache HTML files so browsers always get the latest version
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store');
      }
    },
  })
);

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',              authRoutes);
app.use('/api/events',            eventRoutes);
app.use('/api/bookings',          bookingRoutes);
app.use('/api/admin/users',       userRoutes);
app.use('/api/admin/analytics',   analyticsRoutes);
app.use('/api/admin/bookings',    require('./routes/bookingRoutes')); // re-use bookingRoutes for /admin/all

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'EventSphere API is running 🚀' });
});

// ── Fallback: serve login.html for any unmatched route ────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
});

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EventSphere server running at http://localhost:${PORT}`);
  console.log(`📂 Frontend:  http://localhost:${PORT}/login.html`);
  console.log(`📡 API Base:  http://localhost:${PORT}/api`);
});
