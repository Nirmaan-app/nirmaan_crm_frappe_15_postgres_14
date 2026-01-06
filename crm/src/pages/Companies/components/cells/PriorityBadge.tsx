// src/pages/Companies/components/cells/PriorityBadge.tsx
// Clean priority badge with semantic colors based on meeting frequency

import React from 'react';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority?: string;
}

// Priority configuration - order matters for matching (most specific first)
const PRIORITY_CONFIG = [
  {
    // "Meet Once Every 2 Weeks" - bi-weekly
    match: (p: string) => p.includes('2 week') || p.includes('every 2') || p.includes('bi-week') || p.includes('biweek'),
    label: 'Bi-weekly',
    styles: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  },
  {
    // "Meet Once a Week" - weekly (most frequent)
    match: (p: string) => p.includes('week') && !p.includes('2 week'),
    label: 'Weekly',
    styles: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  },
  {
    // "Meet Once a Month" - monthly
    match: (p: string) => p.includes('month'),
    label: 'Monthly',
    styles: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  },
  {
    // "Hold" - paused
    match: (p: string) => p.includes('hold'),
    label: 'Hold',
    styles: 'bg-stone-100 text-stone-500 border-stone-300 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-600',
  },
];

const DEFAULT_STYLES = 'bg-stone-50 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700';

/**
 * Priority Badge
 * Displays meeting frequency as a color-coded badge
 *
 * Frequency hierarchy (warm → cool):
 * - Weekly (rose) - highest frequency
 * - Bi-weekly (orange)
 * - Monthly (sky)
 * - Hold (stone) - paused
 */
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  if (!priority) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const normalizedPriority = priority.toLowerCase();

  // Find matching config (order matters - most specific patterns first)
  const config = PRIORITY_CONFIG.find(c => c.match(normalizedPriority));

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap',
        config?.styles || DEFAULT_STYLES
      )}
      title={priority}
    >
      {config?.label || (priority.length > 10 ? priority.slice(0, 10) + '…' : priority)}
    </span>
  );
};
