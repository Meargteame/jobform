const express = require('express');
const router = express.Router();
const {
  getJobs,
  getDashboardStats,
  getJobById,
  createJob,
  updateJob,
  togglePublishJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getJobs);
router.get('/stats/summary', getDashboardStats);
router.post('/', createJob);
router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.patch('/:id/publish', togglePublishJob);

module.exports = router;
