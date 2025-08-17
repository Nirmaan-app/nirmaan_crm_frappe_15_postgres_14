// src/pages/Tasks/Tasks.tsx
import { useViewport } from "@/hooks/useViewPort";
import { TaskList } from "./TaskList";
import { Task } from "./Task";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";

const DesktopPlaceholder = () => (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
        <span className="text-muted-foreground">Please select a Task from the list</span>
    </div>
);

export const Tasks = () => {
    const { isMobile } = useViewport();
    const [id, setId] = useStateSyncedWithParams<string>("id", "");
    const { openNewTaskDialog } = useDialogStore();

    if (isMobile) {
        return <TaskList />;
    }

    return (
        <div className="grid grid-cols-[400px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
            {/* Master Panel (Left) */}
            <div className="bg-background rounded-lg border p-4 flex flex-col">
                <h2 className="text-lg font-semibold mb-4">Tasks</h2>
                <TaskList
                    onTaskSelect={setId}
                    activeTaskId={id}
                />
                <div className="mt-4">
                    <button onClick={openNewTaskDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
                        <Plus size={20} /> Add New Task
                    </button>
                </div>
            </div>

            {/* Detail Panel (Right) */}
            <div className="overflow-y-auto">
                {id ? <Task /> : <DesktopPlaceholder />}
            </div>
        </div>
    );
};