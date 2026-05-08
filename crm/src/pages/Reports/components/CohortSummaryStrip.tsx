import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { STATUS_GROUP, type CanonicalStatus } from '../utils/cohortStatusGroups';
import { cn } from '@/lib/utils';
import type { SalesCohortReportData } from '../types';

interface Props {
  report: SalesCohortReportData;
}

type TileAccent = 'success' | 'destructive' | 'muted';

interface Tile {
  label: string;
  value: number;
  pct?: number;
  accent?: TileAccent;
  tooltip?: string;
}

// Single chromatic accent per tile via 2px left rail. Numbers, labels and
// borders stay neutral so color earns its place by being scarce.
const railClass = (accent?: TileAccent) => {
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

export const CohortSummaryStrip = ({ report }: Props) => {
  const tiles = useMemo<Tile[]>(() => {
    const latestMonth = report.months[report.months.length - 1];
    const latestBucket = latestMonth ? report.matrix[latestMonth.key] ?? {} : {};

    const countIn = (statuses: readonly CanonicalStatus[]) =>
      statuses.reduce((sum, s) => sum + (latestBucket[s]?.length ?? 0), 0);

    const wonCount = countIn(STATUS_GROUP.won);
    const lostCount = countIn(STATUS_GROUP.lost);
    const activeCount = countIn(STATUS_GROUP.active);
    const total = report.cohort_size;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

    return [
      { label: 'Cohort Size', value: total },
      { label: 'Won', value: wonCount, pct: pct(wonCount), accent: 'success' },
      {
        label: 'Lost',
        value: lostCount,
        pct: pct(lostCount),
        accent: 'muted',
        tooltip: `Includes: ${STATUS_GROUP.lost.join(', ')}`,
      },
      {
        label: 'In Pipeline',
        value: activeCount,
        pct: pct(activeCount),
        tooltip: `Includes: ${STATUS_GROUP.active.join(', ')}`,
      },
    ];
  }, [report]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className={cn(
            'flex flex-col rounded-md border border-border bg-background',
            'border-l-[2px]',
            railClass(t.accent),
            'px-4 py-3.5',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.label}
            </span>
            {t.tooltip && (
              <Tooltip>
                <TooltipTrigger
                  aria-label={`Info about ${t.label}`}
                  className="cursor-help inline-flex items-center text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                >
                  <Info className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>{t.tooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="mt-3 text-[26px] font-medium leading-none tracking-tight tabular-nums text-foreground">
            {t.value}
          </div>

          {t.pct !== undefined && (
            <div className="mt-2 flex items-baseline gap-1 text-[11px] tabular-nums text-muted-foreground">
              <span className="font-semibold text-foreground/80">{t.pct}%</span>
              <span className="text-muted-foreground/80">of cohort</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
