import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileIcon } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Timeline from '../components/Timeline';
import { getRequestById, getStatusHistory } from '../api/requests.api';
import { formatStatus, formatPriority, formatDate, getErrorMessage } from '../utils/formatters';

const RequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, histRes] = await Promise.all([
          getRequestById(requestId),
          getStatusHistory(requestId),
        ]);
        setRequest(reqRes.data.data);
        setStatusHistory(histRes.data.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/my-requests')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft size={20} /> Back to Requests
        </button>
        <Card>
          <p className="text-center text-gray-600 py-12">{error || 'Request not found'}</p>
        </Card>
      </div>
    );
  }

  // Map status history to Timeline stages format
  const timelineStages = statusHistory.map((h) => ({
    status: formatStatus(h.status),
    date: formatDate(h.changedAt),
    completed: true,
    comment: h.comment || '',
    changedBy: h.changedBy?.name || '',
  }));

  const attachmentBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/my-requests')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
        <ArrowLeft size={20} /> Back to Requests
      </button>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-gray-600 mt-1">Request ID: {request.id}</p>
        </div>
        <Badge text={request.status} status={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium text-gray-900 mt-1">{request.category?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <Badge text={request.priority} status={request.priority} className="mt-1" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted By</p>
                <p className="font-medium text-gray-900 mt-1">{request.requester?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900 mt-1">{request.department?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted Date</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900 mt-1">{formatDate(request.updatedAt)}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-700">{request.description}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Status History</h2>
            {timelineStages.length > 0 ? (
              <Timeline stages={timelineStages} />
            ) : (
              <p className="text-gray-500 text-sm">No status history available yet.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>
            <div className="space-y-4 mb-6">
              {statusHistory.filter((h) => h.comment).map((h, idx) => (
                <div key={idx} className="border-l-2 border-blue-600 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">{h.changedBy?.name || 'System'}</p>
                    <p className="text-xs text-gray-500">{formatDate(h.changedAt)}</p>
                  </div>
                  <p className="text-gray-700 mt-1">{h.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {request.attachmentUrl && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Attachment</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileIcon size={16} className="text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">Download File</p>
                </div>
                <a
                  href={`${attachmentBaseUrl}${request.attachmentUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download size={16} />
                </a>
              </div>
            </Card>
          )}

          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Status</h3>
            <Badge text={request.status} status={request.status} className="w-full text-center py-2" />
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
              <p className="text-gray-600">
                {request.status === 'COMPLETED'
                  ? '✓ Your request has been successfully completed.'
                  : request.status === 'REJECTED'
                  ? '✕ Your request was rejected.'
                  : 'Your request is being processed. Please check back for updates.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
