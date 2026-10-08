const mongoose = require('mongoose');
const { isMemoryMode, memoryApplication } = require('../config/memoryStore');

const applicationStatusValues = ['applied', 'shortlisted', 'rejected'];

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required'],
    index: true,
  },
  fullName: {
    type: String,
    required: [true, 'Candidate full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Candidate email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Candidate phone is required'],
    trim: true,
  },
  cvUrl: {
    type: String,
    required: [true, 'CV file URL is required'],
  },
  answers: {
    type: [answerSchema],
    default: [],
  },
  status: {
    type: String,
    enum: applicationStatusValues,
    default: 'applied',
    index: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const MongooseApplication = mongoose.models.Application || mongoose.model('Application', applicationSchema);

const ApplicationProxy = new Proxy(MongooseApplication, {
  get(target, prop) {
    if (isMemoryMode() && memoryApplication[prop] !== undefined) {
      return memoryApplication[prop];
    }
    return target[prop];
  },
});

module.exports = ApplicationProxy;
module.exports.applicationStatusValues = applicationStatusValues;
