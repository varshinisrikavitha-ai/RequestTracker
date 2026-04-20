import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, Sparkles, ArrowRight, BarChart3 } from 'lucide-react';

// Backend seed accounts (matches prisma/seed.js)
const DEMO_ACCOUNTS = [
  // 1 Admin
  { name: 'HR Admin',        email: 'hradmin@requesttracker.com',      password: 'Admin@123',    role: 'ADMIN',           dept: '' },
  // 1 Head
  { name: 'Engineering Head',email: 'enghead@requesttracker.com',      password: 'Head@123',     role: 'DEPARTMENT_HEAD', dept: 'Engineering' },
  // 1 Staff
  { name: 'IT Staff',        email: 'itstaff@requesttracker.com',      password: 'Password@123', role: 'STAFF',           dept: 'IT' },
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.10),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-lg items-center">
        <div className="w-full rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] sm:p-7">
          <div className="mx-auto max-w-md">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">
                <Sparkles size={12} /> RequestTracker Pro
              </div>

              <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                <LogIn size={28} />
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">RequestTracker</h1>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Clean, cute, and compact access for approvals and request tracking.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Sign In</p>

              <form onSubmit={handleLogin} className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(37,99,235,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogIn size={18} />
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="rounded-full bg-slate-50 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Demo Access
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(account)}
                    className="group w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 group-hover:text-blue-700 transition">{account.name}</p>
                        <p className="truncate text-xs text-slate-500">{account.email}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] ${
                          account.role === 'ADMIN'
                            ? 'bg-rose-100 text-rose-700'
                            : account.role === 'DEPARTMENT_HEAD'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {account.role === 'DEPARTMENT_HEAD' ? 'HEAD' : account.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                Admin: <span className="font-semibold text-slate-700">Admin@123</span> · Head: <span className="font-semibold text-slate-700">Head@123</span> · Users: <span className="font-semibold text-slate-700">Password@123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
