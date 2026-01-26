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

import { RenameBoqName } from "@/pages/BOQS/forms/RenameBoqName";
import { RenameCompanyName } from "@/pages/Companies/forms/RenameCompanyName";
import { RenameContactName } from "@/pages/Contacts/forms/RenameContactName";

import { EditDealStatusForm } from "@/pages/BOQS/forms/EditBoqDealStatusForm";
import { EditBcsStatusForm } from "@/pages/BOQS/forms/EditBcsStatusForm";

import { CompanyProgressForm } from "@/pages/Companies/forms/CompanyProgressForm"
// ============================================================================================
// START OF CHANGES: Importing new forms for Estimation and Admin flows
// ============================================================================================

// --- NEW FORM IMPORTS ---
// The actual files for these components will be created in Phase 4.
import { NewEstimationTaskForm } from "@/pages/Tasks/NewEstimationTaskForm"; // Placeholder import
import { EditEstimationTaskForm } from "@/pages/Tasks/EditEstimationTaskForm"; // Placeholder import
import { SelectTaskProfileDialog } from "./SelectTaskProfileDialog"; // Placeholder import

// ============================================================================================
// END OF CHANGES
// ============================================================================================

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
        renameBoqName, closeRenameBoqNameDialog,
        renameCompanyName, closeRenameCompanyNameDialog,

        renameContactName, closeRenameContactNameDialog,

        companyProgress, closeCompanyProgressDialog,

        editDealStatus, closeEditDealStatusDialog,
        editBcsStatus, closeEditBcsStatusDialog,
        // ============================================================================================
        // START OF CHANGES: Destructuring new dialog states from the store
        // ============================================================================================

        // --- DESTRUCTURE NEW STATES AND ACTIONS ---
        newEstimationTask, closeNewEstimationTaskDialog,
        editEstimationTask, closeEditEstimationTaskDialog,
        selectTaskProfileDialog, closeSelectTaskProfileDialog,

        // ============================================================================================
        // END OF CHANGES
        // ============================================================================================

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

    const getCompanyProgressTitle = () => {
        if (!companyProgress.context || !companyProgress.context.companyId) {
            return "Update Company Progress"; // Fallback
        }
        // If progressData exists and has a parent_company, we can use that for context
        // Otherwise, we just use the companyId (Frappe 'name')
        console.log("companyProgress", companyProgress)
        const companyIdentifier = companyProgress.context.companyId || companyProgress.context.companyId;

        if (companyProgress?.context.progressData?.expected_boq_count) {
            // If editing, use the linked company's name for clarity
            return `Edit Progress for ${companyIdentifier}`;
        }
        // If creating new progress, use the companyId for context
        return `Add Progress for ${companyIdentifier}`;
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

            >
                <UserProfileDialog />

            </ReusableFormDialog>

            {/* ============================================================================================ */}
            {/* START OF CHANGES: Adding new ReusableFormDialog instances for the new states */}
            {/* ============================================================================================ */}

            {/* --- NEW: Estimation Task Dialogs --- */}
            <ReusableFormDialog isOpen={newEstimationTask.isOpen} onClose={closeNewEstimationTaskDialog} title="Add New Estimation Task" className="max-w-lg">
                <NewEstimationTaskForm onSuccess={closeNewEstimationTaskDialog} />
            </ReusableFormDialog>
            <ReusableFormDialog isOpen={editEstimationTask.isOpen} onClose={closeEditEstimationTaskDialog} title="Edit Estimation Task" className="max-w-lg">
                <EditEstimationTaskForm onSuccess={closeEditEstimationTaskDialog} />
            </ReusableFormDialog>

            {/* --- NEW: Admin Task Profile Selection Dialog --- */}
            <ReusableFormDialog isOpen={selectTaskProfileDialog.isOpen} onClose={closeSelectTaskProfileDialog} title="Select Task Profile" className="max-w-sm">
                <SelectTaskProfileDialog />
            </ReusableFormDialog>

            {/* ============================================================================================ */}
            {/* END OF CHANGES */}
            {/* ============================================================================================ */}

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
                onClose={closeRemarkBoqDialog}
                title="Additional Remarks for BOQ"
                className="max-w-lg"
            >
                <RemarkBoqForm
                />

            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={renameBoqName.isOpen}
                onClose={closeRenameBoqNameDialog}
                title={renameBoqName.context?.currentDocName ? `Rename "${renameBoqName.context.currentDocName}"` : "Rename Document"}
                className="max-w-lg"
            >

                {renameBoqName.context && (
                    <RenameBoqName
                        currentDoctype={renameBoqName.context.currentDoctype}
                        currentDocName={renameBoqName.context.currentDocName}
                        onSuccess={closeRenameBoqNameDialog}
                    />
                )}
            </ReusableFormDialog>


            <ReusableFormDialog
                isOpen={renameCompanyName.isOpen}
                onClose={closeRenameCompanyNameDialog}
                // Dynamically set title, showing current doc name
                title={renameCompanyName.context?.currentDocName ? `Rename Company ID "${renameCompanyName.context.currentDocName}"` : "Rename Company"}
                className="max-w-lg"
            >
                {/* Render only when dialog is open and context is available */}
                {renameCompanyName.isOpen && renameCompanyName.context && (
                    <RenameCompanyName
                        currentDoctype={renameCompanyName.context.currentDoctype}
                        currentDocName={renameCompanyName.context.currentDocName}
                        onSuccess={closeRenameCompanyNameDialog}
                    />
                )}
            </ReusableFormDialog>

            {/* --- 3. ADD NEW DIALOG FOR RENAMECONTACTNAME --- */}
            <ReusableFormDialog
                isOpen={renameContactName.isOpen}
                onClose={closeRenameContactNameDialog}
                title={renameContactName.context?.currentDocName ? `Rename Contact ID "${renameContactName.context.currentDocName}"` : "Rename Contact"}
                className="max-w-lg"
            >
                {/* Render only when dialog is open and context is available */}
                {renameContactName.isOpen && renameContactName.context && (
                    <RenameContactName
                        currentDoctype={renameContactName.context.currentDoctype}
                        currentDocName={renameContactName.context.currentDocName}
                        onSuccess={closeRenameContactNameDialog}
                    />
                )}
            </ReusableFormDialog>


            <ReusableFormDialog
                isOpen={editDealStatus.isOpen}
                onClose={closeEditDealStatusDialog}
                title={editDealStatus.context?.boqData?.boq_name ? `Update Deal Status for "${editDealStatus.context.boqData.boq_name}"` : "Update Deal Status"}
                className="max-w-md" // Adjust width for this form
            >
                {editDealStatus.context?.boqData && (
                    <EditDealStatusForm
                        boqData={editDealStatus.context.boqData}
                        onSuccess={closeEditDealStatusDialog}
                    />
                )}
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={editBcsStatus.isOpen}
                onClose={closeEditBcsStatusDialog}
                title={editBcsStatus.context?.boqData?.boq_name
                    ? `Update BCS Status for "${editBcsStatus.context.boqData.boq_name}"`
                    : "Update BCS Status"}
                className="max-w-lg"
            >
                {editBcsStatus.context?.boqData && (
                    <EditBcsStatusForm
                        boqData={editBcsStatus.context.boqData}
                        onSuccess={closeEditBcsStatusDialog}
                    />
                )}
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={companyProgress.isOpen}
                onClose={closeCompanyProgressDialog}
                title={getCompanyProgressTitle()}
                className="max-w-lg"
            >
                {/* Conditionally render the form only when context (specifically companyId) is available */}
                {companyProgress.context?.companyId ? (
                    <CompanyProgressForm
                        companyId={companyProgress.context.companyId} // Pass companyId directly
                        initialData={companyProgress.context.progressData}
                        onSuccess={closeCompanyProgressDialog}
                    />
                ) : (
                    <p className="text-destructive">Error: Company ID missing for progress update.</p>
                )}
            </ReusableFormDialog>

        </>
    );
};