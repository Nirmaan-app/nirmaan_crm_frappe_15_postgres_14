
// src/components/table/hooks/useDataTableLogic.ts
import { useState, useRef, useEffect, useCallback,useMemo } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  GlobalFilterFn,
   Row, // Added Row import
  ColumnDef, // Added ColumnDef import for the inline default filter logic // NEW: Import GlobalFilterFn
} from '@tanstack/react-table';
import { createGlobalFilterFn } from '../utils/global-filters';

import { DataTableColumnDef, dateRangeFilterFn, facetedFilterFn } from '../utils/table-filters';

interface UseDataTableLogicProps<TData> {
  data: TData[];
  columns: DataTableColumnDef<TData, any>[];
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  initialColumnVisibility?: VisibilityState;
  // NEW: Allow a custom global filter function to be passed,
  // or define a robust default one here.
  customGlobalFilterFn?: string[];
}


// src/components/table/utils/global-filters.ts


// export const createGlobalFilterFn = <TData extends Record<string, any>>(
//   customGlobalFilterFn: string[]
// ): GlobalFilterFn<TData> => {
//   return (row: Row<TData>, columnId: string, filterValue: string): boolean => {
//     if (!filterValue || customGlobalFilterFn?.length === 0) {
//       return true; // No filter applied or no searchable keys provided
//     }

//     const search = filterValue.toLowerCase();
//     const rowData = row.original;

//     // Helper to safely get a string value from a potentially nested object
//     const getStringValue = (obj: any, key: string): string => {
//       if (!obj) return '';
//       const keys = key.split('.');
//       let value = obj;
//       for (const k of keys) {
//         if (value && typeof value === 'object' && k in value) {
//           value = value[k];
//         } else {
//           return '';
//         }
//       }
//       return String(value || '');
//     };

//     // Search through the specified fields
//     const fieldsToSearch = customGlobalFilterFn.map(key => getStringValue(rowData, key));
    
//     // Check if any of the field values include the search term
//     return fieldsToSearch.some(field => field.toLowerCase().includes(search));
//   };
// };

// NEW: Define a default, robust global filter function
const defaultGlobalFilterFn = <TData extends Record<string, any>>(
  row: Row<TData>,
  columnId: string, // Not directly used in multi-column search
  filterValue: string,
  columns: ColumnDef<TData, any>[] // Pass columns to access all data points
): boolean => {
  if (!filterValue) return true; // No filter applied

  const search = filterValue.toLowerCase();

  // Iterate over all columns and check if any string value matches the search term
  // You can customize which fields are relevant for global search here.
  // For BOQ, we'd check boq_name, company, boq_status, owner, assigned_sales, etc.
  const rowData = row.original; // Get the raw data object

  // Helper to safely get a string value from a potentially nested object
  const getStringValue = (obj: any, key: string): string => {
    if (!obj) return '';
    const keys = key.split('.');
    let value = obj;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return '';
      }
    }
    return String(value || '');
  };

  // Search through common string-based fields. Add or remove fields as needed.
  // This is a comprehensive search across multiple known string fields.
  const fieldsToSearch = [
    getStringValue(rowData, 'boq_name'),
    getStringValue(rowData, 'company'),
    getStringValue(rowData, 'boq_status'),
    getStringValue(rowData, 'boq_sub_status'),
    getStringValue(rowData, 'owner'),
    getStringValue(rowData, 'salesperson'), // If this field holds a name
    getStringValue(rowData, 'assigned_sales'), // If this field holds a name
    getStringValue(rowData, 'contact'), // If this field holds a name
    getStringValue(rowData, 'city'),
    getStringValue(rowData, 'remarks'),
  ];
  // Filter out empty strings and check for match
  return fieldsToSearch.some(field => field.toLowerCase().includes(search));
};


export function useDataTableLogic<TData extends Record<string, any>>({ // NEW: Extend TData
  data,
  columns,
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
  customGlobalFilterFn:searchableKeys, // NEW: Destructure custom global filter function
}: UseDataTableLogicProps<TData>) {
  const defaultSortingRef = useRef(initialSorting);


  useEffect(() => {
    if (JSON.stringify(initialSorting) !== JSON.stringify(defaultSortingRef.current)) {
      defaultSortingRef.current = initialSorting;
    }
  }, [initialSorting]);

  const [sorting, setSorting] = useState<SortingState>(defaultSortingRef.current);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);

  const activeGlobalFilterFn = useMemo<GlobalFilterFn<TData>>(() => {
    // If custom searchable keys are provided and not empty, use the factory function
    if (searchableKeys && searchableKeys?.length > 0) {
      return createGlobalFilterFn(searchableKeys);
    }

    // Otherwise, define a robust default global filter function inline.
    // This default function conforms to the GlobalFilterFn signature:
    // (row: Row<TData>, columnId: string, filterValue: any) => boolean
    return (row: Row<TData>, columnId: string, filterValue: string): boolean => {
      if (!filterValue) return true; // No filter applied

      const search = filterValue.toLowerCase();
      const rowData = row.original;

      // Helper to safely get a string value from a potentially nested object
      const getStringValue = (obj: any, key: string): string => {
        if (!obj) return '';
        const keys = key.split('.');
        let value = obj;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return '';
          }
        }
        return String(value || '');
      };

      // Define default searchable fields if no custom ones are provided.
      // These should be fields from your BOQ interface that are likely candidates for global search.
      const defaultSearchableFields = [
        'boq_name',
        'company',
        'boq_status',
        'boq_sub_status',
        'owner',
        'salesperson',
        'assigned_sales',
        'contact',
        'city',
        'remarks',
      ];

      // Check if any of the default searchable field values include the search term
      return defaultSearchableFields.some(fieldKey =>
        getStringValue(rowData, fieldKey).toLowerCase().includes(search)
      );
    };
  }, [searchableKeys]); // Re-run this memo if searchableKeys change


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    filterFns: {
      dateRange: dateRangeFilterFn,
      faceted: facetedFilterFn,
    },
    // NEW: Use the custom global filter function or our robust default
    globalFilterFn: activeGlobalFilterFn,
  });

  const hasActiveFilters = columnFilters.length > 0 || globalFilter !== '';

  const resetFilters = useCallback(() => {
    setColumnFilters(initialColumnFilters);
    setGlobalFilter('');
    setSorting(defaultSortingRef.current);

    table.setColumnFilters(initialColumnFilters);
    table.setGlobalFilter('');
    table.setSorting(defaultSortingRef.current);
  }, [table, initialColumnFilters]);

  return {
    table,
    globalFilter,
    setGlobalFilter,
    resetFilters,
    hasActiveFilters,
    filteredRowsCount: table.getFilteredRowModel().rows?.length,
    columnVisibility,
    setColumnVisibility,
  };
}
