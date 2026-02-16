import React from 'react';
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { mockRequests } from '../data/mockData';

const Dashboard = () => {
  const activeRequests = mockRequests.filter((r) => r.status !== 'Completed' && r.status !== 'Rejected').length;
  const pendingApproval = mockRequests.filter((r) => r.status === 'Under Review').length;
  const completedMonth = mockRequests.filter((r) => r.status === 'Completed').length;
  const rejectedRequests = mockRequests.filter((r) => r.status === 'Rejected').length;

  const recentRequests = mockRequests.slice(0, 5);

  const columns = [
    { key: 'id', label: 'Request ID' },
    { key: 'title', label: 'Title' },
    { key: 'priority', label: 'Priority', render: (row) => <Badge text={row.priority} status={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <Badge text={row.status} status={row.status} /> },
    { key: 'submittedDate', label: 'Submitted Date' },
  ];

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className={`border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color.split('-')[3]}-100`}>
          <Icon size={28} className={`text-${color.split('-')[3]}-600`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your request status overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Clock} title="My Active Requests" value={activeRequests} color="border-blue-500" />
        <StatCard icon={Clock} title="Pending Approval" value={pendingApproval} color="border-yellow-500" />
        <StatCard icon={CheckCircle} title="Completed This Month" value={completedMonth} color="border-green-500" />
        <StatCard icon={XCircle} title="Rejected Requests" value={rejectedRequests} color="border-red-500" />
      </div>

      {/* Recent Requests Table */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
          <p className="text-gray-600 text-sm mt-1">Latest 5 requests from your submissions</p>
        </div>
        <Table columns={columns} data={recentRequests} />
      </Card>

      {/* Status Summary Chart */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Status Summary</h2>
          <p className="text-gray-600 text-sm mt-1">Distribution of all requests by status</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {['Submitted', 'Under Review', 'Approved', 'Processing', 'Completed'].map((status) => {
            const count = mockRequests.filter((r) => r.status === status).length;
            const percentage = Math.round((count / mockRequests.length) * 100);
            return (
              <div key={status} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${176 * (percentage / 100)} 176`}
                      className={
                        status === 'Submitted'
                          ? 'text-gray-400'
                          : status === 'Under Review'
                          ? 'text-yellow-500'
                          : status === 'Approved'
                          ? 'text-blue-500'
                          : status === 'Processing'
                          ? 'text-purple-500'
                          : 'text-green-500'
                      }
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {percentage}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{status}</p>
                <p className="text-xs text-gray-500 mt-1">{count} requests</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
