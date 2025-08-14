// src/pages/Home/PendingTasks.tsx
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { EnrichedCRMTask } from "../Tasks/Tasks"; // We'll reuse this type
import { ChevronDown } from "lucide-react";

const PendingTaskRow = ({ task }: { task: EnrichedCRMTask }) => {
    const { openEditTaskDialog } = useDialogStore();
    return (
        <>
            <div className="flex items-center justify-between py-4">
                <div className="flex flex-col">
                    <span className="font-medium">Call {task.contact_name} from {task.company_name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => openEditTaskDialog({ taskData: task, mode: 'updateStatus' })}>
                    Update
                </Button>
            </div>
            <Separator className="last:hidden" />
        </>
    );
};

export const PendingTasks = ({ tasks, isLoading }: { tasks: EnrichedCRMTask[], isLoading: boolean }) => {
    // You can add the date range picker logic here later
    return (
        <div className="bg-background p-4 rounded-xl border-2 border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">Pending Tasks</h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-muted-foreground border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive" 
                >
                    last 7 days <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </div>
            {isLoading && <p className="text-center text-sm text-muted-foreground py-4">Loading tasks...</p>}
            {!isLoading && tasks.length > 0 && tasks.map(task => <PendingTaskRow key={task.name} task={task} />)}
            {!isLoading && tasks.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No pending tasks found.</p>}
        </div>
    );
};