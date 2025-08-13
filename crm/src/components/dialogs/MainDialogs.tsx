import { useDialogStore } from "@/store/dialogStore";
import { ReusableFormDialog } from "@/components/ui/ReusableDialogs";

import { NewCompanyForm } from "@/pages/Companies/NewCompanyForm";
import { NewBoqForm } from "@/pages/BOQs/NewBoqForm";
import { NewTaskForm } from "@/pages/Tasks/NewTaskForm";
import { NewContactForm } from "@/pages/Contacts/NewContactForm";

export const MainDialogs = () => {
    const { 
        newCompany, closeNewCompanyDialog,
        editCompany, closeEditCompanyDialog,
        editContact,closeEditContactDialog,
        newContact, closeNewContactDialog,
        newBoq, closeNewBoqDialog,
        newTask, closeNewTaskDialog
    } = useDialogStore();

    return (
        <>
            <ReusableFormDialog
                isOpen={newCompany.isOpen}
                onClose={closeNewCompanyDialog} // Use close action
                title="Add New Company"
            >
                <NewCompanyForm onSuccess={closeNewCompanyDialog} />
            </ReusableFormDialog>

             <ReusableFormDialog
                isOpen={editCompany.isOpen}
                onClose={closeEditCompanyDialog}
                title="Edit Company"
            >
                {/* Render the same form, but in edit mode with initial data */}
                <NewCompanyForm 
                    isEditMode={true}
                    initialData={editCompany.context.companyData}
                    onSuccess={closeEditCompanyDialog} 
                />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={newContact.isOpen}
                onClose={closeNewContactDialog} // Use close action
                title="Add New Contact"
            >
                <NewContactForm onSuccess={closeNewContactDialog} />
            </ReusableFormDialog>
             <ReusableFormDialog
                isOpen={editContact.isOpen}
                onClose={closeEditContactDialog}
                title="Edit Contact"
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
            >
                <NewBoqForm onSuccess={closeNewBoqDialog} />
            </ReusableFormDialog>

            <ReusableFormDialog
                isOpen={newTask.isOpen}
                onClose={closeNewTaskDialog}
                title="Add New Task"
            >
                <NewTaskForm onSuccess={closeNewTaskDialog} />
            </ReusableFormDialog>
        </>
    );
};