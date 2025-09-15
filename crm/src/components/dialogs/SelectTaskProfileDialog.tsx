// src/components/dialogs/SelectTaskProfileDialog.tsx

import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { Briefcase, Construction } from "lucide-react";

/**
 * A dialog component presented to Admin users to choose whether they are
 * creating a task for the Sales team or the Estimation team.
 */
export const SelectTaskProfileDialog = () => {
    const { selectTaskProfileDialog, closeSelectTaskProfileDialog } = useDialogStore();
    const { onSelect } = selectTaskProfileDialog.context;

    const handleSelect = (profile: 'Sales' | 'Estimates') => {
        // Call the onSelect callback that was passed when the dialog was opened.
        // This will trigger the opening of the appropriate task form.
        onSelect(profile);
        // Close this selection dialog.
        closeSelectTaskProfileDialog();
    };

    return (
        <div className="space-y-6 py-4">
            <p className="text-center text-muted-foreground">
                Which team is this task for?
            </p>
            <div className="flex flex-col md:flex-row gap-4">
                <Button
                    variant="outline"
                    className="flex-1 h-24 flex-col gap-2 text-base border-2"
                    onClick={() => handleSelect('Sales')}
                >
                    <Briefcase className="w-8 h-8 text-destructive" />
                    Sales Task
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 h-24 flex-col gap-2 text-base border-2"
                    onClick={() => handleSelect('Estimates')}
                >
                    <Construction className="w-8 h-8 text-destructive" />
                    Estimation Task
                </Button>
            </div>
        </div>
    );
};