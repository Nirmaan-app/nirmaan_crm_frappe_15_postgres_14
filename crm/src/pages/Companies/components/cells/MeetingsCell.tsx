// src/pages/Companies/components/cells/MeetingsCell.tsx
// Consolidated meeting status cell - combines Last Meeting + Next Meeting into one clean visual

import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { cn } from '@/lib/utils';
import { Calendar, CalendarCheck } from 'lucide-react';

interface MeetingsCellProps {
  lastMeeting?: string | null;
  lastMeetingDone?: boolean;
  nextMeeting?: string | null;
  nextMeetingScheduled?: boolean;
}

/**
 * Consolidated Meetings Cell
 * Shows both last and next meeting status in a compact, scannable format
 *
 * Visual Language:
 * - Green dot = meeting completed/scheduled
 * - Gray dot = no meeting in timeframe
 * - Date shown on hover for context
 */
export const MeetingsCell: React.FC<MeetingsCellProps> = ({
  lastMeeting,
  lastMeetingDone,
  nextMeeting,
  nextMeetingScheduled,
}) => {
  return (
    <div className="flex items-center gap-3">
      {/* Last Meeting Indicator */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors',
              lastMeetingDone
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
            )}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                lastMeetingDone ? 'bg-emerald-500' : 'bg-stone-400'
              )}
            />
            <span>Last</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={8}
          className="bg-popover text-popover-foreground border shadow-lg px-3 py-2"
        >
          <div className="flex items-start gap-2">
            <CalendarCheck className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold mb-0.5">Last Meeting</p>
              {lastMeeting ? (
                <p className="text-sm font-medium">
                  {formatDateWithOrdinal(new Date(lastMeeting), 'dd MMM yyyy')}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">None recorded</p>
              )}
              {lastMeetingDone && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Done within last 7 days
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Next Meeting Indicator */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors',
              nextMeetingScheduled
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
            )}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                nextMeetingScheduled ? 'bg-emerald-500' : 'bg-stone-400'
              )}
            />
            <span>Next</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={8}
          className="bg-popover text-popover-foreground border shadow-lg px-3 py-2"
        >
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold mb-0.5">Next Meeting</p>
              {nextMeeting ? (
                <p className="text-sm font-medium">
                  {formatDateWithOrdinal(new Date(nextMeeting), 'dd MMM yyyy')}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Not scheduled</p>
              )}
              {nextMeetingScheduled && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Scheduled within 14 days
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
