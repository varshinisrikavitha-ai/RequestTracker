import React from 'react';
import {
  Home,
  Plus,
  ListChecks,
  CheckCircle,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X,
  Sparkles,
  ChevronRight,
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[calc(100vw-1.5rem)] max-w-[18rem] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-[0_20px_70px_rgba(15,23,42,0.08)] transition-transform duration-300 lg:z-0 lg:w-[18rem] lg:max-w-none lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-700">
                <Sparkles size={11} /> Workspace
              </div>
              <h1 className="mt-3 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">RequestTracker</h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-4">
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
                className={`group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={15} className="text-blue-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Signed in as</p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.role}</p>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings size={18} />
            <span className="font-medium">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
