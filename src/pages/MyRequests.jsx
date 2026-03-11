import React, { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { getRequests } from '../api/requests.api';
import { formatStatus, formatPriority, formatDate, getErrorMessage } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'];

const MyRequests = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (status !== 'all') params.status = status;
      const res = await getRequests(params);
      setRequests(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(filterStatus);
  }, [filterStatus, fetchRequests]);

  const columns = [
    { key: 'id', label: 'Request ID', render: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}…</span> },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category', render: (row) => row.category?.name || '—' },
    { key: 'priority', label: 'Priority', render: (row) => <Badge text={formatPriority(row.priority)} status={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <Badge text={formatStatus(row.status)} status={row.status} /> },
    { key: 'updatedAt', label: 'Last Updated', render: (row) => formatDate(row.updatedAt) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-1">View and manage all your submitted requests</p>
        </div>
        <button onClick={() => fetchRequests(filterStatus)} className="p-2 text-gray-500 hover:text-blue-600 transition">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Status Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All {pagination ? `(${pagination.total})` : ''}
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg font-medium transition ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {formatStatus(s)}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-600 text-sm py-6 text-center">{error}</p>
        ) : (
          <Table
            columns={columns}
            data={requests}
            actions={(row) => (
              <button
                onClick={() => navigate(`/request/${row.id}`)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition"
              >
                <Eye size={16} />
                View
              </button>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default MyRequests;
