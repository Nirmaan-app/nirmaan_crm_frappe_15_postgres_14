import { useFrappeGetCall } from 'frappe-react-sdk';
import { useMemo } from 'react';
import type { FlowReportData, UseFlowReportArgs, FlowProjectRow } from '../types';

interface ServerResponse {
  window_start: string;
  window_end: string;
  window_label: string;
  selected_months: string[];
  received: FlowProjectRow[];
  moved: FlowProjectRow[];
  buckets: {
    active: FlowProjectRow[];
    negotiationHold: FlowProjectRow[];
    won: FlowProjectRow[];
    lost: FlowProjectRow[];
  };
}

export const useFlowReport = ({ windowMonths, salespersons }: UseFlowReportArgs) => {
  const swrKey = useMemo(() => {
    const m = [...windowMonths].sort().join(',');
    const s = [...salespersons].sort().join(',') || 'all';
    return `flow-report-${m}-${s}`;
  }, [windowMonths, salespersons]);

  const { data, error, isLoading, mutate } = useFrappeGetCall<{ message: ServerResponse }>(
    'nirmaan_crm.api.reports.flow_report.get_flow_report',
    {
      window_months: JSON.stringify(windowMonths),
      assigned_sales: JSON.stringify(salespersons),
    },
    windowMonths.length ? swrKey : null,
    { revalidateOnFocus: false },
  );

  const report = useMemo<FlowReportData | undefined>(() => {
    const msg = data?.message;
    if (!msg) return undefined;
    return {
      windowStart: msg.window_start,
      windowEnd: msg.window_end,
      windowLabel: msg.window_label,
      selectedMonths: msg.selected_months,
      received: msg.received,
      moved: msg.moved,
      buckets: msg.buckets,
    };
  }, [data]);

  return {
    report,
    isLoading,
    error,
    refresh: mutate,
  };
};
