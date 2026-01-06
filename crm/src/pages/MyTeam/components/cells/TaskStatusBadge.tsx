// src/pages/MyTeam/components/cells/TaskStatusBadge.tsx
// Task status badge with icon and semantic colors

import React from 'react';
import { cn } from '@/lib/utils';
import { TouchTooltip } from '@/components/ui/touch-tooltip';
import { CircleCheckBig, CircleX, Clock9 } from 'lucide-react';

interface TaskStatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, {
  Icon: React.ElementType;
  styles: string;
  label: string;
}> = {
  Completed: {
    Icon: CircleCheckBig,
    styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    label: 'Completed',
  },
  Scheduled: {
    Icon: Clock9,
    styles: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    label: 'Scheduled',
  },
  Incomplete: {
    Icon: CircleX,
    styles: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    label: 'Incomplete',
  },
  Pending: {
    Icon: Clock9,
    styles: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    label: 'Pending',
  },
};

const DEFAULT_CONFIG = {
  Icon: Clock9,
  styles: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700',
  label: 'Unknown',
};

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || { ...DEFAULT_CONFIG, label: status };
  const { Icon, styles, label } = config;

  return (
    <TouchTooltip content={<span className="text-xs">{label}</span>} side="bottom">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap',
          styles
        )}
      >
        <Icon className="w-3 h-3 flex-shrink-0" />
        {label}
      </span>
    </TouchTooltip>
  );
};
