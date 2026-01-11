// src/components/table/data-table.tsx
// Refined with cleaner, minimalist header styling
// PERFORMANCE: Uses row virtualization for large datasets

import * as React from "react";
import {
  flexRender,
  Row,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterX, Search, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { useDataTableLogic } from './hooks/useDataTableLogic';
import { DataTableColumnDef } from './utils/table-filters';

import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableDateFilter } from './data-table-date-filter';
import { ActiveFiltersDisplay } from './active-filters-display';


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

// Row height constants for virtualization
const DESKTOP_ROW_HEIGHT = 52; // py-3 (12px * 2) + content (~28px)
const MOBILE_ROW_HEIGHT = 100; // Approximate height for mobile cards

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

  // Ref for the scrollable container (needed for virtualization)
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Track if we're on mobile (for rendering the correct row type)
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current filter state for dependency tracking
  const currentGlobalFilter = table.getState().globalFilter;
  const currentColumnFilters = table.getState().columnFilters;

  // Memoize filtered data - only recalculate when filter state actually changes
  const filteredRowsData = React.useMemo(() => {
    return table.getFilteredRowModel().rows.map(row => row.original);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGlobalFilter, currentColumnFilters, filteredRowsCount]);

  // Get all rows for virtualization
  const { rows } = table.getRowModel();

  // PERFORMANCE: Row virtualizer - only renders visible rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => isMobile ? MOBILE_ROW_HEIGHT : DESKTOP_ROW_HEIGHT,
    overscan: 10, // Render 10 extra rows above/below viewport for smooth scrolling
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // ─────────────────────────────────────────────────────────────────────────
  // Minimalist Column Header Renderer
  // ─────────────────────────────────────────────────────────────────────────

  const renderColumnHeader = React.useCallback((header: any) => {
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
      <div className="flex items-center justify-between h-full w-full gap-1 pr-2">
        {/* Clickable header text with sort indicator */}
        <button
          type="button"
          className={cn(
            "flex items-center text-left py-1 px-1 -ml-1 rounded transition-colors",
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

        {/* Filter icon - inline at end of header */}
        {hasFilter && (
          <div className="flex-shrink-0">
            {renderFilter()}
          </div>
        )}
      </div>
    );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={cn("bg-background p-4 border border-border/60 rounded-lg flex flex-col", className)}>
      {/* Header with count badge and active filters context */}
      {headerTitle && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Count badge - dark circle with white text */}
          <span className={cn(
            "inline-flex items-center justify-center",
            "min-w-[28px] h-7 px-2 rounded-full",
            "bg-foreground text-background",
            "text-xs font-semibold tabular-nums",
            "transition-all duration-300"
          )}>
            {isLoading ? '—' : filteredRowsCount}
          </span>
          <h2 className="font-semibold text-lg">{headerTitle}</h2>
          {/* Active filters display - shows what filters are applied */}
          <ActiveFiltersDisplay
            table={table}
            columnFilters={table.getState().columnFilters}
          />
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
          ref={parentRef}
          className={cn(
            "overflow-auto",
            shouldExpandHeight ? "flex-1" : "max-h-[400px]",
            containerClassName
          )}
        >
          <div style={{ minWidth: isMobile ? undefined : minWidth }}>
            {/* Desktop Header - Clean, minimal */}
            <div className={cn(
              "hidden md:grid gap-4 py-2 px-1 border-b border-border/60 items-center sticky top-0 z-10 bg-background",
              gridColsClass
            )}>
              {table.getHeaderGroups().map(headerGroup => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => {
                    if (header.isPlaceholder) return null;
                    const isLastColumn = index === headerGroup.headers.length - 1;
                    return (
                      <div
                        key={header.id}
                        className={cn(
                          "flex items-center h-full",
                          // Vertical separator - matches header underline weight
                          !isLastColumn && "border-r border-border/60"
                        )}
                      >
                        {renderColumnHeader(header)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Table Body - VIRTUALIZED */}
            <div className="md:space-y-0">
              {/* Loading skeleton */}
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded mb-3 md:mb-0" />
              ))}


              {/* Virtualized rows container */}
              {!isLoading && rows.length > 0 && (
                <div
                  style={{
                    height: `${totalSize}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {/* Only render visible rows */}
                  {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <div
                        key={row.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {/* Mobile row - only rendered on mobile */}
                        {isMobile ? (
                          <div className="p-1.5">
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
                        ) : (
                          /* Desktop row - only rendered on desktop */
                          <div
                            onClick={() => onRowClick?.(row)}
                            className={cn(
                              "grid items-center py-3 px-1 border-b border-border/30 cursor-pointer",
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && rows.length === 0 && (
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
