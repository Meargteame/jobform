const express = require('express');
const router = express.Router();
const {
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Nested route for applications under a job
router.get('/jobs/:jobId/applications', getJobApplications);

// Direct application routes
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

module.exports = router;
