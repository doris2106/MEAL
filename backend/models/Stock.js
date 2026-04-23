const mongoose = require('mongoose');

/**
 * Stock Management Schema
 * Tracks inventory for mid-day meal items
 */
const stockSchema = new mongoose.Schema(
  {
    // Item name (Rice, Dal, Vegetables, Masala, etc.)
    itemName: {
      type: String,
      required: true,
      enum: ['Rice', 'Dal', 'Vegetables', 'Masala', 'Oil', 'Salt', 'Milk', 'Bread'],
      trim: true,
    },

    // Total quantity added to stock
    addedQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Total quantity used/consumed
    usedQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Remaining quantity (calculated)
    remainingQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Unit of measurement (kg, liters, etc.)
    unit: {
      type: String,
      default: 'kg',
    },

    // Teacher who recorded this stock
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },

    // Last updated date
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Update remainingQty before saving
stockSchema.pre('save', function (next) {
  this.remainingQty = this.addedQty - this.usedQty;
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
