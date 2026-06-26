import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Image, Video, Loader2, Send } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import PostCard from '../components/PostCard';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(''); // 'image' or 'video'
  const [filePreview, setFilePreview] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const fetchFeed = async () => {
    setLoadingPosts(true);
    try {
      const res = await API.get('/posts/feed');
      const dataList = res.data.data || res.data;
      setPosts(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      toast.error('Failed to load feed posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      // Get some people you may know (users search with empty or simple query)
      const res = await API.get('/users/search?q=');
      const rawList = res.data.data || res.data || [];
      const list = (Array.isArray(rawList) ? rawList : []).filter(u => (u._id || u.id) !== (user?._id || user?.id)).slice(0, 4);
      setSuggestions(list);
    } catch (error) {
      console.error('Error fetching suggestions', error);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchSuggestions();
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setFileType(type);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFileType('');
    setFilePreview('');
  };

  const handleCreatePost = async (data) => {
    if (!data.content.trim()) {
      toast.error('Post content is required');
      return;
    }
    setCreatingPost(true);
    try {
      const formData = new FormData();
      formData.append('content', data.content);
      if (selectedFile) {
        // Appends as image or video depending on type
        formData.append(fileType, selectedFile);
      }

      await API.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Post created successfully!');
      reset();
      clearFileSelection();
      fetchFeed();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts(posts.filter(p => p._id !== deletedId && p.id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    const updatedId = updatedPost._id || updatedPost.id;
    setPosts(posts.map(p => (p._id === updatedId || p.id === updatedId) ? { ...p, ...updatedPost } : p));
  };

  const handleConnect = async (recipientId) => {
    try {
      await API.post('/connections/request', { recipientId });
      toast.success('Connection request sent!');
      fetchSuggestions(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Left Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <ProfileCard />
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Create Post Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <form onSubmit={handleSubmit(handleCreatePost)} className="space-y-4">
            <div className="flex gap-3">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-base font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <textarea
                placeholder="What's on your mind?"
                {...register('content')}
                rows={2}
                className="w-full text-sm border-0 focus:ring-0 resize-none placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* Media Preview */}
            {filePreview && (
              <div className="relative border border-gray-100 rounded overflow-hidden max-h-60 bg-gray-50 flex items-center justify-center">
                {fileType === 'image' ? (
                  <img src={filePreview} alt="Preview" className="max-h-60 object-contain" />
                ) : (
                  <video src={filePreview} controls className="max-h-60 w-full object-contain" />
                )}
                <button
                  type="button"
                  onClick={clearFileSelection}
                  className="absolute top-2 right-2 bg-gray-900/80 text-white rounded-full p-1 hover:bg-black transition"
                >
                  &times;
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 cursor-pointer font-semibold">
                  <Image className="h-5 w-5 text-blue-500" />
                  <span>Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>

                <label className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 cursor-pointer font-semibold">
                  <Video className="h-5 w-5 text-green-500" />
                  <span>Video</span>
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <button
                type="submit"
                disabled={creatingPost}
                className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white text-xs font-bold py-2 px-5 rounded-full transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {creatingPost ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                Post
              </button>
            </div>
          </form>
        </div>

        {/* Post Feed */}
        {loadingPosts && posts.length === 0 ? (
          <div className="flex justify-center py-10 bg-white border border-gray-200 rounded-lg">
            <Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" />
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))}

            {posts.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                No posts to display in feed. Follow companies or connect with people to see posts!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar Suggestions */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Add to your feed</h3>
          <div className="space-y-3">
            {suggestions.map((sug) => {
              const sugId = sug._id || sug.id;
              return (
                <div key={sugId} className="flex gap-2 items-start justify-between">
                  <div className="flex gap-2 min-w-0">
                    {sug.profilePhoto ? (
                      <img src={sug.profilePhoto} alt={sug.name} className="h-9 w-9 rounded-full object-cover mt-0.5" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        {sug.name?.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-gray-900 hover:text-linkedin-blue hover:underline truncate block">
                        {sug.name}
                      </span>
                      <span className="text-[10px] text-gray-500 line-clamp-1 block leading-tight">{sug.headline || 'LinkedIn Member'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnect(sugId)}
                    className="border border-gray-500 hover:border-gray-900 text-xs font-semibold text-gray-600 hover:bg-gray-50 px-2.5 py-1 rounded-full whitespace-nowrap transition"
                  >
                    Connect
                  </button>
                </div>
              );
            })}
            {suggestions.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No recommendations available</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
