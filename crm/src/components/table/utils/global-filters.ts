// src/components/table/utils/global-filters.ts
import { GlobalFilterFn, Row } from '@tanstack/react-table';

export const createGlobalFilterFn = <TData extends Record<string, any>>(
  customSearchableKeys: string[] // Renamed parameter for consistency
): GlobalFilterFn<TData> => {

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

  return (row: Row<TData>, columnId: string, filterValue: string): boolean => {
    // Defensive check (though useDataTableLogic now prevents calling this if keys are empty)
    if (!filterValue || customSearchableKeys?.length === 0) {
      return true;
    }

    const search = filterValue.toLowerCase();
    const rowData = row.original;

    // Search through the specified fields
    const fieldsToSearch = customSearchableKeys.map(key => getStringValue(rowData, key));

    // Check if any of the field values include the search term
    return fieldsToSearch.some(field => field.toLowerCase().includes(search));
  };
};

// REMOVE THE FOLLOWING SECTION, as its logic is now integrated into useDataTableLogic:
/*
// NEW: Define a default, robust global filter function
const defaultGlobalFilterFn = <TData extends Record<string, any>>(
  row: Row<TData>,
  columnId: string, // Not directly used in multi-column search
  filterValue: string,
  columns: ColumnDef<TData, any>[] // Pass columns to access all data points
): boolean => {
  if (!filterValue) return true; // No filter applied

  const search = filterValue.toLowerCase();

  const rowData = row.original;

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

  const fieldsToSearch = [
    getStringValue(rowData, 'boq_name'),
    getStringValue(rowData, 'company'),
    getStringValue(rowData, 'boq_status'),
    getStringValue(rowData, 'boq_sub_status'),
    getStringValue(rowData, 'owner'),
    getStringValue(rowData, 'salesperson'),
    getStringValue(rowData, 'assigned_sales'),
    getStringValue(rowData, 'contact'),
    getStringValue(rowData, 'city'),
    getStringValue(rowData, 'remarks'),
  ];
  return fieldsToSearch.some(field => field.toLowerCase().includes(search));
};
*/