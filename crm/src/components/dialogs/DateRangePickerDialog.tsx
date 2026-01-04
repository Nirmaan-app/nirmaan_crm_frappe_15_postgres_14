// src/components/dialogs/DateRangePickerDialog.tsx
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useDialogStore } from "@/store/dialogStore";
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";

export const DateRangePickerDialog = () => {
    const { dateRangePicker, closeDateRangePickerDialog } = useDialogStore();
    const [date, setDate] = useState<DateRange | undefined>();

    const handleConfirm = () => {
        if (date?.from && date?.to) {
            dateRangePicker.context.onConfirm(date);
            closeDateRangePickerDialog();
        }
    };

    const handleClear = () => {
        setDate(undefined);
    };

    // Format selected range for display
    const selectionSummary = useMemo(() => {
        if (!date?.from) return null;
        const fromStr = format(date.from, "MMM d, yyyy");
        const toStr = date.to ? format(date.to, "MMM d, yyyy") : "Select end date";
        return { from: fromStr, to: toStr };
    }, [date]);

    const hasValidRange = date?.from && date?.to;

    return (
        <div className="flex flex-col">
            {/* Selection Summary */}
            <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            From
                        </span>
                        <p className={`text-sm font-medium truncate ${date?.from ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {selectionSummary?.from || "Select start date"}
                        </p>
                    </div>
                    <div className="w-8 flex justify-center">
                        <div className="w-4 h-px bg-border" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                            To
                        </span>
                        <p className={`text-sm font-medium truncate ${date?.to ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {selectionSummary?.to || "Select end date"}
                        </p>
                    </div>
                    {date?.from && (
                        <button
                            onClick={handleClear}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Clear selection"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Calendar - Fixed height container to prevent shifting */}
            <div className="calendar-fixed-container flex justify-center">
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={1}
                    fixedWeeks
                    showOutsideDays
                    className="!w-full"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="flex-1 h-10 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={closeDateRangePickerDialog}
                >
                    Cancel
                </Button>
                <Button
                    className="flex-1 h-10 text-sm font-medium bg-destructive hover:bg-destructive/90 transition-all duration-200 disabled:opacity-40"
                    onClick={handleConfirm}
                    disabled={!hasValidRange}
                >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Confirm
                </Button>
            </div>
        </div>
    );
};