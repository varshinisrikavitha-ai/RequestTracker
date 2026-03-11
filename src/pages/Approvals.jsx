import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import TextArea from '../components/TextArea';
import { getRequests, updateStatus } from '../api/requests.api';
import { formatPriority, formatDate, getErrorMessage } from '../utils/formatters';

const Approvals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('approve');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRequests({ status: 'UNDER_REVIEW', limit: 100 });
      setRequests(res.data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleOpenModal = (request, type) => {
    setSelectedRequest(request);
    setModalType(type);
    setError('');
    setComment('');
    setShowModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!selectedRequest) return;
    setSubmitting(true);
    setError('');
    try {
      const newStatus = modalType === 'approve' ? 'APPROVED' : 'REJECTED';
      await updateStatus(selectedRequest.id, newStatus, comment);
      setShowModal(false);
      setComment('');
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
      render: (row) => row.requester?.name || '—',
    },
    {
      key: 'department',
      label: 'Department',
      render: (row) => row.department?.name || '—',
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
                <button
                  onClick={() => handleOpenModal(row, 'approve')}
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => handleOpenModal(row, 'reject')}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  <XCircle size={16} /> Reject
                </button>
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
        title={modalType === 'approve' ? 'Approve Request' : 'Reject Request'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitApproval}
        submitText={submitting ? 'Processing…' : modalType === 'approve' ? 'Approve' : 'Reject'}
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
              <p className="font-medium text-gray-900">{selectedRequest.requester?.name || '—'}</p>
            </div>
            <TextArea
              label={modalType === 'approve' ? 'Approval Comments (optional)' : 'Rejection Reason'}
              placeholder={
                modalType === 'approve'
                  ? 'Add approval comments...'
                  : 'Please provide rejection reason...'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required={modalType === 'reject'}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Approvals;
