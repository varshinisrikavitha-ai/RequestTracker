import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileIcon } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Timeline from '../components/Timeline';
import { mockRequests } from '../data/mockData';

const RequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const request = mockRequests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/my-requests')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Requests
        </button>
        <Card>
          <p className="text-center text-gray-600 py-12">Request not found</p>
        </Card>
      </div>
    );
  }

  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, { author: 'You', text: comment, date: new Date().toLocaleString() }]);
      setComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/my-requests')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft size={20} />
        Back to Requests
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-gray-600 mt-1">Request ID: {request.id}</p>
        </div>
        <Badge text={request.status} status={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium text-gray-900 mt-1">{request.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <Badge text={request.priority} status={request.priority} className="mt-1" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted By</p>
                <p className="font-medium text-gray-900 mt-1">{request.submittedBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900 mt-1">{request.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted Date</p>
                <p className="font-medium text-gray-900 mt-1">{request.submittedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900 mt-1">{request.lastUpdated}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-700">{request.description}</p>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Timeline</h2>
            <Timeline stages={request.timeline} />
          </Card>

          {/* Comments Section */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>

            <div className="space-y-4 mb-6">
              {[...request.comments, ...comments].map((cmnt, idx) => (
                <div key={idx} className="border-l-2 border-blue-600 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-900">{cmnt.author}</p>
                    <p className="text-xs text-gray-500">{cmnt.date}</p>
                  </div>
                  <p className="text-gray-700 mt-1">{cmnt.text}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="border-t border-gray-200 pt-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              />
              <button
                type="submit"
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Post Comment
              </button>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <Card>
              <h3 className="font-bold text-gray-900 mb-4">Attachments</h3>
              <div className="space-y-3">
                {request.attachments.map((attachment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileIcon size={16} className="text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{attachment.size}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Status Info */}
          <Card>
            <h3 className="font-bold text-gray-900 mb-4">Status</h3>
            <Badge text={request.status} status={request.status} className="w-full text-center py-2" />
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
              <p className="text-gray-600">
                {request.status === 'Completed'
                  ? '✓ Your request has been successfully completed.'
                  : request.status === 'Rejected'
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
