// src/pages/MyTeam/ContactsTab.tsx
// Refactored to use DataTable component for consistency with Company table

import React, { useMemo } from 'react';
import { Row, FilterFnOption } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Phone, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { formatDateWithOrdinal } from '@/utils/FormatDate';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ContactType extends Record<string, any> {
  name: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  'company.company_name'?: string;
  mobile?: string;
  creation?: string;
  last_meeting?: string;
  modified?: string;
}

interface ContactsTabProps {
  contacts: ContactType[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ContactsTab: React.FC<ContactsTabProps> = ({ contacts }) => {
  // ─────────────────────────────────────────────────────────────────────────
  // Column Definitions
  // ─────────────────────────────────────────────────────────────────────────

  const columns = useMemo<DataTableColumnDef<ContactType>[]>(
    () => [
      // 1. Name
      {
        accessorKey: 'first_name',
        meta: { title: 'Name', enableSorting: true },
        cell: ({ row }) => {
          const fullName = [row.original.first_name, row.original.last_name]
            .filter(Boolean)
            .join(' ');

          return (
            <Link
              to={`/contacts/contact?id=${row.original.name}`}
              className="text-primary font-medium hover:underline truncate block"
            >
              {fullName || row.original.name}
            </Link>
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

      // 3. Phone
      {
        accessorKey: 'mobile',
        meta: { title: 'Phone', enableSorting: false },
        cell: ({ row }) =>
          row.original.mobile ? (
            <a
              href={`tel:${row.original.mobile}`}
              className="inline-flex items-center gap-1.5 text-sm hover:text-primary"
            >
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              {row.original.mobile}
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },

      // 4. Date Added
      {
        accessorKey: 'creation',
        meta: { title: 'Added', enableSorting: true, filterVariant: 'date' },
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {row.original.creation
              ? formatDateWithOrdinal(row.original.creation)
              : '—'}
          </span>
        ),
        filterFn: 'dateRange' as FilterFnOption<ContactType>,
      },

      // 5. Last Meeting
      {
        accessorKey: 'last_meeting',
        meta: { title: 'Last Meeting', enableSorting: true, filterVariant: 'date' },
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {row.original.last_meeting
              ? formatDateWithOrdinal(row.original.last_meeting)
              : '—'}
          </span>
        ),
        filterFn: 'dateRange' as FilterFnOption<ContactType>,
      },

      // 6. Updated
      {
        accessorKey: 'modified',
        meta: { title: 'Updated', enableSorting: true },
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap text-muted-foreground">
            {row.original.modified
              ? formatDateWithOrdinal(row.original.modified)
              : '—'}
          </span>
        ),
      },
    ],
    []
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Table Logic
  // ─────────────────────────────────────────────────────────────────────────

  const tableLogic = useDataTableLogic<ContactType>({
    data: contacts,
    columns,
    initialSorting: [{ id: 'first_name', desc: false }],
    customGlobalFilterFn: ['first_name', 'last_name', 'company', 'mobile'],
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Mobile Row Renderer (compact - fits ~80px height for virtualization)
  // ─────────────────────────────────────────────────────────────────────────

  const renderMobileRow = (row: Row<ContactType>) => {
    const fullName = [row.original.first_name, row.original.last_name]
      .filter(Boolean)
      .join(' ');
    const companyName = row.original['company.company_name'] || row.original.company;

    return (
      <div className="flex items-center gap-3 w-full">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {fullName || row.original.name}
            </span>
          </div>
          {/* Metadata row */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[12px] text-muted-foreground truncate">
              {companyName || 'No company'}
            </span>
          </div>
          {/* Date row */}
          {row.original.last_meeting && (
            <div className="text-[11px] text-muted-foreground/50 mt-0.5">
              Last: {formatDateWithOrdinal(row.original.last_meeting)}
            </div>
          )}
        </div>

        {/* Right side: Phone or Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {row.original.mobile ? (
            <a
              href={`tel:${row.original.mobile}`}
              className="p-1.5 rounded-full hover:bg-muted/50"
            >
              <Phone className="w-4 h-4 text-primary/70" />
            </a>
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
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
      headerTitle="Contacts"
      gridColsClass="grid-cols-[minmax(140px,1.5fr),minmax(140px,1.5fr),120px,100px,110px,100px]"
      minWidth="720px"
      globalSearchPlaceholder="Search contacts..."
      noResultsMessage="No contacts found for this user."
    />
  );
};
