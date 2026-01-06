// src/pages/MyTeam/TasksTab.tsx
// Refactored to use DataTable component for consistency with Company table

import React, { useMemo } from 'react';
import { Row, FilterFnOption } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { TaskStatusBadge } from './components/cells';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TaskType extends Record<string, any> {
  name: string;
  type?: string;
  start_date?: string;
  status?: string;
  contact?: string;
  company?: string;
  boq?: string;
  'contact.first_name'?: string;
  'contact.last_name'?: string;
  'company.company_name'?: string;
  creation?: string;
  modified?: string;
}

interface TasksTabProps {
  tasks: TaskType[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter Options
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Incomplete', value: 'Incomplete' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const TasksTab: React.FC<TasksTabProps> = ({ tasks }) => {
  // ─────────────────────────────────────────────────────────────────────────
  // Column Definitions
  // ─────────────────────────────────────────────────────────────────────────

  const columns = useMemo<DataTableColumnDef<TaskType>[]>(
    () => [
      // 1. Contact
      {
        accessorKey: 'contact',
        meta: { title: 'Contact', enableSorting: true },
        cell: ({ row }) => {
          const contactName = [
            row.original['contact.first_name'],
            row.original['contact.last_name'],
          ]
            .filter(Boolean)
            .join(' ');

          return row.original.contact ? (
            <Link
              to={`/contacts/contact?id=${row.original.contact}`}
              className="text-primary font-medium hover:underline truncate block"
            >
              {contactName || row.original.contact}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
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

      // 3. BOQ
      {
        accessorKey: 'boq',
        meta: { title: 'BOQ', enableSorting: true },
        cell: ({ row }) =>
          row.original.boq ? (
            <Link
              to={`/boqs/boq?id=${row.original.boq}`}
              className="text-primary font-medium hover:underline truncate block"
            >
              {row.original.boq}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },

      // 4. Task Type
      {
        accessorKey: 'type',
        meta: { title: 'Task', enableSorting: true },
        cell: ({ row }) =>
          row.original.type ? (
            <Link
              to={`/tasks/task?id=${row.original.name}`}
              className="text-primary hover:underline truncate block"
            >
              {row.original.type}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },

      // 5. Date
      {
        accessorKey: 'start_date',
        meta: { title: 'Date', enableSorting: true, filterVariant: 'date' },
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {row.original.start_date
              ? formatDateWithOrdinal(row.original.start_date)
              : '—'}
          </span>
        ),
        filterFn: 'dateRange' as FilterFnOption<TaskType>,
      },

      // 6. Status
      {
        accessorKey: 'status',
        meta: {
          title: 'Status',
          enableSorting: true,
          filterVariant: 'select',
          filterOptions: STATUS_OPTIONS,
        },
        cell: ({ row }) => (
          <TaskStatusBadge status={row.original.status || 'Unknown'} />
        ),
        filterFn: 'faceted' as FilterFnOption<TaskType>,
      },
    ],
    []
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Table Logic
  // ─────────────────────────────────────────────────────────────────────────

  const tableLogic = useDataTableLogic<TaskType>({
    data: tasks,
    columns,
    initialSorting: [{ id: 'start_date', desc: true }],
    customGlobalFilterFn: ['type', 'contact', 'company', 'boq', 'status'],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Mobile Row Renderer - Editorial minimal design
  // ─────────────────────────────────────────────────────────────────────────

  const renderMobileRow = (row: Row<TaskType>) => {
    const contactName = [
      row.original['contact.first_name'],
      row.original['contact.last_name'],
    ]
      .filter(Boolean)
      .join(' ');

    const companyName = row.original['company.company_name'];

    return (
      <div className="flex items-center gap-3 w-full">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {row.original.type || 'Task'}
            </span>
          </div>
          {/* Metadata row */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[12px] text-muted-foreground truncate">
              {contactName || 'No contact'}
            </span>
            {companyName && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[12px] text-muted-foreground/70 truncate">
                  {companyName}
                </span>
              </>
            )}
          </div>
          {/* Date row */}
          {row.original.start_date && (
            <div className="text-[11px] text-muted-foreground/50 mt-0.5">
              {formatDateWithOrdinal(row.original.start_date)}
            </div>
          )}
        </div>

        {/* Right side: Status + Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <TaskStatusBadge status={row.original.status || 'Unknown'} />
          <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
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
      headerTitle="Tasks"
      gridColsClass="grid-cols-[minmax(120px,1.2fr),minmax(140px,1.5fr),minmax(100px,1fr),minmax(100px,1fr),100px,110px]"
      minWidth="700px"
      globalSearchPlaceholder="Search tasks..."
      noResultsMessage="No tasks found for this user."
    />
  );
};
