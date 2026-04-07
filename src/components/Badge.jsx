import React from 'react';

const Badge = ({ text, status = 'default', className = '' }) => {
  const statusColors = {
    // ── Title-case (legacy / display values) ──────────────
    'Submitted': 'bg-slate-100 text-slate-700 border border-slate-200',
    'Under Review': 'bg-amber-100 text-amber-700 border border-amber-200',
    'Approved': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Processing': 'bg-violet-100 text-violet-700 border border-violet-200',
    'Completed': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'Rejected': 'bg-rose-100 text-rose-700 border border-rose-200',
    'Low': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Medium': 'bg-amber-100 text-amber-700 border border-amber-200',
    'High': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Critical': 'bg-rose-100 text-rose-700 border border-rose-200',
    // ── Backend enum values (UPPERCASE) ───────────────────
    'SUBMITTED': 'bg-slate-100 text-slate-700 border border-slate-200',
    'UNDER_REVIEW': 'bg-amber-100 text-amber-700 border border-amber-200',
    'APPROVED': 'bg-blue-100 text-blue-700 border border-blue-200',
    'PROCESSING': 'bg-violet-100 text-violet-700 border border-violet-200',
    'COMPLETED': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'REJECTED': 'bg-rose-100 text-rose-700 border border-rose-200',
    'LOW': 'bg-blue-100 text-blue-700 border border-blue-200',
    'MEDIUM': 'bg-amber-100 text-amber-700 border border-amber-200',
    'HIGH': 'bg-orange-100 text-orange-700 border border-orange-200',
    'CRITICAL': 'bg-rose-100 text-rose-700 border border-rose-200',
    // ── Notification types ────────────────────────────────
    'success': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    'warning': 'bg-amber-100 text-amber-700 border border-amber-200',
    'error': 'bg-rose-100 text-rose-700 border border-rose-200',
    'info': 'bg-blue-100 text-blue-700 border border-blue-200',
    'default': 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const color = statusColors[status] || statusColors.default;

  return (
    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${color} ${className}`}>
      {text}
    </span>
  );
};

export default Badge;
