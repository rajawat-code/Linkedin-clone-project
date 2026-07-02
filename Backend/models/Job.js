const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
  },
  salary: {
    type: String,
    default: '',
  },
  skillsRequired: [{
    type: String,
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company reference is required'],
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

JobSchema.index({ company: 1 });
JobSchema.index({ postedBy: 1 });
JobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', JobSchema);
