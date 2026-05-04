import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { STATUS_GROUP, type CanonicalStatus } from '../utils/cohortStatusGroups';
import { cn } from '@/lib/utils';
import type { SalesCohortReportData } from '../types';

interface Props {
  report: SalesCohortReportData;
}

interface Tile {
  label: string;
  value: number;
  pct?: number;
  accent?: 'destructive' | 'muted';
  tooltip?: string;
}

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
      { label: 'Won', value: wonCount, pct: pct(wonCount), accent: 'destructive' },
      {
        label: 'Lost',
        value: lostCount,
        pct: pct(lostCount),
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tiles.map((t) => (
        <Card key={t.label} className="p-4">
          <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t.label}
            {t.tooltip && (
              <Tooltip>
                <TooltipTrigger
                  className="cursor-help inline-flex items-center"
                  aria-label={`Info about ${t.label}`}
                >
                  <Info className="h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>{t.tooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={cn(
                'tabular-nums text-2xl md:text-3xl font-bold',
                t.accent === 'destructive' && 'text-destructive',
              )}
            >
              {t.value}
            </span>
            {t.pct !== undefined && (
              <span className="tabular-nums text-sm text-muted-foreground">
                {t.pct}%
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
