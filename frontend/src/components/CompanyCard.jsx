import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function CompanyCard({ company, onFollowToggle }) {
  const companyId = company._id || company.id;
  const [isFollowing, setIsFollowing] = useState(company.isFollowing || false);

  const handleFollowToggle = async () => {
    try {
      await API.post(`/companies/${companyId}/follow`);
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed company' : 'Following company');
      if (onFollowToggle) onFollowToggle(companyId, !isFollowing);
    } catch (err) {
      toast.error('Failed to change follow status');
    }
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition flex items-center justify-between gap-4">
      <div className="flex gap-3 min-w-0">
        {company.logo ? (
          <img src={company.logo} alt={company.name} className="h-12 w-12 rounded object-cover flex-shrink-0 border border-gray-100" />
        ) : (
          <div className="h-12 w-12 rounded bg-gray-150 flex items-center justify-center text-gray-500 border border-gray-200 flex-shrink-0">
            <Building className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0">
          <Link to={`/companies/${companyId}`} className="font-bold text-gray-900 hover:text-linkedin-blue hover:underline text-base truncate block">
            {company.name}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{company.industry} • {company.website || 'No website listed'}</p>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{company.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleFollowToggle}
          className={`text-xs font-semibold px-4 py-1.5 rounded-full transition whitespace-nowrap ${isFollowing ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'border border-linkedin-blue hover:bg-blue-50 text-linkedin-blue'}`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
}
