const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Get all applications for a specific job with search & status filters
// @route   GET /api/jobs/:jobId/applications
// @access  Private (Recruiter)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, search } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Authorization check
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view applications for this job.',
      });
    }

    const filter = { job: jobId };

    if (status && ['applied', 'shortlisted', 'rejected'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
      ];
    }

    const applications = await Application.find(filter).sort({ submittedAt: -1 });

    // Status breakdown counts
    const counts = await Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const countSummary = {
      all: 0,
      applied: 0,
      shortlisted: 0,
      rejected: 0,
    };

    counts.forEach((c) => {
      countSummary[c._id] = c.count;
      countSummary.all += c.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        job: {
          _id: job._id,
          title: job.title,
          companyName: job.companyName,
          status: job.status,
          slug: job.slug,
          location: job.location,
          employmentType: job.employmentType,
        },
        counts: countSummary,
        applications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single application details by ID
// @route   GET /api/applications/:id
// @access  Private (Recruiter)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Verify recruiter ownership of the associated job
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this candidate application.',
      });
    }

    return res.status(200).json({
      success: true,
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (applied, shortlisted, rejected)
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['applied', 'shortlisted', 'rejected'].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: applied, shortlisted, rejected.',
      });
    }

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Authorization check
    if (application.job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this candidate application.',
      });
    }

    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Candidate application marked as ${status}.`,
      data: application,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
};
