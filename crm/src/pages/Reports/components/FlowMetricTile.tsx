import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDialogStore } from '@/store/dialogStore';
import { boqNameFormatter } from '@/pages/Home/StatsGrid';
import { cn } from '@/lib/utils';
import type { FlowBucketDef } from '../utils/flowBuckets';
import type { FlowProjectRow } from '../types';

interface Props {
  def: FlowBucketDef;
  projects: FlowProjectRow[];
  total: number;
  showPct?: boolean;
}

const accentClass = (accent: FlowBucketDef['accent']) => {
  switch (accent) {
    case 'destructive':
      return 'text-destructive';
    case 'success':
      return 'text-emerald-600';
    case 'muted':
      return 'text-muted-foreground';
    default:
      return '';
  }
};

export const FlowMetricTile = ({ def, projects, total, showPct = true }: Props) => {
  const { openStatsDetailDialog } = useDialogStore();
  const count = projects.length;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const isClickable = count > 0;

  const handleClick = () => {
    if (!isClickable) return;
    const items = projects.map((p) => ({
      name: boqNameFormatter(p),
      id: p.name,
      type: 'BOQ' as const,
      data: p,
    }));
    openStatsDetailDialog({
      title: `${def.label} (${count})`,
      items,
    });
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        'p-4 transition-colors',
        isClickable && 'cursor-pointer hover:bg-muted/40',
        !isClickable && 'opacity-60'
      )}
      aria-disabled={!isClickable}
    >
      <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {def.label}
        {def.tooltip && (
          <Tooltip>
            <TooltipTrigger
              className="cursor-help inline-flex items-center"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Info about ${def.label}`}
            >
              <Info className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent>{def.tooltip}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={cn(
            'tabular-nums text-2xl md:text-3xl font-bold',
            accentClass(def.accent)
          )}
        >
          {count}
        </span>
        {showPct && (
          <span className="tabular-nums text-sm text-muted-foreground">
            {pct}%
          </span>
        )}
      </div>
    </Card>
  );
};
