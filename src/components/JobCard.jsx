import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';

export default function JobCard({ job }) {
  const jobId = job._id || job.id;
  const company = job.company || {};

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition flex justify-between items-start gap-4">
      <div className="flex gap-3 min-w-0">
        <div className="bg-gray-100 p-2.5 rounded text-gray-500 flex-shrink-0">
          <Briefcase className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <Link to={`/jobs/${jobId}`} className="font-bold text-gray-900 hover:text-linkedin-blue hover:underline text-base truncate block">
            {job.title}
          </Link>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">{company.name || job.companyName || 'Employer'}</p>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> {job.salary}
              </span>
            )}
          </div>

          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-[10px] font-medium border border-gray-200">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link
        to={`/jobs/${jobId}`}
        className="border border-linkedin-blue text-linkedin-blue hover:bg-blue-50 text-xs font-semibold px-4 py-2 rounded-full transition whitespace-nowrap"
      >
        View details
      </Link>
    </div>
  );
}
