// src/pages/Companies/components/CompanyTableView.tsx
// Redesigned with minimalist UI - consolidated columns for better scannability

import React, { useMemo } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { ColumnFiltersState, Row } from '@tanstack/react-table';
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { useUserRoleLists } from '@/hooks/useUserRoleLists';
import { Link } from 'react-router-dom';
import { DataTableExportButton } from '@/components/table/data-table-export-button';

// Cell components
import { MeetingStatusBadge, BOQsCell, PriorityBadge, RemarksCell } from './cells';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SelectOption {
  label: string;
  value: string;
}

interface BOQItem {
  name: string;
  boq_name?: string;
}

interface CRMCompany {
  name: string;
  company_name: string;
  company_city?: string;
  company_type?: string;
  website?: string;
  assigned_sales?: string;
  priority?: string;
  last_meeting?: string;
  next_meeting_date?: string;
  next_meeting_id?: string;
  last_meeting_in_7_days?: string;
  next_meeting_in_14_days?: string;
  last_three_remarks_from_tasks?: string[];
  active_boq?: BOQItem[];
  hot_boq?: BOQItem[];
  last_30_days_boqs?: BOQItem[];
}

interface CompanyTableOptions {
  assignedSalesOptions: SelectOption[];
  companyCityOptions: SelectOption[];
  companyPriorityOptions: SelectOption[];
  companyTypeOptions: SelectOption[];
  getUserFullNameByEmail: (email: string) => string | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: Extract filter options from data
// ─────────────────────────────────────────────────────────────────────────────

export const useCompanyTableOptions = (companies: CRMCompany[]): CompanyTableOptions => {
  const { getUserFullNameByEmail } = useUserRoleLists();

  const options = useMemo(() => {
    if (!companies || companies.length === 0) {
      return {
        assignedSalesOptions: [],
        companyCityOptions: [],
        companyTypeOptions: [],
        companyPriorityOptions: [],
      };
    }

    const uniqueValues: { [key: string]: Set<string> } = {
      assigned_sales: new Set(),
      company_city: new Set(),
      company_type: new Set(),
      priority: new Set(),
    };

    companies.forEach(c => {
      c.assigned_sales && uniqueValues.assigned_sales.add(c.assigned_sales);
      c.company_city && uniqueValues.company_city.add(c.company_city);
      c.company_type && uniqueValues.company_type.add(c.company_type);
      c.priority && uniqueValues.priority.add(c.priority);
    });

    return {
      assignedSalesOptions: Array.from(uniqueValues.assigned_sales).map(email => ({
        label: getUserFullNameByEmail(email)?.split(' ')[0] || email,
        value: email,
      })),
      companyCityOptions: Array.from(uniqueValues.company_city).map(name => ({
        label: name,
        value: name,
      })),
      companyTypeOptions: Array.from(uniqueValues.company_type).map(name => ({
        label: name,
        value: name,
      })),
      companyPriorityOptions: Array.from(uniqueValues.priority).map(name => ({
        label: name,
        value: name,
      })),
    };
  }, [companies, getUserFullNameByEmail]);

  return { ...options, getUserFullNameByEmail };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const CompanyTableView = () => {
  const currentUserEmail = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const swrKey = 'all-companies-list_modified';

  const { data, isLoading, error } = useFrappeGetCall<CRMCompany[]>(
    'nirmaan_crm.api.get_modified_crm_company.get_modified_crm_companies',
    undefined,
    swrKey
  );

  const companies = data?.message || [];

  const {
    assignedSalesOptions,
    companyPriorityOptions,
    companyTypeOptions,
    getUserFullNameByEmail,
  } = useCompanyTableOptions(companies);

  // ─────────────────────────────────────────────────────────────────────────
  // Column Definitions - Consolidated from 12 → 6 columns
  // ─────────────────────────────────────────────────────────────────────────

  const columns = useMemo<DataTableColumnDef<CRMCompany>[]>(
    () => [
      // 1. Company (Name + Type stacked)
      {
        accessorKey: 'company_name',
        meta: { title: 'Company', enableSorting: true },
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              to={`/companies/company?id=${row.original.name}`}
              className="text-primary font-medium hover:underline block truncate"
            >
              {row.original.company_name}
            </Link>
            {row.original.company_type && (
              <span className="text-[11px] text-muted-foreground">
                {row.original.company_type}
              </span>
            )}
          </div>
        ),
        filterFn: 'faceted',
      },

      // 2. Owner (Assigned Sales - first name only)
      {
        accessorKey: 'assigned_sales',
        meta: {
          title: 'Owner',
          filterVariant: 'select',
          filterOptions: assignedSalesOptions,
          enableSorting: true,
        },
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.assigned_sales
              ? getUserFullNameByEmail(row.original.assigned_sales)?.split(' ')[0] ||
                row.original.assigned_sales
              : '—'}
          </span>
        ),
        filterFn: 'faceted',
      },

      // 3. Priority (Visual badge)
      {
        accessorKey: 'priority',
        meta: {
          title: 'Frequency',
          filterVariant: 'select',
          filterOptions: companyPriorityOptions,
          enableSorting: false,
        },
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
        filterFn: 'faceted',
      },

      // 4. Last Meeting (separate column with date filter)
      {
        accessorKey: 'last_meeting',
        meta: { title: 'Last Meeting', enableSorting: true, filterVariant: 'date' },
        cell: ({ row }) => (
          <MeetingStatusBadge
            date={row.original.last_meeting}
            isWithinWindow={!!row.original.last_meeting_in_7_days}
            variant="last"
          />
        ),
        filterFn: 'dateRange',
      },

      // 5. Next Meeting (separate column with date filter)
      {
        accessorKey: 'next_meeting_date',
        meta: { title: 'Next Meeting', enableSorting: true, filterVariant: 'date' },
        cell: ({ row }) => (
          <MeetingStatusBadge
            date={row.original.next_meeting_date}
            isWithinWindow={!!row.original.next_meeting_in_14_days}
            variant="next"
          />
        ),
        filterFn: 'dateRange',
      },

      // 6. BOQs (Consolidated: Recent/Active/Hot badges)
      {
        id: 'boqs', // Use id instead of accessorKey for computed columns
        accessorFn: (row) => {
          // Return total count for sorting
          return (row.active_boq?.length || 0) +
                 (row.hot_boq?.length || 0) +
                 (row.last_30_days_boqs?.length || 0);
        },
        meta: { title: 'BOQs', enableSorting: true },
        cell: ({ row }) => (
          <BOQsCell
            recentBOQs={row.original.last_30_days_boqs}
            activeBOQs={row.original.active_boq}
            hotBOQs={row.original.hot_boq}
          />
        ),
        // Default numeric sorting will work now since accessorFn returns a number
      },

      // 7. Remarks (Latest remarks with tooltip)
      {
        accessorKey: 'last_three_remarks_from_tasks',
        meta: { title: 'Remarks', enableSorting: false },
        cell: ({ row }) => (
          <RemarksCell remarks={row.original.last_three_remarks_from_tasks} />
        ),
      },
    ],
    [assignedSalesOptions, companyPriorityOptions, getUserFullNameByEmail]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Table Configuration
  // ─────────────────────────────────────────────────────────────────────────

  const initialSorting = [{ id: 'next_meeting_date', desc: true }];

  const initialFilters: ColumnFiltersState = useMemo(() => {
    if (currentUserEmail && role === 'Nirmaan Sales User Profile') {
      return [{ id: 'assigned_sales', value: [currentUserEmail] }];
    }
    return [];
  }, [currentUserEmail, role]);

  const tableLogic = useDataTableLogic<CRMCompany>({
    data: companies,
    columns,
    initialSorting,
    initialColumnFilters: initialFilters,
    customGlobalFilterFn: ['company_name', 'company_city', 'assigned_sales', 'priority'],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Export Configuration
  // ─────────────────────────────────────────────────────────────────────────

  const companyExportFields = useMemo<DataTableColumnDef<CRMCompany>[]>(
    () => [
      { accessorKey: 'name', meta: { exportHeaderName: 'Company ID' } },
      { accessorKey: 'company_name', meta: { exportHeaderName: 'Company Name' } },
      { accessorKey: 'company_type', meta: { exportHeaderName: 'Company Type' } },
      { accessorKey: 'company_city', meta: { exportHeaderName: 'City' } },
      {
        accessorKey: 'assigned_sales',
        meta: {
          exportHeaderName: 'Assigned Sales',
          exportValue: row =>
            getUserFullNameByEmail(row.assigned_sales || '') || row.assigned_sales || '',
        },
      },
      { accessorKey: 'priority', meta: { exportHeaderName: 'Priority' } },
      {
        accessorKey: 'last_meeting',
        meta: {
          exportHeaderName: 'Last Meeting',
          exportValue: row =>
            row.last_meeting
              ? formatDateWithOrdinal(new Date(row.last_meeting), 'dd-MMM-yyyy')
              : '',
        },
      },
      {
        accessorKey: 'next_meeting_date',
        meta: {
          exportHeaderName: 'Next Meeting',
          exportValue: row =>
            row.next_meeting_date
              ? formatDateWithOrdinal(new Date(row.next_meeting_date), 'dd-MMM-yyyy')
              : '',
        },
      },
      {
        accessorKey: 'active_boq',
        meta: { exportHeaderName: 'Active BOQs', exportValue: row => row.active_boq?.length || 0 },
      },
      {
        accessorKey: 'hot_boq',
        meta: { exportHeaderName: 'Hot BOQs', exportValue: row => row.hot_boq?.length || 0 },
      },
      {
        accessorKey: 'last_30_days_boqs',
        meta: {
          exportHeaderName: 'BOQs (Last 30 Days)',
          exportValue: row => row.last_30_days_boqs?.length || 0,
        },
      },
      {
        accessorKey: 'last_three_remarks_from_tasks',
        meta: {
          exportHeaderName: 'Last 3 Remarks',
          exportValue: row => row.last_three_remarks_from_tasks?.join('; ') || '',
        },
      },
    ],
    [getUserFullNameByEmail]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Mobile Row Renderer
  // ─────────────────────────────────────────────────────────────────────────

  const renderMobileRow = (row: Row<CRMCompany>) => (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/companies/company?id=${row.original.name}`}
            className="font-semibold text-primary hover:underline block"
          >
            {row.original.company_name}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {row.original.company_type || 'No type'}
            {row.original.company_city && ` · ${row.original.company_city}`}
          </p>
        </div>
        <PriorityBadge priority={row.original.priority} />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Owner:{' '}
            <span className="text-foreground font-medium">
              {getUserFullNameByEmail(row.original.assigned_sales)?.split(' ')[0] || '—'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MeetingStatusBadge
            date={row.original.last_meeting}
            isWithinWindow={!!row.original.last_meeting_in_7_days}
            variant="last"
          />
          <MeetingStatusBadge
            date={row.original.next_meeting_date}
            isWithinWindow={!!row.original.next_meeting_in_14_days}
            variant="next"
          />
        </div>
      </div>

      {/* BOQs */}
      {(row.original.active_boq?.length ||
        row.original.hot_boq?.length ||
        row.original.last_30_days_boqs?.length) && (
        <div className="pt-2 border-t border-border/50">
          <BOQsCell
            recentBOQs={row.original.last_30_days_boqs}
            activeBOQs={row.original.active_boq}
            hotBOQs={row.original.hot_boq}
          />
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Error State
  // ─────────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="text-center text-destructive font-medium p-8 border border-destructive/20 rounded-lg bg-destructive/5">
        Failed to load companies. Please try again.
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <DataTable
      tableLogic={tableLogic}
      isLoading={isLoading}
      renderMobileRow={renderMobileRow}
      headerTitle={<span className="tracking-tight">Companies</span>}
      noResultsMessage="No companies match your filters."
      globalSearchPlaceholder="Search companies..."
      className="h-full"
      shouldExpandHeight={true}
      // Grid: Company | Owner | Frequency | Last Meeting | Next Meeting | BOQs | Remarks
      gridColsClass="grid-cols-[minmax(160px,2fr),80px,90px,120px,120px,minmax(140px,1.2fr),minmax(160px,1.5fr)]"
      minWidth="950px"
      renderToolbarActions={filteredData => (
        <DataTableExportButton
          data={filteredData}
          columns={companyExportFields}
          fileName="Companies_Export"
        />
      )}
    />
  );
};
