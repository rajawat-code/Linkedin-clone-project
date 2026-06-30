import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ThumbsUp, MessageSquare, UserPlus, Briefcase, Check } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function NotificationItem({ notification, onNotificationUpdated }) {
  const notifId = notification._id || notification.id;
  const sender = notification.sender || {};
  const senderId = sender._id || sender.id;

  const handleMarkAsRead = async () => {
    if (notification.isRead) return;
    try {
      await API.put(`/notifications/${notifId}/read`);
      toast.success('Notification marked as read');
      if (onNotificationUpdated) onNotificationUpdated(notifId);
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  // Determine fallback icon based on type
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <ThumbsUp className="h-5 w-5 text-blue-500 fill-blue-50" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'connection':
      case 'connection_request':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'job':
        return <Briefcase className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Render sender's avatar or fallback icon
  const renderAvatarOrIcon = () => {
    if (senderId) {
      if (sender.profilePhoto) {
        return (
          <Link to={`/profile/${senderId}`} className="flex-shrink-0">
            <img src={sender.profilePhoto} alt={sender.name} className="h-10 w-10 rounded-full object-cover shadow-sm border border-gray-150 hover:opacity-90 transition animate-fade-in" />
          </Link>
        );
      }
      return (
        <Link to={`/profile/${senderId}`} className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm border border-blue-200 hover:opacity-90 transition flex-shrink-0">
          {sender.name?.charAt(0) || 'U'}
        </Link>
      );
    }
    return (
      <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 flex items-center justify-center h-10 w-10 flex-shrink-0">
        {getIcon()}
      </div>
    );
  };

  return (
    <div className={`p-4 flex justify-between items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
      <div className="flex gap-3 items-center min-w-0">
        {renderAvatarOrIcon()}
        <div className="min-w-0">
          <p className={`text-sm text-gray-800 leading-normal ${!notification.isRead ? 'font-semibold' : ''}`}>
            {senderId ? (
              <Link to={`/profile/${senderId}`} className="hover:text-linkedin-blue hover:underline transition">
                {notification.message || notification.content}
              </Link>
            ) : (
              notification.message || notification.content
            )}
          </p>
          <span className="text-[10px] text-gray-400 block mt-1">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recent'}
          </span>
        </div>
      </div>

      {!notification.isRead && (
        <button
          onClick={handleMarkAsRead}
          className="text-gray-400 hover:text-linkedin-blue p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition shadow-sm flex-shrink-0"
          title="Mark as read"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
