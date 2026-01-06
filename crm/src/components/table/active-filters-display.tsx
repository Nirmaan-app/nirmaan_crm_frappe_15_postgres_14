// src/components/table/active-filters-display.tsx
// Displays active column filters as subtle inline chips
// Design: Industrial minimalism - informative but unobtrusive

import React from 'react';
import { ColumnFiltersState, Table } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { DataTableColumnDef } from './utils/table-filters';

interface DateFilterValue {
  operator: string;
  value: string | string[];
}

interface ActiveFiltersDisplayProps<TData> {
  table: Table<TData>;
  columnFilters: ColumnFiltersState;
  className?: string;
}

/**
 * Formats a filter value into a readable string
 */
function formatFilterValue(
  value: unknown,
  filterVariant?: string
): string {
  // Handle date filters
  if (filterVariant === 'date' && typeof value === 'object' && value !== null) {
    const dateFilter = value as DateFilterValue;

    if (dateFilter.operator === 'Timespan' && typeof dateFilter.value === 'string') {
      // Capitalize timespan for display
      return dateFilter.value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    if (dateFilter.operator === 'Is' && typeof dateFilter.value === 'string') {
      return new Date(dateFilter.value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
    }

    if (dateFilter.operator === 'Between' && Array.isArray(dateFilter.value)) {
      const from = new Date(dateFilter.value[0]).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
      const to = new Date(dateFilter.value[1]).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      });
      return `${from} - ${to}`;
    }

    if (dateFilter.operator === '<=' && typeof dateFilter.value === 'string') {
      return `Before ${new Date(dateFilter.value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })}`;
    }

    if (dateFilter.operator === '>=' && typeof dateFilter.value === 'string') {
      return `After ${new Date(dateFilter.value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })}`;
    }

    return 'Date filter';
  }

  // Handle array values (faceted/multi-select filters)
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (value.length === 1) return String(value[0]);
    if (value.length === 2) return value.join(', ');
    return `${value[0]} +${value.length - 1}`;
  }

  // Handle string values
  if (typeof value === 'string') {
    return value;
  }

  return String(value);
}

/**
 * Gets the column title from the column definition
 */
function getColumnTitle<TData>(
  table: Table<TData>,
  columnId: string
): string {
  const column = table.getColumn(columnId);
  if (!column) return columnId;

  const columnDef = column.columnDef as DataTableColumnDef<TData>;
  return columnDef.meta?.title || columnId;
}

/**
 * Gets the filter variant from the column definition
 */
function getFilterVariant<TData>(
  table: Table<TData>,
  columnId: string
): string | undefined {
  const column = table.getColumn(columnId);
  if (!column) return undefined;

  const columnDef = column.columnDef as DataTableColumnDef<TData>;
  return columnDef.meta?.filterVariant;
}

export function ActiveFiltersDisplay<TData>({
  table,
  columnFilters,
  className,
}: ActiveFiltersDisplayProps<TData>) {
  // Don't render if no filters
  if (!columnFilters || columnFilters.length === 0) {
    return null;
  }

  // Filter out empty filter values
  const activeFilters = columnFilters.filter(filter => {
    if (Array.isArray(filter.value)) {
      return filter.value.length > 0;
    }
    if (typeof filter.value === 'object' && filter.value !== null) {
      return true; // Date filters are always considered active if present
    }
    return filter.value !== '' && filter.value !== undefined;
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {activeFilters.map((filter) => {
        const title = getColumnTitle(table, filter.id);
        const filterVariant = getFilterVariant(table, filter.id);
        const formattedValue = formatFilterValue(filter.value, filterVariant);

        if (!formattedValue) return null;

        return (
          <span
            key={filter.id}
            className={cn(
              "inline-flex items-center gap-1",
              "text-[11px] text-muted-foreground",
              "transition-colors"
            )}
          >
            <span className="text-muted-foreground/50">·</span>
            <span className="font-medium text-foreground/70">{title}:</span>
            <span className="text-primary/80">{formattedValue}</span>
          </span>
        );
      })}
    </div>
  );
}
