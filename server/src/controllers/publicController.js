const Job = require('../models/Job');
const Question = require('../models/Question');
const Application = require('../models/Application');
const { getFileUrl } = require('../services/uploadService');

// @desc    Get public job details and questions by slug
// @route   GET /api/public/jobs/:slug
// @access  Public
const getPublicJob = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const job = await Job.findOne({ slug });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    if (job.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'This job posting is not currently accepting applications.',
        isUnpublished: true,
      });
    }

    // Fetch custom questions
    const questions = await Question.find({ job: job._id })
      .sort({ order: 1 })
      .select('_id label type required options order');

    return res.status(200).json({
      success: true,
      data: {
        job: {
          _id: job._id,
          title: job.title,
          companyName: job.companyName,
          description: job.description,
          location: job.location,
          employmentType: job.employmentType,
          salary: job.salary,
          requirements: job.requirements,
          deadline: job.deadline,
          slug: job.slug,
          createdAt: job.createdAt,
        },
        questions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit candidate application for a public job
// @route   POST /api/public/jobs/:slug/applications
// @access  Public
const submitApplication = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const job = await Job.findOne({ slug });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found.',
      });
    }

    if (job.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'This job posting is not currently active and cannot accept applications.',
      });
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline for this job posting has passed.',
      });
    }

    const { fullName, email, phone } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Validate CV upload
    // In multer req.file is the uploaded CV
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CV upload is required. Supported formats: PDF, DOC, DOCX up to 5MB.',
      });
    }

    const cvUrl = getFileUrl(req, req.file.filename);

    // Parse custom question answers
    let rawAnswers = req.body.answers;
    if (typeof rawAnswers === 'string') {
      try {
        rawAnswers = JSON.parse(rawAnswers);
      } catch (e) {
        rawAnswers = {};
      }
    } else if (!rawAnswers) {
      rawAnswers = {};
    }

    // Fetch official questions for this job
    const questions = await Question.find({ job: job._id }).sort({ order: 1 });

    const formattedAnswers = [];

    for (const q of questions) {
      const submittedVal = rawAnswers[q._id.toString()];

      if (q.required) {
        const isEmpty =
          submittedVal === undefined ||
          submittedVal === null ||
          submittedVal === '' ||
          (Array.isArray(submittedVal) && submittedVal.length === 0);

        if (isEmpty) {
          return res.status(400).json({
            success: false,
            message: `The field "${q.label}" is required.`,
          });
        }
      }

      // Type-specific basic validation
      if (submittedVal) {
        if (q.type === 'url' && typeof submittedVal === 'string') {
          try {
            new URL(submittedVal);
          } catch (_) {
            return res.status(400).json({
              success: false,
              message: `The field "${q.label}" must be a valid URL (e.g. https://...).`,
            });
          }
        }

        if (q.type === 'email' && typeof submittedVal === 'string') {
          if (!/^\S+@\S+\.\S+$/.test(submittedVal.trim())) {
            return res.status(400).json({
              success: false,
              message: `The field "${q.label}" must be a valid email address.`,
            });
          }
        }
      }

      formattedAnswers.push({
        question: q._id,
        label: q.label,
        type: q.type,
        answer: submittedVal !== undefined ? submittedVal : '',
      });
    }

    const application = await Application.create({
      job: job._id,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cvUrl,
      answers: formattedAnswers,
      status: 'applied',
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Thank you for applying.',
      data: {
        id: application._id,
        submittedAt: application.submittedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicJob,
  submitApplication,
};
