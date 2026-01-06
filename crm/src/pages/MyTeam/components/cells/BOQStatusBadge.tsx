// src/pages/MyTeam/components/cells/BOQStatusBadge.tsx
// BOQ status badge with semantic colors matching the design system

import React from 'react';
import { cn } from '@/lib/utils';
import { TouchTooltip } from '@/components/ui/touch-tooltip';

interface BOQStatusBadgeProps {
  status: string;
}

// Status configuration with colors matching useStatusStyles hook
const STATUS_CONFIG: Record<string, { styles: string; label: string }> = {
  // Final/Terminal statuses
  Won: {
    styles: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    label: 'Won',
  },
  Lost: {
    styles: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    label: 'Lost',
  },
  Dropped: {
    styles: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    label: 'Dropped',
  },
  // Active/In-Progress statuses
  New: {
    styles: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
    label: 'New',
  },
  'In-Progress': {
    styles: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    label: 'In-Progress',
  },
  // Submission statuses
  'BOQ Submitted': {
    styles: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
    label: 'Submitted',
  },
  'Partial BOQ Submitted': {
    styles: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    label: 'Partial',
  },
  // Revision statuses
  'Revision Submitted': {
    styles: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    label: 'Revision',
  },
  'Revision Pending': {
    styles: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    label: 'Rev. Pending',
  },
  // Business statuses
  Negotiation: {
    styles: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    label: 'Negotiation',
  },
  Hold: {
    styles: 'bg-yellow-50 text-yellow-600 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    label: 'Hold',
  },
};

const DEFAULT_CONFIG = {
  styles: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700',
  label: 'Unknown',
};

export const BOQStatusBadge: React.FC<BOQStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || { ...DEFAULT_CONFIG, label: status };
  const { styles, label } = config;

  return (
    <TouchTooltip content={<span className="text-xs">{status}</span>} side="bottom">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap',
          styles
        )}
      >
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            status === 'Won' && 'bg-green-500',
            status === 'Lost' && 'bg-red-500',
            status === 'New' && 'bg-sky-500',
            status === 'Negotiation' && 'bg-yellow-500',
            status === 'Hold' && 'bg-yellow-500',
            !['Won', 'Lost', 'New', 'Negotiation', 'Hold'].includes(status) && 'bg-current opacity-60'
          )}
        />
        {label}
      </span>
    </TouchTooltip>
  );
};
