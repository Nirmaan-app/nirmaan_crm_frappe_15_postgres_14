// src/components/table/utils/export-to-csv.ts
import { ColumnDef, RowData } from '@tanstack/react-table';
import { unparse } from 'papaparse'; // Import UNPARSE from papaparse
import { format } from 'date-fns'; // Using date-fns for robust date formatting
import { DataTableColumnDef } from './table-filters'; // Import our extended column def

// Assuming these utilities exist. If not, you'll need to create them.
// For demonstration, I'll provide a basic placeholder for parseNumber and formatToRoundedIndianRupee.
const parseNumber = (value: any): number | undefined => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/,/g, '')); // Remove commas for parsing
        return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
};

const formatToRoundedIndianRupee = (value: number | undefined | null): string => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};


/**
 * Safely formats a date value using date-fns.
 * Returns an empty string if the date is invalid or null/undefined.
 */
const safeFormatDate = (value: any, formatString: string = 'dd/MM/yyyy'): string => {
    if (value === null || value === undefined || value === '') return '';
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            // If it's already a string that looks like a date, return it
            if (typeof value === 'string' && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                return value;
            }
            console.warn("Invalid date value for formatting:", value);
            return '';
        }
        return format(date, formatString);
    } catch (e) {
        console.error("Date formatting failed:", e, "Value:", value);
        return '';
    }
};

/**
 * Extracts and formats a cell value for CSV export.
 * Prioritizes meta.exportValue for custom formatting, then accessorKey, then default types.
 * @param row - The full data object for the row.
 * @param column - The TanStack Table column definition.
 * @returns A string, number, boolean, or null suitable for a CSV cell.
 */
const getCellValue = <TData extends RowData>(row: TData, column: DataTableColumnDef<TData, any>): string | number | boolean | null => {
    const accessorKey = column.accessorKey as string | undefined;
    const meta = column.meta as any;

    // 1. Use custom exportValue function if provided in meta (highest priority)
    if (typeof meta?.exportValue === 'function') {
        return meta.exportValue(row);
    }

    // 2. Get the raw value using accessorKey or column.id if no custom exportValue
    let rawValue: any;
    if (accessorKey) {
        const keys = accessorKey.split('.');
        rawValue = keys.reduce((obj, key) => (obj && typeof obj === 'object' && obj[key] !== undefined) ? obj[key] : undefined, row);
    } else if (column.id) {
        // Fallback for columns identified by ID but without accessorKey
        // This assumes the ID might also match a key on the row object directly or a meta.exportValue function would handle it
        rawValue = (row as any)[column.id];
    } else {
        console.warn(`Column "${meta?.title || String(column.header) || 'Unknown'}" lacks accessorKey/id or meta.exportValue for export.`);
        rawValue = '';
    }

    // 3. Apply default formatting based on inferred type or meta hints
    if (rawValue === null || rawValue === undefined) {
        return ''; // Represent null/undefined as empty string
    }
    if (rawValue instanceof Date) {
        return safeFormatDate(rawValue);
    }
    // Handle date strings explicitly if accessorKey hints at it
    if (typeof rawValue === 'string' && (accessorKey?.includes('date') || accessorKey?.includes('modified') || accessorKey?.includes('creation'))) {
        return safeFormatDate(rawValue);
    }
    if (typeof rawValue === 'number') {
        // Apply currency formatting if meta.isCurrency is true
        if (meta?.isCurrency) {
            return formatToRoundedIndianRupee(rawValue);
        }
        return rawValue.toString(); // Return as string to avoid spreadsheet auto-formatting issues
    }
    if (typeof rawValue === 'boolean') {
        return rawValue ? 'TRUE' : 'FALSE';
    }
    if (typeof rawValue === 'object') {
        // Avoid exporting complex objects directly without explicit formatting
        console.warn(`Exporting complex object for column "${meta?.title || String(column.header) || 'Unknown'}". Consider using meta.exportValue.`);
        try {
            return JSON.stringify(rawValue);
        } catch {
            return '[Object]';
        }
    }

    return String(rawValue); // Default to string conversion
};

/**
 * Exports data to a CSV file using papaparse.unparse.
 * It intelligently uses column definitions (including meta) to determine headers and cell values.
 * @param filename - The desired filename (without .csv extension).
 * @param data - The array of data objects (rows) to export. This should be the *filtered* data.
 * @param columns - The Tanstack Table column definitions to determine headers and accessors.
 */
export const exportToCsv = <TData extends RowData>(
    filename: string,
    data: TData[],
    columns: DataTableColumnDef<TData, any>[]
) => {
    if (!data || data.length === 0) {
        console.info('No data provided for CSV export.');
        // Optionally show a toast message: toast.info("No data to export.");
        return;
    }

    try {
        // 1. Filter columns intended for export
        const exportableColumns = columns.filter(col => {
            const meta = col.meta as any;
            // Exclude if explicitly marked in meta, or if it's an actions column without an accessorKey
            if (meta?.excludeFromExport) {
                return false;
            }
            // Include if it has an accessorKey, or an ID (and not explicitly excluded)
            // or an explicit exportHeaderName (strongest indicator for inclusion).
            return col.accessorKey || col.id || meta?.exportHeaderName;
        });

        if (exportableColumns.length === 0) {
            console.warn('No columns are configured for export.');
            // Optionally show a toast message: toast.info("No columns configured for export.");
            return;
        }

        // 2. Extract Headers
        // Priority: meta.exportHeaderName > meta.title > col.header (if string) > col.accessorKey > col.id
        const headers = exportableColumns.map(col => {
            const meta = col.meta as any;
            if (meta?.exportHeaderName && String(meta.exportHeaderName).trim() !== '') {
                return String(meta.exportHeaderName).trim();
            }
            if (meta?.title && String(meta.title).trim() !== '') {
                return String(meta.title).trim();
            }
            if (typeof col.header === 'string' && col.header.trim() !== '') {
                return col.header.trim();
            }
            if (col.accessorKey) {
                return String(col.accessorKey);
            }
            if (col.id) {
                return String(col.id);
            }
            return 'Unknown Column';
        });

        // 3. Extract Row Data using getCellValue
        const rows = data.map(rowDataItem =>
            exportableColumns.map(col => getCellValue(rowDataItem, col))
        );

        // 4. Convert data (including headers) to CSV string
        const csvString = unparse(
            [headers, ...rows],
            {
                skipEmptyLines: true,
                delimiter: ',', // Ensure standard comma delimiter
                quoteChar: '"', // Ensure standard quote character
            }
        );

        if (typeof csvString !== 'string') {
            throw new Error("PapaParse unparse did not return a string.");
        }

        // 5. Create Blob and Trigger Download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = format(new Date(), 'yyyyMMdd_HHmmss'); // Use date-fns for timestamp
        link.href = url;
        link.setAttribute('download', `${filename}_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`Successfully exported ${data.length} rows to ${filename}_${timestamp}.csv`);
        // Optionally show success toast: toast.success("Data exported successfully!");

    } catch (error) {
        console.error('Error exporting data to CSV:', error);
        // Optionally show error toast: toast.error("Failed to export data.");
    }
};