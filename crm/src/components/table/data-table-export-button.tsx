// src/components/table/data-table-export-button.tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/utils/export-to-csv'; // Corrected relative import
import { DataTableColumnDef } from './utils/table-filters'; // Corrected relative import

// Define props for the export button
interface DataTableExportButtonProps<TData> {
  data: TData[]; // The array of filtered data to export
  columns: DataTableColumnDef<TData>[]; // The full column definitions to guide export
  fileName?: string; // Optional base file name for the CSV
  label?: string; // Optional button label
}

export function DataTableExportButton<TData>({
  data,
  columns,
  fileName = 'export',
  label = 'Export CSV',
}: DataTableExportButtonProps<TData>) {

  const handleExport = () => {
    exportToCsv(fileName, data, columns);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={data.length === 0} // Disable if no data available for export
      className="h-10 w-full md:w-auto" // Styling to match other toolbar buttons
    >
      <Download className="mr-2 h-4 w-4" /> {/* Standard icon size for button */}
      {label}
    </Button>
  );
}