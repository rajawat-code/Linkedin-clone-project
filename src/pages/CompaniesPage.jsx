import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Building, Search, Plus, Loader2, Image, Link2 } from 'lucide-react';
import CompanyCard from '../components/CompanyCard';

export default function CompaniesPage() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'create'
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Company Media File Upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  // React Hook Form for Create Company
  const { register: createRegister, handleSubmit: handleCreateSubmit, reset: resetCreate } = useForm();

  const fetchCompanies = async (query = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/companies?q=${encodeURIComponent(query)}`);
      setCompanies(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies(searchQuery);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onCreateCompany = async (data) => {
    setLoading(true);
    const toastId = toast.loading('Creating company...');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('industry', data.industry);
      formData.append('website', data.website);
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await API.post('/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Company page created successfully!', { id: toastId });
      resetCreate();
      setLogoFile(null);
      setLogoPreview('');
      setActiveTab('browse');
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create company', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
            Companies Center
          </div>
          <div className="flex flex-col text-sm text-gray-600">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex items-center gap-2.5 px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'browse' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <Building className="h-5 w-5" /> Browse Companies
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2.5 px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'create' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <Plus className="h-5 w-5" /> Create Company
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="md:col-span-3">
        
        {/* Search header for Browse tab */}
        {activeTab === 'browse' && (
          <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-linkedin-blue"
              />
            </div>
            <button
              type="submit"
              className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white font-bold px-6 py-2 rounded text-sm transition"
            >
              Search
            </button>
          </form>
        )}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[400px]">
          
          {/* TAB 1: BROWSE COMPANIES */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Discover Companies</h3>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" /></div>
              ) : (
                <div className="space-y-4">
                  {companies.map((company) => (
                    <CompanyCard key={company._id || company.id} company={company} />
                  ))}
                  {companies.length === 0 && (
                    <p className="text-center text-gray-500 py-10">No companies found.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE COMPANY */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create a Professional Company Page</h3>
              <form onSubmit={handleCreateSubmit(onCreateCompany)} className="space-y-4 text-sm max-w-xl">
                
                {/* Logo Upload */}
                <div>
                  <label className="block font-medium text-gray-700">Company Logo</label>
                  <div className="flex items-center gap-4 mt-2">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded object-cover border border-gray-300" />
                    ) : (
                      <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-300 border-dashed">
                        <Building className="h-8 w-8" />
                      </div>
                    )}
                    <label className="bg-white border border-gray-350 hover:bg-gray-50 rounded px-4 py-2 text-xs font-bold text-gray-700 cursor-pointer shadow-sm transition">
                      Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    {...createRegister('name', { required: 'Company name is required' })}
                    placeholder="e.g. Google DeepMind"
                    className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-gray-700">Industry</label>
                    <input
                      type="text"
                      {...createRegister('industry', { required: 'Industry is required' })}
                      placeholder="e.g. Artificial Intelligence"
                      className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Website URL</label>
                    <input
                      type="url"
                      {...createRegister('website')}
                      placeholder="e.g. https://deepmind.google"
                      className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700">Description</label>
                  <textarea
                    {...createRegister('description', { required: 'Description is required' })}
                    rows={4}
                    placeholder="Write a brief overview of the company, its mission, and its goals..."
                    className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white font-bold py-2.5 px-6 rounded-full transition flex items-center gap-1.5 shadow"
                >
                  {loading && <Loader2 className="animate-spin h-4 w-4" />}
                  Create Page
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
