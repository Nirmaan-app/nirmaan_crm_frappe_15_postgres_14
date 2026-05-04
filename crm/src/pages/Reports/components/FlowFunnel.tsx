import { useMemo } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDialogStore } from '@/store/dialogStore';
import { boqNameFormatter } from '@/pages/Home/StatsGrid';
import { cn } from '@/lib/utils';
import type { FlowProjectRow } from '../types';
import type { CanonicalStatus } from '../utils/cohortStatusGroups';
import type { FlowBucketDef, FlowBucketKey } from '../utils/flowBuckets';

interface Props {
  projects: FlowProjectRow[];
  total: number;
  stages: readonly FlowBucketDef[];
  drops: readonly FlowBucketDef[];
}

interface StageData extends FlowBucketDef {
  count: number;
  pct: number;
  filtered: FlowProjectRow[];
}

const filterByStatuses = (
  projects: FlowProjectRow[],
  statuses: readonly CanonicalStatus[] | null,
): FlowProjectRow[] => {
  if (statuses === null) return projects;
  const allowed = new Set<string>(statuses);
  return projects.filter((p) => allowed.has(p.boq_status));
};

const STAGE_FILL: Record<FlowBucketKey, string> = {
  received: 'fill-slate-300 dark:fill-slate-700',
  active: 'fill-blue-300 dark:fill-blue-800',
  negotiationHold: 'fill-amber-300 dark:fill-amber-800',
  won: 'fill-emerald-400 dark:fill-emerald-700',
  lost: 'fill-rose-400 dark:fill-rose-700',
};

const SVG_W = 320;
const STAGE_H = 64;

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

export const FlowFunnel = ({ projects, total, stages, drops }: Props) => {
  const { openStatsDetailDialog } = useDialogStore();

  const stageData = useMemo<StageData[]>(
    () =>
      stages.map((s) => {
        const filtered = filterByStatuses(projects, s.statuses);
        return {
          ...s,
          count: filtered.length,
          pct: total > 0 ? Math.round((filtered.length / total) * 100) : 0,
          filtered,
        };
      }),
    [stages, projects, total],
  );

  const dropData = useMemo<StageData[]>(
    () =>
      drops.map((d) => {
        const filtered = filterByStatuses(projects, d.statuses);
        return {
          ...d,
          count: filtered.length,
          pct: total > 0 ? Math.round((filtered.length / total) * 100) : 0,
          filtered,
        };
      }),
    [drops, projects, total],
  );

  const wonCount = stageData.find((s) => s.key === 'won')?.count ?? 0;
  const lostCount = dropData.reduce((acc, d) => acc + d.count, 0);
  const decided = wonCount + lostCount;
  const winRate = computeWinRate(wonCount, lostCount, total);

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

  const svgHeight = stageData.length * STAGE_H;
  const safeTotal = total > 0 ? total : 1;

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <div className="flex flex-col">
          {stageData.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-end pr-2"
              style={{ height: STAGE_H }}
            >
              <div className="flex items-center justify-end gap-1 text-right text-sm font-medium">
                {s.label}
                {s.tooltip && (
                  <Tooltip>
                    <TooltipTrigger
                      className="inline-flex cursor-help items-center text-muted-foreground"
                      aria-label={`Info about ${s.label}`}
                    >
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent side="left">{s.tooltip}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${SVG_W} ${svgHeight}`}
          className="h-auto"
          style={{ width: SVG_W }}
          role="img"
          aria-label="Sales funnel visualization"
        >
          {stageData.map((s, i) => {
            const prevCount = i === 0 ? total : stageData[i - 1].count;
            const topW = (prevCount / safeTotal) * SVG_W;
            const botW = (s.count / safeTotal) * SVG_W;
            const yT = i * STAGE_H;
            const yB = (i + 1) * STAGE_H;
            const points = [
              [(SVG_W - topW) / 2, yT],
              [(SVG_W + topW) / 2, yT],
              [(SVG_W + botW) / 2, yB],
              [(SVG_W - botW) / 2, yB],
            ]
              .map((p) => p.join(','))
              .join(' ');
            const clickable = s.count > 0;
            return (
              <g key={s.key}>
                <polygon
                  points={points}
                  className={cn(
                    STAGE_FILL[s.key],
                    'transition-opacity',
                    clickable && 'cursor-pointer hover:opacity-80',
                  )}
                  onClick={() => handleOpen(s.label, s.filtered)}
                />
                <text
                  x={SVG_W / 2}
                  y={yT + STAGE_H / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-foreground text-base font-bold tabular-nums"
                >
                  {s.count}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col">
          {stageData.map((s) => (
            <div
              key={s.key}
              className="flex items-center pl-2"
              style={{ height: STAGE_H }}
            >
              <span className="text-sm tabular-nums text-muted-foreground">
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {dropData.map((d) => {
        const clickable = d.count > 0;
        return (
          <button
            key={d.key}
            type="button"
            onClick={() => handleOpen(d.label, d.filtered)}
            disabled={!clickable}
            className={cn(
              'flex w-full items-center justify-between rounded-md border-l-4 border-rose-500 bg-rose-50 px-3 py-2 text-left transition-colors',
              'dark:bg-rose-950/30',
              clickable
                ? 'cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-950/50'
                : 'cursor-not-allowed opacity-60',
            )}
            aria-label={`${d.label} drop-off`}
          >
            <div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Drop-off
              </div>
              <div className="text-sm font-medium text-rose-900 dark:text-rose-200">
                {d.label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-400">
                {d.count}
              </div>
              <div className="text-xs tabular-nums text-rose-600 dark:text-rose-500">
                {d.pct}%
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
