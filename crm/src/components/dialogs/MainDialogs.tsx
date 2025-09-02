import { useDialogStore } from "@/store/dialogStore";
import { ReusableFormDialog } from "@/components/ui/ReusableDialogs";

import { NewCompanyForm } from "@/pages/Companies/NewCompanyForm";
import { NewBoqForm } from "@/pages/BOQS/NewBoqForm";
import { EditBoqForm } from "@/pages/BOQS/EditBoqForm"
import { NewTaskForm } from "@/pages/Tasks/NewTaskForm";
import { NewContactForm } from "@/pages/Contacts/NewContactForm";
import { EditTaskForm } from "@/pages/Tasks/EditTaskForm";
import { NewUserForm } from "@/pages/MyTeam/NewUserFormMod";
// --- NEW DIALOG IMPORTS ---
import { DateRangePickerDialog } from "./DateRangePickerDialog";
import { StatsDetailDialog } from "./StatsDetailDialog";
import { UserProfileDialog } from "./UserProfileDialog"; // <-- 1. IMPORT THE NEW DIALOG
import { AssignedBoqForm } from "@/pages/BOQS/forms/AssignedBoqForm";
import { RemarkBoqForm } from "@/pages/BOQS/forms/RemarkBoqForm";   

export const MainDialogs = () => {
    const {
        newCompany, closeNewCompanyDialog,
        editCompany, closeEditCompanyDialog,
        editContact, closeEditContactDialog,
        editBoq, closeEditBoqDialog,
        editTask, closeEditTaskDialog,
        newContact, closeNewContactDialog,
        newBoq, closeNewBoqDialog,
        newTask, closeNewTaskDialog,

        dateRangePicker, closeDateRangePickerDialog,
        statsDetail, closeStatsDetailDialog,
        userProfile, closeUserProfileDialog,

        newUser, closeNewUserDialog,
        ///NEW: Destructure the new dialog state and close action
        assignBoq, closeAssignBoqDialog,
         // NEW: Destructure the new dialog state and close action
        remarkBoq, closeRemarkBoqDialog,

    } = useDialogStore();

    // Helper to generate a dynamic title
    const getEditBoqTitle = () => {
        const mode = editBoq.context.mode;
        if (mode === 'details') return 'Edit BOQ Details';
        if (mode === 'status') return 'Update Status';
        // if (mode === 'remark') return 'Add New Remark';
        // if (mode === 'assigned') return 'Edit Assigned';


        return 'Edit BOQ';
    };
    const getEditTaskTitle = () => {
        const mode = editTask.context.mode;
        if (mode === 'edit') return 'Edit Task';
        if (mode === 'updateStatus') return 'Update Task';
        if (mode === 'scheduleNext') return 'Schedule New Task';
        return 'Task';
    };

    return (
        <>
            <ReusableFormDialog
                isOpen={newCompany.isOpen}
                onClose={closeNewCompanyDialog} // Use close action
                title="Add New Company"
                className="max-w-lg"
            >
                <NewCompanyForm onSuccess={closeNewCompanyDialog} />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={editCompany.isOpen}
                onClose={closeEditCompanyDialog}
                title="Edit Company"
                className="max-w-lg"
            >
                {/* Render the same form, but in edit mode with initial data */}
                <NewCompanyForm
                    isEditMode={true}
                    initialData={editCompany.context.companyData}
                    onSuccess={closeEditCompanyDialog}
                    className="max-w-lg"
                />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={newContact.isOpen}
                onClose={closeNewContactDialog} // Use close action
                title="Add New Contact"
                className="max-w-lg"
            >
                <NewContactForm onSuccess={closeNewContactDialog} />
            </ReusableFormDialog>
            <ReusableFormDialog
                isOpen={editContact.isOpen}
                onClose={closeEditContactDialog}
                title="Edit Contact"
                className="max-w-lg"
            >
                <NewContactForm
                    isEditMode={true} // Pass the edit mode flag
                    initialData={editContact.context.contactData} // Pass the data
                    onSuccess={closeEditContactDialog}
                />
            </ReusableFormDialog>

            {/* ... other dialogs follow the same pattern ... */}
            <ReusableFormDialog
                isOpen={newBoq.isOpen}
                onClose={closeNewBoqDialog}
                title="Add New BOQ"
                className="max-w-lg"
            >
                <NewBoqForm onSuccess={closeNewBoqDialog} />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={editBoq.isOpen}
                onClose={closeEditBoqDialog}
                title={getEditBoqTitle()}
                className="max-w-lg"
            >
                <EditBoqForm onSuccess={closeEditBoqDialog} />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={newTask.isOpen}
                onClose={closeNewTaskDialog}
                title="Add New Task"
                className="max-w-lg"
            >
                <NewTaskForm onSuccess={closeNewTaskDialog} />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={editTask.isOpen}
                onClose={closeEditTaskDialog}
                title={getEditTaskTitle()}
                className="max-w-lg"
            >
                <EditTaskForm onSuccess={closeEditTaskDialog} />
            </ReusableFormDialog>

            {/* --- NEW: Date Range Picker Dialog --- */}
            <ReusableFormDialog
                isOpen={dateRangePicker.isOpen}
                onClose={closeDateRangePickerDialog}
                title="Select Date Range"
            >
                <DateRangePickerDialog />
            </ReusableFormDialog>

            {/* --- NEW: Stats Detail Dialog --- */}
            <ReusableFormDialog
                isOpen={statsDetail.isOpen}
                onClose={closeStatsDetailDialog}
                title="" // The title is handled inside the component itself
            >
                <StatsDetailDialog />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={userProfile.isOpen}
                onClose={closeUserProfileDialog}
                title="User Profile" // The title is handled inside the component itself
                className="max-w-lg"

            >
                <UserProfileDialog />

            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={newUser.isOpen}
                onClose={closeNewUserDialog}
                title="Create New CRM User"
            >
                <NewUserForm onSuccess={closeNewUserDialog} />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={assignBoq.isOpen}
                onClose={closeAssignBoqDialog}
                title="Assign Sales/Estimation for BOQ"
                className="max-w-lg"
            >
                <AssignedBoqForm     
                />
            </ReusableFormDialog>
             <ReusableFormDialog
                isOpen={remarkBoq.isOpen}
                onClose={closeAssignBoqDialog}
                title="Additional Remarks for BOQ"
                className="max-w-lg"
            >
                <RemarkBoqForm     
                />
            </ReusableFormDialog>




        </>
    );
};