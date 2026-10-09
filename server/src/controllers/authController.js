const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_key_123456';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Register a new recruiter
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, password, and company name.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      companyName: companyName.trim(),
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log in recruiter
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in recruiter profile
// @route   GET /api/auth/me
// @access  Private (Recruiter)
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        companyName: req.user.companyName,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recruiter profile and company name
// @route   PUT /api/auth/profile
// @access  Private (Recruiter)
const updateProfile = async (req, res, next) => {
  try {
    const { name, companyName } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (companyName) user.companyName = companyName.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Workspace settings updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
