const express = require('express');
const router = express.Router();
const {
  getAllStock,
  getStockById,
  addStock,
  updateUsedStock,
  getStockSummary,
  deleteStock,
} = require('../controllers/stockController');

/**
 * Stock Routes
 * Endpoints for inventory/stock management
 */

// GET all stock items
router.get('/', getAllStock);

// GET stock summary/statistics
router.get('/stats/summary', getStockSummary);

// GET single stock by ID
router.get('/:id', getStockById);

// POST add new stock
router.post('/', addStock);

// PUT update used quantity
router.put('/use/:id', updateUsedStock);

// DELETE stock item
router.delete('/:id', deleteStock);

module.exports = router;
