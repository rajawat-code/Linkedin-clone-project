const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
  },
  logo: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  industry: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

CompanySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Company', CompanySchema);
