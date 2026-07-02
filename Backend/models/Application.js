const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: String,
    required: [true, 'Resume file/URL is required'],
  },
  status: {
    type: String,
    enum: ['applied', 'reviewed', 'shortlisted', 'rejected'],
    default: 'applied',
  },
}, {
  timestamps: true,
});

ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ applicantId: 1 });
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
