import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, DollarSign, Loader2, ArrowLeft, Trash2, Edit2, Users, FileText } from 'lucide-react';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingApply, setSubmittingApply] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/jobs/${id}`);
      const jobData = res.data.data || res.data;
      setJob(jobData);

      // If user is creator, fetch applicants
      const jobCreatorId = jobData.creator?._id || jobData.creator || jobData.userId;
      const currentUserId = currentUser?._id || currentUser?.id;
      
      if (jobCreatorId === currentUserId) {
        try {
          const appRes = await API.get(`/jobs/${id}/applicants`);
          setApplicants(appRes.data.data || appRes.data || []);
        } catch (err) {
          console.log('Error fetching applicants (maybe not creator backend rule)', err);
        }
      }
    } catch (err) {
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, currentUser]);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedResume(file);
    } else {
      toast.error('Please select a valid PDF file');
      e.target.value = null;
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedResume) {
      toast.error('Please upload your resume PDF');
      return;
    }

    setSubmittingApply(true);
    const toastId = toast.loading('Submitting application...');
    try {
      const formData = new FormData();
      formData.append('resume', selectedResume);

      await API.post(`/jobs/${id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Applied successfully!', { id: toastId });
      setSelectedResume(null);
      fetchJobDetails(); // reload state
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply', { id: toastId });
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job post?')) return;
    try {
      await API.delete(`/jobs/${id}`);
      toast.success('Job post deleted');
      navigate('/jobs');
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-linkedin-blue" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-10 bg-white rounded border border-gray-200">
        <p className="text-gray-500">Job not found</p>
      </div>
    );
  }

  const jobCreatorId = job.creator?._id || job.creator || job.userId;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isCreator = jobCreatorId === currentUserId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back to Jobs Link */}
      <button 
        onClick={() => navigate('/jobs')}
        className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-linkedin-blue transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </button>

      {/* Main Job Detail Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-base font-semibold text-linkedin-blue">{job.company?.name || job.companyName || 'Employer'}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-1">
              <span className="flex items-center gap-1"><MapPin className="h-4.5 w-4.5" /> {job.location}</span>
              {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-4.5 w-4.5" /> {job.salary}</span>}
            </div>
          </div>
          
          {isCreator && (
            <div className="flex gap-2">
              <button
                onClick={handleDeleteJob}
                className="text-red-600 hover:bg-red-50 p-2 rounded-full border border-red-200 transition"
                title="Delete Job Post"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Apply Action or Status */}
        {!isCreator && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Apply to this position</h3>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <label className="bg-white border border-gray-300 hover:border-gray-500 rounded px-4 py-2 text-xs font-bold text-gray-700 cursor-pointer shadow-sm transition">
                  Upload Resume (PDF)
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleResumeChange} 
                    className="hidden" 
                  />
                </label>
                {selectedResume && (
                  <span className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 rounded px-3 py-1 flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> {selectedResume.name}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={submittingApply}
                className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white text-sm font-bold px-6 py-2 rounded-full transition flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                {submittingApply && <Loader2 className="animate-spin h-4 w-4" />}
                Submit Application
              </button>
            </form>
          </div>
        )}

        {/* Job Description details */}
        <div>
          <h3 className="font-bold text-gray-900 text-base mb-2">Job Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Required Skills list */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Skills Required</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skillsRequired.map((skill, index) => (
                <span key={index} className="bg-blue-50 text-linkedin-blue text-xs font-semibold px-3 py-1 rounded-full border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Creator Only: View Applicants Section */}
      {isCreator && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" /> Applicants ({applicants.length})
          </h3>
          <div className="space-y-4">
            {applicants.map((app, index) => {
              const applicantUser = app.user || app.applicant || {};
              const applicantId = applicantUser._id || applicantUser.id;
              return (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <div className="flex gap-3">
                    {applicantUser.profilePhoto ? (
                      <img src={applicantUser.profilePhoto} alt={applicantUser.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                        {applicantUser.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{applicantUser.name}</h4>
                      <p className="text-xs text-gray-500 leading-tight">{applicantUser.headline || 'LinkedIn Member'}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex gap-2">
                    {app.resume && (
                      <a 
                        href={app.resume} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-white border border-gray-300 hover:border-gray-500 text-xs font-bold text-gray-700 hover:text-black px-4 py-2 rounded flex items-center gap-1 shadow-sm transition"
                      >
                        <FileText className="h-4 w-4" /> View Resume
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            {applicants.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No applications received yet.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
