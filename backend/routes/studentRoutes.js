const express = require('express');
const {
  addStudent,
  getAllStudents,
  getStudentsByClass,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const router = express.Router();

/**
 * Student Routes
 * All routes for student management
 */

// Get all students (with optional class filter)
router.get('/', getAllStudents);

// Get students by class
router.get('/class/:class', getStudentsByClass);

// Add new student
router.post('/', addStudent);

// Update student
router.put('/:id', updateStudent);

// Delete (soft) student
router.delete('/:id', deleteStudent);

module.exports = router;