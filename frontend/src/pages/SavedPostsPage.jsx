import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Bookmark, Loader2 } from 'lucide-react';
import PostCard from '../components/PostCard';

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/posts/saved');
      // Set isSaved to true for all fetched posts so they render with the filled saved state
      const rawList = res.data.data || res.data || [];
      const savedList = (Array.isArray(rawList) ? rawList : []).map(p => ({ ...p, isSaved: true }));
      setPosts(savedList);
    } catch (err) {
      toast.error('Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handlePostDeleted = (deletedId) => {
    setPosts(posts.filter(p => p._id !== deletedId && p.id !== deletedId));
  };

  // If a post is updated (e.g. unsaved), filter it out of the saved posts list
  const handlePostUpdated = (updatedPost) => {
    const updatedId = updatedPost._id || updatedPost.id;
    // If the post is no longer saved (or if they toggle save), we remove it from this page
    setPosts(posts.filter(p => p._id !== updatedId && p.id !== updatedId));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-gray-500 fill-gray-50" /> Saved Posts
        </h2>
        <p className="text-xs text-gray-500 mt-1">Keep track of posts you have saved for later reading.</p>
      </div>

      {/* Saved Posts Feed */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-20 bg-white border border-gray-200 rounded-lg">
          <Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id || post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              // Since toggling unsave will trigger update, we'll filter it out
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {posts.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center text-gray-500">
              No saved posts found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
