import { useFrappeGetCall } from 'frappe-react-sdk';
import { useMemo } from 'react';
import type {
  SalesCohortReportData,
  CohortProjectRow,
  UseSalesCohortReportArgs,
} from '../types';

export const useSalesCohortReport = ({
  cohortMonth,
  salesperson,
}: UseSalesCohortReportArgs) => {
  const swrKey = `cohort-report-${cohortMonth}-${salesperson || 'all'}`;

  const { data, error, isLoading, mutate } = useFrappeGetCall<{
    message: SalesCohortReportData;
  }>(
    'nirmaan_crm.api.reports.sales_cohort.get_sales_cohort_report',
    {
      cohort_month: cohortMonth,
      ...(salesperson ? { assigned_sales: salesperson } : {}),
    },
    swrKey,
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
