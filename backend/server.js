const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const connectDB = require('./config/db');
const recordRoutes = require('./routes/recordRoutes');
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const studentRoutes = require('./routes/studentRoutes');
const errorHandler = require('./middleware/errorHandler');

/**
 * Digital Attendance & Mid-Day Meal Management System
 * Backend Server (Express.js + MongoDB)
 */

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
];

const isAllowedOrigin = (origin) => {
  // Check if in allowed list
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  
  // Allow localhost with any port
  try {
    const url = new URL(origin);
    if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && url.port) {
      return true;
    }
    // Allow any Render.com domain in production
    if (url.hostname.includes('onrender.com')) {
      return true;
    }
  } catch {
    return false;
  }
  
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // allow local file access and some dev tools
        return callback(null, true);
      }
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from dist folder
const path = require('path');
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint - serve frontend or API response
app.get('/', (req, res) => {
  // Check if it's an API request
  if (req.accepts('json')) {
    res.json({
      success: true,
      message: 'Digital Attendance & Mid-Day Meal Management API is running',
      api: {
        health: '/api/health',
        records: '/api/records',
        auth: '/api/auth',
        stock: '/api/stock',
      },
    });
  } else {
    // Serve index.html for frontend
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/records', recordRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/students', studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═════════════════════════════════════════════════════════════╗
║        Digital Attendance & Mid-Day Meal Management         ║
║                      Backend Server                          ║
╚═════════════════════════════════════════════════════════════╝
✅ Server listening on 0.0.0.0:${PORT}
📡 Access URL: http://localhost:${PORT}
🔧 Environment: ${process.env.NODE_ENV || 'development'}
📊 MongoDB Connection: Connected
  `);
});

module.exports = app;
