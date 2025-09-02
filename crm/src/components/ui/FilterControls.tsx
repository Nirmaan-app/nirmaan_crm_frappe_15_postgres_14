// src/components/ui/FilterControls.tsx

import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { format, subDays, parseISO, isEqual } from 'date-fns';
import { useMemo } from "react";

// Define the props the component will accept
interface FilterControlsProps {
    // A function to call whenever the date range is updated
    onDateRangeChange: (newRange: { from: string; to: string; }) => void;
    dateRange: { from: string; to: string; }; // Expect `dateRange`
}

export const FilterControls = ({ onDateRangeChange, dateRange }: FilterControlsProps) => {
    const { openDateRangePickerDialog } = useDialogStore();

    // // Internal state to track the selected dates
    // const [dateRange, setDateRange] = useState({
    //     from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    //     to: format(new Date(), 'yyyy-MM-dd'),
    // });

    // // When the internal dateRange state changes, call the prop function to notify the parent
    // useEffect(() => {
    //     onDateRangeChange(dateRange);
    // }, [dateRange, onDateRangeChange]);

    // This is the logic to open the date picker dialog
    const handleSelectRange = () => {
        openDateRangePickerDialog({
            onConfirm: (range) => {
                // When the user confirms, update the internal state
                onDateRangeChange({
                    from: format(range.from, 'yyyy-MM-dd'),
                    to: format(range.to, 'yyyy-MM-dd'),
                });
            }
        });
    };

    // This is the logic to reset the filter to the last 30 days
    const resetToLast30Days = () => {
        onDateRangeChange({
            from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            to: format(new Date(), 'yyyy-MM-dd'),
        });
    };

    // --- Dynamic Button Styling Logic ---
    // Calculate what the "last 30 days" range is
    const isLast30Days = useMemo(() => {
        const last30DaysRange = {
            from: parseISO(format(subDays(new Date(), 30), 'yyyy-MM-dd')),
            to: parseISO(format(new Date(), 'yyyy-MM-dd')),
        };
        // Get the current range from state
        const currentRange = {
            from: parseISO(dateRange.from),
            to: parseISO(dateRange.to),
        };
        return isEqual(last30DaysRange.from, currentRange.from) && isEqual(last30DaysRange.to, currentRange.to);
    }, [dateRange]);
    // Check if the current selection is the last 30 days
    // const isLast30Days = isEqual(last30DaysRange.from, currentRange.from) && isEqual(last30DaysRange.to, currentRange.to);
    // --- NEW: Step 1 ---
    // Create a dynamic label for the date range button.
    // This logic runs only when the date range changes, thanks to useMemo.
    const dateRangeButtonLabel = useMemo(() => {
        if (isLast30Days) {
            return "Select Date Range";
        }

        // --- NEW: Step 2 ---
        // Format the dates into a user-friendly string when a custom range is active.
        try {
            const fromDate = format(parseISO(dateRange.from), 'MMM d');
            const toDate = format(parseISO(dateRange.to), 'MMM d');
            return `${fromDate} - ${toDate}`;
        } catch (e) {
            // Fallback in case of an invalid date string
            return "Custom Range";
        }
    }, [isLast30Days, dateRange]);

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
                    {/* --- NEW: Step 3 --- */}
                    {/* Use the dynamic label variable here instead of static text */}
                    {dateRangeButtonLabel}
                </Button>
            </div>
        </div>
    );
};