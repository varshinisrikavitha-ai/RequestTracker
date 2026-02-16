import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import TextArea from '../components/TextArea';
import { mockRequests } from '../data/mockData';

const Approvals = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('approve');
  const [comment, setComment] = useState('');
  const [processedRequests, setProcessedRequests] = useState([]);

  const pendingApprovals = mockRequests.filter((r) => r.status === 'Under Review').filter(
    (r) => !processedRequests.some((p) => p.id === r.id)
  );

  const handleOpenModal = (request, type) => {
    setSelectedRequest(request);
    setModalType(type);
    setShowModal(true);
  };

  const handleSubmitApproval = () => {
    if (selectedRequest) {
      setProcessedRequests([...processedRequests, selectedRequest]);
      setShowModal(false);
      setComment('');
    }
  };

  const columns = [
    { key: 'id', label: 'Request ID' },
    { key: 'title', label: 'Title' },
    { key: 'submittedBy', label: 'Submitted By' },
    { key: 'department', label: 'Department' },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <Badge text={row.priority} status={row.priority} />,
    },
    { key: 'submittedDate', label: 'Submitted Date' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve pending requests</p>
      </div>

      {/* Pending Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingApprovals.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <div className="w-8 h-8 text-yellow-600 flex items-center justify-center">⚠️</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Processed This Session</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{processedRequests.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <div className="w-8 h-8 text-blue-600 flex items-center justify-center">✓</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Approvals Table */}
      <Card>
        {pendingApprovals.length > 0 ? (
          <Table
            columns={columns}
            data={pendingApprovals}
            actions={(row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(row, 'approve')}
                  className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleOpenModal(row, 'reject')}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  <XCircle size={16} />
                  Reject
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

      {/* Approval Modal */}
      <Modal
        isOpen={showModal}
        title={modalType === 'approve' ? 'Approve Request' : 'Reject Request'}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitApproval}
        submitText={modalType === 'approve' ? 'Approve' : 'Reject'}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Request ID</p>
              <p className="font-medium text-gray-900">{selectedRequest.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Title</p>
              <p className="font-medium text-gray-900">{selectedRequest.title}</p>
            </div>
            <TextArea
              label="Approval Comment"
              placeholder={
                modalType === 'approve'
                  ? 'Add approval comments...'
                  : 'Please provide rejection reason...'
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Approvals;
