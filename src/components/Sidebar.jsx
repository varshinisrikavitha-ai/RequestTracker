import React, { useState } from 'react';
import {
  Home,
  Plus,
  ListChecks,
  CheckCircle,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = hasRole('ADMIN');
  const isManager = hasRole(['ADMIN', 'DEPARTMENT_HEAD']);

  const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/' },
    { name: 'Submit Request', icon: Plus, href: '/submit-request' },
    { name: 'My Requests', icon: ListChecks, href: '/my-requests' },
    ...(isManager ? [{ name: 'Approvals', icon: CheckCircle, href: '/approvals' }] : []),
    { name: 'Reports', icon: BarChart3, href: '/reports' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
    ...(isAdmin ? [{ name: 'Admin Panel', icon: Settings, href: '/admin' }] : []),
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-transform duration-300 z-50 lg:z-0 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">RequestTracker</h1>
            <button onClick={toggleSidebar} className="lg:hidden">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (isOpen) toggleSidebar();
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-700">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-blue-700 rounded-lg transition"
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-blue-700 rounded-lg transition mt-2"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
