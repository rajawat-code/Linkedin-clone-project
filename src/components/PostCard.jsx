import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { ThumbsUp, Bookmark, MessageSquare, Trash2, Edit3, MoreHorizontal, Check, X } from 'lucide-react';
import CommentSection from './CommentSection';

export default function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id || user?.id));
  const [isSaved, setIsSaved] = useState(post.isSaved || false); 
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);

  const postId = post._id || post.id;
  const author = post.author || post.user || {};
  const authorId = author._id || author.id;
  const isPostOwner = authorId === (user?._id || user?.id);

  const handleLike = async () => {
    try {
      const res = await API.post(`/posts/${postId}/like`);
      // res.data might return updated post or list of likes
      setIsLiked(!isLiked);
      if (isLiked) {
        setLikes(likes.filter(id => id !== (user?._id || user?.id)));
      } else {
        setLikes([...likes, user?._id || user?.id]);
      }
    } catch (err) {
      toast.error('Error toggling like');
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await API.delete(`/posts/${postId}/save`);
        setIsSaved(false);
        toast.success('Post unsaved');
      } else {
        await API.post(`/posts/${postId}/save`);
        setIsSaved(true);
        toast.success('Post saved');
      }
    } catch (err) {
      toast.error('Error saving/unsaving post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/posts/${postId}`);
      toast.success('Post deleted successfully');
      if (onPostDeleted) onPostDeleted(postId);
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    try {
      const res = await API.put(`/posts/${postId}`, { content: editText });
      setIsEditing(false);
      toast.success('Post updated');
      if (onPostUpdated) onPostUpdated(res.data.post || res.data);
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 relative mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <Link to={`/profile/${authorId}`}>
            {author.profilePhoto ? (
              <img src={author.profilePhoto} alt={author.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold">
                {author.name?.charAt(0)}
              </div>
            )}
          </Link>
          <div>
            <Link to={`/profile/${authorId}`} className="font-bold text-gray-900 text-sm hover:text-linkedin-blue hover:underline">
              {author.name}
            </Link>
            <p className="text-xs text-gray-500 line-clamp-1">{author.headline || 'LinkedIn Member'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
            </p>
          </div>
        </div>

        {/* Dropdown Menu for Owners */}
        {isPostOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg py-1 text-sm text-gray-700 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  <Edit3 className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600 font-medium"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body Content */}
      {isEditing ? (
        <div className="mb-3 space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-linkedin-blue"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
            >
              <Check className="h-3 w-3" /> Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditText(post.content);
              }}
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-semibold transition"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed mb-3">
          {post.content}
        </p>
      )}

      {/* Image / Video Attachments */}
      {post.image && (
        <div className="mb-3 rounded overflow-hidden max-h-96 bg-gray-50 border border-gray-100 flex items-center justify-center">
          <img src={post.image} alt="Attachment" className="max-h-96 object-contain w-full" />
        </div>
      )}
      {post.video && (
        <div className="mb-3 rounded overflow-hidden max-h-96 bg-gray-50 border border-gray-100">
          <video src={post.video} controls className="max-h-96 w-full object-contain" />
        </div>
      )}

      {/* Likes & Comments Count Header */}
      <div className="flex justify-between items-center text-xs text-gray-500 pb-2 border-b border-gray-100 mb-2">
        <span>{likes.length} {likes.length === 1 ? 'like' : 'likes'}</span>
        <span>{post.commentsCount || 0} comments</span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-1 text-gray-500 text-xs font-semibold">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 py-2.5 rounded hover:bg-gray-100 transition ${isLiked ? 'text-linkedin-blue' : ''}`}
        >
          <ThumbsUp className={`h-4.5 w-4.5 ${isLiked ? 'fill-current' : ''}`} />
          <span>Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center justify-center gap-2 py-2.5 rounded hover:bg-gray-100 transition ${showComments ? 'text-linkedin-blue' : ''}`}
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleSaveToggle}
          className={`flex items-center justify-center gap-2 py-2.5 rounded hover:bg-gray-100 transition ${isSaved ? 'text-linkedin-blue' : ''}`}
        >
          <Bookmark className={`h-4.5 w-4.5 ${isSaved ? 'fill-current' : ''}`} />
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Render Comments Inline */}
      {showComments && <CommentSection postId={postId} />}
    </div>
  );
}
