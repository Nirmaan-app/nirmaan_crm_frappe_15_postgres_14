import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SquarePen, ChevronRight, Plus } from "lucide-react";
// Import the new child components
import { CompanyDetailsCard } from "./CompanyDetailsCard";
import { DynamicCompanyStats } from "./DynamicCompanyStats";
import { CompanySubPages } from "./CompanySubPages";
import {CompanyProgressCard} from "./components/CompanyProgressCard"
import { useDialogStore } from "@/store/dialogStore";

// Assume you have an EditCompanyForm component for the dialog
// import { EditCompanyForm } from "./EditCompanyForm"; 

export const Company = () => {
    const navigate = useNavigate();
    const { mutate } = useSWRConfig();
    const [id] = useStateSyncedWithParams<string>("id", "");
      const { openEditCompanyDialog, openRenameCompanyNameDialog } = useDialogStore();
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
            orderBy: { field: "start_date", order: "desc"},
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

 const handleBackToCompanysList = () => {
        // Construct the path back to /boqs, including statusTab if it exists

        navigate(-1);
    };


    return (
        <div className="flex flex-col h-full max-h-screen overflow-y-auto space-y-2">
               <div className="sticky top-0 z-20 bg-background p-2 flex items-center justify-between flex-shrink-0">
            
                            <div className="flex items-center gap-4"> {/* Added a container for back button and header */}
                                <Button variant="ghost" size="icon" onClick={handleBackToCompanysList} aria-label="Back to Company List" className="hidden md:inline-flex">
                                    <div className="bg-destructive text-black font-bold p-2 rounded-full">
                                        <ArrowLeft className="w-8 h-8" />
                                    </div>
                                </Button>
                                <h1 className="text-md md:text-2xl font-bold ">{companyData.company_name}{" "}Details</h1> {/* Main title for the page */}
                            </div>
            
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openEditCompanyDialog({ companyData: companyData })}>
                                <SquarePen className="w-4 h-4 mr-2" />
                                EDIT
                            </Button>
                </div>
            <CompanyDetailsCard
                company={companyData}
                totalProjects={boqsList?.length || 0}
                totalContacts={contactsList?.length || 0}
                activeProjects={active?.length||0}
            />
  {companyData && <CompanyProgressCard company={companyData} />} {/* Render the new card here */}
                  
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

