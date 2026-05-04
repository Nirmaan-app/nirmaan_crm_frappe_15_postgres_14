import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import type {
  FlowProjectRow,
  FlowReportData,
  UseFlowReportArgs,
} from '../types';

export const useFlowReport = ({ salespersons }: UseFlowReportArgs) => {
  const { windowStart, windowEnd, windowLabel } = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(subMonths(today, 3));
    return {
      windowStart: format(start, 'yyyy-MM-dd'),
      windowEnd: format(today, 'yyyy-MM-dd'),
      windowLabel: `${format(start, 'MMM yyyy')} – ${format(today, 'MMM yyyy')}`,
    };
  }, []);

  const filters = useMemo(() => {
    const f: Array<[string, string, string | string[]]> = [
      ['creation', '>=', windowStart],
      ['creation', '<=', `${windowEnd} 23:59:59`],
    ];
    if (salespersons.length > 0) {
      f.push(['assigned_sales', 'in', salespersons]);
    }
    return f;
  }, [windowStart, windowEnd, salespersons]);

  const swrKey = useMemo(() => {
    const s = [...salespersons].sort().join(',') || 'all';
    return `flow-report-${windowStart}-${windowEnd}-${s}`;
  }, [windowStart, windowEnd, salespersons]);

  const { data, error, isLoading, mutate } = useFrappeGetDocList<FlowProjectRow>(
    'CRM BOQ',
    {
      fields: [
        'name',
        'boq_name',
        'company',
        'boq_status',
        'creation',
        'boq_value',
        'assigned_sales',
      ],
      filters: filters as never,
      orderBy: { field: 'creation', order: 'desc' },
      limit: 0,
    },
    swrKey
  );

  const report = useMemo<FlowReportData | undefined>(() => {
    if (!data) return undefined;
    return {
      windowStart,
      windowEnd,
      windowLabel,
      totalReceived: data.length,
      projects: data,
    };
  }, [data, windowStart, windowEnd, windowLabel]);

  return {
    report,
    isLoading,
    error,
    refresh: mutate,
  };
};
