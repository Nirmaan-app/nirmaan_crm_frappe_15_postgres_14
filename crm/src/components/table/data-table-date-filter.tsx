// src/components/table/data-table-date-filter.tsx
import * as React from 'react';
import { Column } from '@tanstack/react-table';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Filter, FilterX, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Filter value structure
export interface DateFilterValue {
    operator: string;
    value: string | string[] | null;
}

// Operators with minimal labels
const dateOperators = [
    { value: 'Is', label: 'Exact date' },
    { value: 'Between', label: 'Date range' },
    { value: '<=', label: 'Before' },
    { value: '>=', label: 'After' },
    { value: 'Timespan', label: 'Preset' },
];

// Grouped timespan options for better UX
const timespanGroups = [
    {
        label: 'Relative',
        options: [
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
        ]
    },
    {
        label: 'This Period',
        options: [
            { value: 'this week', label: 'This week' },
            { value: 'this month', label: 'This month' },
            { value: 'this quarter', label: 'This quarter' },
            { value: 'this year', label: 'This year' },
        ]
    },
    {
        label: 'Last Period',
        options: [
            { value: 'last week', label: 'Last week' },
            { value: 'last month', label: 'Last month' },
            { value: 'last quarter', label: 'Last quarter' },
            { value: 'last year', label: 'Last year' },
        ]
    },
    {
        label: 'Rolling',
        options: [
            { value: 'last 7 days', label: 'Last 7 days' },
            { value: 'last 14 days', label: 'Last 14 days' },
            { value: 'last 30 days', label: 'Last 30 days' },
            { value: 'last 90 days', label: 'Last 90 days' },
            { value: 'last 6 months', label: 'Last 6 months' },
        ]
    }
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
    } catch {
        return undefined;
    }
};

export function DataTableDateFilter<TData>({
    column,
}: DataTableDateFilterProps<TData>) {
    const filterValue = column.getFilterValue() as DateFilterValue | undefined;

    // Internal state
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

    // Sync state with external filter value
    React.useEffect(() => {
        const currentFilter = column.getFilterValue() as DateFilterValue | undefined;
        setOperator(currentFilter?.operator || 'Is');
        setDate(parseFilterDate(
            (currentFilter?.operator !== 'Between' && currentFilter?.operator !== 'Timespan' && typeof currentFilter?.value === 'string')
                ? currentFilter.value : undefined
        ));
        setDateRange({
            from: parseFilterDate(currentFilter?.operator === 'Between' && Array.isArray(currentFilter.value) ? currentFilter.value[0] : undefined),
            to: parseFilterDate(currentFilter?.operator === 'Between' && Array.isArray(currentFilter.value) ? currentFilter.value[1] : undefined),
        });
        setTimespan(currentFilter?.operator === 'Timespan' && typeof currentFilter?.value === 'string' ? currentFilter.value : undefined);
    }, [column.getFilterValue()]);

    // Compact summary of the current, *unapplied* selection — shown inline in the header.
    const previewSummary = React.useMemo<string | null>(() => {
        if (operator === 'Between' && dateRange.from && dateRange.to) {
            return `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yy')}`;
        }
        if (['Is', '<=', '>='].includes(operator) && date) {
            return format(date, 'MMM d, yyyy');
        }
        if (operator === 'Timespan' && timespan) {
            const found = timespanGroups.flatMap(g => g.options).find(o => o.value === timespan);
            return found?.label ?? null;
        }
        return null;
    }, [operator, date, dateRange, timespan]);

    const handleApplyFilter = () => {
        let newFilter: DateFilterValue | undefined = undefined;
        let hasValidValue = false;

        if (operator === 'Between') {
            if (dateRange.from && dateRange.to) {
                const valFrom = formatDateForFilterValue(dateRange.from);
                const valTo = formatDateForFilterValue(dateRange.to);
                if (valFrom && valTo) {
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
        setDate(undefined);
        setDateRange({ from: undefined, to: undefined });
        setTimespan(undefined);
        setPopoverOpen(false);
    };

    const isFilterActive = !!column.getFilterValue();

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "cursor-pointer p-1 rounded-md transition-colors",
                        isFilterActive
                            ? "bg-accent text-primary-foreground"
                            : "bg-background text-muted-foreground",
                        "hover:bg-muted"
                    )}
                >
                    {isFilterActive ? (
                        <FilterX
                            className={cn(
                                "h-3.5 w-3.5 text-destructive",
                                isFilterActive && "animate-bounce"
                            )}
                        />
                    ) : (
                        <Filter className="h-3.5 w-3.5" />
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-[300px] p-0 flex flex-col overflow-hidden"
                align="end"
                sideOffset={8}
            >
                {/* Compact header: inline Select + live selection chip */}
                <div className="flex items-center gap-2 px-3 pt-3">
                    <Select value={operator} onValueChange={setOperator}>
                        <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
                            <SelectValue placeholder="Filter type" />
                        </SelectTrigger>
                        <SelectContent>
                            {dateOperators.map((op) => (
                                <SelectItem key={op.value} value={op.value} className="text-sm">
                                    {op.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {previewSummary && (
                        <span
                            className="shrink-0 max-w-[140px] truncate h-8 px-2 inline-flex items-center rounded-md bg-muted/60 text-[11px] tabular-nums text-foreground"
                            title={previewSummary}
                        >
                            {previewSummary}
                        </span>
                    )}
                </div>

                <div className="px-3 pb-2 pt-2">
                    {/* Date Range Calendar */}
                    {operator === 'Between' && (
                        <div className="calendar-fixed-container calendar-fixed-container--compact">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                numberOfMonths={1}
                                fixedWeeks
                                showOutsideDays
                                compact
                                className="!w-full"
                            />
                        </div>
                    )}

                    {/* Single Date Calendar */}
                    {['Is', '<=', '>='].includes(operator) && (
                        <div className="calendar-fixed-container calendar-fixed-container--compact">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                numberOfMonths={1}
                                fixedWeeks
                                showOutsideDays
                                compact
                                className="!w-full"
                            />
                        </div>
                    )}

                    {/* Timespan Selection — no calendar, just a grouped select */}
                    {operator === 'Timespan' && (
                        <div className="py-2">
                            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                                <Clock className="h-3 w-3" />
                                Time period
                            </div>
                            <Select value={timespan} onValueChange={setTimespan}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Choose period" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[240px]">
                                    {timespanGroups.map((group) => (
                                        <React.Fragment key={group.label}>
                                            <div className="px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-medium">
                                                {group.label}
                                            </div>
                                            {group.options.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border/60 bg-muted/30">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClearFilter();
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 px-4 text-xs bg-destructive hover:bg-destructive/90"
                        onClick={handleApplyFilter}
                    >
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
