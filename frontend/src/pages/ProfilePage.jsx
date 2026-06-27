import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Camera, Edit, Plus, Trash2, Edit3, Loader2, MapPin, 
  Briefcase, GraduationCap, Award, ThumbsUp, Calendar, X 
} from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Modals / Edit Forms State
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);

  // Active items for editing
  const [editingExp, setEditingExp] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);

  // React Hook Form hooks
  const { register: infoRegister, handleSubmit: handleInfoSubmit, reset: resetInfo } = useForm();
  const { register: expRegister, handleSubmit: handleExpSubmit, reset: resetExp, setValue: setExpValue } = useForm();
  const { register: eduRegister, handleSubmit: handleEduSubmit, reset: resetEdu, setValue: setEduValue } = useForm();
  const { register: skillRegister, handleSubmit: handleSkillSubmit, reset: resetSkill } = useForm();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let res;
      // If no ID or ID matches current user's ID, fetch own profile
      const currentUserId = currentUser?._id || currentUser?.id;
      if (!id || id === currentUserId) {
        res = await API.get('/users/profile');
        setIsOwner(true);
      } else {
        res = await API.get(`/users/profile/${id}`);
        setIsOwner(false);
      }
      const profileData = res.data.data || res.data;
      setProfile(profileData);
      
      // Prefill Info Form
      resetInfo({
        name: profileData.name || '',
        headline: profileData.headline || '',
        about: profileData.about || '',
        location: profileData.location || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  // File Uploads
  const handlePhotoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const toastId = toast.loading(`Uploading ${type === 'profile' ? 'avatar' : 'cover'}...`);
    try {
      const endpoint = type === 'profile' ? '/users/profile-photo' : '/users/cover-photo';
      const res = await API.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Photo updated successfully!', { id: toastId });
      setProfile(prev => ({ ...prev, [type === 'profile' ? 'profilePhoto' : 'coverPhoto']: res.data.url || res.data[type === 'profile' ? 'profilePhoto' : 'coverPhoto'] }));
      
      // Update global context if it's the owner
      if (isOwner) {
        setCurrentUser(prev => ({ ...prev, [type === 'profile' ? 'profilePhoto' : 'coverPhoto']: res.data.url || res.data[type === 'profile' ? 'profilePhoto' : 'coverPhoto'] }));
      }
    } catch (err) {
      toast.error('Failed to upload photo', { id: toastId });
    }
  };

  // Edit Basic Profile Info
  const onInfoSubmit = async (data) => {
    try {
      const res = await API.put('/users/profile', data);
      setProfile(prev => ({ ...prev, ...data }));
      if (isOwner) {
        setCurrentUser(prev => ({ ...prev, ...data }));
      }
      setEditInfoOpen(false);
      toast.success('Profile info updated');
    } catch (err) {
      toast.error('Failed to update info');
    }
  };

  // Experience Logic
  const onExpSubmit = async (data) => {
    try {
      if (editingExp) {
        const res = await API.put(`/users/experience/${editingExp._id || editingExp.id}`, data);
        toast.success('Experience updated');
      } else {
        const res = await API.post('/users/experience', data);
        toast.success('Experience added');
      }
      setExpModalOpen(false);
      setEditingExp(null);
      resetExp();
      fetchProfile();
    } catch (err) {
      toast.error('Failed to save experience');
    }
  };

  const handleEditExpClick = (exp) => {
    setEditingExp(exp);
    setExpValue('companyName', exp.companyName);
    setExpValue('designation', exp.designation);
    setExpValue('startDate', exp.startDate ? exp.startDate.split('T')[0] : '');
    setExpValue('endDate', exp.endDate ? exp.endDate.split('T')[0] : '');
    setExpValue('currentCompany', exp.currentCompany || false);
    setExpValue('description', exp.description || '');
    setExpModalOpen(true);
  };

  const handleDeleteExp = async (expId) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await API.delete(`/users/experience/${expId}`);
      toast.success('Experience removed');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to remove experience');
    }
  };

  // Education Logic
  const onEduSubmit = async (data) => {
    try {
      if (editingEdu) {
        await API.put(`/users/education/${editingEdu._id || editingEdu.id}`, data);
        toast.success('Education updated');
      } else {
        await API.post('/users/education', data);
        toast.success('Education added');
      }
      setEduModalOpen(false);
      setEditingEdu(null);
      resetEdu();
      fetchProfile();
    } catch (err) {
      toast.error('Failed to save education');
    }
  };

  const handleEditEduClick = (edu) => {
    setEditingEdu(edu);
    setEduValue('collegeName', edu.collegeName);
    setEduValue('degree', edu.degree);
    setEduValue('fieldOfStudy', edu.fieldOfStudy);
    setEduValue('startDate', edu.startDate ? edu.startDate.split('T')[0] : '');
    setEduValue('endDate', edu.endDate ? edu.endDate.split('T')[0] : '');
    setEduValue('grade', edu.grade || '');
    setEduValue('description', edu.description || '');
    setEduModalOpen(true);
  };

  const handleDeleteEdu = async (eduId) => {
    if (!window.confirm('Delete this education?')) return;
    try {
      await API.delete(`/users/education/${eduId}`);
      toast.success('Education removed');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to remove education');
    }
  };

  // Skills Logic
  const onSkillSubmit = async (data) => {
    if (!data.skillName.trim()) return;
    try {
      await API.post('/users/skills', { skillName: data.skillName });
      toast.success('Skill added');
      resetSkill();
      fetchProfile();
    } catch (err) {
      toast.error('Failed to add skill');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await API.delete(`/users/skills/${skillId}`);
      toast.success('Skill removed');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to remove skill');
    }
  };

  const handleEndorseSkill = async (skillId) => {
    try {
      await API.post(`/users/skills/${skillId}/endorse`);
      toast.success('Skill endorsed!');
      fetchProfile();
    } catch (err) {
      toast.error('Already endorsed or failed to endorse');
    }
  };

  // Connect request for viewing other users
  const handleConnect = async () => {
    try {
      await API.post('/connections/request', { recipientId: profile._id || profile.id });
      toast.success('Connection request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send connect request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-linkedin-blue" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10 bg-white rounded border border-gray-200">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm relative">
        {/* Cover Photo */}
        <div 
          className="h-48 w-full bg-cover bg-center bg-no-repeat relative group"
          style={{ 
            backgroundImage: profile.coverPhoto 
              ? `url(${profile.coverPhoto})` 
              : 'linear-gradient(to right, #0a66c2, #004182)'
          }}
        >
          {isOwner && (
            <label className="absolute right-4 bottom-4 bg-white/95 hover:bg-white text-gray-700 hover:text-black p-2 rounded-full cursor-pointer shadow border border-gray-200 transition">
              <Camera className="h-5 w-5" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'cover')} />
            </label>
          )}
        </div>

        {/* Profile Avatar & Primary Info */}
        <div className="px-6 pb-6 relative">
          
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <div className="relative group">
              {profile.profilePhoto ? (
                <img 
                  src={profile.profilePhoto} 
                  alt={profile.name} 
                  className="h-32 w-32 rounded-full border-4 border-white object-cover" 
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.name?.charAt(0)}
                </div>
              )}
              {isOwner && (
                <label className="absolute bottom-0 right-0 bg-white text-gray-700 p-1.5 rounded-full cursor-pointer shadow border border-gray-200 hover:bg-gray-100 transition">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'profile')} />
                </label>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-2 pt-4">
            {isOwner ? (
              <button 
                onClick={() => setEditInfoOpen(true)}
                className="flex items-center gap-1.5 border border-gray-500 hover:border-gray-800 text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 px-4 py-1.5 rounded-full transition"
              >
                <Edit className="h-4 w-4" /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={handleConnect}
                className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white text-sm font-semibold px-5 py-1.5 rounded-full transition shadow"
              >
                Connect
              </button>
            )}
          </div>

          {/* Name & Headline details */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-800 mt-0.5 leading-relaxed">{profile.headline || 'No headline listed'}</p>
            {profile.location && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </p>
            )}
          </div>

          {/* About Section */}
          {profile.about && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 text-base mb-1.5">About</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
            </div>
          )}

        </div>
      </div>

      {/* 2. Experience Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-500" /> Experience
          </h3>
          {isOwner && (
            <button 
              onClick={() => { setEditingExp(null); resetExp(); setExpModalOpen(true); }}
              className="text-linkedin-blue hover:bg-blue-50 p-1.5 rounded-full transition"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {(profile.experience || []).map((exp) => {
            const expId = exp._id || exp.id;
            return (
              <div key={expId} className="flex gap-4 items-start text-sm border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                <div className="bg-gray-100 p-2.5 rounded text-gray-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-base">{exp.designation}</h4>
                    {isOwner && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEditExpClick(exp)} className="text-gray-500 hover:text-linkedin-blue p-1 rounded hover:bg-gray-100">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteExp(expId)} className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 font-semibold">{exp.companyName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : ''} - 
                    {exp.currentCompany ? ' Present' : exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}` : ''}
                  </p>
                  {exp.description && <p className="text-gray-600 mt-2 whitespace-pre-wrap text-sm leading-relaxed">{exp.description}</p>}
                </div>
              </div>
            );
          })}
          {(!profile.experience || profile.experience.length === 0) && (
            <p className="text-sm text-gray-500">No work experience listed.</p>
          )}
        </div>
      </div>

      {/* 3. Education Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-gray-500" /> Education
          </h3>
          {isOwner && (
            <button 
              onClick={() => { setEditingEdu(null); resetEdu(); setEduModalOpen(true); }}
              className="text-linkedin-blue hover:bg-blue-50 p-1.5 rounded-full transition"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          {(profile.education || []).map((edu) => {
            const eduId = edu._id || edu.id;
            return (
              <div key={eduId} className="flex gap-4 items-start text-sm border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                <div className="bg-gray-100 p-2.5 rounded text-gray-600">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 text-base">{edu.collegeName}</h4>
                    {isOwner && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEditEduClick(edu)} className="text-gray-500 hover:text-linkedin-blue p-1 rounded hover:bg-gray-100">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteEdu(eduId)} className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - 
                    {edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                    {edu.grade && <span className="ml-2 font-medium bg-gray-100 px-2 py-0.5 rounded text-[10px]">Grade: {edu.grade}</span>}
                  </p>
                  {edu.description && <p className="text-gray-600 mt-2 whitespace-pre-wrap text-sm leading-relaxed">{edu.description}</p>}
                </div>
              </div>
            );
          })}
          {(!profile.education || profile.education.length === 0) && (
            <p className="text-sm text-gray-500">No education entries listed.</p>
          )}
        </div>
      </div>

      {/* 4. Skills Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-500" /> Skills
          </h3>
          {isOwner && (
            <button 
              onClick={() => { resetSkill(); setSkillModalOpen(true); }}
              className="text-linkedin-blue hover:bg-blue-50 p-1.5 rounded-full transition"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(profile.skills || []).map((skill) => {
            const skillId = skill._id || skill.id;
            return (
              <div key={skillId} className="flex justify-between items-center p-3 rounded-lg border border-gray-150 bg-gray-50/70 hover:bg-gray-50 transition">
                <div>
                  <span className="font-bold text-gray-800 text-sm block">{skill.skillName}</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">Endorsed by {skill.endorsementCount || skill.endorsements?.length || 0} professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  {!isOwner && (
                    <button
                      onClick={() => handleEndorseSkill(skillId)}
                      className="flex items-center gap-1 border border-linkedin-blue hover:bg-blue-50 text-linkedin-blue text-xs font-semibold px-3 py-1 rounded-full transition"
                    >
                      <ThumbsUp className="h-3 w-3" /> Endorse
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteSkill(skillId)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {(!profile.skills || profile.skills.length === 0) && (
            <p className="text-sm text-gray-500 col-span-2">No skills listed.</p>
          )}
        </div>
      </div>

      {/* --- MODALS AND EDIT FORMS --- */}

      {/* Edit Basic Info Modal */}
      {editInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setEditInfoOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile details</h3>
            <form onSubmit={handleInfoSubmit(onInfoSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700">Full Name</label>
                <input type="text" {...infoRegister('name', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Headline</label>
                <input type="text" {...infoRegister('headline')} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Location</label>
                <input type="text" {...infoRegister('location')} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">About</label>
                <textarea {...infoRegister('about')} rows={4} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditInfoOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="bg-linkedin-blue text-white px-5 py-2 rounded-full font-semibold hover:bg-linkedin-blue-hover transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setExpModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingExp ? 'Edit Experience' : 'Add Experience'}</h3>
            <form onSubmit={handleExpSubmit(onExpSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700">Designation / Title</label>
                <input type="text" {...expRegister('designation', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Company Name</label>
                <input type="text" {...expRegister('companyName', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700">Start Date</label>
                  <input type="date" {...expRegister('startDate', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">End Date</label>
                  <input type="date" {...expRegister('endDate')} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="currentCompany" {...expRegister('currentCompany')} className="rounded border-gray-300 text-linkedin-blue focus:ring-linkedin-blue" />
                <label htmlFor="currentCompany" className="font-medium text-gray-700 select-none">I am currently working in this role</label>
              </div>
              <div>
                <label className="block font-medium text-gray-700">Description</label>
                <textarea {...expRegister('description')} rows={3} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setExpModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="bg-linkedin-blue text-white px-5 py-2 rounded-full font-semibold hover:bg-linkedin-blue-hover transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Education Modal */}
      {eduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setEduModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingEdu ? 'Edit Education' : 'Add Education'}</h3>
            <form onSubmit={handleEduSubmit(onEduSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700">College / School Name</label>
                <input type="text" {...eduRegister('collegeName', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Degree</label>
                <input type="text" {...eduRegister('degree', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Field Of Study</label>
                <input type="text" {...eduRegister('fieldOfStudy', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700">Start Date</label>
                  <input type="date" {...eduRegister('startDate', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">End Date (or expected)</label>
                  <input type="date" {...eduRegister('endDate', { required: true })} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700">Grade (optional)</label>
                <input type="text" {...eduRegister('grade')} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-gray-700">Description</label>
                <textarea {...eduRegister('description')} rows={3} className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEduModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="bg-linkedin-blue text-white px-5 py-2 rounded-full font-semibold hover:bg-linkedin-blue-hover transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skills Modal */}
      {skillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl relative">
            <button onClick={() => setSkillModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Skill</h3>
            <form onSubmit={handleSkillSubmit(onSkillSubmit)} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700">Skill Name</label>
                <input type="text" {...skillRegister('skillName', { required: true })} placeholder="e.g. ReactJS, CSS, Project Management" className="w-full border border-gray-300 rounded p-2 mt-1 focus:ring-1 focus:ring-linkedin-blue focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setSkillModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="bg-linkedin-blue text-white px-5 py-2 rounded-full font-semibold hover:bg-linkedin-blue-hover transition">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
