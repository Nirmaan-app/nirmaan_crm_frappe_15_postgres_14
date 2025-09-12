// src/components/table/data-table-date-filter.tsx
import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Filter, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils'; // Import cn utility for combining classes

// Define the structure for our date filter state
export interface DateFilterValue {
    operator: string;
    value: string | string[] | null; // string for single date/timespan, array for 'Between'
}

// Define operators
const dateOperators = [
    { value: 'Is', label: 'Is' },
    { value: 'Between', label: 'Between' },
    { value: '<=', label: 'On or Before' },
    { value: '>=', label: 'On or After' },
    { value: 'Timespan', label: 'Timespan' },
];

const timespanOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this week', label: 'This Week' },
    { value: 'last week', label: 'Last Week' },
    { value: 'this month', label: 'This Month' },
    { value: 'last month', label: 'Last Month' },
    { value: 'this quarter', label: 'This Quarter' },
    { value: 'last quarter', label: 'Last Quarter' },
    { value: 'this year', label: 'This Year' },
    { value: 'last year', label: 'Last Year' },
    { value: 'last 7 days', label: 'Last 7 days' },
    { value: 'last 14 days', label: 'Last 14 days' },
    { value: 'last 30 days', label: 'Last 30 days' },
    { value: 'last 90 days', label: 'Last 90 days' },
    { value: 'last 6 months', label: 'Last 6 months' },
];

interface DataTableDateFilterProps<TData> {
    column: Column<TData, unknown>;
    title?: string;
}

const formatDateForFilterValue = (date: Date | undefined | null): string | undefined => {
    return date ? format(date, 'yyyy-MM-dd') : undefined;
};

const parseFilterDate = (dateString: string | undefined | null): Date | undefined => {
    if (!dateString) return undefined;
    try {
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) return undefined;
        return date;
    } catch (e) {
        return undefined;
    }
}

export function DataTableDateFilter<TData>({
    column,
    title,
}: DataTableDateFilterProps<TData>) {

    const filterValue = column.getFilterValue() as DateFilterValue | undefined;

    const [operator, setOperator] = React.useState<string>(filterValue?.operator || 'Is');
    const [date, setDate] = React.useState<Date | undefined>(() =>
        parseFilterDate(
             (filterValue?.operator !== 'Between' && filterValue?.operator !== 'Timespan' && typeof filterValue?.value === 'string')
                ? filterValue.value : undefined
        )
    );
    const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>(() => ({
        from: parseFilterDate(filterValue?.operator === 'Between' && Array.isArray(filterValue.value) ? filterValue.value[0] : undefined),
        to: parseFilterDate(filterValue?.operator === 'Between' && Array.isArray(filterValue.value) ? filterValue.value[1] : undefined),
    }));
    const [timespan, setTimespan] = React.useState<string | undefined>(() =>
         filterValue?.operator === 'Timespan' && typeof filterValue?.value === 'string' ? filterValue.value : undefined
    );
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    React.useEffect(() => {
        const currentFilter = column.getFilterValue() as DateFilterValue | undefined;
        setOperator(currentFilter?.operator || 'Is');
        setDate(parseFilterDate( (currentFilter?.operator !== 'Between' && currentFilter?.operator !== 'Timespan' && typeof currentFilter?.value === 'string') ? currentFilter.value : undefined ));
        setDateRange({
            from: parseFilterDate(currentFilter?.operator === 'Between' && Array.isArray(currentFilter.value) ? currentFilter.value[0] : undefined),
            to: parseFilterDate(currentFilter?.operator === 'Between' && Array.isArray(currentFilter.value) ? currentFilter.value[1] : undefined),
        });
        setTimespan(currentFilter?.operator === 'Timespan' && typeof currentFilter?.value === 'string' ? currentFilter.value : undefined);
    }, [column.getFilterValue()]);

    const handleApplyFilter = () => {
        let newFilter: DateFilterValue | undefined = undefined;
        let hasValidValue = false;

        if (operator === 'Between') {
            if (dateRange.from && dateRange.to) {
                const valFrom = formatDateForFilterValue(dateRange.from);
                const valTo = formatDateForFilterValue(dateRange.to);
                if(valFrom && valTo) {
                    newFilter = { operator, value: [valFrom, valTo] };
                    hasValidValue = true;
                }
            }
        } else if (operator === 'Timespan') {
            if (timespan) {
                newFilter = { operator, value: timespan };
                hasValidValue = true;
            }
        } else if (['Is', '<=', '>='].includes(operator)) {
            if (date) {
                const val = formatDateForFilterValue(date);
                if (val) {
                    newFilter = { operator, value: val };
                    hasValidValue = true;
                }
            }
        }

        column.setFilterValue(hasValidValue ? newFilter : undefined);
        setPopoverOpen(false);
    };

    const handleClearFilter = () => {
        column.setFilterValue(undefined);
        setPopoverOpen(false);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
              <div
                  className={cn(
                    "cursor-pointer p-1 rounded-md",
                    column.getFilterValue() ? "bg-accent text-primary-foreground" : "bg-background text-muted-foreground",
                    "hover:bg-muted transition-colors"
                  )}
              >
                  {column.getFilterValue() ? (
                      <FilterX
                          className={cn(
                            "h-3.5 w-3.5 text-destructive", // small-xs icon size
                            column.getFilterValue() && "animate-bounce"
                          )}
                      />
                  ) : (
                      <Filter className="h-3.5 w-3.5" /> // small-xs icon size
                  )}
              </div>
          </PopoverTrigger>
            {/* Adjusted PopoverContent for responsiveness and compactness */}
            <PopoverContent
                className={cn(
                    "w-fit p-3", // Uniform padding around the entire content of the popover
                    "max-w-[calc(100vw-2rem)] md:max-w-sm" // Responsive max-width
                )}
                align="start"
            >
                {/* This div now only needs vertical spacing, horizontal padding is from PopoverContent */}
                <div className="space-y-3">
                    {/* Operator Select */}
                    <div className="space-y-1.5">
                        <Label htmlFor={`op-${column.id}`} className="text-sm">Condition</Label>
                        <Select value={operator} onValueChange={setOperator}>
                            <SelectTrigger id={`op-${column.id}`} className="h-8 text-sm">
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                                {dateOperators.map((op) => (
                                    <SelectItem key={op.value} value={op.value} className="text-sm">{op.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date/Range/Timespan Inputs based on selected operator */}
                    {operator === 'Between' && (
                        <div className="space-y-1.5">
                             <Label className="text-sm">Date Range</Label>
                             <Calendar
                                 initialFocus
                                 mode="range"
                                 defaultMonth={dateRange?.from}
                                 selected={dateRange}
                                 onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                 numberOfMonths={1}
                                 className="p-0" // Remove padding from calendar itself for max compactness
                             />
                        </div>
                    )}
                    {['Is', '<=', '>='].includes(operator) && (
                         <div className="space-y-1.5">
                            <Label className="text-sm">Date</Label>
                             <Calendar
                                 mode="single"
                                 selected={date}
                                 onSelect={setDate}
                                 initialFocus
                                 className="p-0" // Remove padding from calendar itself for max compactness
                             />
                         </div>
                    )}
                    {operator === 'Timespan' && (
                        <div className="space-y-1.5">
                             <Label htmlFor={`ts-${column.id}`} className="text-sm">Timespan</Label>
                            <Select value={timespan} onValueChange={setTimespan}>
                                <SelectTrigger id={`ts-${column.id}`} className="h-8 text-sm">
                                    <SelectValue placeholder="Select timespan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timespanOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>
                    )}
                </div>
                <Separator className="my-3" /> {/* Add vertical margin to separator for visual break */}
                <div className="flex justify-end gap-2"> {/* Removed its own padding, inherits from PopoverContent */}
                     <Button variant="ghost" size="sm" onClick={handleClearFilter} disabled={!filterValue}>Clear</Button>
                     <Button size="sm" onClick={handleApplyFilter} className="bg-destructive hover:bg-destructive/90">Apply</Button> {/* Use destructive variant for Apply */}
                </div>
            </PopoverContent>
        </Popover>
    );
}

// import * as React from 'react';
// import { Column } from '@tanstack/react-table';
// import { format } from 'date-fns';

// // Removed Badge import
// import { Button } from '@/components/ui/button';
// import { Calendar } from '@/components/ui/calendar';
// import { Label } from '@/components/ui/label';
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from '@/components/ui/popover';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
// import { Filter, FilterX } from 'lucide-react';

// // Define the structure for our date filter state - exported for table-filters.ts
// export interface DateFilterValue {
//     operator: string;
//     value: string | string[] | null; // string for single date/timespan, array for 'Between'
// }

// // Define operators
// const dateOperators = [
//     { value: 'Is', label: 'Is' },
//     { value: 'Between', label: 'Between' },
//     { value: '<=', label: 'On or Before' },
//     { value: '>=', label: 'On or After' },
//     { value: 'Timespan', label: 'Timespan' },
// ];

// const timespanOptions = [
//     { value: 'today', label: 'Today' },
//     { value: 'yesterday', label: 'Yesterday' },
//     { value: 'this week', label: 'This Week' },
//     { value: 'last week', label: 'Last Week' },
//     { value: 'this month', label: 'This Month' },
//     { value: 'last month', label: 'Last Month' },
//     { value: 'this quarter', label: 'This Quarter' },
//     { value: 'last quarter', label: 'Last Quarter' },
//     { value: 'this year', label: 'This Year' },
//     { value: 'last year', label: 'Last Year' },
//     { value: 'last 7 days', label: 'Last 7 days' },
//     { value: 'last 14 days', label: 'Last 14 days' },
//     { value: 'last 30 days', label: 'Last 30 days' },
//     { value: 'last 90 days', label: 'Last 90 days' },
//     { value: 'last 6 months', label: 'Last 6 months' },
// ];

// interface DataTableDateFilterProps<TData> {
//     column: Column<TData, unknown>;
//     title?: string;
// }

// // Helper to format date for filter value (YYYY-MM-DD)
// const formatDateForFilterValue = (date: Date | undefined | null): string | undefined => {
//     return date ? format(date, 'yyyy-MM-dd') : undefined;
// };

// // Helper to safely parse date string, considering timezone might be needed
// const parseFilterDate = (dateString: string | undefined | null): Date | undefined => {
//     if (!dateString) return undefined;
//     try {
//         const date = new Date(dateString + 'T00:00:00');
//         if (isNaN(date.getTime())) return undefined;
//         return date;
//     } catch (e) {
//         return undefined;
//     }
// }

// export function DataTableDateFilter<TData>({
//     column,
//     title,
// }: DataTableDateFilterProps<TData>) {

//     const filterValue = column.getFilterValue() as DateFilterValue | undefined;

//     const [operator, setOperator] = React.useState<string>(filterValue?.operator || 'Is');
//     const [date, setDate] = React.useState<Date | undefined>(() =>
//         parseFilterDate(
//              (filterValue?.operator !== 'Between' && filterValue?.operator !== 'Timespan' && typeof filterValue?.value === 'string')
//                 ? filterValue.value : undefined
//         )
//     );
//     const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>(() => ({
//         from: parseFilterDate(filterValue?.operator === 'Between' && Array.isArray(filterValue.value) ? filterValue.value[0] : undefined),
//         to: parseFilterDate(filterValue?.operator === 'Between' && Array.isArray(filterValue.value) ? filterValue.value[1] : undefined),
//     }));
//     const [timespan, setTimespan] = React.useState<string | undefined>(() =>
//          filterValue?.operator === 'Timespan' && typeof filterValue?.value === 'string' ? filterValue.value : undefined
//     );
//     const [popoverOpen, setPopoverOpen] = React.useState(false);

//     React.useEffect(() => {
//         const currentFilter = column.getFilterValue() as DateFilterValue | undefined;
//         setOperator(currentFilter?.operator || 'Is');
//         setDate(parseFilterDate( (currentFilter?.operator !== 'Between' && currentFilter?.operator !== 'Timespan' && typeof currentFilter?.value === 'string') ? currentFilter.value : undefined ));
//         setDateRange({
//             from: parseFilterDate(currentFilter?.operator === 'Between' && Array.isArray(currentFilter.value) ? currentFilter.value[0] : undefined),
//             to: parseFilterDate(currentFilter?.operator === 'Between' && Array.isArray(currentFilter.value) ? currentFilter.value[1] : undefined),
//         });
//         setTimespan(currentFilter?.operator === 'Timespan' && typeof currentFilter?.value === 'string' ? currentFilter.value : undefined);
//     }, [column.getFilterValue()]);

//     const handleApplyFilter = () => {
//         let newFilter: DateFilterValue | undefined = undefined;
//         let hasValidValue = false;

//         if (operator === 'Between') {
//             if (dateRange.from && dateRange.to) {
//                 const valFrom = formatDateForFilterValue(dateRange.from);
//                 const valTo = formatDateForFilterValue(dateRange.to);
//                 if(valFrom && valTo) {
//                     newFilter = { operator, value: [valFrom, valTo] };
//                     hasValidValue = true;
//                 }
//             }
//         } else if (operator === 'Timespan') {
//             if (timespan) {
//                 newFilter = { operator, value: timespan };
//                 hasValidValue = true;
//             }
//         } else if (['Is', '<=', '>='].includes(operator)) {
//             if (date) {
//                 const val = formatDateForFilterValue(date);
//                 if (val) {
//                     newFilter = { operator, value: val };
//                     hasValidValue = true;
//                 }
//             }
//         }

//         column.setFilterValue(hasValidValue ? newFilter : undefined);
//         setPopoverOpen(false);
//     };

//     const handleClearFilter = () => {
//         column.setFilterValue(undefined);
//         setPopoverOpen(false);
//     };

//     return (
//         <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
//           <PopoverTrigger asChild>
//               <div
//                   className={`cursor-pointer ${
//                     column.getFilterValue() ? "bg-accent text-primary-foreground" : "bg-background text-muted-foreground"
//                   } hover:bg-muted p-1 rounded-md`}
//               >
//                   {column.getFilterValue() ? (
//                       <FilterX
//                           className={`h-3.5 w-3.5 text-destructive ${column.getFilterValue() && "animate-bounce"}`} // small-xs icon size
//                       />
//                   ) : (
//                       <Filter className="h-3.5 w-3.5" /> // small-xs icon size
//                   )}
//               </div>
//           </PopoverTrigger>
//             <PopoverContent className="w-[300px] p-0" align="start">
//                 <div className="p-4 space-y-4">
//                     {/* Operator Select */}
//                     <div className="space-y-2">
//                         <Label htmlFor={`op-${column.id}`}>Condition</Label>
//                         <Select value={operator} onValueChange={setOperator}>
//                             <SelectTrigger id={`op-${column.id}`} className="h-8">
//                                 <SelectValue placeholder="Select condition" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {dateOperators.map((op) => (
//                                     <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     {/* Date/Range/Timespan Inputs based on selected operator */}
//                     {operator === 'Between' && (
//                         <div className="space-y-2">
//                              <Label>Date Range</Label>
//                              <Calendar
//                                  initialFocus
//                                  mode="range"
//                                  defaultMonth={dateRange?.from}
//                                  selected={dateRange}
//                                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
//                                  numberOfMonths={1}
//                              />
//                         </div>
//                     )}
//                     {['Is', '<=', '>='].includes(operator) && (
//                          <div className="space-y-2">
//                             <Label>Date</Label>
//                              <Calendar
//                                  mode="single"
//                                  selected={date}
//                                  onSelect={setDate}
//                                  initialFocus
//                              />
//                          </div>
//                     )}
//                     {operator === 'Timespan' && (
//                         <div className="space-y-2">
//                              <Label htmlFor={`ts-${column.id}`}>Timespan</Label>
//                             <Select value={timespan} onValueChange={setTimespan}>
//                                 <SelectTrigger id={`ts-${column.id}`} className="h-8">
//                                     <SelectValue placeholder="Select timespan" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {timespanOptions.map((opt) => (
//                                         <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
//                                     ))}
//                                 </SelectContent>
//                              </Select>
//                         </div>
//                     )}
//                 </div>
//                 <Separator />
//                 <div className="p-2 flex justify-end gap-2">
//                      <Button variant="ghost" size="sm" onClick={handleClearFilter} disabled={!filterValue}>Clear</Button>
//                      <Button size="sm" onClick={handleApplyFilter}>Apply</Button>
//                 </div>
//             </PopoverContent>
//         </Popover>
//     );
// }