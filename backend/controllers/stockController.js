const Stock = require('../models/Stock');

/**
 * Stock Controller
 * Handles inventory/stock management operations
 */

// @desc    Get all stock items
// @route   GET /api/stock
const getAllStock = async (req, res, next) => {
  try {
    const stocks = await Stock.find().sort({ itemName: 1 });

    res.status(200).json({
      success: true,
      data: stocks,
      count: stocks.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single stock by ID
// @route   GET /api/stock/:id
const getStockById = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new stock or update existing
// @route   POST /api/stock
// @params  req.body: { itemName, addedQty, unit }
const addStock = async (req, res, next) => {
  try {
    const { itemName, addedQty, unit } = req.body;

    // Validation
    if (!itemName || !addedQty) {
      return res.status(400).json({
        success: false,
        message: 'Item name and quantity are required',
      });
    }

    if (addedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    // Check if item already exists
    let stock = await Stock.findOne({ itemName });

    if (stock) {
      // Update existing stock - add to addedQty
      stock.addedQty += parseFloat(addedQty);
      stock.remainingQty = stock.addedQty - stock.usedQty;
    } else {
      // Create new stock
      stock = new Stock({
        itemName,
        addedQty: parseFloat(addedQty),
        usedQty: 0,
        remainingQty: parseFloat(addedQty),
        unit: unit || 'kg',
        recordedBy: req.user?._id || null,
      });
    }

    await stock.save();

    res.status(201).json({
      success: true,
      message: 'Stock added successfully',
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update used quantity for a stock item
// @route   PUT /api/stock/use/:id
// @params  req.body: { usedQty }
const updateUsedStock = async (req, res, next) => {
  try {
    const { usedQty } = req.body;
    const { id } = req.params;

    if (!usedQty || usedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Used quantity must be greater than 0',
      });
    }

    const stock = await Stock.findById(id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found',
      });
    }

    // Check if used quantity exceeds available stock
    const totalUsed = stock.usedQty + parseFloat(usedQty);
    if (totalUsed > stock.addedQty) {
      return res.status(400).json({
        success: false,
        message: `Cannot use ${usedQty}. Only ${stock.remainingQty} remaining.`,
      });
    }

    stock.usedQty = totalUsed;
    stock.remainingQty = stock.addedQty - stock.usedQty;

    await stock.save();

    res.status(200).json({
      success: true,
      message: 'Stock usage updated successfully',
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock summary/statistics
// @route   GET /api/stock/stats/summary
const getStockSummary = async (req, res, next) => {
  try {
    const stocks = await Stock.find();

    const summary = {
      totalItems: stocks.length,
      totalAdded: stocks.reduce((sum, item) => sum + item.addedQty, 0),
      totalUsed: stocks.reduce((sum, item) => sum + item.usedQty, 0),
      totalRemaining: stocks.reduce((sum, item) => sum + item.remainingQty, 0),
      itemStatus: stocks.map((item) => ({
        name: item.itemName,
        added: item.addedQty,
        used: item.usedQty,
        remaining: item.remainingQty,
      })),
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a stock item
// @route   DELETE /api/stock/:id
const deleteStock = async (req, res, next) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock item deleted successfully',
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStock,
  getStockById,
  addStock,
  updateUsedStock,
  getStockSummary,
  deleteStock,
};
