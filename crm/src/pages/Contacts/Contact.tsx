import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDialogStore } from "@/store/dialogStore";
import { ArrowLeft, SquarePen, ChevronRight, Plus } from "lucide-react";




// Import the new child components
import { ContactDetailsCard } from "./ContactDetailsCard";
import { ContactSubPages } from "./ContactSubPages";


export const Contact = () => {
    const navigate = useNavigate();
    const { mutate } = useSWRConfig();
    const [id] = useStateSyncedWithParams<string>("id", "");
    
    // Using Zustand for edit dialog, but keeping delete local for simplicity
    const { editContact,openEditContactDialog } = useDialogStore();
    const [deleteDialog, setDeleteDialog] = useState(false);

    // --- Data Fetching ---
    const { data: contactData, isLoading: contactLoading } = useFrappeGetDoc<CRMContacts>("CRM Contacts", id,`Contact/${id}`);

    const { data: companyData, isLoading: companyLoading } = useFrappeGetDoc<CRMCompany>("CRM Company", contactData?.company);

    const { data: boqsList, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", { filters: { contact: id }, fields: ["*"], limit: 0,orderBy: { field: "creation", order: "asc"}, },`all-boqs-filterbyContact-id${id}`);

    const { data: tasksList, isLoading: tasksLoading } = useFrappeGetDocList<CRMTask>("CRM Task", {   fields: ["name", "status","start_date", "type", "modified", "company", "contact.first_name", "contact.last_name" ,"company.company_name","creation","remarks"], limit: 0, filters: { contact: id }, orderBy: { field: "start_date", order: "desc"}, },`all-tasks-filterbyContact-id${id}`);

    // console.log("tasksList",tasksList)

    const { deleteDoc } = useFrappeDeleteDoc();


    const handleConfirmDelete = async () => {
        try {
            await deleteDoc("CRM Contacts", contactData?.name);
            await mutate("CRM Contacts");
            toast({ title: "Success!", description: "Contact deleted successfully!" });
            navigate('/contacts');
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete contact.", variant: "destructive" });
        } finally {
            setDeleteDialog(false);
        }
    };
    
    if (contactLoading || companyLoading || boqsLoading || tasksLoading) {
        return <div>Loading Contact Details...</div>;
    }

     const handleBackToCompanysList = () => {
        // Construct the path back to /boqs, including statusTab if it exists

        navigate(-1);
    };


    // openEditContactDialog({ contactData: contactData })
    return (
         <div className="flex flex-col h-full max-h-screen overflow-y-auto space-y-2">

            <div className="sticky top-0 z-20 bg-background p-2 flex items-center justify-between flex-shrink-0">
                        
                                        <div className="flex items-center gap-4"> {/* Added a container for back button and header */}
                                            <Button variant="ghost" size="icon" onClick={handleBackToCompanysList} aria-label="Back to Company List" className="hidden md:inline-flex">
                                                <div className="bg-destructive text-black font-bold p-2 rounded-full">
                                                    <ArrowLeft className="w-8 h-8" />
                                                </div>
                                            </Button>
                                            <h1 className="text-md md:text-2xl font-bold ">{`${contactData?.first_name || ''} ${contactData?.last_name || ''}`}Details</h1> {/* Main title for the page */}
                                        </div>
                        
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openEditContactDialog({ contactData: contactData })}>
                                            <SquarePen className="w-4 h-4 mr-2" />
                                            EDIT
                                        </Button>
                            </div>

            <ContactDetailsCard
                contact={contactData}
                company={companyData}
            />

            <ContactSubPages
                boqs={boqsList}
                tasks={tasksList}
            />

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the contact.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
            <div className="pb-16"/>

            
            {/* The Edit Dialog is now handled in MainDialogs.tsx */}
        </div>
    );
};


// import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useApplicationContext } from "@/contexts/ApplicationContext";
// import { toast } from "@/hooks/use-toast";
// import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
// import { useViewport } from "@/hooks/useViewPort";
// import { ContactDetails, ContactProjects, ContactTasks } from "@/pages/Contacts/ContactDetails";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { CRMPRojects } from "@/types/NirmaanCRM/CRMBOQ";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
// import { Plus, X } from "lucide-react";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import ReactSelect from 'react-select';
// import * as z from "zod";

// const contactFormSchema = z.object({
//     first_name: z
//         .string({
//             required_error: "Required!"
//         })
//         .min(3, {
//             message: "Minimum 3 characters required!"
//         }),
//     last_name: z.string({
//         required_error: "Required!"
//         })
//         .min(1, {
//             message: "Minimum a character is required!"
//         }),
//     company: z
//         .string({
//             required_error: "Required!"
//         })
//         .min(3, {
//             message: "Minimum 3 characters required!",
//         }),
//     designation: z
//         .string()
//         .optional(),
//     email: z.string().email().optional().or(z.literal('')),
//     mobile: z
//         .string()
//         .max(10, { message: "Mobile number must be of 10 digits" })
//         .min(10, { message: "Mobile number must be of 10 digits" })
// });

// type ContactFormValues = z.infer<typeof contactFormSchema>;

// export const Contact = () => {

//     const { toggleTaskDialog, overlayOpen, setOverlayOpen } = useApplicationContext()
//     const navigate = useNavigate()

//     const [id] = useStateSyncedWithParams<string>("id", "");

//     const {updateDoc, loading: updateLoading} = useFrappeUpdateDoc()
//     const {deleteDoc, loading: deleteLoading} = useFrappeDeleteDoc()
//     const {isMobile} = useViewport()

//     const [editDialogOpen, setEditDialogOpen] = useState(false);
//     const toggleEditDialog = useCallback(() => {
//         setEditDialogOpen(!editDialogOpen);
//     }, [editDialogOpen]);

//     const [innerTab, setInnerTab] = useStateSyncedWithParams<"details" | "projects" | "tasks">("innerTab", "details");

//     const handleChangeInnerTab = useCallback((e : "details" | "projects" | "tasks") => {
//         if(innerTab === e) return;
//         setInnerTab(e);
//     }, [innerTab, setInnerTab]);

//     const [deleteDialog, setDeleteDialog] = useState(false);
//     const toggleDeleteDialog = useCallback(() => {
//         setDeleteDialog(!deleteDialog);
//     }, [deleteDialog]);

//     const {mutate} = useSWRConfig()

//     const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc<CRMContacts>("CRM Contacts", id, id ? undefined : null)

//     const {data : contactCompany, isLoading: contactCompanyLoading} = useFrappeGetDoc<CRMCompany>("CRM Company", data?.company, data?.company ? undefined : null)

//     const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
//         fields: ["name", "company_name"],
//         limit: 1000,
//     }, "CRM Company")

//     const {data : tasksData, isLoading: tasksDataLoading} = useFrappeGetDocList<CRMTask>("CRM Task", {
//       fields: ["*"],
//       filters: [["reference_doctype", "=", "CRM Contacts"], ["reference_docname", "=", id]],
//       limit: 1000,
//     }, id ? `CRM Task ${id}` : null)

//     const {data : contactProjects, isLoading: contactProjectsLoading} = useFrappeGetDocList<CRMPRojects>("CRM Projects", {
//         fields: ["*"],
//         filters: [["project_contact", "=", id]],
//         limit: 1000
//     }, id ? `CRM Projects ${id}` : null)

//     const form = useForm<ContactFormValues>({
//         resolver: zodResolver(contactFormSchema),
//         defaultValues: {
//             first_name: data?.first_name,
//             last_name: data?.last_name,
//             designation: data?.designation,
//             email: data?.email,
//             mobile: data?.mobile,
//             company: data?.company,
//         },
//         mode: "onBlur",
//     });

//     useEffect(() => {
//         if (data) {
//           form.reset({
//             first_name: data?.first_name,
//             last_name: data?.last_name,
//             designation: data?.designation,
//             email: data?.email,
//             mobile: data?.mobile,
//             company: data?.company,
//           });
//         }
//     }, [data, form]);

//     const onSubmit = async (values: ContactFormValues) => {
//         try {
//             const isValid = await form.trigger()
//             if(isValid) {
//                 await updateDoc("CRM Contacts", data?.name, {
//                     first_name: values.first_name,
//                     last_name: values.last_name,
//                     company: values.company,
//                     designation: values.designation,
//                     email: values.email,
//                     mobile: values.mobile,
//                 })

//                 await dataMutate()
//                 await mutate("CRM Contacts")

//                 toggleEditDialog()

//                 toast({
//                     title: "Success!",
//                     description: "Contact updated successfully!",
//                     variant: "success"
//                 })
//             }
//         } catch (error) {
//             console.log("error", error)
//             toast({
//                 title: "Failed!",
//                 description: `${error?.Error || error?.message}`,
//                 variant: "destructive"
//             })
//         }
//     }

//     const handleConfirmDelete = async () => {
//         try {
//             await deleteDoc("CRM Contacts", data?.name)

//             await mutate("CRM Contacts")
//             toast({
//                 title: "Success!",
//                 description: `Contact: ${data?.first_name} ${data?.last_name} deleted successfully!`,
//                 variant: "success"
//             })
//             navigate('/prospects?tab=contact')

//             toggleDeleteDialog()

//         } catch (error) {
//             console.log("error", error)
//             toast({
//                 title: "Failed!",
//                 description: `${error?.Error || error?.message}`,
//                 variant: "destructive"
//             })
//         }
//     }

//     const companyOptions = useMemo(() => companiesList?.map(com => ({label : com?.company_name, value : com?.name})), [companiesList]);

//     return (
//         <div className="dark:text-white space-y-4">
//                 {isMobile ? (
//                     <>
//                         <h2 className="font-medium mb-2">Contact Details</h2>
//                         <ContactDetails data={data} contactCompany={contactCompany} toggleEditDialog={toggleEditDialog} toggleDeleteDialog={toggleDeleteDialog} />
//                         <Separator />
//                         <h2 className="font-medium mb-2">Tasks</h2>   
//                         <ContactTasks tasksData={tasksData} />
//                     </>
//                 ) : (
//                     <Tabs onValueChange={(e) => handleChangeInnerTab(e)} defaultValue={innerTab}>
//                         <div className="flex items-center justify-between relative">
//                         <TabsList>
//                             <TabsTrigger value="details">Contact Details</TabsTrigger>
//                             <TabsTrigger value="tasks">Tasks</TabsTrigger>
//                             <TabsTrigger value="projects">Projects</TabsTrigger>
//                         </TabsList>
//                         {
//                             innerTab === "tasks" &&
//                                 <Button onClick={toggleTaskDialog}>
//                                     <Plus className="w-4 h-4" />
//                                     New Task
//                                 </Button>
//                             }
//                         {
//                             innerTab === "projects" && (
//                                 <Button>
//                                     <Plus className="w-4 h-4" />
//                                     New Project
//                                 </Button>
//                             ) 
//                         }
//                         </div>
//                         <TabsContent value="details">
//                             <ContactDetails data={data} contactCompany={contactCompany} toggleEditDialog={toggleEditDialog} toggleDeleteDialog={toggleDeleteDialog} />
//                         </TabsContent>
//                         <TabsContent value="tasks">
//                             <ContactTasks tasksData={tasksData} />
//                         </TabsContent>
//                         <TabsContent value="projects">
//                             <ContactProjects projectsData={contactProjects} companiesData={companiesList} />
//                         </TabsContent>
//                     </Tabs>
//                 )}


//             <AlertDialog open={deleteDialog} onOpenChange={toggleDeleteDialog}>
//                     <AlertDialogContent>
//                         <AlertDialogHeader>
//                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                         </AlertDialogHeader>
//                         <AlertDialogDescription className="flex gap-2 items-end">
//                             <Button onClick={handleConfirmDelete} className="flex-1">Delete</Button>
//                             <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
//                         </AlertDialogDescription>
//                     </AlertDialogContent>
//                 </AlertDialog>

//                 <AlertDialog open={editDialogOpen} onOpenChange={toggleEditDialog}>
//                     <AlertDialogContent>
//                         <AlertDialogHeader className="text-start">
//                             <AlertDialogTitle className="text-destructive text-center">Edit Contact</AlertDialogTitle>
//                             <AlertDialogDescription asChild>
//                             <Form {...form}>
//                 <form
//                     onSubmit={(event) => {
//                         event.stopPropagation();
//                         return form.handleSubmit(onSubmit)(event);
//                     }}
//                     className="space-y-4 py-4"
//                 >
//                     <FormField
//                         control={form.control}
//                         name="first_name"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">First Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter First Name" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="last_name"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Last Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter Last Name" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="company"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Company<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <ReactSelect defaultValue={companyOptions.find(i => i?.value === field.value)} className="text-sm text-muted-foreground" placeholder="Select Company" options={companyOptions} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="designation"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Designation</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter Designation" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="mobile"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Mobile<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         type="number"
//                                         placeholder="Mobile Number"
//                                         {...field}
//                                         value={field.value || ""}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="email"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Email</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter Email ID" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </form>
//             </Form>
                                
//             </AlertDialogDescription>

//                         <div className="flex items-end gap-2">
//                             <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
//                             <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
//                         </div>
//                         </AlertDialogHeader>
//                     </AlertDialogContent>
//                 </AlertDialog>
//         </div>
//     )
// }