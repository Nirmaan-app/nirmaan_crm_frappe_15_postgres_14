import { ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDialogStore } from '@/store/dialogStore';
import { boqNameFormatter } from '@/pages/Home/StatsGrid';
import { cn } from '@/lib/utils';
import type { FlowBucketDef } from '../utils/flowBuckets';
import type { FlowProjectRow } from '../types';

interface Props {
  def: FlowBucketDef;
  projects: FlowProjectRow[];
  denominator?: number;
  showPct?: boolean;
}

// 2px left rail is the tile's only chromatic surface — color earns its place
// by being scarce. Numbers, labels, and borders stay neutral.
const railClass = (accent: FlowBucketDef['accent']) => {
  switch (accent) {
    case 'success':
      return 'border-l-emerald-500';
    case 'destructive':
      return 'border-l-rose-500';
    case 'muted':
      return 'border-l-slate-300 dark:border-l-slate-600';
    default:
      return 'border-l-slate-200 dark:border-l-slate-800';
  }
};

export const FlowMetricTile = ({ def, projects, denominator, showPct }: Props) => {
  const { openStatsDetailDialog } = useDialogStore();
  const count = projects.length;
  const hasDenominator = denominator !== undefined && denominator > 0;
  const shouldShowPct = showPct === false ? false : (showPct ?? hasDenominator);
  const pct = hasDenominator ? Math.round((count / (denominator as number)) * 100) : 0;
  const isClickable = count > 0;

  const handleClick = () => {
    if (!isClickable) return;
    openStatsDetailDialog({
      title: `${def.label} (${count})`,
      items: projects.map((p) => ({
        name: boqNameFormatter(p),
        id: p.name,
        type: 'BOQ' as const,
        data: p,
      })),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isClickable}
      aria-label={
        shouldShowPct && hasDenominator
          ? `${def.label}: ${count}, ${pct}% of received`
          : `${def.label}: ${count}`
      }
      className={cn(
        'group relative flex flex-col text-left',
        'rounded-md border border-border bg-background',
        'border-l-[2px]',
        railClass(def.accent),
        'px-4 py-3.5 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
        isClickable
          ? 'cursor-pointer hover:bg-muted/30 hover:border-border/80'
          : 'cursor-default opacity-60',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {def.label}
        </span>
        <div className="flex items-center gap-1.5 text-muted-foreground/60">
          {def.tooltip && (
            <Tooltip>
              <TooltipTrigger
                onClick={(e) => e.stopPropagation()}
                aria-label={`Info about ${def.label}`}
                className="cursor-help inline-flex items-center transition-colors hover:text-muted-foreground"
              >
                <Info className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>{def.tooltip}</TooltipContent>
            </Tooltip>
          )}
          {isClickable && (
            <ChevronRight
              aria-hidden
              className={cn(
                'h-3.5 w-3.5 -mr-0.5 -translate-x-0.5 opacity-0 transition-all duration-200',
                'group-hover:translate-x-0 group-hover:opacity-100',
                'group-focus-visible:translate-x-0 group-focus-visible:opacity-100',
              )}
            />
          )}
        </div>
      </div>

      <div className="mt-3 text-[26px] font-medium leading-none tracking-tight tabular-nums text-foreground">
        {count}
      </div>

      {shouldShowPct && hasDenominator && (
        <div className="mt-2 flex items-baseline gap-1 text-[11px] tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground/80">{pct}%</span>
          <span className="text-muted-foreground/80">of received</span>
        </div>
      )}
    </button>
  );
};
