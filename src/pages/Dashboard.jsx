import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard, getUserDashboard } from '../api/dashboard.api';
import { formatStatus, formatPriority, formatDate, getErrorMessage } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [stats, setStats] = useState({ totalRequests: 0, pendingRequests: 0, completedRequests: 0, totalUsers: 0, totalDepartments: 0, rejectedRequests: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [recentPagination, setRecentPagination] = useState(null);
  const [recentPage, setRecentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = { page: recentPage, limit: 10 };
        if (isAdmin) {
          const res = await getAdminDashboard(params);
          const d = res.data.data;
          setStats(d.stats);
          setRecentRequests(d.recentRequests || []);
          setRecentPagination(d.recentRequestsPagination || null);
          setStatusBreakdown(d.statusBreakdown || []);
        } else {
          const res = await getUserDashboard(params);
          const d = res.data.data;
          setStats(d.stats);
          setRecentRequests(d.recentRequests || []);
          setRecentPagination(d.recentRequestsPagination || null);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, recentPage]);

  const columns = [
    { key: 'id', label: 'Request ID', render: (row) => <span className="font-mono text-xs text-slate-500">{row.id.slice(0, 8)}…</span> },
    { key: 'title', label: 'Title' },
    { key: 'priority', label: 'Priority', render: (row) => <Badge text={formatPriority(row.priority)} status={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <Badge text={formatStatus(row.status)} status={row.status} /> },
    { key: 'createdAt', label: 'Submitted', render: (row) => formatDate(row.createdAt) },
  ];

  const StatCard = ({ icon: Icon, title, value, gradient, icon_color }) => (
    <Card className={`relative overflow-hidden group border border-slate-200 ${gradient}`}>
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/25 group-hover:scale-110 transition-transform duration-500" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-bold text-white mt-3">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl ${icon_color} bg-white/20`}>
            <Icon size={32} className="text-white" />
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-900/20 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const totalForChart = statusBreakdown.reduce((s, x) => s + x.count, 0) || 1;
  const statusColorMap = {
    SUBMITTED: 'text-gray-400', UNDER_REVIEW: 'text-yellow-500',
    APPROVED: 'text-blue-500', PROCESSING: 'text-purple-500',
    COMPLETED: 'text-green-500', REJECTED: 'text-red-500',
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-lg">Welcome back, <span className="font-semibold text-blue-700">{user?.name}</span>. Here's your performance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        <StatCard icon={Clock} title="Total Requests" value={stats.totalRequests} gradient="bg-gradient-to-br from-blue-600 to-blue-700" icon_color="bg-blue-500/30" />
        <StatCard icon={Clock} title="Pending" value={stats.pendingRequests} gradient="bg-gradient-to-br from-amber-500 to-amber-600" icon_color="bg-amber-500/30" />
        <StatCard icon={CheckCircle} title="Completed" value={stats.completedRequests} gradient="bg-gradient-to-br from-emerald-500 to-green-600" icon_color="bg-emerald-500/30" />
        <StatCard icon={XCircle} title="Rejected" value={stats.rejectedRequests} gradient="bg-gradient-to-br from-rose-500 to-red-600" icon_color="bg-rose-500/30" />
      </div>

      {/* Recent Requests Table */}
      <Card className="border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
              <TrendingUp size={24} className="text-blue-600" />
              Recent Requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">Your 10 most recent request submissions</p>
          </div>
        </div>
        {recentRequests.length > 0
          ? <Table columns={columns} data={recentRequests} />
          : <p className="py-8 text-center text-sm text-slate-500">No requests yet. Create one to get started!</p>
        }

        {recentPagination && recentPagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-500">
              Page <span className="font-semibold text-blue-700">{recentPagination.page}</span> of <span className="font-semibold text-blue-700">{recentPagination.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                disabled={!recentPagination.hasPrevPage}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setRecentPage((p) => p + 1)}
                disabled={!recentPagination.hasNextPage}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {isAdmin && statusBreakdown.length > 0 && (
        <Card className="border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Status Distribution</h2>
            <p className="mt-1 text-sm text-slate-500">Request breakdown across all statuses</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {statusBreakdown.map(({ status, count }) => {
              const pct = Math.round((count / totalForChart) * 100);
              return (
                <div key={status} className="text-center group">
                  <div className="relative w-20 h-20 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#cbd5e1" strokeWidth="2" opacity="0.5" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="3"
                        strokeDasharray={`${201 * (pct / 100)} 201`}
                        className={statusColorMap[status] || 'text-slate-400'}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-900">{pct}%</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 transition group-hover:text-blue-700">{formatStatus(status)}</p>
                  <p className="mt-1 text-xs text-slate-500">{count} {count === 1 ? 'request' : 'requests'}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
