import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Loader2, Trash2, Edit2, Check, X } from 'lucide-react';

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/comments/${postId}`);
      const dataList = res.data.data || res.data;
      setComments(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      console.error('Error fetching comments', err);
      // fallback in case they are nested or different route
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleAddComment = async (data) => {
    if (!data.commentText.trim()) return;
    try {
      const res = await API.post(`/comments/${postId}`, { commentText: data.commentText });
      // The API response might return the newly created comment
      if (res.data) {
        setComments([...comments, res.data.comment || res.data]);
        reset();
        toast.success('Comment added');
      }
      fetchComments(); // Reload to be safe
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await API.put(`/comments/${commentId}`, { commentText: editText });
      setComments(comments.map(c => c._id === commentId || c.id === commentId ? { ...c, commentText: editText } : c));
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated');
      fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId && c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
      {/* Create Comment Form */}
      <form onSubmit={handleSubmit(handleAddComment)} className="flex items-start gap-2">
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0)}
          </div>
        )}
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Add a comment..."
            {...register('commentText', { required: true })}
            className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-linkedin-blue"
          />
        </div>
        <button
          type="submit"
          className="bg-linkedin-blue hover:bg-linkedin-blue-hover text-white text-xs font-bold py-2 px-4 rounded-full transition"
        >
          Post
        </button>
      </form>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-2">
          <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const commentId = comment._id || comment.id;
            const author = comment.user || comment.author || {};
            const authorId = author._id || author.id;
            const isCommentOwner = authorId === (user._id || user.id);

            return (
              <div key={commentId} className="flex gap-2 items-start text-sm">
                {author.profilePhoto ? (
                  <img src={author.profilePhoto} alt={author.name} className="h-8 w-8 rounded-full object-cover mt-1" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold mt-1">
                    {author.name?.charAt(0) || 'U'}
                  </div>
                )}
                
                <div className="flex-grow bg-gray-100 rounded-lg p-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-gray-900 block">{author.name || 'LinkedIn Member'}</span>
                      {author.headline && <span className="text-[11px] text-gray-500 block leading-tight">{author.headline}</span>}
                    </div>
                    {/* Action Controls */}
                    {isCommentOwner && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition absolute right-2 top-2">
                        {editingId !== commentId ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(commentId);
                                setEditText(comment.commentText);
                              }}
                              className="text-gray-500 hover:text-linkedin-blue"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(commentId)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Comment Text Content */}
                  {editingId === commentId ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-grow bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-linkedin-blue"
                      />
                      <button
                        onClick={() => handleEditComment(commentId)}
                        className="text-green-600 hover:text-green-700 bg-white p-1 rounded border border-gray-200"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditText('');
                        }}
                        className="text-red-600 hover:text-red-700 bg-white p-1 rounded border border-gray-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-800 mt-1 leading-normal whitespace-pre-line">
                      {comment.commentText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-1">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  );
}
