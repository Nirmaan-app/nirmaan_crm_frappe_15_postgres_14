// src/components/table/hooks/useDataTableLogic.ts
import { useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

// Corrected relative import path
import { DataTableColumnDef, dateRangeFilterFn, facetedFilterFn } from '../utils/table-filters';

interface UseDataTableLogicProps<TData> {
  data: TData[];
  columns: DataTableColumnDef<TData, any>[];
  initialSorting?: SortingState;
}

export function useDataTableLogic<TData>({
  data,
  columns,
  initialSorting = [],
}: UseDataTableLogicProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    filterFns: {
      dateRange: dateRangeFilterFn,
      faceted: facetedFilterFn,
    },
  });

  const hasActiveFilters = columnFilters.length > 0 || globalFilter !== '';

  const resetFilters = () => {
    setColumnFilters([]);
    setGlobalFilter('');
    setSorting(initialSorting);
  };

  return {
    table,
    globalFilter,
    setGlobalFilter,
    resetFilters,
    hasActiveFilters,
    filteredRowsCount: table.getFilteredRowModel().rows.length,
  };
}

// // src/hooks/useDataTableLogic.ts
// import { useState } from 'react';
// import {
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   useReactTable,
//   SortingState,
//   ColumnFiltersState,
// } from '@tanstack/react-table';

// // Corrected import path for DataTableColumnDef and filter functions
// import { DataTableColumnDef, dateRangeFilterFn, facetedFilterFn } from '@/components/table/utils/table-filters';

// interface UseDataTableLogicProps<TData> {
//   data: TData[];
//   columns: DataTableColumnDef<TData, any>[];
//   initialSorting?: SortingState;
// }

// export function useDataTableLogic<TData>({
//   data,
//   columns,
//   initialSorting = [],
// }: UseDataTableLogicProps<TData>) {
//   const [sorting, setSorting] = useState<SortingState>(initialSorting);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [globalFilter, setGlobalFilter] = useState('');

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     onSortingChange: setSorting,
//     getSortedRowModel: getSortedRowModel(),
//     onColumnFiltersChange: setColumnFilters,
//     getFilteredRowModel: getFilteredRowModel(),
//     onGlobalFilterChange: setGlobalFilter,
//     state: {
//       sorting,
//       columnFilters,
//       globalFilter,
//     },
//     filterFns: {
//       dateRange: dateRangeFilterFn,
//       faceted: facetedFilterFn,
//     },
//   });

//   const hasActiveFilters = columnFilters.length > 0 || globalFilter !== '';

//   const resetFilters = () => {
//     setColumnFilters([]);
//     setGlobalFilter('');
//     setSorting(initialSorting);
//   };

//   return {
//     table,
//     globalFilter,
//     setGlobalFilter,
//     resetFilters,
//     hasActiveFilters,
//     filteredRowsCount: table.getFilteredRowModel().rows.length,
//   };
// }