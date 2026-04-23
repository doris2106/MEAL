const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

/**
 * Authentication Controller
 * Handles teacher registration, login, and JWT generation
 */

// @desc    Register a new teacher
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, school, password, passwordConfirm } = req.body;

    // Validation
    if (!name || !email || !phone || !school || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new teacher
    const teacher = new Teacher({
      name,
      email,
      phone,
      school,
      password,
    });

    await teacher.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: teacher._id,
        email: teacher.email,
        role: teacher.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully',
      token,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login teacher
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find teacher
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is active
    if (!teacher.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.',
      });
    }

    // Verify password
    const isMatch = await teacher.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: teacher._id,
        email: teacher.email,
        role: teacher.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        school: teacher.school,
        role: teacher.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in teacher
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.user._id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    res.json({
      success: true,
      data: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        school: teacher.school,
        role: teacher.role,
        isActive: teacher.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Guest login (without authentication)
// @route   POST /api/auth/guest-login
const guestLogin = async (req, res, next) => {
  try {
    // Generate temporary token for guest
    const guestToken = jwt.sign(
      {
        _id: 'guest-' + Date.now(),
        email: 'guest@local',
        role: 'guest',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Guest login successful',
      token: guestToken,
      isGuest: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  guestLogin,
};
