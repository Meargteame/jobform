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
    const user = req.user;
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        website: user.website || '',
        industry: user.industry || 'Technology & Software',
        headline: user.headline || 'Building world-class products with exceptional people.',
        notifyNewApplicant: user.notifyNewApplicant ?? true,
        notifyCandidateShortlist: user.notifyCandidateShortlist ?? true,
        autoConfirmationEmail: user.autoConfirmationEmail ?? true,
        webhookUrl: user.webhookUrl || '',
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recruiter profile and workspace settings
// @route   PUT /api/auth/profile
// @access  Private (Recruiter)
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      companyName,
      website,
      industry,
      headline,
      notifyNewApplicant,
      notifyCandidateShortlist,
      autoConfirmationEmail,
      webhookUrl,
    } = req.body;
    const user = req.user;

    if (name !== undefined) user.name = name.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();
    if (website !== undefined) user.website = website.trim();
    if (industry !== undefined) user.industry = industry;
    if (headline !== undefined) user.headline = headline.trim();
    if (notifyNewApplicant !== undefined) user.notifyNewApplicant = Boolean(notifyNewApplicant);
    if (notifyCandidateShortlist !== undefined) user.notifyCandidateShortlist = Boolean(notifyCandidateShortlist);
    if (autoConfirmationEmail !== undefined) user.autoConfirmationEmail = Boolean(autoConfirmationEmail);
    if (webhookUrl !== undefined) user.webhookUrl = webhookUrl.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Workspace settings updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        website: user.website,
        industry: user.industry,
        headline: user.headline,
        notifyNewApplicant: user.notifyNewApplicant,
        notifyCandidateShortlist: user.notifyCandidateShortlist,
        autoConfirmationEmail: user.autoConfirmationEmail,
        webhookUrl: user.webhookUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dispatch real test ping to recruiter webhook endpoint
// @route   POST /api/auth/test-webhook
// @access  Private (Recruiter)
const testWebhook = async (req, res, next) => {
  try {
    const { webhookUrl } = req.body;
    if (!webhookUrl || (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://'))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid endpoint beginning with http:// or https://',
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const pingResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'webhook.ping',
          timestamp: new Date().toISOString(),
          workspace: req.user.companyName,
          recruiter: req.user.name,
          message: 'BetterForm webhook ping test',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      return res.status(200).json({
        success: true,
        message: `Ping successful: Endpoint replied with HTTP ${pingResponse.status} ${pingResponse.statusText}`,
        statusCode: pingResponse.status,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const isTimeout = fetchErr.name === 'AbortError';
      return res.status(200).json({
        success: true,
        message: isTimeout
          ? 'Ping dispatched: Endpoint response timed out (> 4s)'
          : `Ping dispatched: ${fetchErr.message}`,
        statusCode: isTimeout ? 408 : 0,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  testWebhook,
};
