const express = require('express');
const router = express.Router();
const {
  getQuestionsByJob,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestion,
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Nested routes under /api/jobs/:jobId/questions
router.get('/jobs/:jobId/questions', getQuestionsByJob);
router.post('/jobs/:jobId/questions', addQuestion);

// Direct question routes under /api/questions/:id
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.patch('/questions/:id/order', reorderQuestion);

module.exports = router;
