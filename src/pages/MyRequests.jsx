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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">My Requests</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">View and manage all your submitted requests</p>
        </div>
        <button onClick={() => fetchRequests(filterStatus)} className="self-start rounded-xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:border-blue-200 hover:text-blue-700 hover:bg-slate-50 sm:self-auto">
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Status Filters */}
      <Card className="border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2.5 rounded-xl font-semibold transition tracking-wide text-sm ${filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All {pagination ? `(${pagination.total})` : ''}
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-xl font-semibold transition tracking-wide text-sm ${filterStatus === s ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {formatStatus(s)}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="border border-slate-200 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-rose-600">{error}</p>
        ) : (
          <Table
            columns={columns}
            data={requests}
            actions={(row) => (
              <button
                onClick={() => navigate(`/request/${row.id}`)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
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
