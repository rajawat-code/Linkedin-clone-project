import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Building, Globe, Loader2, ArrowLeft, Edit, X } from 'lucide-react';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { register: editRegister, handleSubmit: handleEditSubmit, reset: resetEdit } = useForm();

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/companies/${id}`);
      const companyData = res.data.data || res.data;
      setCompany(companyData);
      setIsFollowing(companyData.isFollowing || false);
      resetEdit({
        name: companyData.name || '',
        industry: companyData.industry || '',
        website: companyData.website || '',
        description: companyData.description || ''
      });
    } catch (err) {
      toast.error('Failed to load company details');
      navigate('/companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const handleFollowToggle = async () => {
    try {
      await API.post(`/companies/${id}/follow`);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed company' : 'Following company');
    } catch (err) {
      toast.error('Failed to change follow status');
    }
  };

  const onEditSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.put(`/companies/${id}`, data);
      const payload = res.data.data || res.data;
      setCompany(payload.company || payload || { ...company, ...data });
      setEditModalOpen(false);
      toast.success('Company page updated');
    } catch (err) {
      toast.error('Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-linkedin-blue" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-10 bg-white rounded border border-gray-200">
        <p className="text-gray-500">Company not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back Link */}
      <button 
        onClick={() => navigate('/companies')}
        className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-linkedin-blue transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Discover
      </button>

      {/* Main Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Cover Background */}
        <div className="h-32 w-full bg-gradient-to-r from-linkedin-blue to-linkedin-blue-hover" />
        
        <div className="px-6 pb-6 relative">
          
          {/* Logo container */}
          <div className="absolute -top-12 left-6">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="h-24 w-24 bg-white rounded border-4 border-white object-cover shadow-sm" />
            ) : (
              <div className="h-24 w-24 rounded border-4 border-white bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                <Building className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex items-center gap-1.5 border border-gray-400 hover:border-gray-800 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 px-4 py-1.5 rounded-full transition"
            >
              <Edit className="h-4 w-4" /> Edit Page
            </button>

            <button
              onClick={handleFollowToggle}
              className={`text-sm font-semibold px-6 py-1.5 rounded-full transition shadow-sm ${isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-linkedin-blue text-white hover:bg-linkedin-blue-hover'}`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Core Info */}
          <div className="mt-14 space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            <p className="text-sm text-linkedin-blue font-semibold">{company.industry}</p>
            {company.website && (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-gray-500 hover:text-linkedin-blue hover:underline flex items-center gap-1 mt-1 w-max"
              >
                <Globe className="h-3.5 w-3.5" /> {company.website}
              </a>
            )}
          </div>

          {/* Description */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-base mb-2">About Company</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{company.description}</p>
          </div>

        </div>
      </div>

      {/* Edit Company Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Company profile</h3>
            <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700">Company Name</label>
                <input type="text" {...editRegister('name', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Industry</label>
                <input type="text" {...editRegister('industry', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Website URL</label>
                <input type="url" {...editRegister('website')} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">About / Description</label>
                <textarea {...editRegister('description', { required: true })} rows={5} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="bg-linkedin-blue text-white px-5 py-2 rounded-full font-semibold hover:bg-linkedin-blue-hover transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
