import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import Card from '../components/Card';
import { getRequestsSummary, getDepartmentPerformance, getMonthlyReport } from '../api/reports.api';
import { formatStatus } from '../utils/formatters';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [deptPerf, setDeptPerf] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRequestsSummary(),
      getMonthlyReport(),
      getDepartmentPerformance(),
    ]).then(([sumRes, monRes, deptRes]) => {
      setSummary(sumRes.data.data || {});
      setMonthly(monRes.data.data || []);
      setDeptPerf(deptRes.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const StatCard = ({ title, value, color }) => (
    <Card className={`border-l-4 ${color}`}>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value ?? '—'}</p>
    </Card>
  );

  const stats = summary?.byStatus || {};
  const total = summary?.total || 0;
  const approved = stats['APPROVED'] || 0;
  const rejected = stats['REJECTED'] || 0;
  const pending = (stats['SUBMITTED'] || 0) + (stats['UNDER_REVIEW'] || 0) + (stats['PROCESSING'] || 0);
  const approvalRate = approved + rejected > 0
    ? Math.round((approved / (approved + rejected)) * 100)
    : 0;

  const maxMonthly = Math.max(...monthly.map((m) => m.submitted || 0), 1);
  const maxDept = Math.max(...deptPerf.map((d) => d.total || 0), 1);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">View analytics and export request data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Requests" value={total} color="border-blue-500" />
        <StatCard title="Approved" value={approved} color="border-green-500" />
        <StatCard title="Rejected" value={rejected} color="border-red-500" />
        <StatCard title="Pending" value={pending} color="border-yellow-500" />
        <StatCard title="Approval Rate" value={`${approvalRate}%`} color="border-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Monthly Trend</h3>
          {monthly.length > 0 ? (
            <div className="space-y-4">
              {monthly.map((m) => (
                <div key={m.month}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(m.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-sm text-gray-600">
                      S: {m.submitted} | A: {m.approved} | R: {m.rejected}
                    </span>
                  </div>
                  <div className="flex gap-1 h-6">
                    <div className="bg-blue-500 rounded-l" style={{ width: `${(m.submitted / maxMonthly) * 100}%` }} title="Submitted" />
                    <div className="bg-green-500" style={{ width: `${(m.approved / maxMonthly) * 100}%` }} title="Approved" />
                    <div className="bg-red-500 rounded-r" style={{ width: `${(m.rejected / maxMonthly) * 100}%` }} title="Rejected" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No monthly data available.</p>
          )}
        </Card>

        {/* Status Breakdown */}
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Status Breakdown</h3>
          {Object.keys(stats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{formatStatus(status)}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No status data available.</p>
          )}
        </Card>
      </div>

      {/* Department Performance */}
      {deptPerf.length > 0 && (
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-3">
            {deptPerf.map((d) => (
              <div key={d.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{d.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{d.total ?? 0} requests</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${((d.total || 0) / maxDept) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Export Section */}
      <Card>
        <h3 className="font-bold text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium">
            <Download size={18} /> Export as PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition font-medium">
            <Download size={18} /> Export as Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium">
            <Download size={18} /> Export as CSV
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
