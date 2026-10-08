const mongoose = require('mongoose');

const questionTypes = [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'url',
  'select',
  'radio',
  'checkbox',
  'file',
];

const questionSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required'],
    index: true,
  },
  label: {
    type: String,
    required: [true, 'Question label is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Question type is required'],
    enum: {
      values: questionTypes,
      message: '{VALUE} is not a valid question type',
    },
  },
  required: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Question', questionSchema);
module.exports.questionTypes = questionTypes;
