/**
 * EventSphere Database Seeder
 * Run with: npm run seed
 *
 * This script:
 *  1. Creates the admin user from .env credentials
 *  2. Inserts 8 sample events into MongoDB
 *
 * Safe to run multiple times — it checks for existing data first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User  = require('../models/User');
const Event = require('../models/Event');
const connectDB = require('../config/db');

const sampleEvents = [
  {
    emoji: '🎵', title: 'Neon Nights Music Festival',
    description: 'An electrifying night of music under the stars.',
    category: 'Music', date: new Date('2026-11-22'), venue: 'Bandra Fort, Mumbai',
    city: 'Mumbai', basePrice: 2499, totalCapacity: 2000, status: 'active',
    bg: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', cc: 'cm',
  },
  {
    emoji: '💻', title: 'TechFusion Summit 2026',
    description: 'Biggest tech summit of the year featuring top industry speakers.',
    category: 'Tech', date: new Date('2026-12-05'), venue: 'KTPO, Bangalore',
    city: 'Bangalore', basePrice: 3999, totalCapacity: 800, status: 'active',
    bg: 'linear-gradient(135deg,#064e3b,#065f46)', cc: 'ct',
  },
  {
    emoji: '🍜', title: 'Grand Food & Wine Carnival',
    description: 'A celebration of fine dining, craft wine, and world cuisine.',
    category: 'Food', date: new Date('2026-11-28'), venue: 'Phoenix Palladium, Pune',
    city: 'Pune', basePrice: 899, totalCapacity: 1200, status: 'active',
    bg: 'linear-gradient(135deg,#451a03,#78350f)', cc: 'cf',
  },
  {
    emoji: '🎨', title: 'Contemporary Art Expo',
    description: "Showcasing India's finest contemporary artists.",
    category: 'Art', date: new Date('2026-12-12'), venue: 'NGMA, New Delhi',
    city: 'New Delhi', basePrice: 599, totalCapacity: 500, status: 'active',
    bg: 'linear-gradient(135deg,#4a044e,#831843)', cc: 'ca',
  },
  {
    emoji: '⚽', title: 'Pro League Grand Final',
    description: 'The most anticipated match of the season.',
    category: 'Sports', date: new Date('2026-12-20'), venue: 'Salt Lake Stadium, Kolkata',
    city: 'Kolkata', basePrice: 1199, totalCapacity: 60000, status: 'active',
    bg: 'linear-gradient(135deg,#064e3b,#166534)', cc: 'cs',
  },
  {
    emoji: '😂', title: 'Stand-Up Comedy Night',
    description: 'An evening of laughs with India\'s top comedians.',
    category: 'Comedy', date: new Date('2026-11-25'), venue: 'Sophia Auditorium, Mumbai',
    city: 'Mumbai', basePrice: 749, totalCapacity: 600, status: 'active',
    bg: 'linear-gradient(135deg,#1c1917,#44403c)', cc: 'cc',
  },
  {
    emoji: '🎸', title: 'Rock Legends Concert',
    description: 'The ultimate rock music experience.',
    category: 'Music', date: new Date('2026-12-28'), venue: 'MMRDA Grounds, Mumbai',
    city: 'Mumbai', basePrice: 1999, totalCapacity: 25000, status: 'active',
    bg: 'linear-gradient(135deg,#1a0a0a,#7f1d1d)', cc: 'cm',
  },
  {
    emoji: '🧘', title: 'Wellness & Yoga Retreat',
    description: 'A restorative weekend retreat in the hills.',
    category: 'Wellness', date: new Date('2027-01-05'), venue: 'Lonavala Hills, Pune',
    city: 'Pune', basePrice: 2999, totalCapacity: 100, status: 'draft',
    bg: 'linear-gradient(135deg,#052e16,#14532d)', cc: 'bw2',
  },
];

const seed = async () => {
  await connectDB();

  // ── 1. Admin User ────────────────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@eventsphere.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Secure2025';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
  } else {
    await User.create({
      firstName: 'Admin',
      lastName:  'User',
      email:     adminEmail,
      password:  adminPassword,
      role:      'admin',
    });
    console.log(`✅ Admin created: ${adminEmail}`);
  }

  // ── 2. Sample Events ─────────────────────────────────────────────────────────
  const eventCount = await Event.countDocuments();
  if (eventCount > 0) {
    console.log(`ℹ️  Events already exist (${eventCount} found) — skipping event seed.`);
  } else {
    await Event.insertMany(sampleEvents);
    console.log(`✅ Inserted ${sampleEvents.length} sample events.`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`   Admin login: ${adminEmail} / ${adminPassword}`);
  console.log('   Open: http://localhost:5000/login.html\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
