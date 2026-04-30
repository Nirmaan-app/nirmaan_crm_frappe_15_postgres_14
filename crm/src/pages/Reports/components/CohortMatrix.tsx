import { CohortMatrixCell } from './CohortMatrixCell';
import { useStatusStyles } from '@/hooks/useStatusStyles';
import { CANONICAL_STATUSES } from '../utils/cohortStatusGroups';
import { formatCohortRangeLabel, getLatestCohortKey } from '../utils/cohortRange';
import { cn } from '@/lib/utils';
import type { SalesCohortReportData, CohortProjectRow } from '../types';

interface Props {
  report: SalesCohortReportData;
  projectsByName: Map<string, CohortProjectRow>;
}

export const CohortMatrix = (props: Props) => {
  const isRangeMode = props.report.cohort_months.length > 1;
  return isRangeMode ? <RangeMatrix {...props} /> : <TimelineMatrix {...props} />;
};

const TimelineMatrix = ({ report, projectsByName }: Props) => {
  const getStatusClass = useStatusStyles('boq');
  const monthCount = report.months.length;
  const rowStatuses = CANONICAL_STATUSES;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
      <div
        className="grid min-w-fit"
        style={{
          gridTemplateColumns: `200px repeat(${monthCount}, minmax(120px, 1fr))`,
        }}
      >
        <div className="sticky left-0 z-10 bg-muted/40 border-b border-r border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        {report.months.map(m => {
          const monthTotal = Object.values(report.matrix[m.key] || {}).reduce(
            (sum, arr) => sum + arr.length,
            0
          );
          return (
            <div
              key={m.key}
              className={cn(
                'border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center',
                m.is_cohort_month && 'bg-destructive/5 text-destructive'
              )}
            >
              <div>{m.label}</div>
              <div className="text-[10px] font-normal normal-case tracking-normal opacity-80 mt-0.5">
                {m.is_cohort_month ? `Cohort · ${monthTotal}` : `Total · ${monthTotal}`}
              </div>
            </div>
          );
        })}

        {rowStatuses.map((status, idx) => (
          <div key={status} className="contents">
            <div
              className={cn(
                'sticky left-0 z-10 bg-card border-r border-border/60 px-4 py-3 flex items-center',
                idx < rowStatuses.length - 1 && 'border-b border-border/40'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border',
                  getStatusClass(status)
                )}
              >
                {status}
              </span>
            </div>
            {report.months.map(m => {
              const boqNames = report.matrix[m.key]?.[status] ?? [];
              return (
                <CohortMatrixCell
                  key={`${m.key}-${status}`}
                  boqNames={boqNames}
                  monthLabel={m.label}
                  status={status}
                  projectsByName={projectsByName}
                  className={cn(idx < rowStatuses.length - 1 && 'border-b border-border/40')}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const RangeMatrix = ({ report, projectsByName }: Props) => {
  const getStatusClass = useStatusStyles('boq');
  const rowStatuses = CANONICAL_STATUSES;
  const latestKey = getLatestCohortKey(report.cohort_months);
  const cohortBucket = report.matrix[latestKey] ?? {};
  const rangeLabel = formatCohortRangeLabel(report.cohort_months);
  const cohortTotal = Object.values(cohortBucket).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  // Months strictly after the cohort range, up to today — show progression.
  const trailingMonths = report.months.filter(
    (m) => !m.is_cohort_month && m.key > latestKey
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
      <div
        className="grid min-w-fit"
        style={{
          gridTemplateColumns: `200px minmax(160px, 1fr)${
            trailingMonths.length
              ? ` repeat(${trailingMonths.length}, minmax(120px, 1fr))`
              : ''
          }`,
        }}
      >
        <div className="sticky left-0 z-10 bg-muted/40 border-b border-r border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </div>
        <div className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center bg-destructive/5 text-destructive">
          <div>{rangeLabel}</div>
          <div className="text-[10px] font-normal normal-case tracking-normal opacity-80 mt-0.5">
            Cohort · {cohortTotal}
          </div>
        </div>
        {trailingMonths.map((m) => {
          const monthTotal = Object.values(report.matrix[m.key] || {}).reduce(
            (sum, arr) => sum + arr.length,
            0
          );
          return (
            <div
              key={m.key}
              className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center"
            >
              <div>{m.label}</div>
              <div className="text-[10px] font-normal normal-case tracking-normal opacity-80 mt-0.5">
                Total · {monthTotal}
              </div>
            </div>
          );
        })}

        {rowStatuses.map((status, idx) => (
          <div key={status} className="contents">
            <div
              className={cn(
                'sticky left-0 z-10 bg-card border-r border-border/60 px-4 py-3 flex items-center',
                idx < rowStatuses.length - 1 && 'border-b border-border/40'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border',
                  getStatusClass(status)
                )}
              >
                {status}
              </span>
            </div>
            <CohortMatrixCell
              boqNames={cohortBucket[status] ?? []}
              monthLabel={rangeLabel}
              status={status}
              projectsByName={projectsByName}
              className={cn(idx < rowStatuses.length - 1 && 'border-b border-border/40')}
            />
            {trailingMonths.map((m) => {
              const boqNames = report.matrix[m.key]?.[status] ?? [];
              return (
                <CohortMatrixCell
                  key={`${m.key}-${status}`}
                  boqNames={boqNames}
                  monthLabel={m.label}
                  status={status}
                  projectsByName={projectsByName}
                  className={cn(idx < rowStatuses.length - 1 && 'border-b border-border/40')}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
