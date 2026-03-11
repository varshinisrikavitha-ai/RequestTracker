import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead } from '../api/notifications.api';

const TopBar = ({ toggleSidebar }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications({ limit: 10 });
      const data = res.data.data || [];
      setNotifications(data);
      setUnreadCount(res.data.unreadCount ?? data.filter((n) => !n.isRead).length);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const handleBellClick = () => {
    setShowNotifications((v) => !v);
    setShowProfileMenu(false);
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead([id]);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={toggleSidebar} className="lg:hidden text-gray-600 hover:text-gray-900">
            <Menu size={24} />
          </button>
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-md">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search requests..." className="bg-transparent outline-none flex-1 text-sm" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications Bell */}
          <div className="relative">
            <button onClick={handleBellClick} className="relative text-gray-600 hover:text-gray-900">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-blue-600">{unreadCount} unread</span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm text-gray-700 flex-1">{notif.message}</p>
                        {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button onClick={() => { navigate('/notifications'); setShowNotifications(false); }} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => { setShowProfileMenu((v) => !v); setShowNotifications(false); }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="text-2xl">👤</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.role}</p>
                </div>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition text-sm">
                  <User size={16} /> Profile
                </button>
                <button className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition text-sm border-t border-gray-200">
                  <Settings size={16} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition text-sm border-t border-gray-200"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
