
// src/components/table/data-table.tsx
import * as React from "react";
import {
  flexRender,
  Row,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterX, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useDataTableLogic } from './hooks/useDataTableLogic';
import { DataTableColumnDef } from './utils/table-filters';

import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableDateFilter } from './data-table-date-filter';


// Props for the generic DataTable component
interface DataTableProps<TData> {
  tableLogic: ReturnType<typeof useDataTableLogic<TData>>;
  isLoading: boolean;
  onRowClick?: (row: Row<TData>) => void;
  renderMobileRow?: (row: Row<TData>) => React.ReactNode;
  globalSearchPlaceholder?: string;
  className?: string; // For overall container styling
  containerClassName?: string; // For additional styling on the scrollable table body
  noResultsMessage?: string;
  gridColsClass: string;
  headerTitle?: string;
  renderToolbarActions?: (filteredData: TData[], columns: DataTableColumnDef<TData>[]) => React.ReactNode;
  renderTopToolbarActions?: React.ReactNode; // NEW PROP: Slot for content above search/reset
  shouldExpandHeight?: boolean;
}

export function DataTable<TData>({
  tableLogic,
  isLoading,
  onRowClick,
  renderMobileRow,
  globalSearchPlaceholder = "Search all columns...",
  className,
  containerClassName,
  noResultsMessage = "No results found matching your criteria.",
  gridColsClass,
  headerTitle,
  renderToolbarActions,
  renderTopToolbarActions, // NEW: Destructure new prop
  shouldExpandHeight = false,
}: DataTableProps<TData>) {
  const { table, globalFilter, setGlobalFilter, resetFilters, hasActiveFilters, filteredRowsCount } = tableLogic;

  const filteredRowsData = React.useMemo(() => {
    return table.getFilteredRowModel().rows.map(row => row.original);
  }, [table.getState().globalFilter, table.getState().columnFilters, table.getRowModel().rows]);


  const renderColumnHeader = (header: any) => {
    const columnDef = header.column.columnDef as DataTableColumnDef<TData>;
    const title = columnDef.meta?.title || String(columnDef.header) || header.id;

    const renderSorting = columnDef.meta?.enableSorting && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
        className="p-1 h-auto"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    );

    const renderFilter = () => {
      switch (columnDef.meta?.filterVariant) {
        case 'select':
        case 'multiSelect':
          if (columnDef.meta.filterOptions) {
            return (
              <DataTableFacetedFilter
                column={header.column}
                title={title}
                options={columnDef.meta.filterOptions}
              />
            );
          }
          return null;
        case 'date':
          return (
            <DataTableDateFilter
              column={header.column}
              title={title}
            />
          );
        case 'text':
            return null;
        default:
          return null;
      }
    };

    return (
      <div className="flex items-center gap-1 justify-between h-full">
        <span
          className={columnDef.meta?.enableSorting ? "cursor-pointer" : ""}
          onClick={columnDef.meta?.enableSorting ? () => header.column.toggleSorting(header.column.getIsSorted() === "asc") : undefined}
        >
          {title}
        </span>
        <div className="flex items-center gap-1">
            {renderSorting}
            {renderFilter()}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("bg-background p-4 rounded-xl border flex flex-col", className)}>
      {headerTitle && <h2 className="font-semibold text-lg mb-4">{headerTitle} - {isLoading ? '...' : filteredRowsCount}</h2>}

      {renderTopToolbarActions && ( // NEW: Render top toolbar actions if provided
        <div className="mb-4 flex-shrink-0">
          {renderTopToolbarActions}
        </div>
      )}

      {/* Main Toolbar: Search and Reset Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4 flex-shrink-0">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={globalSearchPlaceholder}
            className="pl-10"
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)} // FIX: Ensure onChange updates globalFilter
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto md:justify-end">
            {renderToolbarActions && renderToolbarActions(filteredRowsData, table.getAllColumns() as DataTableColumnDef<TData>[])}
            {hasActiveFilters && (
            <Button
                variant="ghost"
                onClick={resetFilters}
                className="h-10 w-full md:w-auto"
            >
                Reset Filters
                <FilterX className="ml-2 h-4 w-4 text-destructive" />
            </Button>
            )}
        </div>
      </div>

      {/* Desktop Table Header */}
      <div className={cn("hidden md:grid gap-4 font-medium text-sm text-muted-foreground px-2 py-2 border-b min-h-10 items-center flex-shrink-0", gridColsClass)}>
        {table.getHeaderGroups().map(headerGroup => (
          <React.Fragment key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              if (header.isPlaceholder) return null;
              return (
                <div
                  key={header.id}
                  className="flex items-center justify-between h-full"
                >
                  {renderColumnHeader(header)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Table Body (Desktop and Mobile) */}
      <div className={cn(
          "overflow-y-auto pr-2 min-h-0",
          shouldExpandHeight ? "flex-1" : "max-h-[300px]",
          containerClassName
      )}>
        <div className="space-y-4 md:space-y-0 pb-2">
          {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

          {!isLoading && table.getRowModel().rows.map(row => (
            <div key={row.id}>
              <div className="md:hidden">
                {renderMobileRow ? (
                  <div onClick={() => onRowClick?.(row)} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    {renderMobileRow(row)}
                  </div>
                ) : (
                  <div onClick={() => onRowClick?.(row)} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <p className="font-semibold text-primary">{Object.values(row.original as any).find(v => typeof v === 'string' && v.length > 0) || 'Unnamed Item'}</p>
                    <p className="text-sm text-muted-foreground">Click for details</p>
                  </div>
                )}
              </div>

              <div
                onClick={() => onRowClick?.(row)}
                className={cn("hidden md:grid md:items-center md:p-0 md:py-3 md:px-2 md:border-none md:border-b md:rounded-none cursor-pointer hover:bg-muted/50 transition-colors", gridColsClass)}
              >
                {row.getVisibleCells().map(cell => (
                  <div key={cell.id} className="text-left">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!isLoading && table.getRowModel().rows.length === 0 && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
              <p>{noResultsMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
