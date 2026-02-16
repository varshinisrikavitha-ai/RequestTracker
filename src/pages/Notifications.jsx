import React from 'react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { mockNotifications } from '../data/mockData';

const Notifications = () => {
  const [notifications, setNotifications] = React.useState(mockNotifications);

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
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

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`${!notif.read ? 'bg-blue-50 border-blue-200' : ''} cursor-pointer hover:shadow-md transition`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`${!notif.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {notif.message}
                    </p>
                    <Badge text={notif.type} status={notif.type} />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{notif.timestamp}</p>
                </div>
                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium">No notifications</p>
              <p className="text-gray-500 text-sm mt-1">You'll see notifications here when something important happens</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
