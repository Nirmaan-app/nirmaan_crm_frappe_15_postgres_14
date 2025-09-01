// File: src/components/ui/TaskStatusIcon.jsx

import { CircleCheckBig, CircleX, Clock9 } from 'lucide-react';

// A mapping object to hold the configuration for each status
const statusConfig = {
  Completed: {
    Icon: CircleCheckBig,
    color: 'text-green-600', // Green for success
  },
  Incomplete: {
    Icon: CircleX,
    color: 'text-red-600', // Red for incomplete/cancelled
  },
  Scheduled: {
    Icon: Clock9,
    color: 'text-yellow-500', // Yellow for pending/scheduled
  },
  // You can add more statuses here if needed
  // Example:
  // 'Cancelled': {
  //   Icon: CircleX,
  //   color: 'text-red-600',
  // },
};

export const TaskStatusIcon = ({ status, className = '' }) => {
  // Get the configuration for the current status, or return null if the status is invalid
  const config = statusConfig[status];

  if (!config) {
    return null; // Or return a default icon
  }

  const { Icon, color } = config;
  const combinedClassName = `h-4 w-4 mt-1 ${color} ${className}`; // Combine base styles with any passed-in styles

  return <Icon className={combinedClassName} />;
};