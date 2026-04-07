import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import TextArea from '../components/TextArea';
import { getRequests, updateStatus } from '../api/requests.api';
import { formatDate, getErrorMessage } from '../utils/formatters';

const ACTIONABLE_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'];

const getActionsForStatus = (status) => {
  if (status === 'SUBMITTED') {
    return [
      { key: 'review', label: 'Move to Review', nextStatus: 'UNDER_REVIEW' },
      { key: 'approve', label: 'Approve', nextStatus: 'APPROVED' },
      { key: 'reject', label: 'Reject', nextStatus: 'REJECTED' },
    ];
  }
  if (status === 'UNDER_REVIEW') {
    return [
      { key: 'approve', label: 'Approve', nextStatus: 'APPROVED' },
      { key: 'reject', label: 'Reject', nextStatus: 'REJECTED' },
    ];
  }
  if (status === 'APPROVED') {
    return [{ key: 'processing', label: 'Mark Processing', nextStatus: 'PROCESSING' }];
  }
  if (status === 'PROCESSING') {
    return [{ key: 'completed', label: 'Mark Completed', nextStatus: 'COMPLETED' }];
  }
  return [];
};

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRequests({ limit: 200 });
      const all = res.data.data || [];
      setRequests(all.filter((request) => ACTIONABLE_STATUSES.includes(request.status)));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleOpenModal = (request, action) => {
    setSelectedRequest(request);
    setSelectedAction(action);
    setError('');
    setComment('');
    setShowModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!selectedRequest || !selectedAction) return;
    if (selectedAction.nextStatus === 'REJECTED' && !comment.trim()) {
      setError('Rejection reason is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await updateStatus(selectedRequest.id, selectedAction.nextStatus, comment);
      setShowModal(false);
      setComment('');
      setSelectedAction(null);
      await fetchPending();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Request ID',
      render: (row) => <span className="text-xs font-mono text-gray-500">{row.id.slice(0, 8)}…</span>,
    },
    { key: 'title', label: 'Title' },
    {
      key: 'requester',
      label: 'Submitted By',
      render: (row) => row.creator?.name || '—',
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => row.department?.name || '—',
    },
    {
      key: 'status',
      label: 'Current Status',
      render: (row) => <Badge text={row.status} status={row.status} />,
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <Badge text={row.priority} status={row.priority} />,
    },
    {
      key: 'createdAt',
      label: 'Submitted Date',
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve pending requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{requests.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <div className="w-8 h-8 text-yellow-600 flex items-center justify-center text-xl">⚠️</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Under Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{requests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <div className="w-8 h-8 text-blue-600 flex items-center justify-center text-xl">📋</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : requests.length > 0 ? (
          <Table
            columns={columns}
            data={requests}
            actions={(row) => (
              <div className="flex gap-2">
                {getActionsForStatus(row.status).map((action) => (
                  <button
                    onClick={() => handleOpenModal(row, action)}
                    key={`${row.id}-${action.key}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium ${
                      action.nextStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {action.nextStatus === 'REJECTED' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 font-medium">No pending approvals</p>
            <p className="text-gray-500 text-sm mt-1">All requests have been processed</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={showModal}
        title={selectedAction ? `${selectedAction.label} Request` : 'Update Request Status'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitApproval}
        submitText={submitting ? 'Processing…' : selectedAction?.label || 'Submit'}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
            <div>
              <p className="text-sm text-gray-600">Request</p>
              <p className="font-medium text-gray-900">{selectedRequest.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Submitted By</p>
              <p className="font-medium text-gray-900">{selectedRequest.creator?.name || '—'}</p>
            </div>
            <TextArea
              label={selectedAction?.nextStatus === 'REJECTED' ? 'Rejection Reason' : 'Comments (optional)'}
              placeholder={selectedAction?.nextStatus === 'REJECTED' ? 'Please provide rejection reason...' : 'Add comments...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required={selectedAction?.nextStatus === 'REJECTED'}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Approvals;
