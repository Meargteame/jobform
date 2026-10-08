const mongoose = require('mongoose');
const { isMemoryMode, memoryJob } = require('../config/memoryStore');

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Remote',
];

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: employmentTypes,
        message: '{VALUE} is not a valid employment type',
      },
    },
    salary: {
      type: String,
      trim: true,
      default: '',
    },
    requirements: {
      type: String,
      default: '',
    },
    deadline: {
      type: Date,
      default: null,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseJob = mongoose.models.Job || mongoose.model('Job', jobSchema);

const JobProxy = new Proxy(MongooseJob, {
  get(target, prop) {
    if (isMemoryMode() && memoryJob[prop] !== undefined) {
      return memoryJob[prop];
    }
    return target[prop];
  },
});

module.exports = JobProxy;
module.exports.employmentTypes = employmentTypes;
