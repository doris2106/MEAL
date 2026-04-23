const express = require('express');
const {
  createRecord,
  getAllRecords,
  getRecordsByDate,
  getRecordsByDateRange,
  getRecordById,
  updateRecord,
  deleteRecord,
  getDashboardStats,
} = require('../controllers/recordController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Record Routes
 * All routes for attendance and meal management records
 */

// Get dashboard statistics
router.get('/stats/dashboard', getDashboardStats);

// Get all records with pagination
router.get('/', getAllRecords);

// Get records by date range
router.get('/range', getRecordsByDateRange);

// Get records by specific date
router.get('/date/:date', getRecordsByDate);

// Get single record by ID
router.get('/:id', getRecordById);

// Create new record
router.post('/', createRecord);

// Update record
router.put('/:id', updateRecord);

// Delete record
router.delete('/:id', deleteRecord);

module.exports = router;
