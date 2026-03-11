import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const res = await getAdminDashboard();
          const d = res.data.data;
          setStats(d.stats);
          setRecentRequests(d.recentRequests || []);
          setStatusBreakdown(d.statusBreakdown || []);
        } else {
          const res = await getUserDashboard();
          const d = res.data.data;
          setStats(d.stats);
          setRecentRequests(d.recentRequests || []);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  const columns = [
    { key: 'id', label: 'Request ID', render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}…</span> },
    { key: 'title', label: 'Title' },
    { key: 'priority', label: 'Priority', render: (row) => <Badge text={formatPriority(row.priority)} status={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <Badge text={formatStatus(row.status)} status={row.status} /> },
    { key: 'createdAt', label: 'Submitted', render: (row) => formatDate(row.createdAt) },
  ];

  const StatCard = ({ icon: Icon, title, value, iconBg, iconColor, borderColor }) => (
    <Card className={`border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon size={28} className={iconColor} />
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
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Clock} title="Total Requests" value={stats.totalRequests} iconBg="bg-blue-100" iconColor="text-blue-600" borderColor="border-blue-500" />
        <StatCard icon={Clock} title="Pending" value={stats.pendingRequests} iconBg="bg-yellow-100" iconColor="text-yellow-600" borderColor="border-yellow-500" />
        <StatCard icon={CheckCircle} title="Completed" value={stats.completedRequests} iconBg="bg-green-100" iconColor="text-green-600" borderColor="border-green-500" />
        <StatCard icon={XCircle} title={isAdmin ? 'Total Users' : 'Rejected'} value={isAdmin ? stats.totalUsers : stats.rejectedRequests} iconBg="bg-red-100" iconColor="text-red-600" borderColor="border-red-500" />
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
          <p className="text-gray-600 text-sm mt-1">Latest activity</p>
        </div>
        {recentRequests.length > 0
          ? <Table columns={columns} data={recentRequests} />
          : <p className="text-gray-500 text-sm py-6 text-center">No requests yet.</p>
        }
      </Card>

      {isAdmin && statusBreakdown.length > 0 && (
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Status Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusBreakdown.map(({ status, count }) => {
              const pct = Math.round((count / totalForChart) * 100);
              return (
                <div key={status} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
                        strokeDasharray={`${176 * (pct / 100)} 176`}
                        className={statusColorMap[status] || 'text-gray-400'}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{pct}%</span>
                  </div>
                  <p className="text-xs font-medium text-gray-900">{formatStatus(status)}</p>
                  <p className="text-xs text-gray-500">{count}</p>
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
