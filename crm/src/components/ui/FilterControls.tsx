// src/components/ui/FilterControls.tsx

import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { format, subDays, parseISO, isEqual } from 'date-fns';
import { useState, useEffect } from "react";

// Define the props the component will accept
interface FilterControlsProps {
    // A function to call whenever the date range is updated
    onDateRangeChange: (newRange: { from: string; to: string; }) => void;
}

export const FilterControls = ({ onDateRangeChange }: FilterControlsProps) => {
    const { openDateRangePickerDialog } = useDialogStore();

    // Internal state to track the selected dates
    const [dateRange, setDateRange] = useState({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
    });

    // When the internal dateRange state changes, call the prop function to notify the parent
    useEffect(() => {
        onDateRangeChange(dateRange);
    }, [dateRange, onDateRangeChange]);

    // This is the logic to open the date picker dialog
    const handleSelectRange = () => {
        openDateRangePickerDialog({
            onConfirm: (range) => {
                // When the user confirms, update the internal state
                setDateRange({
                    from: format(range.from, 'yyyy-MM-dd'),
                    to: format(range.to, 'yyyy-MM-dd'),
                });
            }
        });
    };

    // This is the logic to reset the filter to the last 30 days
    const resetToLast30Days = () => {
        setDateRange({
            from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            to: format(new Date(), 'yyyy-MM-dd'),
        });
    };

    // --- Dynamic Button Styling Logic ---
    // Calculate what the "last 30 days" range is
    const last30DaysRange = {
        from: parseISO(format(subDays(new Date(), 30), 'yyyy-MM-dd')),
        to: parseISO(format(new Date(), 'yyyy-MM-dd')),
    };
    // Get the current range from state
    const currentRange = {
        from: parseISO(dateRange.from),
        to: parseISO(dateRange.to),
    };
    // Check if the current selection is the last 30 days
    const isLast30Days = isEqual(last30DaysRange.from, currentRange.from) && isEqual(last30DaysRange.to, currentRange.to);

    return (
        <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Filter by:</p>
            <div className="flex items-center border rounded-md overflow-hidden">
                <Button
                    variant="ghost"
                    className={`rounded-r-none h-8 text-xs transition-colors ${isLast30Days ? 'bg-gray-700 text-white' : 'text-muted-foreground'}`}
                    onClick={resetToLast30Days}
                >
                    30 Days
                </Button>
                <Button
                    variant="ghost"
                    className={`rounded-l-none h-8 border-l text-xs transition-colors ${!isLast30Days ? 'bg-gray-700 text-white' : 'text-muted-foreground'}`}
                    onClick={handleSelectRange}
                >
                    Select Date Range
                </Button>
            </div>
        </div>
    );
};