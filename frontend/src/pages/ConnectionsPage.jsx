import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Users, UserPlus, UserCheck, Trash2, Check, X, Search, Loader2 } from 'lucide-react';

export default function ConnectionsPage() {
  const [searchParams] = useSearchParams();
  const navbarQuery = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState('connections'); // 'connections', 'pending', 'search'
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch My Connections
  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await API.get('/connections');
      setConnections(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Pending Invites
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await API.get('/connections/pending');
      setPendingRequests(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  // Search Members
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await API.get(`/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchResults(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // If Navbar search initiates, focus on Search Tab
  useEffect(() => {
    if (navbarQuery) {
      setActiveTab('search');
      setSearchQuery(navbarQuery);
      // Run search
      const runNavbarSearch = async () => {
        setLoading(true);
        try {
          const res = await API.get(`/users/search?q=${encodeURIComponent(navbarQuery)}`);
          setSearchResults(res.data.data || res.data || []);
        } catch (err) {
          toast.error('Search failed');
        } finally {
          setLoading(false);
        }
      };
      runNavbarSearch();
    } else {
      fetchConnections();
    }
  }, [navbarQuery]);

  // Tab switching load logic
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'connections') {
      fetchConnections();
    } else if (tab === 'pending') {
      fetchPending();
    }
  };

  // Accept Invite
  const handleAccept = async (requestId) => {
    try {
      await API.put(`/connections/request/${requestId}/accept`);
      toast.success('Connection request accepted!');
      fetchPending();
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  // Reject Invite
  const handleReject = async (requestId) => {
    try {
      await API.put(`/connections/request/${requestId}/reject`);
      toast.success('Connection request rejected');
      fetchPending();
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  // Remove Connection
  const handleRemove = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    try {
      await API.delete(`/connections/${connectionId}`);
      toast.success('Connection removed');
      fetchConnections();
    } catch (err) {
      toast.error('Failed to remove connection');
    }
  };

  // Send Connection Request
  const handleConnect = async (recipientId) => {
    try {
      await API.post('/connections/request', { recipientId });
      toast.success('Connection request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send connect request');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Sidebar Tabs */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
            Manage Network
          </div>
          <div className="flex flex-col text-sm text-gray-600">
            <button
              onClick={() => handleTabChange('connections')}
              className={`flex items-center gap-2.5 px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'connections' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <Users className="h-5 w-5" /> Connections
            </button>
            
            <button
              onClick={() => handleTabChange('pending')}
              className={`flex items-center justify-between px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'pending' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <span className="flex items-center gap-2.5">
                <UserPlus className="h-5 w-5" /> Pending Invites
              </span>
              {pendingRequests.length > 0 && (
                <span className="bg-linkedin-blue text-white rounded-full text-xs px-2 py-0.5 font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('search')}
              className={`flex items-center gap-2.5 px-4 py-3 text-left border-l-4 transition hover:bg-gray-50 ${activeTab === 'search' ? 'border-linkedin-blue bg-blue-50/30 text-linkedin-blue font-bold' : 'border-transparent'}`}
            >
              <Search className="h-5 w-5" /> Search Members
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="md:col-span-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[400px]">
          
          {/* TAB 1: CONNECTIONS LIST */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Connections ({connections.length})</h3>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connections.map((c) => {
                    const connId = c._id || c.id;
                    return (
                      <div key={connId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition">
                        <Link to={`/profile/${connId}`} className="flex gap-3 min-w-0 group">
                          {c.profilePhoto ? (
                            <img src={c.profilePhoto} alt={c.name} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                              {c.name?.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-linkedin-blue group-hover:underline truncate">{c.name}</h4>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{c.headline || 'LinkedIn Member'}</p>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/messages?userId=${connId}&name=${encodeURIComponent(c.name)}&profilePhoto=${encodeURIComponent(c.profilePhoto || '')}`}
                            className="border border-linkedin-blue hover:bg-blue-50 text-linkedin-blue text-xs font-semibold px-4 py-1.5 rounded-full transition"
                          >
                            Message
                          </Link>
                          <button
                            onClick={() => handleRemove(connId)}
                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                            title="Remove Connection"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {connections.length === 0 && (
                    <div className="col-span-2 text-center text-gray-500 py-10">
                      No connections found. Switch to the Search tab to connect with peers.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PENDING INVITES */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Invites</h3>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" /></div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => {
                    const reqId = req._id || req.id;
                    const sender = req.sender || {};
                    return (
                      <div key={reqId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition">
                        <Link to={`/profile/${sender._id || sender.id}`} className="flex gap-3 min-w-0 group">
                          {sender.profilePhoto ? (
                            <img src={sender.profilePhoto} alt={sender.name} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                              {sender.name?.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-linkedin-blue group-hover:underline truncate">{sender.name}</h4>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{sender.headline || 'LinkedIn Member'}</p>
                          </div>
                        </Link>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(reqId)}
                            className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white text-xs font-semibold px-4 py-1.5 rounded-full transition flex items-center gap-1 shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleReject(reqId)}
                            className="border border-gray-400 hover:border-gray-600 text-gray-600 hover:bg-gray-50 text-xs font-semibold px-4 py-1.5 rounded-full transition flex items-center gap-1"
                          >
                            <X className="h-3.5 w-3.5" /> Ignore
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {pendingRequests.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                      No pending connection requests.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEARCH MEMBERS */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Search Members</h3>
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Enter name, headline or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow bg-gray-50 border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-linkedin-blue"
                />
                <button
                  type="submit"
                  className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white font-semibold px-6 py-2 rounded text-sm transition"
                >
                  Search
                </button>
              </form>

              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((user) => {
                    const uId = user._id || user.id;
                    return (
                      <div key={uId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition">
                        <Link to={`/profile/${uId}`} className="flex gap-3 min-w-0 group">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                              {user.name?.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-linkedin-blue group-hover:underline truncate">{user.name}</h4>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{user.headline || 'LinkedIn Member'}</p>
                          </div>
                        </Link>
                        <button
                          onClick={() => handleConnect(uId)}
                          className="border border-linkedin-blue hover:bg-blue-50 text-linkedin-blue text-xs font-semibold px-4 py-1.5 rounded-full transition"
                        >
                          Connect
                        </button>
                      </div>
                    );
                  })}
                  {searchResults.length === 0 && searchQuery && (
                    <div className="col-span-2 text-center text-gray-500 py-10">
                      No members match your search criteria.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
