import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { mockRequests } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

const MyRequests = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredRequests = filterStatus === 'all' 
    ? mockRequests 
    : mockRequests.filter((r) => r.status === filterStatus);

  const columns = [
    { key: 'id', label: 'Request ID' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <Badge text={row.priority} status={row.priority} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge text={row.status} status={row.status} />,
    },
    { key: 'lastUpdated', label: 'Last Updated' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
        <p className="text-gray-600 mt-1">View and manage all your submitted requests</p>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({mockRequests.length})
          </button>
          {['Submitted', 'Under Review', 'Approved', 'Processing', 'Completed', 'Rejected'].map((status) => {
            const count = mockRequests.filter((r) => r.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </Card>

      {/* Requests Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredRequests}
          actions={(row) => (
            <button
              onClick={() => navigate(`/request/${row.id}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
            >
              <Eye size={16} />
              View Details
            </button>
          )}
        />
      </Card>
    </div>
  );
};

export default MyRequests;
