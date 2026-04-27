export interface CohortMonthSpec {
  key: string;
  label: string;
  end_date: string;
  is_cohort_month: boolean;
}

export interface CohortProjectRow {
  name: string;
  boq_name: string;
  company: string;
  company_name: string;
  boq_status: string;
  creation: string;
  boq_value?: string;
  assigned_sales?: string;
}

export interface CohortMatrix {
  [monthKey: string]: { [status: string]: string[] };
}

export interface SalesCohortReportData {
  cohort_month: string;
  cohort_label: string;
  cohort_size: number;
  salesperson: string | null;
  statuses: string[];
  months: CohortMonthSpec[];
  projects: CohortProjectRow[];
  matrix: CohortMatrix;
}

export interface UseSalesCohortReportArgs {
  cohortMonth: string;
  salesperson?: string | null;
}
