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
import { useFrappeGetDoc, useFrappeGetDocList,useSWRConfig,useFrappeUpdateDoc } from "frappe-react-sdk";
import { ChevronDown, ChevronRight, Plus, SquarePen } from "lucide-react";
import React ,{useMemo,useState}from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReusableAlertDialog } from "@/components/ui/ReusableDialogs";
import { toast } from "@/hooks/use-toast";

// --- SUB-COMPONENT 1: Header ---
// Inside src/pages/BOQs/BOQ.tsx

// Make sure useStatusStyles is imported at the top of the file

// --- THIS IS THE UPDATED HEADER COMPONENT ---
const BoqDetailsHeader = ({ boq }: { boq: CRMBOQ }) => {
      const { openEditBoqDialog } = useDialogStore();
    const { updateDoc, loading } = useFrappeUpdateDoc();
    const { mutate } = useSWRConfig();
    const getBoqStatusClass = useStatusStyles("boq");
    const role = localStorage.getItem('role');
    const currentUser = localStorage.getItem('userId');
    
    // 3. LOCAL STATE: Use useState to control the dialog's visibility
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);


   const handleConfirmAssign = async () => {
        if (!currentUser) {
            toast({ title: "Error", description: "Could not identify current user.", variant: "destructive" });
            return;
        }
        try {
            await updateDoc("CRM BOQ", boq.name, { assigned_estimations: currentUser });
            toast({ title: "Success!", description: `BOQ assigned to you.` });
            await mutate(`BOQ/${boq.name}`);
            await mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));
            setIsConfirmOpen(false)
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    };



    return (
        <div className="bg-background p-6 rounded-lg border shadow-sm flex justify-between items-start">
            {/* Left Section */}
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-muted-foreground">BOQ Name</p>
                    <h1 className="text-lg font-bold">{boq?.boq_name || 'N/A'}</h1>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">BOQ</p>
                    {/* Display a link if it exists, otherwise 'N/A' */}
                    {boq?.boq_link ? (
                         <a href={boq.boq_link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline">
                            View BOQ
                         </a>
                    ) : (
                        <p className="font-semibold">N/A</p>
                    )}
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Assigned Sales</p>
                    <h1 className="text-sm font-bold">{boq?.assigned_sales || 'N/A'}</h1>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Assigned Estimates</p>
                    <h1 className="text-sm font-bold">{boq?.assigned_estimations || 'N/A'}</h1>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-end space-y-2">
                <div>
                    <p className="text-sm text-muted-foreground text-right mb-1">Status</p>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>
                        {boq.boq_status || 'N/A'}
                    </span>
                </div>
                
                {/* Conditionally render the sub-status only if it has a value */}
                {boq.boq_sub_status ? (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {boq.boq_sub_status}
                    </span>
                ):<span className="px-2 py-1">{" "}</span>}

                <Button
                    onClick={() => openEditBoqDialog({ boqData: boq, mode: 'status' })}
                    className="bg-destructive hover:bg-destructive/90 mt-2" // Added margin for spacing
                >
                    Update BOQ Status
                </Button>
                {role=="Nirmaan Admin User Profile"&&(
 <Button
                    onClick={() => openEditBoqDialog({ boqData: boq, mode: 'assigned' })}
                    className="bg-destructive hover:bg-destructive/90 mt-4" // Added margin for spacing
                >
                    Edit Assigned
                </Button>
                )}

                {role === "Nirmaan Estimations User Profile" && !boq.assigned_estimations && (
                        <Button
                            // 5. The button now just opens the local dialog
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={loading}
                            className="bg-destructive hover:bg-destructive/90 mt-4" 
                        >
                            {loading ? "Assigning..." : "Assign to Me"}
                        </Button>
                    )}
               
                 <ReusableAlertDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Assign to Me"
                children={`Are you sure you want to assign this BOQ (${boq.boq_name}) to yourself?`}
                onConfirm={handleConfirmAssign}
            />
            </div>
        </div>
    );
};



// --- SUB-COMPONENT 2: Task List (Now with rendering logic) ---
const BoqTaskDetails = ({ tasks, boqId, companyId, contactId }: { tasks: CRMTask[], boqId: string, companyId: string, contactId: string }) => {
    const navigate = useNavigate();
    // console.log("tasks",tasks)
    const getTaskStatusClass=useStatusStyles("task")

    const { openNewTaskDialog } = useDialogStore();
   
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
                 <div className="max-h-[275px] overflow-y-auto pr-2 -mr-2"> {/* Negative margin to compensate for padding */}
                {tasks.length > 0 ? (
                    tasks.map((task, index) => (
                        // React.Fragment does not need a key or className here
                        <React.Fragment key={task.name}>
                            <div 
                                onClick={() => navigate(`/tasks/task?id=${task.name}`)} 
                                className="grid grid-cols-3 items-center px-2 py-3 cursor-pointer hover:bg-secondary rounded-md"
                            >
                                <span className="font-medium truncate pr-2">{task.type}</span>
                                <span className="text-sm text-muted-foreground">{formatDate(task.start_date)}</span>
                                <div className="flex items-center justify-end gap-2">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getTaskStatusClass(task.status)}`}>
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
        </div>
    );
};

// --- SUB-COMPONENT 3: Remarks ---
const BoqRemarks = ({ remarks, boqId }: { remarks: CRMNote[], boqId: CRMBOQ }) => {
    const { openEditBoqDialog } = useDialogStore();

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Additional Remarks</h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-destructive text-destructive" 
                    // This is a partial BOQ object, which is okay for this specific mode
                    onClick={() => openEditBoqDialog({ boqData:boqId as CRMBOQ, mode: 'remark' })}
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
            {href ? <a href={href} className="font-semibold text-blue-600 underline">{value}</a>  : <p className="font-semibold">{value}</p>}
        </div>
    );
    return (
<div className="bg-background p-6 rounded-lg border shadow-sm space-y-6">

            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">BOQ Details</h2>
                <Button variant="outline" size="sm" className="border-destructive text-destructive" onClick={() => openEditBoqDialog({ boqData: boq, mode: 'details' })}>
                    <SquarePen className="w-4 h-4 mr-2" />Edit
                </Button>
            </div>
                {/* Top Details Section */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-20">
                <DetailItem label="Size (Sqft)" value={boq?.boq_size || 'N/A'} />
                <DetailItem label="BOQ Value" value={`₹ ${boq?.boq_value}` || 'N/A'} />
                  
                <DetailItem label="Package" value={boq?.boq_type || 'N/A'} />
                <DetailItem label="City" value={boq?.city || 'N/A'} />

                <DetailItem label="Submission Deadline" value={formatDate(boq?.boq_submission_date)} />
                    <DetailItem label="Recevied on" value={formatDate(boq?.creation)} />
                <DetailItem label="Created by" value={boq?.owner.split('@')[0]}/>
                
                <DetailItem label="Remarks" value={boq?.remarks || 'N/A'} />
            </div>

            <Separator />

            {/* Contact & Company Details Section */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-20">
                <DetailItem label="Contact Name" value={contact ? `${contact.first_name} ${contact.last_name}` : 'N/A'} isLink href={`/contacts/contact?id=${contact?.name}`} />
                <DetailItem label="Designation" value={contact?.designation || 'N/A'} />
                <DetailItem label="Company Name" value={contact?.company || 'N/A'} isLink href={`/companies/company?id=${company?.name}`} />
                <DetailItem label="Location" value={boq?.city || 'N/A'} />
            </div>

            <Separator />

            {/* Attachments Section */}
            <div className="flex justify-between items-center">
                <DetailItem label="Additional Attachments" value="n/a" />
                <Button variant="outline" size="sm" className="text-destructive border-destructive">
                    <Plus className="w-4 h-4 mr-2" />ADD ATTACHMENTS
                </Button>
            </div>
        </div>
    );
};


// --- UPDATED SUBMISSION HISTORY COMPONENT ---
const BoqSubmissionHistory = ({ versions }: { versions: DocVersion[] }) => {
    const getBoqStatusClass = useStatusStyles("boq");

    // This memoized function transforms the raw version data into the format needed for the UI table.
    const transformedHistory = useMemo((): TransformedHistoryItem[] => {
        if (!versions || versions.length === 0) return [];

        let lastKnownStatus = '';

        // We process in reverse to establish the correct status at each point in time.
        return versions.slice().reverse().map(version => {
            try {
                const parsedData = JSON.parse(version.data);
                const changes = parsedData.changed || [];

                const statusChange = changes.find(c => c[0] === 'boq_status');
                const subStatusChange = changes.find(c => c[0] === 'boq_sub_status');
                const boqLinkChange = changes.find(c => c[0] === 'boq_link');
                const remarksChange = changes.find(c => c[0] === 'remarks'); // New
                const dateChange = changes.find(c => c[0] === 'boq_submission_date'); // New

                // console.log(dateChange[2])

                // If this version changed the status, update our tracker.
                if (statusChange) {
                    lastKnownStatus = statusChange[2]; // [2] is the new value
                }

                // We create a history item if any of the fields we care about were changed.
                if (!statusChange && !subStatusChange && !boqLinkChange && !remarksChange && !dateChange) {
                    return null;
                }

                // Build a descriptive remark based on what changed in this version.
                let remarkText = '';
                if (remarksChange) {
                    remarkText = `${remarksChange[2]}`;
                }else{
                    remarkText='--'
                }

             
                // else if (subStatusChange && subStatusChange[2]) {
                //     remarkText = subStatusChange[2]; // e.g., "Awaiting clarification from Client"
                // }   else if (dateChange) {
                //     remarkText = `Submission date changed to ${dateChange[2]}`;
                // } else if (statusChange) {
                //     remarkText = `Status updated`; // Default if only status changed
                // }

                return {
                    status: lastKnownStatus,
                    remark: remarkText,
                    submission_date:dateChange?dateChange[2]:"--",

                    date: formatDate(version.creation),
                    link: boqLinkChange ? boqLinkChange[2] : undefined
                };
            } catch (e) {
                console.error("Failed to parse version data:", e);
                return null;
            }
        })
        .filter((item): item is TransformedHistoryItem => item !== null) // Remove nulls and add type guard
        .reverse(); // Reverse again to show most recent first

    }, [versions]);

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h2 className="font-semibold mb-4">BOQ Submission History</h2>
            <div className="max-h-[275px] overflow-y-auto pr-2">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>BOQs Status</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Submission Deadline</TableHead>

                        <TableHead>Date Updated</TableHead>
                        <TableHead>BOQs Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transformedHistory.length > 0 ? (
                        transformedHistory.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-md ${getBoqStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </TableCell>
                                <TableCell>{item.remark || '--'}</TableCell>
                                <TableCell>{item.submission_date||'--'}</TableCell>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>
                                    {item.link ? (
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">
                                            View Link
                                        </a>
                                    ) : (
                                        '--'
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">No submission history found.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>
        </div>
    );
};


// --- MAIN ORCHESTRATOR COMPONENT ---
export const BOQ = () => {
    const [id] = useStateSyncedWithParams<string>("id", "");
    const role = localStorage.getItem('role');


    const { data: boqData, isLoading: boqLoading } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", id,`BOQ/${id}`);
    const { data: companyData, isLoading: companyLoading } = useFrappeGetDoc<CRMCompany>("CRM Company", boqData?.company, { enabled: !!boqData?.company });

     const { data: contactData, isLoading: contactLoading } = useFrappeGetDoc<CRMContacts>("CRM Contacts", boqData?.contact);
    
    
    const { data: tasksList, isLoading: tasksLoading } = useFrappeGetDocList<CRMTask>("CRM Task", { filters: { boq: id }, fields: ["name", "type", "start_date", "status"],orderBy: { field: "creation", order: "desc" },limit: 0, },`all-tasks-filterbyBoq-id${id}`);

    const { data: remarksList, isLoading: remarksLoading } = useFrappeGetDocList<CRMNote>("CRM Note", { filters: { reference_doctype: "CRM BOQ", reference_docname: id }, fields: ["name", "content", "creation"], orderBy: { field: "creation", order: "desc" },limit: 0, },`all-notes-filterbyBoq-id${id}`);


  const { data: versionsList, isLoading: versionsLoading } = useFrappeGetDocList<DocVersion>("Version", {
        filters: { ref_doctype: "CRM BOQ", docname: id },
        fields: ["name", "owner", "creation", "data"],
        orderBy: { field: "creation", order: "desc" },
        limit: 20,
        enabled: role !== 'Nirmaan Sales User Profile' //
    },`all-boqs-filterbyBoq-id${id}`);

    if (boqLoading || companyLoading || contactLoading || tasksLoading || remarksLoading) {
        return <div>Loading BOQ Details...</div>;
    }
    if (!boqData) {
        return <div>BOQ not found.</div>;
    }
    return (
        <div className="space-y-6">
            <BoqDetailsHeader boq={boqData} />
            {(role!="Nirmaan Estimations User Profile")&&(
<BoqTaskDetails 
                tasks={tasksList || []}
                boqId={boqData.name}
                companyId={boqData.company}
                contactId={boqData.contact}
            />
            )}
            
           
            <OtherBoqDetails 
                boq={boqData} 
                contact={contactData} 
                company={companyData}
            />
            {role!=="Nirmaan Sales User Profile"&&(
             <BoqSubmissionHistory versions={versionsList || []} boqData={boqData} />

            )}

             <BoqRemarks 
                remarks={remarksList || []} 
                boqId={boqData}
            />

        </div>
    );
};
