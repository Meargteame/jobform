const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getPublicJob, submitApplication } = require('../controllers/publicController');
const { upload } = require('../services/uploadService');

// Rate limiter for public job application submission (e.g., max 20 submissions per 15 minutes per IP)
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many application submissions from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// View public job details
router.get('/jobs/:slug', getPublicJob);

// Submit candidate application with CV file
router.post(
  '/jobs/:slug/applications',
  submissionLimiter,
  upload.single('cv'),
  submitApplication
);

module.exports = router;
