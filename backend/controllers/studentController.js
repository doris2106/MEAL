const Student = require('../models/Student');

/**
 * Student Controller
 * Handles student CRUD operations
 */

// @desc    Add a new student
// @route   POST /api/students
// @access  Public (can be restricted later with auth middleware)
const addStudent = async (req, res, next) => {
  try {
    const { name, class: studentClass, rollNumber, school } = req.body;

    // Validation: Required fields
    if (!name || !studentClass || rollNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, class, and roll number are required',
      });
    }

    // Check for duplicate roll number
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `A student with roll number ${rollNumber} already exists`,
      });
    }

    // Create new student
    const student = new Student({
      name: name.trim(),
      class: String(studentClass).trim(),
      rollNumber: parseInt(rollNumber),
      school: school || '',
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number already exists',
      });
    }
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getAllStudents = async (req, res, next) => {
  try {
    const { class: studentClass, active } = req.query;

    // Build filter
    const filter = {};
    
    if (studentClass) {
      filter.class = String(studentClass);
    }
    
    // By default, only return active students
    if (active !== 'false') {
      filter.isActive = true;
    }

    const students = await Student.find(filter).sort({ class: 1, rollNumber: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students by class
// @route   GET /api/students/class/:class
// @access  Public
const getStudentsByClass = async (req, res, next) => {
  try {
    const { class: studentClass } = req.params;

    const students = await Student.find({ 
      class: studentClass,
      isActive: true 
    }).sort({ rollNumber: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, class: studentClass, rollNumber, school, isActive } = req.body;

    // Check if student exists
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check for duplicate roll number (excluding current student)
    if (rollNumber && rollNumber !== student.rollNumber) {
      const existingStudent = await Student.findOne({ 
        rollNumber,
        _id: { $ne: id }
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: `A student with roll number ${rollNumber} already exists`,
        });
      }
    }

    // Update fields
    if (name) student.name = name.trim();
    if (studentClass) student.class = String(studentClass).trim();
    if (rollNumber !== undefined) student.rollNumber = parseInt(rollNumber);
    if (school !== undefined) student.school = school;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number already exists',
      });
    }
    next(error);
  }
};

// @desc    Delete (soft) a student
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Soft delete
    student.isActive = false;
    await student.save();

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudentsByClass,
  updateStudent,
  deleteStudent,
};