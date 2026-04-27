import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStateSyncedWithParams } from '@/hooks/useSearchParamsManager';
import { useSalesCohortReport } from './hooks/useSalesCohortReport';
import { CohortMonthSelector } from './components/CohortMonthSelector';
import { SalesPersonSelector } from './components/SalesPersonSelector';
import { CohortMatrix } from './components/CohortMatrix';
import { CohortSummaryStrip } from './components/CohortSummaryStrip';
import { CohortEmptyState } from './components/CohortEmptyState';

export const SalesCohortReport = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const isAdmin = role === 'Nirmaan Admin User Profile';

  const defaultMonth = format(subMonths(new Date(), 1), 'yyyy-MM');
  const [cohortMonth, setCohortMonth] = useStateSyncedWithParams<string>(
    'cohort',
    defaultMonth
  );
  const [salesperson, setSalesperson] = useStateSyncedWithParams<string>(
    'sales',
    ''
  );

  const effectiveSalesperson = isAdmin ? salesperson || null : null;

  const { report, projectsByName, isLoading, error } = useSalesCohortReport({
    cohortMonth: cohortMonth || defaultMonth,
    salesperson: effectiveSalesperson,
  });

  const currentMonth = format(new Date(), 'yyyy-MM');
  const isCurrentMonthCohort = cohortMonth === currentMonth;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/reports')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Sales Cohort Report
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track how projects added in a given month progress through statuses
            over time.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <CohortMonthSelector
          value={cohortMonth || defaultMonth}
          onChange={(v) => setCohortMonth(v)}
        />
        {isAdmin && (
          <SalesPersonSelector
            value={salesperson || ''}
            onChange={(v) => setSalesperson(v)}
          />
        )}
      </div>

      {isCurrentMonthCohort && !isLoading && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This cohort is still forming. Column count will grow each month.
        </div>
      )}

      {isLoading && <SalesCohortLoadingSkeleton />}

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load report: {error.message || 'Unknown error'}
        </div>
      )}

      {!isLoading && !error && report && report.cohort_size === 0 && (
        <CohortEmptyState
          title={`No projects added in ${report.cohort_label}`}
          subtitle="Try selecting a different month or salesperson."
        />
      )}

      {!isLoading && !error && report && report.cohort_size > 0 && (
        <>
          <CohortSummaryStrip report={report} />
          <CohortMatrix report={report} projectsByName={projectsByName} />
        </>
      )}
    </div>
  );
};

const SalesCohortLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
    <Skeleton className="h-72 w-full" />
  </div>
);

export default SalesCohortReport;
