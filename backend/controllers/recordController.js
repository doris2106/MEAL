const Record = require('../models/Record');

/**
 * Record Controller
 * Handles attendance and meal management operations
 */

// @desc    Create a new attendance/meal record
// @route   POST /api/records
// @params  req.body: { date, classGroup1to5, classGroup6to8, students, beneficiaries, mealType, studentAttendance }
const createRecord = async (req, res, next) => {
  try {
    const {
      date,
      classGroup1to5,
      classGroup6to8,
      detectedStudents,
      students,
      beneficiaries,
      mealType,
      notes,
      studentAttendance,
    } = req.body;

    // Validation: At least one class group must be selected
    if (!classGroup1to5 && !classGroup6to8) {
      return res.status(400).json({
        success: false,
        message: 'At least one class group must be selected',
      });
    }

    // Determine if this is student-wise attendance or count-based
    const isStudentWise = Array.isArray(studentAttendance) && studentAttendance.length > 0;

    if (!isStudentWise && classGroup1to5 && classGroup6to8) {
      return res.status(400).json({
        success: false,
        message: 'Please select only one class group for count-based attendance',
      });
    }

    let recordData = {
      date: date ? new Date(date) : new Date(),
      classGroup1to5,
      classGroup6to8,
      detectedStudents: parseInt(detectedStudents) || 0,
      mealType,
      notes: notes || '',
      teacherId: req.user?._id || null,
      attendanceType: isStudentWise ? 'student-wise' : 'count',
    };

    if (isStudentWise) {
      // Student-wise attendance mode
      // Validate student attendance array
      for (const student of studentAttendance) {
        if (!student.studentId || !student.studentName || !student.rollNumber || !student.class || !student.status) {
          return res.status(400).json({
            success: false,
            message: 'Each student record must have studentId, studentName, rollNumber, class, and status',
          });
        }
        if (!['Present', 'Absent'].includes(student.status)) {
          return res.status(400).json({
            success: false,
            message: 'Status must be either "Present" or "Absent"',
          });
        }
      }

      // Calculate attendance summary
      const presentCount = studentAttendance.filter(s => s.status === 'Present').length;
      const absentCount = studentAttendance.filter(s => s.status === 'Absent').length;

      recordData.studentAttendance = studentAttendance;
      recordData.attendanceSummary = {
        totalStudents: studentAttendance.length,
        presentCount,
        absentCount,
      };

      // For backward compatibility, also set students count (sum of all classes)
      const classFields = classGroup1to5 
        ? ['class1', 'class2', 'class3', 'class4', 'class5']
        : ['class6', 'class7', 'class8'];
      
      recordData.students = {};
      recordData.beneficiaries = {};
      classFields.forEach(cls => {
        recordData.students[cls] = 0;
        recordData.beneficiaries[cls] = 0;
      });


    } else {
      // Count-based attendance mode (backward compatibility)
      const classGroup1Fields = ['class1', 'class2', 'class3', 'class4', 'class5'];
      const classGroup2Fields = ['class6', 'class7', 'class8'];

      const studentFieldsToCheck = classGroup1to5 ? classGroup1Fields : classGroup2Fields;
      const beneficiaryFieldsToCheck = classGroup1to5 ? classGroup1Fields : classGroup2Fields;

      if (!students || studentFieldsToCheck.some((field) => students[field] === undefined || students[field] === null)) {
        return res.status(400).json({
          success: false,
          message: 'All student counts for the selected group are required',
        });
      }

      if (!beneficiaries || beneficiaryFieldsToCheck.some((field) => beneficiaries[field] === undefined || beneficiaries[field] === null)) {
        return res.status(400).json({
          success: false,
          message: 'All beneficiary counts for the selected group are required',
        });
      }

      // Validation: Beneficiaries cannot exceed students for the selected group
      for (const classNum of studentFieldsToCheck) {
        if (beneficiaries[classNum] > students[classNum]) {
          return res.status(400).json({
            success: false,
            message: `Beneficiaries cannot exceed students in ${classNum}`,
          });
        }
      }

      // Ensure all class fields are present and default to 0 for unused classes
      const allClassFields = [...classGroup1Fields, ...classGroup2Fields];
      allClassFields.forEach((classNum) => {
        students[classNum] = parseInt(students[classNum]) || 0;
        beneficiaries[classNum] = parseInt(beneficiaries[classNum]) || 0;
      });

      recordData.students = students;
      recordData.beneficiaries = beneficiaries;
    }

    // Create new record
    const record = new Record(recordData);
    await record.save();

    res.status(201).json({
      success: true,
      message: isStudentWise ? 'Student-wise attendance recorded successfully' : 'Record created successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all records
// @route   GET /api/records?page=1&limit=10
const getAllRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await Record.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Record.countDocuments();

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get records by date
// @route   GET /api/records/date/:date
const getRecordsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;

    // Parse the date and create date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const records = await Record.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      date,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get records by date range
// @route   GET /api/records/range?startDate=2024-01-01&endDate=2024-01-31
const getRecordsByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await Record.find({
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: -1 });

    // Calculate statistics
    let totalStudents = 0;
    let totalBeneficiaries = 0;

    records.forEach((record) => {
      totalStudents += Object.values(record.students).reduce((a, b) => a + b, 0);
      totalBeneficiaries += Object.values(record.beneficiaries).reduce((a, b) => a + b, 0);
    });

    res.json({
      success: true,
      dateRange: { startDate, endDate },
      count: records.length,
      statistics: {
        totalStudents,
        totalBeneficiaries,
        averageBeneficiaryRate: Math.round((totalBeneficiaries / totalStudents) * 100) || 0,
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single record by ID
// @route   GET /api/records/:id
const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a record
// @route   PUT /api/records/:id
const updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validation: Beneficiaries cannot exceed students
    if (updateData.students && updateData.beneficiaries) {
      for (const classNum of ['class1', 'class2', 'class3', 'class4', 'class5']) {
        if (updateData.beneficiaries[classNum] > updateData.students[classNum]) {
          return res.status(400).json({
            success: false,
            message: `Beneficiaries cannot exceed students in ${classNum}`,
          });
        }
      }
    }

    const record = await Record.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    res.json({
      success: true,
      message: 'Record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/records/stats/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const records = await Record.find().sort({ date: -1 }).limit(30);

    let totalStudents = 0;
    let totalBeneficiaries = 0;
    let avgBeneficiaries = 0;
    const mealTypeCount = {};

    records.forEach((record) => {
      totalStudents += Object.values(record.students).reduce((a, b) => a + b, 0);
      totalBeneficiaries += Object.values(record.beneficiaries).reduce((a, b) => a + b, 0);

      // Count meal types
      mealTypeCount[record.mealType] = (mealTypeCount[record.mealType] || 0) + 1;
    });

    avgBeneficiaries = records.length > 0 ? Math.round((totalBeneficiaries / records.length) * 100) / 100 : 0;

    res.json({
      success: true,
      statistics: {
        totalRecords: records.length,
        totalStudents,
        totalBeneficiaries,
        averageBeneficiaryPerRecord: avgBeneficiaries,
        beneficiaryPercentage: Math.round((totalBeneficiaries / totalStudents) * 100) || 0,
        mealTypes: mealTypeCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getRecordsByDate,
  getRecordsByDateRange,
  getRecordById,
  updateRecord,
  deleteRecord,
  getDashboardStats,
};
