// src/pages/Companies/components/cells/BOQsCell.tsx
// Consolidated BOQ indicator - combines Recent/Active/Hot into compact visual badges
// Touch-friendly: tap to see BOQ list on mobile

import React from 'react';
import { Link } from 'react-router-dom';
import { TouchTooltip } from '@/components/ui/touch-tooltip';
import { cn } from '@/lib/utils';
import { FileText, Flame, Activity, Clock } from 'lucide-react';

interface BOQItem {
  name: string;
  boq_name?: string;
}

interface BOQsCellProps {
  recentBOQs?: BOQItem[];    // Last 30 days
  activeBOQs?: BOQItem[];    // Active status
  hotBOQs?: BOQItem[];       // Hot/urgent
}

interface BOQBadgeProps {
  count: number;
  variant: 'recent' | 'active' | 'hot';
  label: string;
  shortLabel: string;
  items: BOQItem[];
  icon: React.ReactNode;
}

const variantStyles = {
  recent: {
    badge: 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700',
    dot: 'bg-stone-500',
    iconColor: 'text-stone-500',
  },
  active: {
    badge: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50',
    dot: 'bg-blue-500',
    iconColor: 'text-blue-500',
  },
  hot: {
    badge: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50',
    dot: 'bg-amber-500',
    iconColor: 'text-amber-500',
  },
};

const BOQBadge: React.FC<BOQBadgeProps> = ({ count, variant, label, shortLabel, items, icon }) => {
  if (count === 0) return null;

  const styles = variantStyles[variant];

  const tooltipContent = (
    <div className="space-y-2 min-w-[200px]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className={styles.iconColor}>{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground ml-auto">{count} total</span>
      </div>

      {/* BOQ List */}
      <ul className="space-y-1.5">
        {items.slice(0, 5).map((item, i) => (
          <li key={item.name || i} className="flex items-center gap-2">
            <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <Link
              to={`/boqs/boq?id=${item.name}`}
              className="text-sm text-foreground hover:text-primary hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {item.boq_name || item.name}
            </Link>
          </li>
        ))}
        {items.length > 5 && (
          <li className="text-xs text-muted-foreground pl-5 pt-1">
            +{items.length - 5} more BOQs
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <TouchTooltip content={tooltipContent} side="bottom" align="start">
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-default transition-colors',
          styles.badge
        )}
      >
        <div className={cn('w-1.5 h-1.5 rounded-full', styles.dot)} />
        <span>{count}</span>
        <span className="hidden sm:inline">{shortLabel}</span>
      </button>
    </TouchTooltip>
  );
};

/**
 * Consolidated BOQs Cell
 * Displays three categories of BOQs as compact, color-coded badges
 * Touch-friendly: tap any badge to see BOQ list
 */
export const BOQsCell: React.FC<BOQsCellProps> = ({
  recentBOQs = [],
  activeBOQs = [],
  hotBOQs = [],
}) => {
  const hasAny = recentBOQs.length > 0 || activeBOQs.length > 0 || hotBOQs.length > 0;

  if (!hasAny) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <BOQBadge
        count={hotBOQs.length}
        variant="hot"
        label="Hot BOQs"
        shortLabel="Hot"
        items={hotBOQs}
        icon={<Flame className="w-4 h-4" />}
      />
      <BOQBadge
        count={activeBOQs.length}
        variant="active"
        label="Active BOQs"
        shortLabel="Active"
        items={activeBOQs}
        icon={<Activity className="w-4 h-4" />}
      />
      <BOQBadge
        count={recentBOQs.length}
        variant="recent"
        label="Recent BOQs (30 days)"
        shortLabel="30d"
        items={recentBOQs}
        icon={<Clock className="w-4 h-4" />}
      />
    </div>
  );
};
