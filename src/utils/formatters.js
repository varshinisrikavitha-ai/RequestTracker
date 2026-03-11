/** Convert backend STATUS enum to display label */
export const formatStatus = (status) => {
  const map = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
  };
  return map[status] || status;
};

/** Convert backend PRIORITY enum to display label */
export const formatPriority = (priority) => {
  const map = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  };
  return map[priority] || priority;
};

/** Convert backend ROLE enum to display label */
export const formatRole = (role) => {
  const map = {
    ADMIN: 'Admin',
    DEPARTMENT_HEAD: 'Dept. Head',
    STAFF: 'Staff',
    VIEWER: 'Viewer',
  };
  return map[role] || role;
};

/** Format a date string to a readable local date */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Extract the error message from an axios error response */
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'An unexpected error occurred.';
