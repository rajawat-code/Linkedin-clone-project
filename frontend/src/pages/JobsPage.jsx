import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, Search, Plus, ListFilter, ClipboardCheck, Loader2 } from 'lucide-react';
import JobCard from '../components/JobCard';

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'applied', 'post'
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [userCompanies, setUserCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search parameters
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // React Hook Form for Posting Job
  const { register: postRegister, handleSubmit: handlePostSubmit, reset: resetPost } = useForm();

  const fetchJobs = async (title = '', location = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/jobs?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}`);
      setJobs(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/jobs/applied');
      setAppliedJobs(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load applied jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      // Fetch companies to populate the dropdown for job creation
      const res = await API.get('/companies?q=');
      // For simplicity, we can let user post jobs on behalf of any company they follow/own, or show all
      setUserCompanies(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch companies', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
    fetchCompanies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(searchTitle, searchLocation);
  };

  const onPostJob = async (data) => {
    setLoading(true);
    try {
      // Split skills by commas
      const skillsArray = data.skillsRequired 
        ? data.skillsRequired.split(',').map(s => s.trim()) 
        : [];
      
      const payload = {
        title: data.title,
        description: data.description,
        location: data.location,
        salary: data.salary,
        skillsRequired: skillsArray,
        companyId: data.companyId || undefined
      };

      await API.post('/jobs', payload);
      toast.success('Job posted successfully!');
      resetPost();
      setActiveTab('browse');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'browse') fetchJobs();
    if (tab === 'applied') fetchAppliedJobs();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
            Job Center
          </div>
          <div className="flex flex-col text-sm text-gray-600">
            <button
              onClick={() => handleTabChange('browse')}
              className={`flex items-center gap-2.5 px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'browse' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <Briefcase className="h-5 w-5" /> Browse Jobs
            </button>

            <button
              onClick={() => handleTabChange('applied')}
              className={`flex items-center gap-2.5 px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'applied' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <ClipboardCheck className="h-5 w-5" /> My Applied Jobs
            </button>

            <button
              onClick={() => handleTabChange('post')}
              className={`flex items-center gap-2.5 px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'post' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <Plus className="h-5 w-5" /> Post a Job
            </button>
          </div>
        </div>
      </div>

      {/* Main Contents */}
      <div className="md:col-span-3">
        
        {/* Search header for Browse tab */}
        {activeTab === 'browse' && (
          <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-linkedin-blue"
              />
            </div>
            
            <div className="sm:col-span-2 relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="City, state, or country..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-linkedin-blue"
              />
            </div>

            <button
              type="submit"
              className="sm:col-span-1 bg-linkedin-blue hover:bg-linkedin-blue-hover text-white font-bold py-2 rounded text-sm transition"
            >
              Search
            </button>
          </form>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[400px]">
          
          {/* TAB 1: BROWSE JOBS */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Jobs</h3>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" /></div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job._id || job.id} job={job} />
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-center text-gray-500 py-10">No jobs match your search parameters.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPLIED JOBS */}
          {activeTab === 'applied' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Applications</h3>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" /></div>
              ) : (
                <div className="space-y-4">
                  {appliedJobs.map((job) => (
                    <JobCard key={job._id || job.id} job={job} />
                  ))}
                  {appliedJobs.length === 0 && (
                    <p className="text-center text-gray-500 py-10">You haven't applied to any jobs yet.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POST A JOB */}
          {activeTab === 'post' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Post a new opportunity</h3>
              <form onSubmit={handlePostSubmit(onPostJob)} className="space-y-4 text-sm max-w-xl">
                
                <div>
                  <label className="block font-medium text-gray-700">Job Title</label>
                  <input
                    type="text"
                    {...postRegister('title', { required: 'Job title is required' })}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700">Company (Select from List)</label>
                  <select
                    {...postRegister('companyId')}
                    className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                  >
                    <option value="">-- Post independent or select followed company --</option>
                    {userCompanies.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      {...postRegister('location', { required: 'Location is required' })}
                      placeholder="e.g. Remote, San Francisco"
                      className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Salary Range (optional)</label>
                    <input
                      type="text"
                      {...postRegister('salary')}
                      placeholder="e.g. $120,000 - $140,000"
                      className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    {...postRegister('skillsRequired')}
                    placeholder="e.g. React, JavaScript, CSS, REST APIs"
                    className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700">Job Description</label>
                  <textarea
                    {...postRegister('description', { required: 'Job description is required' })}
                    rows={6}
                    placeholder="Provide a detailed description of the role, responsibilities, and requirements..."
                    className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white font-bold py-2.5 px-6 rounded-full transition flex items-center gap-1.5 shadow"
                >
                  {loading && <Loader2 className="animate-spin h-4 w-4" />}
                  Publish Job
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
