import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { getNotifications, markAsRead, deleteNotification } from '../api/notifications.api';
import { formatDate } from '../utils/formatters';

const Notifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications({ limit: 50 });
      setNotifications(res.data.data?.notifications || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length) await markAsRead(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`${!notif.read ? 'bg-blue-50 border-blue-200' : ''} cursor-pointer hover:shadow-md transition`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`${!notif.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                        {notif.message}
                      </p>
                      <Badge text={notif.type} status={notif.type} />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{formatDate(notif.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 font-medium">No notifications</p>
                <p className="text-gray-500 text-sm mt-1">
                  You'll see notifications here when something important happens
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
