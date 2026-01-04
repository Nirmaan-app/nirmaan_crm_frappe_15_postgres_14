// src/pages/Companies/components/cells/RemarksCell.tsx
// Clean remarks preview with expandable tooltip
// Touch-friendly: tap to see all remarks on mobile

import React from 'react';
import { TouchTooltip } from '@/components/ui/touch-tooltip';
import { MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemarksCellProps {
  remarks?: string[];
}

/**
 * Remarks Cell
 * Shows a preview of the latest remark with full history on hover/tap
 * Touch-friendly: tap to see all remarks
 */
export const RemarksCell: React.FC<RemarksCellProps> = ({ remarks = [] }) => {
  if (!remarks || remarks.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const latestRemark = remarks[0];
  const truncated = latestRemark.length > 40
    ? latestRemark.slice(0, 40) + '…'
    : latestRemark;

  const tooltipContent = (
    <div className="space-y-3 min-w-[240px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <MessageSquareText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Recent Remarks</span>
        <span className="text-xs text-muted-foreground ml-auto">{remarks.length} total</span>
      </div>

      {/* Remarks list */}
      <ul className="space-y-3">
        {remarks.map((remark, i) => (
          <li
            key={i}
            className={cn(
              'text-sm leading-relaxed pl-3 border-l-2',
              i === 0
                ? 'border-primary text-foreground'
                : 'border-muted text-muted-foreground'
            )}
          >
            {remark}
            {i === 0 && (
              <span className="block text-[10px] text-muted-foreground mt-1">
                Most recent
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <TouchTooltip content={tooltipContent} side="left" align="start">
      <button
        type="button"
        className="flex items-start gap-2 text-left group max-w-full cursor-default"
      >
        {/* Icon with inline count */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          <MessageSquareText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {remarks.length > 1 && (
            <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground bg-muted px-1 rounded">
              {remarks.length}
            </span>
          )}
        </div>

        {/* Truncated preview */}
        <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors line-clamp-2">
          {truncated}
        </p>
      </button>
    </TouchTooltip>
  );
};
