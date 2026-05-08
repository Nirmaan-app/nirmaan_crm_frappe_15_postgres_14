import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useDialogStore } from '@/store/dialogStore';
import { boqNameFormatter } from '@/pages/Home/StatsGrid';
import { cn } from '@/lib/utils';
import { FLOW_BUCKETS } from '../utils/flowBuckets';
import type {
  FlowProjectRow,
  FlowReportData,
  FlowActivityBucketKey,
} from '../types';

interface Props {
  report: FlowReportData;
}

interface SegmentData {
  key: FlowActivityBucketKey;
  label: string;
  count: number;
  pct: number;
  items: FlowProjectRow[];
}

const SEGMENT_BG: Record<FlowActivityBucketKey, string> = {
  active: 'bg-blue-300 dark:bg-blue-800',
  negotiationHold: 'bg-amber-300 dark:bg-amber-800',
  won: 'bg-emerald-400 dark:bg-emerald-700',
  lost: 'bg-rose-400 dark:bg-rose-700',
};

// Text color override per segment so the count reads cleanly on the
// segment's fill in light mode. Light fills (blue-300/amber-300) read
// fine with foreground text; the saturated emerald-400/rose-400 fills
// want white text for contrast.
const SEGMENT_TEXT: Record<FlowActivityBucketKey, string> = {
  active: 'text-foreground',
  negotiationHold: 'text-foreground',
  won: 'text-white dark:text-white',
  lost: 'text-white dark:text-white',
};

const SEGMENT_DOT: Record<FlowActivityBucketKey, string> = {
  active: 'bg-blue-400 dark:bg-blue-700',
  negotiationHold: 'bg-amber-400 dark:bg-amber-700',
  won: 'bg-emerald-500 dark:bg-emerald-600',
  lost: 'bg-rose-500 dark:bg-rose-600',
};

const SEGMENT_ORDER: FlowActivityBucketKey[] = [
  'active',
  'negotiationHold',
  'won',
  'lost',
];

// TODO(human): Pick a Win Rate formula.
//
// Option A — Win Rate (decided): wonCount / (wonCount + lostCount)
//   Standard CRM metric. Ignores in-flight projects, so it answers
//   "of the deals we've actually decided, what share did we win?"
//
// Option B — Closure Rate: wonCount / totalReceived
//   Includes everything in the window, so slow-moving deals drag the
//   number down. Useful when leadership cares about throughput.
//
// Edit the body of computeWinRate to pick one. Return null when the
// denominator is zero so the UI can render "—" instead of a misleading 0%.
const computeWinRate = (
  wonCount: number,
  lostCount: number,
  _totalReceived: number,
): number | null => {
  const decided = wonCount + lostCount;
  if (decided === 0) return null;
  return Math.round((wonCount / decided) * 100);
};

export const FlowDistributionBar = ({ report }: Props) => {
  const { openStatsDetailDialog } = useDialogStore();

  const movedCount = report.moved.length;

  const segments = useMemo<SegmentData[]>(
    () =>
      SEGMENT_ORDER.map((key) => {
        const items = report.buckets[key] ?? [];
        return {
          key,
          label: FLOW_BUCKETS[key].label,
          count: items.length,
          pct:
            movedCount > 0
              ? Math.round((items.length / movedCount) * 100)
              : 0,
          items,
        };
      }),
    [report.buckets, movedCount],
  );

  const wonCount = segments.find((s) => s.key === 'won')?.count ?? 0;
  const lostCount = segments.find((s) => s.key === 'lost')?.count ?? 0;
  const decided = wonCount + lostCount;
  const winRate = computeWinRate(wonCount, lostCount, 0);
  const lostItems =
    segments.find((s) => s.key === 'lost')?.items ?? [];
  const lostPct =
    movedCount > 0 ? Math.round((lostCount / movedCount) * 100) : 0;

  const handleOpen = (label: string, items: FlowProjectRow[]) => {
    if (items.length === 0) return;
    openStatsDetailDialog({
      title: `${label} (${items.length})`,
      items: items.map((p) => ({
        name: boqNameFormatter(p),
        id: p.name,
        type: 'BOQ' as const,
        data: p,
      })),
    });
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Section 1 — Win Rate KPI strip */}
      <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Win Rate
          </div>
          <div className="mt-0.5 text-2xl font-bold tabular-nums text-emerald-600">
            {winRate === null ? '—' : `${winRate}%`}
          </div>
        </div>
        <div className="space-y-0.5 text-right text-xs text-muted-foreground">
          <div className="tabular-nums">
            <span className="font-semibold text-foreground">{wonCount}</span> won
            <span className="mx-1">/</span>
            <span className="font-semibold text-foreground">{decided}</span> decided
          </div>
          <div className="tabular-nums">
            <span className="font-semibold text-rose-600">{lostCount}</span> lost (drop-off)
          </div>
        </div>
      </div>

      {/* Section 2 — Distribution bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Distribution
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">{movedCount}</span>{' '}
            project{movedCount === 1 ? '' : 's'} moved
          </div>
        </div>

        {movedCount === 0 ? (
          <div
            className="flex h-10 w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground"
            role="img"
            aria-label="No projects moved in this window"
          >
            No projects moved in this window
          </div>
        ) : (
          <>
            <div
              className="flex h-10 w-full overflow-hidden rounded-md"
              role="group"
              aria-label="Distribution of moved projects across outcome buckets"
            >
              {segments
                .filter((s) => s.count > 0)
                .map((s) => {
                  const widthPct = (s.count / movedCount) * 100;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => handleOpen(s.label, s.items)}
                      className={cn(
                        'flex h-full items-center justify-center text-sm font-semibold tabular-nums transition-opacity hover:opacity-80 cursor-pointer',
                        SEGMENT_BG[s.key],
                        SEGMENT_TEXT[s.key],
                      )}
                      style={{ width: `${widthPct}%` }}
                      aria-label={`${s.label}: ${s.count} projects (${s.pct}%)`}
                    >
                      {s.count}
                    </button>
                  );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {segments
                .filter((s) => s.count > 0)
                .map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center gap-1.5 tabular-nums"
                  >
                    <span
                      className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        SEGMENT_DOT[s.key],
                      )}
                      aria-hidden="true"
                    />
                    <span>
                      {s.label} —{' '}
                      <span className="font-semibold text-foreground">
                        {s.count}
                      </span>{' '}
                      ({s.pct}%)
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Section 3 — Lost drop-off card */}
      {lostCount > 0 && (
        <button
          type="button"
          onClick={() =>
            handleOpen(FLOW_BUCKETS.lost.label, lostItems)
          }
          className={cn(
            'flex w-full items-center justify-between rounded-md border-l-4 border-rose-500 bg-rose-50 px-3 py-2 text-left transition-colors',
            'dark:bg-rose-950/30',
            'cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-950/50',
          )}
          aria-label={`${FLOW_BUCKETS.lost.label} drop-off`}
        >
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Drop-off
            </div>
            <div className="text-sm font-medium text-rose-900 dark:text-rose-200">
              {FLOW_BUCKETS.lost.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-400">
              {lostCount}
            </div>
            <div className="text-xs tabular-nums text-rose-600 dark:text-rose-500">
              {lostPct}%
            </div>
          </div>
        </button>
      )}
    </Card>
  );
};
