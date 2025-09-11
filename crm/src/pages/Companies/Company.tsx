import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import the new child components
import { CompanyDetailsCard } from "./CompanyDetailsCard";
import { DynamicCompanyStats } from "./DynamicCompanyStats";
import { CompanySubPages } from "./CompanySubPages";
// Assume you have an EditCompanyForm component for the dialog
// import { EditCompanyForm } from "./EditCompanyForm"; 

export const Company = () => {
    const navigate = useNavigate();
    const { mutate } = useSWRConfig();
    const [id] = useStateSyncedWithParams<string>("id", "");
    
    // --- State for Dialogs ---
   
    const [deleteDialog, setDeleteDialog] = useState(false);
    const toggleDeleteDialog = useCallback(() => setDeleteDialog(p => !p), []);

    // --- Data Fetching ---
    const { data: companyData, isLoading: companyLoading } = useFrappeGetDoc("CRM Company", id,`Company/${id}`);

       // CORRECTED: Pass doctype as the first argument, and options object as the second.
    const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>(
        "CRM Contacts", // 1. Doctype name as a string
        {               // 2. Options object
            filters: { company: id },
            fields: ["*"],
            limit:0,
            orderBy: { field: "first_name", order: "asc"},
        },`all-contacts-filterbyCompany-id${id}`
    );

    // CORRECTED: Use the correct field name 'boq_company' for filtering.
    const { data: boqsList, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>(
        "CRM BOQ",      // 1. Doctype name as a string
        {               // 2. Options object
            filters: { company: id }, // Use the correct field name from the BOQ doctype
            fields: ["*"],limit:0,
            orderBy: { field: "creation", order: "asc"},
        },`all-boqs-filterbyCompany-id${id}`
    );


        const { data: tasksList, isLoading: tasksLoading } = useFrappeGetDocList<CRMTask>(
        "CRM Task", 
        {
               fields: ["name", "status","start_date","type", "modified", "company", "contact.first_name", "contact.last_name" ,"company.company_name","creation","remarks"],
               limit:0,
            filters: { company: id },
            orderBy: { field: "start_date", order: "asc"},
             // Directly filter tasks by the company ID
          
        },`all-tasks-filterbyCompany-id${id}`
    );
    const { deleteDoc } = useFrappeDeleteDoc();

    const handleConfirmDelete = async () => {
        try {
            await deleteDoc("CRM Company", companyData?.name);
            await mutate("CRM Company");
            toast({ title: "Success!", description: "Company deleted successfully!", variant: "success" });
            navigate('/companies');
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete company.", variant: "destructive" });
        } finally {
            toggleDeleteDialog();
        }
    };
    
    if (companyLoading || contactsLoading || boqsLoading) {
        return <div>Loading...</div>;
    }
    const INACTIVE_STATUSES = ['Won', 'Lost','Dropped'];

    const activeProjectsfilter =() => {
    // console.log("boqsList-company",boqsList)

    // If there's no list, return an empty array.
    if (!boqsList) {
        return [];
    }

    // 3. Use .filter() to create a new list.
    // An item is included only if its status is NOT in our INACTIVE_STATUSES list.
    return boqsList.filter(item => 
        !INACTIVE_STATUSES.includes(item.boq_status)
    );

}; 
const active=activeProjectsfilter()

// console.log(active)

    return (
        <div className="space-y-6">
            <CompanyDetailsCard
                company={companyData}
                totalProjects={boqsList?.length || 0}
                totalContacts={contactsList?.length || 0}
                activeProjects={active?.length||0}
            />

                  
            {id && <DynamicCompanyStats companyId={id} />}

               <CompanySubPages
                boqs={boqsList || []}
                contacts={contactsList || []}
                tasks={tasksList || []} 
            />

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialog} onOpenChange={toggleDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the company.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
            <div className="pb-16"/>
        </div>
    );
};

