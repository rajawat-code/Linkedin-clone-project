import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, Briefcase, MessageSquare, Bell, Search, User, LogOut, ChevronDown, Building, Bookmark } from 'lucide-react';
import API from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnreadCounts = async () => {
    if (!user) return;
    try {
      // Fetch notifications
      const notifRes = await API.get('/notifications');
      const notifList = notifRes.data.data || notifRes.data || [];
      const unreadNotifs = notifList.filter(n => !n.isRead).length;
      setUnreadNotifications(unreadNotifs);

      // Fetch conversations
      const convRes = await API.get('/messages/conversations');
      const convList = convRes.data.data || convRes.data || [];
      const unreadConvs = convList.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
      setUnreadMessages(unreadConvs);
    } catch (error) {
      console.error('Error fetching navbar unread counts', error);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 15000); // poll every 15s for updates
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/connections?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-1.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Logo & Search */}
        <div className="flex items-center gap-2 flex-grow max-w-md">
          <Link to="/feed" className="text-linkedin-blue text-2xl font-black flex items-center">
            <span className="bg-linkedin-blue text-white px-1.5 py-0.5 rounded font-black text-xl">in</span>
          </Link>
          <form onSubmit={handleSearchSubmit} className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 pl-9 pr-4 py-1.5 rounded text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-linkedin-blue border border-transparent focus:border-linkedin-blue transition-all"
            />
          </form>
        </div>

        {/* Right Side: Navigation Links */}
        <div className="flex items-center gap-6 md:gap-8 ml-4">
          <Link to="/feed" className={`flex flex-col items-center text-xs font-normal transition ${location.pathname === '/feed' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            <Home className="h-5 w-5 mb-0.5" />
            <span className="hidden md:inline">Home</span>
          </Link>

          <Link to="/connections" className={`flex flex-col items-center text-xs font-normal transition ${location.pathname === '/connections' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            <Users className="h-5 w-5 mb-0.5" />
            <span className="hidden md:inline">My Network</span>
          </Link>

          <Link to="/jobs" className={`flex flex-col items-center text-xs font-normal transition ${location.pathname === '/jobs' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            <Briefcase className="h-5 w-5 mb-0.5" />
            <span className="hidden md:inline">Jobs</span>
          </Link>

          <Link to="/companies" className={`flex flex-col items-center text-xs font-normal transition ${location.pathname === '/companies' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            <Building className="h-5 w-5 mb-0.5" />
            <span className="hidden md:inline">Companies</span>
          </Link>

          <Link to="/saved" className={`flex flex-col items-center text-xs font-normal transition ${location.pathname === '/saved' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            <Bookmark className="h-5 w-5 mb-0.5" />
            <span className="hidden md:inline">Saved</span>
          </Link>

          <Link to="/messages" className={`relative flex flex-col items-center text-xs font-normal transition ${location.pathname === '/messages' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            <MessageSquare className="h-5 w-5 mb-0.5" />
            <span className="hidden md:inline">Messaging</span>
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 md:right-2 transform translate-x-1 -translate-y-1 bg-red-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {unreadMessages}
              </span>
            )}
          </Link>

          <Link to="/notifications" className={`relative flex flex-col items-center text-xs font-normal transition ${location.pathname === '/notifications' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
            <Bell className="h-5 w-5 mb-0.5" />
            <span className="hidden md:inline">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-0 right-0 md:right-3 transform translate-x-1 -translate-y-1 bg-red-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex flex-col items-center text-xs text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-white text-[10px] font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
              <span className="flex items-center gap-0.5 mt-0.5">
                Me <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg py-1 text-sm text-gray-700">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.headline || 'No headline'}</p>
                  </div>
                </div>
                <Link
                  to={`/profile/${user._id || user.id}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition text-left w-full"
                >
                  <User className="h-4 w-4" /> View Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition text-left w-full text-red-600 font-medium"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
