import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-slate-900 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="hidden flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm md:flex md:max-w-lg">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search requests..." className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="relative rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-slate-900"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-xs font-semibold text-white shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] z-50">
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{unreadCount} unread</span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                      className={`cursor-pointer border-b border-slate-100 p-4 transition hover:bg-slate-50 ${!notif.isRead ? 'bg-blue-50/70' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="flex-1 text-sm text-slate-700">{notif.message}</p>
                        {!notif.isRead && <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-sm text-slate-500">No notifications</div>
                  )}
                </div>
                <div className="border-t border-slate-200 p-3 text-center">
                  <button onClick={() => { navigate('/notifications'); setShowNotifications(false); }} className="text-sm font-medium text-blue-600 hover:text-blue-700">
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
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-slate-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">{user?.name?.[0] || 'U'}</span>
              <span className="hidden text-sm font-medium md:block">{user?.name?.split(' ')[0] || 'User'}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] z-50">
                <div className="border-b border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{user?.role}</p>
                </div>
                <button className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                  <User size={16} /> Profile
                </button>
                <button className="flex w-full items-center gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                  <Settings size={16} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 border-t border-slate-200 px-4 py-3 text-sm text-rose-600 transition hover:bg-rose-50"
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
