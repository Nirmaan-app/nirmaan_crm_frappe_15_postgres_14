// src/pages/MyTeam/ProjectTab.tsx
// Refactored to use DataTable component for consistency with Company table

import React, { useMemo } from 'react';
import { Row, FilterFnOption } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { BOQStatusBadge } from './components/cells';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BOQType extends Record<string, any> {
  name: string;
  boq_name?: string;
  company?: string;
  'company.company_name'?: string;
  boq_link?: string;
  boq_status?: string;
  creation?: string;
  modified?: string;
}

interface ProjectsTabProps {
  boqs: BOQType[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Options
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: 'New', value: 'New' },
  { label: 'In-Progress', value: 'In-Progress' },
  { label: 'BOQ Submitted', value: 'BOQ Submitted' },
  { label: 'Partial BOQ Submitted', value: 'Partial BOQ Submitted' },
  { label: 'Revision Pending', value: 'Revision Pending' },
  { label: 'Revision Submitted', value: 'Revision Submitted' },
  { label: 'Negotiation', value: 'Negotiation' },
  { label: 'Won', value: 'Won' },
  { label: 'Lost', value: 'Lost' },
  { label: 'Hold', value: 'Hold' },
  { label: 'Dropped', value: 'Dropped' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ boqs }) => {
  // ─────────────────────────────────────────────────────────────────────────
  // Column Definitions
  // ─────────────────────────────────────────────────────────────────────────

  const columns = useMemo<DataTableColumnDef<BOQType>[]>(
    () => [
      // 1. BOQ Name
      {
        accessorKey: 'boq_name',
        meta: { title: 'BOQ Name', enableSorting: true },
        cell: ({ row }) => (
          <Link
            to={`/boqs/boq?id=${row.original.name}`}
            className="text-primary font-medium hover:underline truncate block"
          >
            {row.original.boq_name || row.original.name}
          </Link>
        ),
      },

      // 2. Company
      {
        accessorKey: 'company',
        meta: { title: 'Company', enableSorting: true },
        cell: ({ row }) =>
          row.original.company ? (
            <Link
              to={`/companies/company?id=${row.original.company}`}
              className="text-primary hover:underline truncate block"
            >
              {row.original['company.company_name'] || row.original.company}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },

      // 3. BOQ Link
      {
        accessorKey: 'boq_link',
        meta: { title: 'Link', enableSorting: false },
        cell: ({ row }) =>
          row.original.boq_link ? (
            <a
              href={row.original.boq_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View</span>
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },

      // 4. Status
      {
        accessorKey: 'boq_status',
        meta: {
          title: 'Status',
          enableSorting: true,
          filterVariant: 'select',
          filterOptions: STATUS_OPTIONS,
        },
        cell: ({ row }) => (
          <BOQStatusBadge status={row.original.boq_status || 'Unknown'} />
        ),
        filterFn: 'faceted' as FilterFnOption<BOQType>,
      },

      // 5. Deadline / Creation Date
      {
        accessorKey: 'creation',
        meta: { title: 'Received', enableSorting: true, filterVariant: 'date' },
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {row.original.creation
              ? formatDateWithOrdinal(row.original.creation)
              : '—'}
          </span>
        ),
        filterFn: 'dateRange' as FilterFnOption<BOQType>,
      },
    ],
    []
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Table Logic
  // ─────────────────────────────────────────────────────────────────────────

  const tableLogic = useDataTableLogic<BOQType>({
    data: boqs,
    columns,
    initialSorting: [{ id: 'creation', desc: true }],
    customGlobalFilterFn: ['boq_name', 'company', 'boq_status'],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Mobile Row Renderer (compact - fits ~80px height for virtualization)
  // ─────────────────────────────────────────────────────────────────────────

  const renderMobileRow = (row: Row<BOQType>) => {
    const companyName = row.original['company.company_name'] || row.original.company;

    return (
      <div className="flex items-center gap-3 w-full">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <Link
              to={`/boqs/boq?id=${row.original.name}`}
              className="font-medium text-foreground truncate hover:text-primary"
            >
              {row.original.boq_name || row.original.name}
            </Link>
          </div>
          {/* Metadata row */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[12px] text-muted-foreground truncate">
              {companyName || 'No company'}
            </span>
          </div>
          {/* Date row */}
          {row.original.creation && (
            <div className="text-[11px] text-muted-foreground/50 mt-0.5">
              {formatDateWithOrdinal(row.original.creation)}
            </div>
          )}
        </div>

        {/* Right side: Status + External link */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <BOQStatusBadge status={row.original.boq_status || 'Unknown'} />
          {row.original.boq_link && (
            <a
              href={row.original.boq_link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-muted/50"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <DataTable
      tableLogic={tableLogic as any}
      isLoading={false}
      renderMobileRow={renderMobileRow}
      headerTitle="BOQs"
      gridColsClass="grid-cols-[minmax(160px,2fr),minmax(140px,1.5fr),80px,130px,100px]"
      minWidth="620px"
      globalSearchPlaceholder="Search BOQs..."
      noResultsMessage="No BOQs found for this user."
    />
  );
};
