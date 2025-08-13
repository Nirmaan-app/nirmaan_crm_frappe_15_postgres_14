// src/pages/BOQs/BOQ.tsx
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMNote } from "@/types/NirmaanCRM/CRMNote";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatDate } from "@/utils/FormatDate";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronDown, ChevronRight, Plus, SquarePen } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";

// --- SUB-COMPONENT 1: Header ---
const BoqDetailsHeader = ({ boq }: { boq: CRMBOQ }) => {
    const { openEditBoqDialog } = useDialogStore();
    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm flex justify-between items-start">
            <div>
                <p className="text-xs text-muted-foreground">BOQ Name</p>
                <h1 className="text-xl font-bold">{boq?.boq_name}</h1>
            </div>
            <div onClick={() => openEditBoqDialog({ boqData: boq, mode: 'status' })} className="cursor-pointer">
                <p className="text-xs text-muted-foreground">Current Status</p>
                <div className="border rounded-md px-3 py-2 min-w-[160px] flex justify-between items-center hover:bg-secondary transition-colors">
                    <span className="font-semibold">{boq?.boq_status || 'N/A'}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT 2: Task List (Now with rendering logic) ---
const BoqTaskDetails = ({ tasks, boqId, companyId, contactId }: { tasks: CRMTask[], boqId: string, companyId: string, contactId: string }) => {
    const navigate = useNavigate();
    // console.log("tasks",tasks)
    const { openNewTaskDialog } = useDialogStore();
    const getStatusClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'incomplete': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Task Details</h2>
                <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={() => openNewTaskDialog({ boqId, companyId, contactId })}>
                    <Plus className="w-4 h-4 mr-2" />Add New Task
                </Button>
            </div>
            {/* *** ADDED TASK LIST RENDERING LOGIC HERE *** */}
            <div className="space-y-2">
                <div className="grid grid-cols-3 text-sm font-semibold px-2 text-muted-foreground">
                    <span>Task</span>
                    <span>Due Date</span>
                    <span className="text-center">Status</span>
                </div>
                {tasks.length > 0 ? (
                    tasks.map((task, index) => (
                        <React.Fragment key={task.name}>
                            <div onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="grid grid-cols-3 items-center px-2 py-3 cursor-pointer hover:bg-secondary rounded-md">
                                <span className="font-medium truncate pr-2">{task.type}</span>
                                <span className="text-sm text-muted-foreground">{formatDate(task.start_date)}</span>
                                <div className="flex items-center justify-end gap-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getStatusClass(task.status)}`}>
                                        {task.status}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                            {index < tasks.length - 1 && <Separator />}
                        </React.Fragment>
                    ))
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">No tasks found for this BOQ.</p>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT 3: Remarks ---
const BoqRemarks = ({ remarks, boqId }: { remarks: CRMNote[], boqId: string }) => {
    const { openEditBoqDialog } = useDialogStore();

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Remarks</h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-destructive text-destructive" 
                    // This is a partial BOQ object, which is okay for this specific mode
                    onClick={() => openEditBoqDialog({ boqData: { name: boqId } as CRMBOQ, mode: 'remark' })}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Remarks
                </Button>
            </div>
            <div className="space-y-3">
                {/* *** THE FIX IS HERE: Add the header row *** */}
                {remarks.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-4 text-sm font-semibold px-2 text-muted-foreground border-b pb-2">
                        <span>Date</span>
                        <span>Remarks</span>
                    </div>
                )}

                {/* The list of remarks */}
                {remarks.map((remark, index) => (
                    <React.Fragment key={remark.name}>
                        <div className="grid grid-cols-2 gap-x-4 text-sm px-2 py-1">
                            <span className="text-muted-foreground">{formatDate(remark.creation)}</span>
                            <span>{remark.content}</span>
                        </div>
                        {/* We don't need a separator if the header provides the line */}
                    </React.Fragment>
                ))}
                
                {/* The "No remarks" message */}
                {remarks.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">No remarks added yet.</p>
                )}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT 4: Other Details ---
const OtherBoqDetails = ({ boq, contact, company }: { boq: CRMBOQ, contact?: CRMContacts, company?: CRMCompany }) => {
    const { openEditBoqDialog } = useDialogStore();
    const DetailItem = ({ label, value, href }: { label: string; value: string; href?: string }) => (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {href ? <Link to={href} className="font-semibold text-blue-600 underline">{value}</Link> : <p className="font-semibold">{value}</p>}
        </div>
    );
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Other BOQ Details</h2>
                <Button variant="outline" size="sm" className="border-destructive text-destructive" onClick={() => openEditBoqDialog({ boqData: boq, mode: 'details' })}>
                    <SquarePen className="w-4 h-4 mr-2" />Edit
                </Button>
            </div>
            <div className="bg-background p-4 rounded-lg border shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <DetailItem label="Size" value={boq?.boq_size || 'n/a'} />
                    <DetailItem label="Package" value={boq?.boq_type || 'n/a'} />
                    <DetailItem label="Contact Name" value={contact ? `${contact.first_name} ${contact.last_name}` : 'n/a'} href={`/contacts/contact?id=${contact?.name}`} />
                    <DetailItem label="Designation" value={contact?.designation || 'n/a'} />
                    <DetailItem label="Company Name" value={company?.company_name || 'n/a'} href={`/companies/company?id=${company?.name}`} />
                    <DetailItem label="Location" value={company?.company_city || 'n/a'} />
                </div>
                <div className="border-t pt-4 space-y-2">
                    <DetailItem label="BOQ" value={boq?.boq_link ? "View Link" : "n/a"} href={boq?.boq_link} />
                    <DetailItem label="Additional Attachments" value="n/a" />
                    <Button variant="outline" size="sm" className="border-destructive text-destructive w-full justify-start mt-2">
                         <Plus className="w-4 h-4 mr-2" />ADD ATTACHMENTS
                    </Button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN ORCHESTRATOR COMPONENT ---
export const BOQ = () => {
    const [id] = useStateSyncedWithParams<string>("id", "");

    const { data: boqData, isLoading: boqLoading } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", id);
    const { data: companyData, isLoading: companyLoading } = useFrappeGetDoc<CRMCompany>("CRM Company", boqData?.company, { enabled: !!boqData?.company });

     const { data: contactData, isLoading: contactLoading } = useFrappeGetDoc<CRMContacts>("CRM Contacts", boqData?.contact);
    
    
    const { data: tasksList, isLoading: tasksLoading } = useFrappeGetDocList<CRMTask>("CRM Task", { filters: { boq: id }, fields: ["name", "type", "start_date", "status"] });
    const { data: remarksList, isLoading: remarksLoading } = useFrappeGetDocList<CRMNote>("CRM Note", { filters: { reference_doctype: "CRM BOQ", reference_docname: id }, fields: ["name", "content", "creation"], orderBy: { field: "creation", order: "desc" } });


    if (boqLoading || companyLoading || contactLoading || tasksLoading || remarksLoading) {
        return <div>Loading BOQ Details...</div>;
    }
    if (!boqData) {
        return <div>BOQ not found.</div>;
    }
    return (
        <div className="space-y-6">
            <BoqDetailsHeader boq={boqData} />
            <BoqTaskDetails 
                tasks={tasksList || []}
                boqId={boqData.name}
                companyId={boqData.company}
                contactId={boqData.contact}
            />
            <BoqRemarks 
                remarks={remarksList || []} 
                boqId={boqData.name}
            />
            <OtherBoqDetails 
                boq={boqData} 
                contact={contactData} 
                company={companyData}
            />
        </div>
    );
};
// import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "@/hooks/use-toast";
// import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
// import { useViewport } from "@/hooks/useViewPort";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ"; // 1. Use new type
// import { formatDate } from "@/utils/FormatDate";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
// import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import * as z from "zod";
// import { NewBoqForm } from "./NewBoqForm"; // 2. Use new form component

// // 3. Define a new schema for the BOQ form
// const boqFormSchema = z.object({
//     boq_name: z
//         .string({ required_error: "Required!" })
//         .min(3, { message: "Minimum 3 characters required!" }),
//     boq_company: 
//         z.object({ label: z.string(), value: z.string() }),
//     boq_contact: 
//         z.object({ label: z.string(), value: z.string() }),
//     submission_date: 
//         z.string({ required_error: "Submission date is required" }),
//     boq_value: z.coerce.number().optional(),
//     boq_status: z.string().optional(),
//     // Add any other fields from your BOQ doctype here
// });

// type BOQFormValues = z.infer<typeof boqFormSchema>;

// // 4. Rename the component
// export const BOQ = () => {
//     const { isDesktop } = useViewport();
//     const navigate = useNavigate();
//     const [id] = useStateSyncedWithParams<string>("id", "");
    
//     const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
//     const { deleteDoc, loading: deleteLoading } = useFrappeDeleteDoc();

//     const [editDialogOpen, setEditDialogOpen] = useState(false);
//     const toggleEditDialog = () => setEditDialogOpen(!editDialogOpen);

//     const [deleteDialog, setDeleteDialog] = useState(false);
//     const toggleDeleteDialog = () => setDeleteDialog(!deleteDialog);

//     const { mutate } = useSWRConfig();

//     // 5. Fetch from "CRM BOQ" Doctype
//     const { data, isLoading: dataLoading, mutate: dataMutate } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", id, { enabled: !!id });

//     // 6. Fetch related data using new BOQ field names
//     const { data: boqCompany } = useFrappeGetDoc<CRMCompany>("CRM Company", data?.boq_company, { enabled: !!data?.boq_company });
//     const { data: boqContact } = useFrappeGetDoc<CRMContacts>("CRM Contacts", data?.boq_contact, { enabled: !!data?.boq_contact });

//     const form = useForm<BOQFormValues>({
//         resolver: zodResolver(boqFormSchema),
//         defaultValues: {}, // Will be set by useEffect
//         mode: "onBlur",
//     });

//     useEffect(() => {
//         if (data) {
//           // 7. Update form.reset with new BOQ fields
//           form.reset({
//             boq_name: data.boq_name,
//             boq_company: { value: data.boq_company, label: boqCompany?.company_name },
//             boq_contact: { value: data.boq_contact, label: `${boqContact?.first_name} ${boqContact?.last_name}` },
//             submission_date: data.submission_date,
//             boq_value: data.boq_value,
//             boq_status: data.boq_status,
//           });
//         }
//     }, [data, form, boqCompany, boqContact]);

//     const onSubmit = async (values: BOQFormValues) => {
//         try {
//             const isValid = await form.trigger();
//             if(isValid) {
//                 // 8. Update "CRM BOQ" Doctype
//                 await updateDoc("CRM BOQ", data?.name, {
//                   boq_name: values.boq_name,
//                   boq_company: values.boq_company?.value,
//                   boq_contact: values.boq_contact?.value,
//                   submission_date: values.submission_date,
//                   boq_value: values.boq_value,
//                   boq_status: values.boq_status,
//                 });

//                 await dataMutate();
//                 await mutate("CRM BOQ"); // Mutate BOQ list key
//                 toggleEditDialog();

//                 toast({
//                     title: "Success!",
//                     description: "BOQ updated successfully!", // Updated toast message
//                     variant: "success",
//                 });
//             }
//         } catch (error) {
//             toast({
//                 title: "Failed!",
//                 description: `${error?.Error || error?.message}`,
//                 variant: "destructive",
//             });
//         }
//     };

//     const handleConfirmDelete = async () => {
//         try {
//             // 9. Delete from "CRM BOQ"
//             await deleteDoc("CRM BOQ", data?.name);
//             await mutate("CRM BOQ");
//             toast({
//                 title: "Success!",
//                 description: `BOQ: ${data?.boq_name} deleted successfully!`, // Updated toast message
//                 variant: "success",
//             });
//             navigate(-1);
//             toggleDeleteDialog();
//         } catch (error) {
//             toast({
//                 title: "Failed!",
//                 description: `${error?.Error || error?.message}`,
//                 variant: "destructive",
//             });
//         }
//     };

//     return (
//         <div className="dark:text-white space-y-4">
//             <section>
//                 <div className="font-medium mb-2 flex items-center gap-1">
//                     {isDesktop && <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />}
//                     {/* 10. Update all static text and displayed data */}
//                     <h2 className="font-medium">BOQ Details</h2>
//                 </div>
//                 <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
//                     <div className="flex justify-between">
//                         <div className="flex flex-col gap-6">
//                             <div>
//                                 <p className="text-xs">BOQ Name</p>
//                                 <p className="text-sm font-semibold text-destructive">{data?.boq_name}</p>
//                             </div>
//                             <div>
//                                 <p className="text-xs">Value</p>
//                                 <p className="text-sm font-semibold text-destructive">{data?.boq_value || "--"}</p>
//                             </div>
//                             <div>
//                                 <p className="text-xs">Date Created</p>
//                                 <p className="text-sm font-semibold text-destructive">{formatDate(data?.creation) || "--"}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-col gap-6 text-end">
//                             <div>
//                                 <p className="text-xs">Submission Date</p>
//                                 <p className="text-sm font-semibold text-destructive">{formatDate(data?.submission_date) || "--"}</p>
//                             </div>
//                             <div>
//                                 <p className="text-xs">Status</p>
//                                 <p className="text-sm font-semibold text-destructive">{data?.boq_status || "--"}</p>
//                             </div>
//                         </div>
//                     </div>
//                     <Separator />
//                     <div className="flex justify-between">
//                         <div className="flex flex-col gap-6">
//                             <div>
//                                 <p className="text-xs">Company Name</p>
//                                 <p className="text-sm font-semibold text-destructive">{boqCompany?.company_name}</p>
//                             </div>
//                             <div>
//                                 <p className="text-xs">Contact Name</p>
//                                 <p className="text-sm font-semibold text-destructive">{boqContact?.first_name} {boqContact?.last_name}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-col gap-6 text-end">
//                             <div>
//                                 <p className="text-xs">Company Location</p>
//                                 <p className="text-sm font-semibold text-destructive">{boqCompany?.company_location || "--"}</p>
//                             </div>
//                             <div>
//                                 <p className="text-xs">Contact Designation</p>
//                                 <p className="text-sm font-semibold text-destructive">{boqContact?.designation || "--"}</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="flex justify-end gap-2 mt-4">
//                     <Button onClick={toggleEditDialog} variant="outline" className="text-destructive border-destructive">
//                         <SquarePen />
//                         Edit
//                     </Button>
//                     <Button onClick={toggleDeleteDialog} variant="outline" className="text-destructive border-destructive">
//                         <Trash2 />
//                         Delete
//                     </Button>
//                 </div>
              
//                 <AlertDialog open={deleteDialog} onOpenChange={toggleDeleteDialog}>
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
//                     <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
//                         <AlertDialogHeader className="text-start">
//                             <AlertDialogTitle className="text-destructive text-center">Edit BOQ</AlertDialogTitle>
//                             <AlertDialogDescription asChild>
//                               <NewBoqForm form={form} edit={true} />
//                             </AlertDialogDescription>

//                         <div className="flex items-end gap-2">
//                             <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
//                             <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
//                         </div>
//                         </AlertDialogHeader>
//                     </AlertDialogContent>
//                 </AlertDialog>
//             </section>
//         </div>
//     );
// };