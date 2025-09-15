// src/hooks/useFabOptions.ts
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDialogStore } from '@/store/dialogStore';

export interface FabOption {
    label: string;
    action: () => void;
}

// ============================================================================================
// START OF CHANGES: Implementing the centralized task creation handler
// ============================================================================================

const useTaskCreationHandler = () => {
    const {
        openNewTaskDialog,
        openNewEstimationTaskDialog,
        openSelectTaskProfileDialog,
    } = useDialogStore();
    const role = localStorage.getItem('role');

    // This function becomes the single entry point for creating any task.
    const handleCreateTask = (context: object = {}) => {
        if (role === 'Nirmaan Sales User Profile') {
            openNewTaskDialog({ ...context, task_profile: 'Sales' });
        }
        else if (role === 'Nirmaan Estimations User Profile') {
            openNewEstimationTaskDialog({ ...context, task_profile: 'Estimates' });
        }
        else if (role === 'Nirmaan Admin User Profile') {
            // Admin gets the selection dialog first.
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

// ============================================================================================
// END OF CHANGES
// ============================================================================================


export const useFabOptions = () => {
    const location = useLocation();
    const role = localStorage.getItem('role');

    const [options, setOptions] = useState<FabOption[]>([]);
    const {
        openNewCompanyDialog,
        openNewContactDialog,
        openNewBoqDialog,
        openNewTaskDialog,
        openNewUserDialog
    } = useDialogStore();

    // --- CHANGE: Use the new task creation handler ---
    const handleCreateTask = useTaskCreationHandler();

    useEffect(() => {
        const { pathname, search } = location;
        const params = new URLSearchParams(search);
        const id = params.get('id');
        let newOptions: FabOption[] = [];

        if (pathname.startsWith('/companies/company') && id) {
            newOptions = [
                { label: "Add New BOQ", action: () => openNewBoqDialog({ companyId: id }) },
                { label: "Add New Contact", action: () => openNewContactDialog({ companyId: id }) },
                // Use the handler here
                { label: "Add New Task", action: () => handleCreateTask({ companyId: id }) }
            ];
        }
        if (pathname.startsWith('/companies') && id) {
            newOptions = [
                { label: "Add New BOQ", action: () => openNewBoqDialog({ companyId: id }) },
                { label: "Add New Contact", action: () => openNewContactDialog({ companyId: id }) },
                // Use the handler here
                { label: "Add New Task", action: () => handleCreateTask({ companyId: id }) }
            ];
        } else if (pathname.startsWith('/contacts/contact') && id) {
            newOptions = [
                // Use the handler here
                { label: "Add New Task", action: () => handleCreateTask({ contactId: id }) },
                { label: "Add New BOQ", action: () => openNewBoqDialog({ contactId: id }) }
            ];
        } else if (pathname.startsWith('/contacts') && id) {
            newOptions = [
                // Use the handler here
                { label: "Add New Task", action: () => handleCreateTask({ contactId: id }) },
                { label: "Add New BOQ", action: () => openNewBoqDialog({ contactId: id }) }
            ];
        }
        else if (pathname.startsWith('/boqs') && id) {
            newOptions = [
                // Use the handler here
                { label: "Add Follow-up Task", action: () => handleCreateTask({ boqId: id }) }
            ];
        } else if (pathname.startsWith('/tasks') && id) {
            newOptions = [
                // Use the handler here
                { label: "Add Follow-up Task", action: () => handleCreateTask({ taskId: id }) }
            ];
        }
        else if (pathname.startsWith('/companies')) {
            newOptions = [{ label: "Add New Company", action: openNewCompanyDialog }];
        } else if (pathname.startsWith('/contacts')) {
            newOptions = [{ label: "Add New Contact", action: openNewContactDialog }];
        } else if (pathname.startsWith('/boqs')) {
            newOptions = [{ label: "Add New BOQ", action: openNewBoqDialog }];
        } else if (pathname.startsWith('/tasks')) {
            newOptions = [{ label: "Add New Task", action: handleCreateTask }];
        } else if (pathname.startsWith('/team')) {
            newOptions = [{ label: "Add New CRM User", action: openNewUserDialog }];
        } else if (role === "Nirmaan Estimations User Profile" && pathname === '/') {
            newOptions = [{ label: "Add New BOQ", action: openNewBoqDialog }];
        } else if (pathname === '/') {
            newOptions = [
                { label: "Add New Company", action: openNewCompanyDialog },
                { label: "Add New Contact", action: openNewContactDialog },
                { label: "Add New BOQ", action: openNewBoqDialog },
                // Use the handler here
                { label: "Add New Task", action: handleCreateTask },
            ];
        }
        setOptions(newOptions);
    }, [location, openNewCompanyDialog, openNewContactDialog, openNewBoqDialog, openNewTaskDialog, role]);

    return options;
};