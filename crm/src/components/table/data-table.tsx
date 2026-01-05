// src/components/table/data-table.tsx
// Refined with cleaner, minimalist header styling

import * as React from "react";
import {
  flexRender,
  Row,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterX, Search, ChevronUp, ChevronDown } from "lucide-react";
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
  headerTitle?: string | React.ReactNode;
  renderToolbarActions?: (filteredData: TData[], columns: DataTableColumnDef<TData>[]) => React.ReactNode;
  renderTopToolbarActions?: React.ReactNode;
  shouldExpandHeight?: boolean;
  minWidth?: string;
}

export function DataTable<TData>({
  tableLogic,
  isLoading,
  onRowClick,
  renderMobileRow,
  globalSearchPlaceholder = "Search...",
  className,
  containerClassName,
  noResultsMessage = "No results found.",
  gridColsClass,
  headerTitle,
  renderToolbarActions,
  renderTopToolbarActions,
  shouldExpandHeight = false,
  minWidth,
}: DataTableProps<TData>) {
  const { table, globalFilter, setGlobalFilter, resetFilters, hasActiveFilters, filteredRowsCount } = tableLogic;

  const filteredRowsData = React.useMemo(() => {
    return table.getFilteredRowModel().rows.map(row => row.original);
  }, [table.getState().globalFilter, table.getState().columnFilters, table.getRowModel().rows]);


  // ─────────────────────────────────────────────────────────────────────────
  // Minimalist Column Header Renderer
  // ─────────────────────────────────────────────────────────────────────────

  const renderColumnHeader = (header: any) => {
    const columnDef = header.column.columnDef as DataTableColumnDef<TData>;
    const title = columnDef.meta?.title || String(columnDef.header) || header.id;
    const isSortable = columnDef.meta?.enableSorting;
    const sortDirection = header.column.getIsSorted();

    // Subtle sort indicator - only shows when sorted
    const SortIndicator = () => {
      if (!isSortable) return null;

      return (
        <span className="inline-flex flex-col -space-y-1 ml-1">
          <ChevronUp
            className={cn(
              "h-2.5 w-2.5 transition-colors",
              sortDirection === "asc"
                ? "text-foreground"
                : "text-muted-foreground/30"
            )}
          />
          <ChevronDown
            className={cn(
              "h-2.5 w-2.5 transition-colors",
              sortDirection === "desc"
                ? "text-foreground"
                : "text-muted-foreground/30"
            )}
          />
        </span>
      );
    };

    // Filter component - only for columns with filter config
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
        default:
          return null;
      }
    };

    const hasFilter = !!columnDef.meta?.filterVariant;

    return (
      <div className="relative flex items-center h-full w-full group">
        {/* Clickable header text with sort indicator */}
        <button
          type="button"
          className={cn(
            "flex items-center text-left py-1 rounded transition-colors",
            isSortable
              ? "cursor-pointer hover:bg-muted/60 hover:text-foreground"
              : "cursor-default"
          )}
          onClick={isSortable ? () => header.column.toggleSorting(sortDirection === "asc") : undefined}
          disabled={!isSortable}
          title={typeof title === 'string' ? title : undefined}
        >
          <span className="text-[11px] font-medium uppercase tracking-wide whitespace-nowrap">
            {title}
          </span>
          <SortIndicator />
        </button>

        {/* Filter icon - absolutely positioned to not affect layout */}
        {hasFilter && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2">
            {renderFilter()}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={cn("bg-background p-4 border border-border/60 rounded-lg flex flex-col", className)}>
      {/* Header with count */}
      {headerTitle && (
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="font-semibold text-lg">{headerTitle}</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {isLoading ? '—' : filteredRowsCount}
          </span>
        </div>
      )}

      {renderTopToolbarActions && (
        <div className="mb-4 flex-shrink-0">
          {renderTopToolbarActions}
        </div>
      )}

      {/* Toolbar: Search + Actions */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center mb-4 flex-shrink-0">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder={globalSearchPlaceholder}
            className="pl-9 h-9 text-sm bg-muted/30 border-transparent focus:border-border focus:bg-background transition-colors"
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
        </div>
        <div className="flex flex-row gap-2 w-full md:w-auto md:justify-end">
          {renderToolbarActions && renderToolbarActions(filteredRowsData, table.getAllColumns() as DataTableColumnDef<TData>[])}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              Clear filters
              <FilterX className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className={cn("overflow-hidden flex flex-col", shouldExpandHeight ? "flex-1" : "")}>
        <div
          className={cn(
            "overflow-auto",
            shouldExpandHeight ? "flex-1" : "max-h-[400px]",
            containerClassName
          )}
        >
          <div style={{ minWidth: minWidth ?? '100%' }}>
            {/* Desktop Header - Clean, minimal */}
            <div className={cn(
              "hidden md:grid gap-4 py-2 px-1 border-b border-border/60 items-center sticky top-0 z-10 bg-background",
              gridColsClass
            )}>
              {table.getHeaderGroups().map(headerGroup => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    if (header.isPlaceholder) return null;
                    return (
                      <div
                        key={header.id}
                        className="flex items-center h-full overflow-visible"
                      >
                        {renderColumnHeader(header)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Table Body */}
            <div className="space-y-3 md:space-y-0">
              {/* Loading skeleton */}
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded" />
              ))}

              {/* Data rows */}
              {!isLoading && table.getRowModel().rows.map(row => (
                <div key={row.id}>
                  {/* Mobile row */}
                  <div className="md:hidden">
                    {renderMobileRow ? (
                      <div
                        onClick={() => onRowClick?.(row)}
                        className="p-3 bg-card border border-border/40 rounded-lg cursor-pointer hover:border-border hover:shadow-sm transition-all"
                      >
                        {renderMobileRow(row)}
                      </div>
                    ) : (
                      <div
                        onClick={() => onRowClick?.(row)}
                        className="p-3 border border-border/40 rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <p className="font-medium text-primary">
                          {Object.values(row.original as any).find(v => typeof v === 'string' && v.length > 0) || 'Item'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Desktop row */}
                  <div
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "hidden md:grid items-center py-3 px-1 border-b border-border/30 cursor-pointer",
                      "hover:bg-muted/30 transition-colors gap-4",
                      gridColsClass
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <div key={cell.id} className="text-left overflow-hidden">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {!isLoading && table.getRowModel().rows.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground text-sm">{noResultsMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
