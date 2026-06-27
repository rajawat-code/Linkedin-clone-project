import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfileCard() {
  const { user } = useAuth();

  if (!user) return null;

  const profileId = user._id || user.id;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Cover Background */}
      <div 
        className="h-14 w-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: user.coverPhoto 
            ? `url(${user.coverPhoto})` 
            : 'linear-gradient(to right, #0a66c2, #004182)'
        }}
      />
      
      {/* Content */}
      <div className="px-4 pb-4 text-center border-b border-gray-200 relative">
        {/* Avatar Container */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link to={`/profile/${profileId}`}>
            {user.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.name} 
                className="h-16 w-16 rounded-full border-2 border-white object-cover hover:opacity-95 transition"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
                {user.name?.charAt(0)}
              </div>
            )}
          </Link>
        </div>

        {/* Text Details */}
        <div className="mt-10">
          <Link to={`/profile/${profileId}`} className="font-bold text-gray-900 hover:underline">
            {user.name}
          </Link>
          <p className="text-xs text-gray-500 mt-1 leading-normal line-clamp-2">
            {user.headline || 'No headline yet'}
          </p>
        </div>
      </div>

      {/* Network Stats Link */}
      <div className="p-3 hover:bg-gray-50 transition cursor-pointer">
        <Link to="/connections" className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-semibold">Connections</span>
          <span className="text-linkedin-blue font-bold">Grow your network</span>
        </Link>
      </div>

      {/* View My Profile link */}
      <div className="p-3 border-t border-gray-200 hover:bg-gray-50 transition cursor-pointer text-center text-xs font-semibold text-gray-600">
        <Link to={`/profile/${profileId}`}>
          Access my profile
        </Link>
      </div>
    </div>
  );
}
