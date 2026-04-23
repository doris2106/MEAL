const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Teacher Authentication Schema
 * Stores teacher credentials for login and access control
 */
const teacherSchema = new mongoose.Schema(
  {
    // Full name of the teacher
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email address (unique)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // Phone number
    phone: {
      type: String,
      required: true,
    },

    // School name/ID
    school: {
      type: String,
      required: true,
    },

    // Hashed password (never store plain passwords)
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // Role-based access control
    role: {
      type: String,
      enum: ['teacher', 'admin'],
      default: 'teacher',
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
teacherSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Teacher', teacherSchema);
