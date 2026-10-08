const Job = require('../models/Job');
const Question = require('../models/Question');
const Application = require('../models/Application');
const { generateSlug } = require('../utils/slug');

// @desc    Get all jobs for logged-in recruiter with application counts
// @route   GET /api/jobs
// @access  Private (Recruiter)
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });

    // Aggregate application counts for each job
    const jobIds = jobs.map((j) => j._id);
    const appCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    appCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const enrichedJobs = jobs.map((job) => ({
      ...job.toObject(),
      applicationCount: countMap[job._id.toString()] || 0,
    }));

    return res.status(200).json({
      success: true,
      count: enrichedJobs.length,
      data: enrichedJobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard metrics for recruiter
// @route   GET /api/jobs/stats/summary
// @access  Private (Recruiter)
const getDashboardStats = async (req, res, next) => {
  try {
    const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id status');
    const totalJobs = recruiterJobs.length;
    const publishedJobs = recruiterJobs.filter((j) => j.status === 'published').length;

    const jobIds = recruiterJobs.map((j) => j._id);
    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

    return res.status(200).json({
      success: true,
      data: {
        totalJobs,
        publishedJobs,
        totalApplications,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Private (Recruiter)
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this job.',
      });
    }

    const applicationCount = await Application.countDocuments({ job: job._id });
    const questionCount = await Question.countDocuments({ job: job._id });

    return res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        applicationCount,
        questionCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      companyName,
      description,
      location,
      employmentType,
      salary,
      requirements,
      deadline,
      status,
    } = req.body;

    if (!title || !description || !location || !employmentType) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, location, and employment type are required.',
      });
    }

    // Generate unique slug
    let slug = generateSlug(title);
    // Ensure slug uniqueness
    let existingJobWithSlug = await Job.findOne({ slug });
    let counter = 1;
    while (existingJobWithSlug) {
      slug = `${generateSlug(title)}-${counter}`;
      existingJobWithSlug = await Job.findOne({ slug });
      counter++;
    }

    const job = await Job.create({
      recruiter: req.user._id,
      title: title.trim(),
      companyName: (companyName || req.user.companyName || '').trim(),
      description,
      location: location.trim(),
      employmentType,
      salary: salary ? salary.trim() : '',
      requirements: requirements || '',
      deadline: deadline || null,
      slug,
      status: status === 'published' ? 'published' : 'draft',
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update existing job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this job.',
      });
    }

    const {
      title,
      companyName,
      description,
      location,
      employmentType,
      salary,
      requirements,
      deadline,
      status,
    } = req.body;

    if (title) job.title = title.trim();
    if (companyName) job.companyName = companyName.trim();
    if (description) job.description = description;
    if (location) job.location = location.trim();
    if (employmentType) job.employmentType = employmentType;
    if (salary !== undefined) job.salary = salary.trim();
    if (requirements !== undefined) job.requirements = requirements;
    if (deadline !== undefined) job.deadline = deadline ? new Date(deadline) : null;
    if (status && ['draft', 'published'].includes(status)) job.status = status;

    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Publish / Unpublish a job
// @route   PATCH /api/jobs/:id/publish
// @access  Private (Recruiter)
const togglePublishJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this job status.',
      });
    }

    // If explicit status provided in body, use it; otherwise toggle
    if (req.body.status && ['draft', 'published'].includes(req.body.status)) {
      job.status = req.body.status;
    } else {
      job.status = job.status === 'published' ? 'draft' : 'published';
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job ${job.status === 'published' ? 'published' : 'unpublished'} successfully.`,
      data: job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found.',
      });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this job.',
      });
    }

    // Clean up dependent questions and applications
    await Question.deleteMany({ job: job._id });
    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(job._id);

    return res.status(200).json({
      success: true,
      message: 'Job and associated records deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobs,
  getDashboardStats,
  getJobById,
  createJob,
  updateJob,
  togglePublishJob,
  deleteJob,
};
