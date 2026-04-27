import { useFrappeGetCall } from 'frappe-react-sdk';
import { useMemo } from 'react';
import type {
  SalesCohortReportData,
  CohortProjectRow,
  UseSalesCohortReportArgs,
} from '../types';

export const useSalesCohortReport = ({
  cohortMonths,
  salespersons,
}: UseSalesCohortReportArgs) => {
  const swrKey = useMemo(() => {
    const m = [...cohortMonths].sort().join(',');
    const s = [...salespersons].sort().join(',') || 'all';
    return `cohort-report-${m}-${s}`;
  }, [cohortMonths, salespersons]);

  const { data, error, isLoading, mutate } = useFrappeGetCall<{
    message: SalesCohortReportData;
  }>(
    'nirmaan_crm.api.reports.sales_cohort.get_sales_cohort_report',
    {
      cohort_months: JSON.stringify(cohortMonths),
      assigned_sales: JSON.stringify(salespersons),
    },
    cohortMonths.length ? swrKey : null,
    { revalidateOnFocus: false }
  );

  const report = data?.message;

  const projectsByName = useMemo(() => {
    const map = new Map<string, CohortProjectRow>();
    report?.projects.forEach((p) => map.set(p.name, p));
    return map;
  }, [report]);

  return {
    report,
    projectsByName,
    isLoading,
    error,
    refresh: mutate,
  };
};
