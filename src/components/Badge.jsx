import React from 'react';

const Badge = ({ text, status = 'default', className = '' }) => {
  const statusColors = {
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
