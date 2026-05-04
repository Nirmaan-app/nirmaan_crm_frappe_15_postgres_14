import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStateSyncedWithParams } from '@/hooks/useSearchParamsManager';
import { useFlowReport } from './hooks/useFlowReport';
import { SalesPersonSelector } from './components/SalesPersonSelector';
import { CohortEmptyState } from './components/CohortEmptyState';
import { FlowMetricTile } from './components/FlowMetricTile';
import { FlowFunnel } from './components/FlowFunnel';
import {
  FLOW_BUCKETS,
  FUNNEL_DROPS,
  FUNNEL_STAGES,
  type FlowBucketDef,
} from './utils/flowBuckets';
import type { CanonicalStatus } from './utils/cohortStatusGroups';
import type { FlowProjectRow, FlowReportData } from './types';

const filterByBucket = (
  projects: FlowProjectRow[],
  bucket: FlowBucketDef
): FlowProjectRow[] => {
  if (bucket.statuses === null) return projects;
  const allowed = bucket.statuses;
  return projects.filter((p) =>
    allowed.includes(p.boq_status as CanonicalStatus)
  );
};

export const FlowReport = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'Nirmaan Admin User Profile';

  const [salesRaw, setSalesRaw] = useStateSyncedWithParams<string>('sales', '');
  const salespersons = useMemo(
    () => (salesRaw ? salesRaw.split(',').filter(Boolean) : []),
    [salesRaw]
  );
  const setSalespersons = (next: string[]) => setSalesRaw(next.join(','));

  const effectiveSalespersons = isAdmin ? salespersons : [];

  const { report, isLoading, error } = useFlowReport({
    salespersons: effectiveSalespersons,
  });

  const primaryBuckets = FLOW_BUCKETS.filter((b) => b.row === 'primary');
  const secondaryBuckets = FLOW_BUCKETS.filter((b) => b.row === 'secondary');

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
            Outcome funnel for projects received over the last ~3 months.
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex flex-col md:flex-row gap-3">
          <SalesPersonSelector value={salespersons} onChange={setSalespersons} />
        </div>
      )}

      {isLoading && <FlowLoadingSkeleton />}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load report: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && report && (
        <FlowBody
          report={report}
          primaryBuckets={primaryBuckets}
          secondaryBuckets={secondaryBuckets}
        />
      )}
    </div>
  );
};

interface FlowBodyProps {
  report: FlowReportData;
  primaryBuckets: FlowBucketDef[];
  secondaryBuckets: FlowBucketDef[];
}

const FlowBody = ({ report, primaryBuckets, secondaryBuckets }: FlowBodyProps) => {
  if (FLOW_BUCKETS.length === 0) {
    return (
      <CohortEmptyState
        title="Flow buckets not configured"
        subtitle="Define FLOW_BUCKETS in src/pages/Reports/utils/flowBuckets.ts to render this report."
      />
    );
  }

  if (report.totalReceived === 0) {
    return (
      <CohortEmptyState
        title={`No projects received in ${report.windowLabel}`}
        subtitle="Try clearing salesperson filters or check back later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Window: <span className="font-medium text-foreground">{report.windowLabel}</span>
        <span className="mx-2">•</span>
        <span className="font-medium text-foreground">{report.totalReceived}</span> projects
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <header className="flex items-center justify-between border-b pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tile View
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Current
            </span>
          </header>
          <div className="space-y-3">
            {primaryBuckets.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {primaryBuckets.map((bucket) => (
                  <FlowMetricTile
                    key={bucket.key}
                    def={bucket}
                    projects={filterByBucket(report.projects, bucket)}
                    total={report.totalReceived}
                    showPct={bucket.key !== 'received'}
                  />
                ))}
              </div>
            )}

            {secondaryBuckets.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {secondaryBuckets.map((bucket) => (
                  <FlowMetricTile
                    key={bucket.key}
                    def={bucket}
                    projects={filterByBucket(report.projects, bucket)}
                    total={report.totalReceived}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <header className="flex items-center justify-between border-b pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Funnel View
            </h2>
            <span className="text-[10px] uppercase tracking-wider text-emerald-600">
              New
            </span>
          </header>
          <Card className="p-4">
            <FlowFunnel
              projects={report.projects}
              total={report.totalReceived}
              stages={FUNNEL_STAGES}
              drops={FUNNEL_DROPS}
            />
          </Card>
        </section>
      </div>
    </div>
  );
};

const FlowLoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-4 w-64" />
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`p-${i}`} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-80" />
      </div>
    </div>
  </div>
);

export default FlowReport;
