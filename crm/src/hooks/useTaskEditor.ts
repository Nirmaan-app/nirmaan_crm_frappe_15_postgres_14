import { useDialogStore } from "@/store/dialogStore";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";

type EditMode = 'edit' | 'updateStatus' | 'scheduleNext';

/**
 * A centralized hook to handle the logic for opening the correct task editor dialog
 * based on the task's profile ('Sales' or 'Estimates').
 * 
 * @returns A function `openTaskEditor(task, mode)` that can be called from any component.
 */
export const useTaskEditor = () => {
    const {
        openEditTaskDialog,
        openEditEstimationTaskDialog,
    } = useDialogStore();

    /**
     * Inspects the task's profile and opens the corresponding edit dialog.
     * @param task The full task object.
     * @param mode The desired editing mode: 'edit', 'updateStatus', or 'scheduleNext'.
     */
    const openTaskEditor = (task: CRMTask, mode: EditMode) => {
        if (!task || !task.task_profile) {
            console.error("Task or task_profile is missing. Cannot open editor.");
            // Default to the sales dialog as a fallback, but this indicates a data issue.
            openEditTaskDialog({ taskData: task, mode });
            return;
        }

        if (task.task_profile === 'Estimates') {
            openEditEstimationTaskDialog({ taskData: task, mode });
        } else {
            // Default to the Sales dialog for 'Sales' profile or any other case.
            openEditTaskDialog({ taskData: task, mode });
        }
    };

    return openTaskEditor;
};