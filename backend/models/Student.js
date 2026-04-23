const mongoose = require('mongoose');

/**
 * Student Schema
 * Stores individual student information for attendance tracking
 */
const studentSchema = new mongoose.Schema(
  {
    // Student name (required)
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // Class (required) - can be number (1-8) or string
    class: {
      type: String, // Using String to support both "1" and "LKG", "UKG" etc.
      required: [true, 'Class is required'],
      trim: true,
    },

    // Roll number (unique, required)
    rollNumber: {
      type: Number,
      required: [true, 'Roll number is required'],
      unique: true,
      min: [1, 'Roll number must be at least 1'],
    },

    // Active status - soft delete
    isActive: {
      type: Boolean,
      default: true,
    },

    // Optional: School/teacher reference
    school: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
studentSchema.index({ class: 1, rollNumber: 1 });
studentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Student', studentSchema);