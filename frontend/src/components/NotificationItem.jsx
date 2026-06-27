import React from 'react';
import { Bell, ThumbsUp, MessageSquare, UserPlus, Briefcase, Check } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function NotificationItem({ notification, onNotificationUpdated }) {
  const notifId = notification._id || notification.id;

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

  // Determine icon based on type
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

  return (
    <div className={`p-4 flex justify-between items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition ${!notification.isRead ? 'bg-blue-50/30' : ''}`}>
      <div className="flex gap-3">
        <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 flex items-center justify-center h-10 w-10 flex-shrink-0">
          {getIcon()}
        </div>
        <div>
          <p className={`text-sm text-gray-800 leading-normal ${!notification.isRead ? 'font-semibold' : ''}`}>
            {notification.message || notification.content}
          </p>
          <span className="text-[10px] text-gray-400 block mt-1.5">
            {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Recent'}
          </span>
        </div>
      </div>

      {!notification.isRead && (
        <button
          onClick={handleMarkAsRead}
          className="text-gray-400 hover:text-linkedin-blue p-2 hover:bg-white rounded-full border border-transparent hover:border-gray-200 transition shadow-sm"
          title="Mark as read"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
