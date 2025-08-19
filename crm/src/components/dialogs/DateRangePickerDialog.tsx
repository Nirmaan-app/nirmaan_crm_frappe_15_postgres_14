// src/components/dialogs/DateRangePickerDialog.tsx
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useDialogStore } from "@/store/dialogStore";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import React, { useEffect } from "react";


export const DateRangePickerDialog = () => {
    // Get the context and the close action from the Zustand store
    const { dateRangePicker, closeDateRangePickerDialog } = useDialogStore();
    
    // Local state to manage the selected date range within the dialog
    const [date, setDate] = useState<DateRange | undefined>();

    const handleConfirm = () => {
        // Ensure both a 'from' and 'to' date have been selected
        if (date?.from && date?.to) {
            // Call the onConfirm function that was passed in the context from the trigger component
            dateRangePicker.context.onConfirm(date);
            // Close the dialog after confirming
            closeDateRangePickerDialog();
        }
    };

    return (
        <div className="flex flex-col">
            {/* <Calendar
                mode="range" // Set the calendar to range selection mode
            
                selected={date}
                onSelect={setDate}
                className="rounded-md p-0"
                
            /> */}

           <Calendar
        mode="range"
        // defaultMonth={date}
        selected={date}
        onSelect={setDate}
          className="min-w-full"
        // captionLayout={dropdown}
        // className="rounded-lg"
      />
            <div className="flex gap-2 justify-center w-full mt-4 pt-4 border-t">
                <Button variant="outline" className="flex-1 border-destructive text-destructive" onClick={closeDateRangePickerDialog}>
                    Cancel
                </Button>
                <Button 
                    className="flex-1 bg-destructive hover:bg-destructive/90" 
                    onClick={handleConfirm} 
                    // Disable the confirm button until a full range is selected
                    disabled={!date?.from || !date?.to}
                >
                    Confirm
                </Button>
            </div>
        </div>
    );
};