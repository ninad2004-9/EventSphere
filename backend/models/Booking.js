const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
      enum: ['General Admission', 'VIP Experience', 'Platinum Pass'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Maximum 10 tickets per booking'],
    },
    // Price per ticket at the time of booking (authoritative — calculated by backend)
    ticketPrice: {
      type: Number,
      required: true,
      min: [0],
    },
    // Convenience fee at the time of booking
    convenienceFee: {
      type: Number,
      required: true,
      min: [0],
    },
    // totalAmount = ticketPrice × quantity + convenienceFee (calculated by backend)
    totalAmount: {
      type: Number,
      required: true,
      min: [0],
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'refunded'],
      default: 'paid',
    },
    // Unique reference shown to the user, e.g. ES-20260921-A8F42K
    bookingReference: {
      type: String,
      unique: true,
      required: true,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index to speed up "my bookings" and analytics queries
bookingSchema.index({ user: 1, bookedAt: -1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ bookedAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
