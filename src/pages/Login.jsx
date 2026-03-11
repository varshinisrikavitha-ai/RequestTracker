import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

// Backend seed accounts (matches prisma/seed.js)
const DEMO_ACCOUNTS = [
  { name: 'System Admin',    email: 'admin@requesttracker.com',        password: 'Admin@123',    role: 'ADMIN',           dept: '' },
  { name: 'IT Head',         email: 'ithead@requesttracker.com',       password: 'Head@123',     role: 'DEPARTMENT_HEAD', dept: 'IT' },
  { name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com',     password: 'Password@123', role: 'ADMIN',           dept: 'HR' },
  { name: 'Sarah Johnson',   email: 'sarah.johnson@company.com',       password: 'Password@123', role: 'DEPARTMENT_HEAD', dept: 'Design' },
  { name: 'Lisa Anderson',   email: 'lisa.anderson@company.com',       password: 'Password@123', role: 'DEPARTMENT_HEAD', dept: 'Finance' },
  { name: 'Robert Wilson',   email: 'robert.wilson@company.com',       password: 'Password@123', role: 'DEPARTMENT_HEAD', dept: 'Operations' },
  { name: 'John Smith',      email: 'john.smith@company.com',          password: 'Password@123', role: 'STAFF',           dept: 'Engineering' },
  { name: 'Mike Chen',       email: 'mike.chen@company.com',           password: 'Password@123', role: 'STAFF',           dept: 'Data Analytics' },
  { name: 'David Park',      email: 'david.park@company.com',          password: 'Password@123', role: 'STAFF',           dept: 'IT' },
  { name: 'Jennifer Taylor', email: 'jennifer.taylor@company.com',     password: 'Password@123', role: 'STAFF',           dept: 'Marketing' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleDemoLogin = async (account) => {
    setError('');
    setLoading(true);
    const result = await login(account.email, account.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LogIn size={32} className="text-white" />
            <h1 className="text-3xl font-bold text-white">RequestTracker</h1>
          </div>
          <p className="text-blue-100">Online Request Status Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or use a demo account</span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-semibold mb-3">Seeded Accounts (click to auto-login):</p>
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin(account)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-500 truncate">{account.email}</p>
                    {account.dept && <p className="text-xs text-gray-400">{account.dept}</p>}
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-1 rounded font-medium ${
                    account.role === 'ADMIN'           ? 'bg-red-100 text-red-700' :
                    account.role === 'DEPARTMENT_HEAD' ? 'bg-yellow-100 text-yellow-700' :
                                                         'bg-blue-100 text-blue-700'
                  }`}>
                    {account.role === 'DEPARTMENT_HEAD' ? 'DEPT HEAD' : account.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">Seed Passwords:</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>admin@requesttracker.com</strong> → Admin@123</li>
            <li>• <strong>ithead@requesttracker.com</strong> → Head@123</li>
            <li>• <strong>*@company.com</strong> accounts → Password@123</li>
          </ul>
        </div>

        <p className="text-center text-blue-100 text-sm mt-6">
          Connected to Express + PostgreSQL Backend
        </p>
      </div>
    </div>
  );
};

export default Login;
