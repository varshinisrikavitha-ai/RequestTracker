import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockData';
import { LogIn } from 'lucide-react';

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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = (userEmail) => {
    setEmail(userEmail);
    setPassword('demo');
    setTimeout(() => {
      const result = login(userEmail, 'demo');
      if (result.success) {
        navigate('/');
      }
    }, 100);
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
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
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
              <span className="px-2 bg-white text-gray-500">Or use demo accounts</span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-semibold mb-3">Demo Users (Click to Auto-Login):</p>
            {mockUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleDemoLogin(user.email)}
                className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                    {user.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Email:</strong> Any demo user email above</li>
            <li>• <strong>Password:</strong> Any password (demo mode)</li>
            <li>• Use demo buttons for instant login</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 text-sm mt-6">
          Frontend Demo • No Backend Connection
        </p>
      </div>
    </div>
  );
};

export default Login;
