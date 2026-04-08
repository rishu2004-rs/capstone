import React from 'react';

export const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50';
    case 'In Progress':
      return 'bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#3c4043] dark:text-[#8ab4f8] border border-[#dadce0] dark:border-[#5f6368]'; // Google Blue style
    case 'Hearing Scheduled':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50';
    case 'Closed':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
    case 'Dismissed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
  }
};

const StatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
