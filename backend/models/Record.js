const mongoose = require('mongoose');

/**
 * Attendance & Meal Record Schema
 * Stores daily attendance and meal management data for school classes
 */
const recordSchema = new mongoose.Schema(
  {
    // Date of the record (default: today)
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },

    // Class group selection (Class 1-5)
    classGroup1to5: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Class group selection (Class 6-8)
    classGroup6to8: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Student count per class
    students: {
      class1: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class2: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class3: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class4: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class5: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class6: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class7: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class8: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    // Total students detected from camera auto-fill
    detectedStudents: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Meal beneficiaries per class
    beneficiaries: {
      class1: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class2: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class3: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class4: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class5: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class6: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class7: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
      class8: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
        default: 0,
      },
    },

    // Type of meal served
    mealType: {
      type: String,
      required: true,
      enum: ['Khichdi', 'Dal', 'Rice', 'Bread', 'Vegetables', 'Milk', 'Other'],
    },

    // Student-wise attendance (new feature)
    // Stores individual student attendance records instead of just counts
    studentAttendance: {
      type: [
        {
          studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
          },
          studentName: {
            type: String,
            required: true,
          },
          rollNumber: {
            type: Number,
            required: true,
          },
          class: {
            type: String,
            required: true,
          },
          status: {
            type: String,
            enum: ['Present', 'Absent'],
            default: 'Present',
          },
        },
      ],
      default: [],
    },

    // Summary counts derived from studentAttendance
    attendanceSummary: {
      totalStudents: {
        type: Number,
        default: 0,
      },
      presentCount: {
        type: Number,
        default: 0,
      },
      absentCount: {
        type: Number,
        default: 0,
      },
    },

    // Flag to indicate if this is student-wise attendance
    attendanceType: {
      type: String,
      enum: ['count', 'student-wise'],
      default: 'count',
    },

    // Teacher/User ID (for future authentication)
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },

    // Additional notes
    notes: {
      type: String,
      default: '',
    },

    // Timestamp for record creation and modification
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

// Index for efficient date-based queries
recordSchema.index({ date: 1 });
recordSchema.index({ teacherId: 1, date: -1 });

module.exports = mongoose.model('Record', recordSchema);
