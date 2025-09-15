import { useDialogStore } from "@/store/dialogStore";


export const useTaskCreationHandler = () => {
    const {
        openNewTaskDialog,
        openNewEstimationTaskDialog,
        openSelectTaskProfileDialog,
    } = useDialogStore();
    const role = localStorage.getItem('role');

    const handleCreateTask = (context: object = {}) => {
        if (role === 'Nirmaan Sales User Profile') {
            openNewTaskDialog({ ...context, task_profile: 'Sales' });
        } else if (role === 'Nirmaan Estimations User Profile') {
            openNewEstimationTaskDialog({ ...context, task_profile: 'Estimates' });
        } else if (role === 'Nirmaan Admin User Profile') {
            openSelectTaskProfileDialog({
                originalContext: context,
                onSelect: (profile) => {
                    if (profile === 'Sales') {
                        openNewTaskDialog({ ...context, task_profile: 'Sales' });
                    } else {
                        openNewEstimationTaskDialog({ ...context, task_profile: 'Estimates' });
                    }
                },
            });
        }
    };
    return handleCreateTask;
};