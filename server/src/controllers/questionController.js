const Question = require('../models/Question');
const Job = require('../models/Job');

// Helper to verify that current user owns the job
const verifyJobOwnership = async (jobId, userId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    const error = new Error('Job not found.');
    error.statusCode = 404;
    throw error;
  }
  if (job.recruiter.toString() !== userId.toString()) {
    const error = new Error('You are not authorized to modify questions for this job.');
    error.statusCode = 403;
    throw error;
  }
  return job;
};

// @desc    Get all questions for a specific job
// @route   GET /api/jobs/:jobId/questions
// @access  Private (Recruiter)
const getQuestionsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    await verifyJobOwnership(jobId, req.user._id);

    const questions = await Question.find({ job: jobId }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a question to a job
// @route   POST /api/jobs/:jobId/questions
// @access  Private (Recruiter)
const addQuestion = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    await verifyJobOwnership(jobId, req.user._id);

    const { label, type, required, options } = req.body;

    if (!label || !type) {
      return res.status(400).json({
        success: false,
        message: 'Question label and type are required.',
      });
    }

    // Determine order: put at end
    const lastQuestion = await Question.findOne({ job: jobId }).sort({ order: -1 });
    const order = lastQuestion ? lastQuestion.order + 1 : 0;

    let parsedOptions = [];
    if (['select', 'radio', 'checkbox'].includes(type)) {
      if (Array.isArray(options)) {
        parsedOptions = options.map((opt) => opt.trim()).filter(Boolean);
      } else if (typeof options === 'string') {
        parsedOptions = options.split(',').map((opt) => opt.trim()).filter(Boolean);
      }
    }

    const question = await Question.create({
      job: jobId,
      label: label.trim(),
      type,
      required: Boolean(required),
      options: parsedOptions,
      order,
    });

    return res.status(201).json({
      success: true,
      message: 'Question created successfully.',
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Recruiter)
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    await verifyJobOwnership(question.job, req.user._id);

    const { label, type, required, options } = req.body;

    if (label) question.label = label.trim();
    if (type) question.type = type;
    if (required !== undefined) question.required = Boolean(required);

    if (options !== undefined) {
      if (Array.isArray(options)) {
        question.options = options.map((opt) => opt.trim()).filter(Boolean);
      } else if (typeof options === 'string') {
        question.options = options.split(',').map((opt) => opt.trim()).filter(Boolean);
      }
    }

    await question.save();

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      data: question,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Recruiter)
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    await verifyJobOwnership(question.job, req.user._id);

    const jobId = question.job;
    const deletedOrder = question.order;

    await Question.findByIdAndDelete(question._id);

    // Re-index remaining questions order
    await Question.updateMany(
      { job: jobId, order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reorder question (Move Up / Move Down or specific index)
// @route   PATCH /api/questions/:id/order
// @access  Private (Recruiter)
const reorderQuestion = async (req, res, next) => {
  try {
    const { direction, targetOrder } = req.body; // direction can be 'up' or 'down'

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    await verifyJobOwnership(question.job, req.user._id);

    const allQuestions = await Question.find({ job: question.job }).sort({ order: 1 });
    const currentIndex = allQuestions.findIndex((q) => q._id.toString() === question._id.toString());

    if (currentIndex === -1) {
      return res.status(400).json({ success: false, message: 'Question order not resolvable.' });
    }

    let targetIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < allQuestions.length - 1) {
      targetIndex = currentIndex + 1;
    } else if (typeof targetOrder === 'number' && targetOrder >= 0 && targetOrder < allQuestions.length) {
      targetIndex = targetOrder;
    } else {
      // Nothing to swap
      return res.status(200).json({
        success: true,
        message: 'Order already at boundary.',
        data: allQuestions,
      });
    }

    // Swap positions
    const otherQuestion = allQuestions[targetIndex];
    const currentOrderVal = question.order;
    const otherOrderVal = otherQuestion.order;

    question.order = otherOrderVal;
    otherQuestion.order = currentOrderVal;

    await question.save();
    await otherQuestion.save();

    const updatedQuestions = await Question.find({ job: question.job }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: 'Question reordered successfully.',
      data: updatedQuestions,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQuestionsByJob,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestion,
};
