// src/pages/Companies/components/cells/MeetingStatusBadge.tsx
// Simple meeting status badge for individual Last/Next meeting columns

import React from 'react';
import { TouchTooltip } from '@/components/ui/touch-tooltip';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { cn } from '@/lib/utils';
import { Calendar, CalendarCheck, CalendarX } from 'lucide-react';

interface MeetingStatusBadgeProps {
  date?: string | null;
  isWithinWindow?: boolean;
  variant: 'last' | 'next';
}

/**
 * Meeting Status Badge
 * Shows a single meeting date with status indicator
 * Touch-friendly: tap to see details on mobile
 */
export const MeetingStatusBadge: React.FC<MeetingStatusBadgeProps> = ({
  date,
  isWithinWindow,
  variant,
}) => {
  const hasDate = !!date;
  const isGood = isWithinWindow;

  const Icon = variant === 'last' ? CalendarCheck : Calendar;
  const label = variant === 'last' ? 'Last Meeting' : 'Next Meeting';
  const windowText = variant === 'last' ? 'within last 7 days' : 'within next 14 days';

  if (!hasDate) {
    return (
      <TouchTooltip
        content={
          <p className="text-xs text-muted-foreground">
            {variant === 'last' ? 'No meeting recorded' : 'No meeting scheduled'}
          </p>
        }
        side="bottom"
      >
        <button type="button" className="flex items-center gap-1.5 text-muted-foreground cursor-default">
          <CalendarX className="w-3.5 h-3.5" />
          <span className="text-xs">—</span>
        </button>
      </TouchTooltip>
    );
  }

  const tooltipContent = (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold mb-0.5">{label}</p>
        <p className="text-sm font-medium">
          {formatDateWithOrdinal(new Date(date), 'dd MMM yyyy')}
        </p>
        {isGood && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
            ✓ {windowText}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <TouchTooltip content={tooltipContent} side="bottom">
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-default',
          isGood
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
        )}
      >
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            isGood ? 'bg-emerald-500' : 'bg-stone-400'
          )}
        />
        <span>{formatDateWithOrdinal(new Date(date), 'dd MMM')}</span>
      </button>
    </TouchTooltip>
  );
};
