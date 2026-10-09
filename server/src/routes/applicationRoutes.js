const express = require('express');
const router = express.Router();
const {
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  getAllApplications,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Recruiter pipeline applications route
router.get('/applications', getAllApplications);

// Nested route for applications under a specific job
router.get('/jobs/:jobId/applications', getJobApplications);

// Direct application routes
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

module.exports = router;
