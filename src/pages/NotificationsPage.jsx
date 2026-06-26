import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Bell, Loader2, CheckCheck, Trash2 } from 'lucide-react';
import NotificationItem from '../components/NotificationItem';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      const dataList = res.data.data || res.data;
      setNotifications(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    if (notifications.filter(n => !n.isRead).length === 0) return;
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await API.delete('/notifications');
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationUpdated = (id) => {
    setNotifications(notifications.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-500" /> Notifications
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
            className="flex items-center gap-1 border border-gray-300 hover:border-gray-500 text-xs font-semibold text-gray-700 hover:text-black bg-white hover:bg-gray-50 px-3 py-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
          
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1 border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-650 hover:text-red-750 px-3 py-1.5 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" /> Clear all
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-150 min-h-[400px]">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-linkedin-blue" />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif._id || notif.id}
                notification={notif}
                onNotificationUpdated={handleNotificationUpdated}
              />
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-20 text-gray-400 text-sm">
                No notifications yet. We will notify you when things happen!
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
