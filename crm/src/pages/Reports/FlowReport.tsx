import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStateSyncedWithParams } from '@/hooks/useSearchParamsManager';
import { useFlowReport } from './hooks/useFlowReport';
import { CohortMonthSelector } from './components/CohortMonthSelector';
import { SalesPersonSelector } from './components/SalesPersonSelector';
import { CohortEmptyState } from './components/CohortEmptyState';
import { FlowMetricTile } from './components/FlowMetricTile';
// import { FlowDistributionBar } from './components/FlowDistributionBar';
import { FLOW_BUCKETS } from './utils/flowBuckets';
import type { FlowReportData } from './types';

const computeLast3MonthKeys = (): string[] => {
  const now = startOfMonth(new Date());
  // earliest -> latest order
  return [2, 1, 0].map((i) => format(subMonths(now, i), 'yyyy-MM'));
};

export const FlowReport = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'Nirmaan Admin User Profile';

  const [windowRaw, setWindowRaw] = useStateSyncedWithParams<string>('window', '');
  const [salesRaw, setSalesRaw] = useStateSyncedWithParams<string>('sales', '');

  const windowMonths = useMemo(
    () => (windowRaw ? windowRaw.split(',').filter(Boolean) : []),
    [windowRaw]
  );
  const salespersons = useMemo(
    () => (salesRaw ? salesRaw.split(',').filter(Boolean) : []),
    [salesRaw]
  );

  // Seed last-3-months on first mount only when URL has no `window` param.
  // If the user later clears the selector, do NOT auto-reseed — empty is intentional.
  useEffect(() => {
    if (!windowRaw) {
      const seed = computeLast3MonthKeys();
      setWindowRaw(seed.join(','));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setWindowMonths = (next: string[]) => setWindowRaw(next.join(','));
  const setSalespersons = (next: string[]) => setSalesRaw(next.join(','));

  const effectiveSalespersons = isAdmin ? salespersons : [];

  const { report, isLoading, error } = useFlowReport({
    windowMonths,
    salespersons: effectiveSalespersons,
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Flow Report
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Activity-based outcome view for the selected window.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <CohortMonthSelector
          value={windowMonths}
          onChange={setWindowMonths}
          label="Window Months"
        />
        {isAdmin && (
          <SalesPersonSelector value={salespersons} onChange={setSalespersons} />
        )}
      </div>

      {windowMonths.length === 0 ? (
        <CohortEmptyState
          title="Select at least one window month"
          subtitle="Pick one or more months from the dropdown to load the report."
        />
      ) : isLoading ? (
        <FlowLoadingSkeleton />
      ) : error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load report: {error.message || 'Unknown error'}
        </div>
      ) : !report ? null : report.received.length === 0 && report.moved.length === 0 ? (
        <CohortEmptyState
          title={`No activity in ${report.windowLabel}`}
          subtitle="Try a different window or clear salesperson filters."
        />
      ) : (
        <FlowBody report={report} />
      )}
    </div>
  );
};

interface FlowBodyProps {
  report: FlowReportData;
}

const FlowBody = ({ report }: FlowBodyProps) => {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="font-medium text-foreground">{report.windowLabel}</span>
        <span aria-hidden className="text-muted-foreground/40">/</span>
        <span>
          <span className="tabular-nums font-semibold text-foreground">
            {report.received.length}
          </span>{' '}
          projects received
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FlowMetricTile
          def={FLOW_BUCKETS.received}
          projects={report.received}
        />
        <FlowMetricTile
          def={FLOW_BUCKETS.won}
          projects={report.buckets.won}
          denominator={report.received.length}
        />
        <FlowMetricTile
          def={FLOW_BUCKETS.lost}
          projects={report.buckets.lost}
          denominator={report.received.length}
        />
      </div>

      {/*
        <section className="space-y-3">
          <header className="flex items-center justify-between border-b pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Distribution
            </h2>
          </header>
          <FlowDistributionBar report={report} />
        </section>
      */}
    </div>
  );
};

const FlowLoadingSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="h-3 w-72" />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={`t-${i}`} className="h-[92px] rounded-md" />
      ))}
    </div>
  </div>
);

export default FlowReport;
