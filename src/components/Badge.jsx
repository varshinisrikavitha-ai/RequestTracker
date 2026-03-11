import React from 'react';

const Badge = ({ text, status = 'default', className = '' }) => {
  const statusColors = {
    // ── Title-case (legacy / display values) ──────────────
    'Submitted': 'bg-gray-100 text-gray-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Processing': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800',
    // ── Backend enum values (UPPERCASE) ───────────────────
    'SUBMITTED': 'bg-gray-100 text-gray-800',
    'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
    'APPROVED': 'bg-blue-100 text-blue-800',
    'PROCESSING': 'bg-purple-100 text-purple-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'LOW': 'bg-blue-100 text-blue-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'CRITICAL': 'bg-red-100 text-red-800',
    // ── Notification types ────────────────────────────────
    'success': 'bg-green-100 text-green-800',
    'warning': 'bg-yellow-100 text-yellow-800',
    'error': 'bg-red-100 text-red-800',
    'info': 'bg-blue-100 text-blue-800',
    'default': 'bg-gray-100 text-gray-800',
  };

  const color = statusColors[status] || statusColors.default;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color} ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
