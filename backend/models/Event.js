const mongoose = require('mongoose');

// Ticket type sub-schema — matches the 3 tiers the frontend expects:
//   General Admission | VIP Experience | Platinum Pass
const ticketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['General Admission', 'VIP Experience', 'Platinum Pass'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    emoji: {
      type: String,
      default: '🎵',
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Music', 'Tech', 'Food', 'Art', 'Sports', 'Comedy', 'Wellness'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    // Base ticket price (General Admission); VIP = price×2.5, Platinum = price×5
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    ticketTypes: {
      type: [ticketTypeSchema],
      default: [],
    },
    totalCapacity: {
      type: Number,
      default: 500,
      min: [1, 'Capacity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['active', 'draft'],
      default: 'active',
    },
    // CSS gradient — preserved from frontend for rendering event cards
    bg: {
      type: String,
      default: 'linear-gradient(135deg,#1e1b4b,#4c1d95)',
    },
    // CSS class name for category colour badge
    cc: {
      type: String,
      default: 'cm',
    },
  },
  { timestamps: true }
);

// Before saving, auto-generate the 3 ticket tiers if not already set
eventSchema.pre('save', function (next) {
  if (this.isModified('basePrice') || this.ticketTypes.length === 0) {
    const p = this.basePrice;
    const cap = this.totalCapacity;
    this.ticketTypes = [
      { name: 'General Admission', price: p,                    availableQuantity: Math.floor(cap * 0.6) },
      { name: 'VIP Experience',    price: Math.round(p * 2.5),  availableQuantity: Math.floor(cap * 0.3) },
      { name: 'Platinum Pass',     price: Math.round(p * 5),    availableQuantity: Math.floor(cap * 0.1) },
    ];
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
