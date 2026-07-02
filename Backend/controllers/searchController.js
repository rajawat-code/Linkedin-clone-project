const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

exports.globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return apiResponse.success(res, 'Search results retrieved successfully', {
      users: [],
      companies: [],
      jobs: []
    });
  }

  const regex = { $regex: q, $options: 'i' };

  // 1. Search Users
  const users = await User.find({
    $or: [
      { name: regex },
      { headline: regex }
    ]
  }).select('name email headline profilePicture').limit(10).lean();

  // 2. Search Companies
  const companies = await Company.find({
    $or: [
      { name: regex },
      { industry: regex },
      { description: regex }
    ]
  }).limit(10).lean();

  // 3. Search Jobs (also find jobs matching matching companies)
  const matchedCompaniesForJobs = await Company.find({ name: regex }).lean();
  const companyIds = matchedCompaniesForJobs.map(c => c._id);

  const jobs = await Job.find({
    $or: [
      { title: regex },
      { description: regex },
      { company: { $in: companyIds } }
    ]
  }).populate('company', 'name logo industry').limit(10).lean();

  return apiResponse.success(res, 'Search results retrieved successfully', {
    users,
    companies,
    jobs
  });
});
