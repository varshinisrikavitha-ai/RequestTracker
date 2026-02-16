import React, { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import Card from '../components/Card';
import { mockReportsData, mockRequests } from '../data/mockData';

const Reports = () => {
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-02-16');
  const [filterCategory, setFilterCategory] = useState('all');

  const StatCard = ({ title, value, color }) => (
    <Card className={`border-l-4 ${color}`}>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </Card>
  );

  const approvalRate = Math.round(
    (mockReportsData.approved / (mockReportsData.approved + mockReportsData.rejected)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">View analytics and export request data</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Access">Access</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Requests" value={mockReportsData.totalRequests} color="border-blue-500" />
        <StatCard title="Approved" value={mockReportsData.approved} color="border-green-500" />
        <StatCard title="Rejected" value={mockReportsData.rejected} color="border-red-500" />
        <StatCard title="Pending" value={mockReportsData.pending} color="border-yellow-500" />
        <StatCard title="Approval Rate" value={`${approvalRate}%`} color="border-purple-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Monthly Trend</h3>
          <div className="space-y-4">
            {mockReportsData.monthlyData.map((data) => (
              <div key={data.month}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <span className="text-sm text-gray-600">
                    S: {data.submitted} | A: {data.approved} | R: {data.rejected}
                  </span>
                </div>
                <div className="flex gap-1 h-8">
                  <div
                    className="bg-blue-500 rounded-l"
                    style={{ width: `${(data.submitted / 12) * 100}%` }}
                    title="Submitted"
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${(data.approved / 12) * 100}%` }}
                    title="Approved"
                  />
                  <div
                    className="bg-red-500 rounded-r"
                    style={{ width: `${(data.rejected / 12) * 100}%` }}
                    title="Rejected"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <h3 className="font-bold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {mockReportsData.categoryBreakdown.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{category.category}</span>
                  <span className="text-sm font-semibold text-gray-900">{category.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(category.count / Math.max(...mockReportsData.categoryBreakdown.map((c) => c.count))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <h3 className="font-bold text-gray-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium">
            <Download size={18} />
            Export as PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition font-medium">
            <Download size={18} />
            Export as Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium">
            <Download size={18} />
            Export as CSV
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
