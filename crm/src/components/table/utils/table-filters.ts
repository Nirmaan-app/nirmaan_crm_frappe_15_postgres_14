
// src/components/table/utils/table-filters.ts
import { ColumnDef, FilterFn } from "@tanstack/react-table";
// Corrected relative import path for DateFilterValue
import { DateFilterValue } from '../data-table-date-filter';

// --- Extended ColumnDef Interface ---
export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  meta?: {
    title?: string; // Custom title for the column header (e.g., "Project Name")
    enableSorting?: boolean; // Explicitly enable sorting for this column in the UI
    filterVariant?: 'text' | 'select' | 'date' | 'multiSelect'; // Type of filter to render
    filterOptions?: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]; // Options for 'select'/'multiSelect' filters
  };
};

// --- Custom Date Range Filter Function for TanStack Table ---
export const dateRangeFilterFn: FilterFn<any> = (row, columnId, filterValue: DateFilterValue) => {
  const dateString = row.getValue(columnId) as string;
  if (!dateString) return false;

  const rowDate = new Date(dateString);
  if (isNaN(rowDate.getTime())) return false;

  const { operator, value } = filterValue;

  if (operator === 'Is' && typeof value === 'string') {
    const filterDate = new Date(value);
    return rowDate.toDateString() === filterDate.toDateString();
  } else if (operator === 'Between' && Array.isArray(value)) {
    const fromDate = new Date(value[0]);
    const toDate = new Date(value[1]);
    toDate.setHours(23, 59, 59, 999);
    return rowDate >= fromDate && rowDate <= toDate;
  } else if (operator === '<=' && typeof value === 'string') {
    const filterDate = new Date(value);
    filterDate.setHours(23, 59, 59, 999);
    return rowDate <= filterDate;
  } else if (operator === '>=' && typeof value === 'string') {
    const filterDate = new Date(value);
    filterDate.setHours(0, 0, 0, 0);
    return rowDate >= filterDate;
  } else if (operator === 'Timespan' && typeof value === 'string') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999);

    switch (value) {
      case 'today': startDate = new Date(today); break;
      case 'yesterday': startDate = new Date(today); startDate.setDate(today.getDate() - 1); endDate = new Date(startDate); endDate.setHours(23, 59, 59, 999); break;
      case 'this week': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay()); endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6); endDate.setHours(23, 59, 59, 999); break;
      case 'last week': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay() - 7); endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6); endDate.setHours(23, 59, 59, 999); break;
      case 'this month': startDate = new Date(today.getFullYear(), today.getMonth(), 1); endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); endDate.setHours(23, 59, 59, 999); break;
      case 'last month': startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); endDate = new Date(today.getFullYear(), today.getMonth(), 0); endDate.setHours(23, 59, 59, 999); break;
      case 'this quarter': const currentQuarter = Math.floor(today.getMonth() / 3); startDate = new Date(today.getFullYear(), currentQuarter * 3, 1); endDate = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0); endDate.setHours(23, 59, 59, 999); break;
      case 'last quarter': const prevQuarterMonth = Math.floor(today.getMonth() / 3) * 3 - 3; startDate = new Date(today.getFullYear(), prevQuarterMonth, 1); endDate = new Date(today.getFullYear(), prevQuarterMonth + 3, 0); endDate.setHours(23, 59, 59, 999); break;
      case 'this year': startDate = new Date(today.getFullYear(), 0, 1); endDate = new Date(today.getFullYear(), 11, 31); endDate.setHours(23, 59, 59, 999); break;
      case 'last year': startDate = new Date(today.getFullYear() - 1, 0, 1); endDate = new Date(today.getFullYear() - 1, 11, 31); endDate.setHours(23, 59, 59, 999); break;
      case 'last 7 days': startDate = new Date(today); startDate.setDate(today.getDate() - 6); break;
      case 'last 14 days': startDate = new Date(today); startDate.setDate(today.getDate() - 13); break;
      case 'last 30 days': startDate = new Date(today); startDate.setDate(today.getDate() - 29); break;
      case 'last 90 days': startDate = new Date(today); startDate.setDate(today.getDate() - 89); break;
      case 'last 6 months': startDate = new Date(today); startDate.setDate(today.getDate() - 179); break;
      default: return false;
    }
    startDate.setHours(0, 0, 0, 0);
    return rowDate >= startDate && rowDate <= endDate;
  }
  return false;
};

// --- Custom Faceted (Multi-select) Filter Function for TanStack Table ---
export const facetedFilterFn: FilterFn<any> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;

  const rowValue = String(row.getValue(columnId));

  return filterValue.includes(rowValue);
};

// // src/utils/table-filters.ts
// import { ColumnDef, FilterFn } from "@tanstack/react-table";
// // Corrected import path for DateFilterValue based on your actual structure
// import { DateFilterValue } from "@/components/table/data-table-date-filter";

// // --- Extended ColumnDef Interface ---
// export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
//   meta?: {
//     title?: string; // Custom title for the column header (e.g., "Project Name")
//     enableSorting?: boolean; // Explicitly enable sorting for this column in the UI
//     filterVariant?: 'text' | 'select' | 'date' | 'multiSelect'; // Type of filter to render
//     filterOptions?: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]; // Options for 'select'/'multiSelect' filters
//   };
// };

// // --- Custom Date Range Filter Function for TanStack Table ---
// export const dateRangeFilterFn: FilterFn<any> = (row, columnId, filterValue: DateFilterValue) => {
//   const dateString = row.getValue(columnId) as string;
//   if (!dateString) return false;

//   const rowDate = new Date(dateString);
//   if (isNaN(rowDate.getTime())) return false;

//   const { operator, value } = filterValue;

//   if (operator === 'Is' && typeof value === 'string') {
//     const filterDate = new Date(value);
//     return rowDate.toDateString() === filterDate.toDateString();
//   } else if (operator === 'Between' && Array.isArray(value)) {
//     const fromDate = new Date(value[0]);
//     const toDate = new Date(value[1]);
//     toDate.setHours(23, 59, 59, 999);
//     return rowDate >= fromDate && rowDate <= toDate;
//   } else if (operator === '<=' && typeof value === 'string') {
//     const filterDate = new Date(value);
//     filterDate.setHours(23, 59, 59, 999);
//     return rowDate <= filterDate;
//   } else if (operator === '>=' && typeof value === 'string') {
//     const filterDate = new Date(value);
//     filterDate.setHours(0, 0, 0, 0);
//     return rowDate >= filterDate;
//   } else if (operator === 'Timespan' && typeof value === 'string') {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     let startDate: Date;
//     let endDate: Date = new Date();
//     endDate.setHours(23, 59, 59, 999);

//     switch (value) {
//       case 'today': startDate = new Date(today); break;
//       case 'yesterday': startDate = new Date(today); startDate.setDate(today.getDate() - 1); endDate = new Date(startDate); endDate.setHours(23, 59, 59, 999); break;
//       case 'this week': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay()); endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6); endDate.setHours(23, 59, 59, 999); break;
//       case 'last week': startDate = new Date(today); startDate.setDate(today.getDate() - today.getDay() - 7); endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6); endDate.setHours(23, 59, 59, 999); break;
//       case 'this month': startDate = new Date(today.getFullYear(), today.getMonth(), 1); endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); endDate.setHours(23, 59, 59, 999); break;
//       case 'last month': startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); endDate = new Date(today.getFullYear(), today.getMonth(), 0); endDate.setHours(23, 59, 59, 999); break;
//       case 'this quarter': const currentQuarter = Math.floor(today.getMonth() / 3); startDate = new Date(today.getFullYear(), currentQuarter * 3, 1); endDate = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0); endDate.setHours(23, 59, 59, 999); break;
//       case 'last quarter': const prevQuarterMonth = Math.floor(today.getMonth() / 3) * 3 - 3; startDate = new Date(today.getFullYear(), prevQuarterMonth, 1); endDate = new Date(today.getFullYear(), prevQuarterMonth + 3, 0); endDate.setHours(23, 59, 59, 999); break;
//       case 'this year': startDate = new Date(today.getFullYear(), 0, 1); endDate = new Date(today.getFullYear(), 11, 31); endDate.setHours(23, 59, 59, 999); break;
//       case 'last year': startDate = new Date(today.getFullYear() - 1, 0, 1); endDate = new Date(today.getFullYear() - 1, 11, 31); endDate.setHours(23, 59, 59, 999); break;
//       case 'last 7 days': startDate = new Date(today); startDate.setDate(today.getDate() - 6); break;
//       case 'last 14 days': startDate = new Date(today); startDate.setDate(today.getDate() - 13); break;
//       case 'last 30 days': startDate = new Date(today); startDate.setDate(today.getDate() - 29); break;
//       case 'last 90 days': startDate = new Date(today); startDate.setDate(today.getDate() - 89); break;
//       case 'last 6 months': startDate = new Date(today); startDate.setDate(today.getDate() - 179); break;
//       default: return false;
//     }
//     startDate.setHours(0, 0, 0, 0);
//     return rowDate >= startDate && rowDate <= endDate;
//   }
//   return false;
// };

// // --- Custom Faceted (Multi-select) Filter Function for TanStack Table ---
// export const facetedFilterFn: FilterFn<any> = (row, columnId, filterValue: string[]) => {
//   if (!filterValue || filterValue.length === 0) return true;

//   const rowValue = String(row.getValue(columnId));

//   return filterValue.includes(rowValue);
// };