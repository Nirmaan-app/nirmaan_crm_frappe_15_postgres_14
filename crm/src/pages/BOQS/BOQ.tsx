// src/pages/BOQs/BOQ.tsx
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMNote } from "@/types/NirmaanCRM/CRMNote";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { useFrappeGetDoc, useFrappeGetDocList, useSWRConfig, useFrappeUpdateDoc } from "frappe-react-sdk";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Plus, SquarePen } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReusableAlertDialog } from "@/components/ui/ReusableDialogs";
import { toast } from "@/hooks/use-toast";
import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon'; // Import the status icon
import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";
import { StatusPill } from "@/pages/Tasks/TasksVariantPage"
import { useViewport } from "@/hooks/useViewPort";
import { useUserRoleLists } from "@/hooks/useUserRoleLists"
import { parse, isValid } from 'date-fns';
import { BoqDealStatusCard } from "./components/BoqDealStatusCard";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTaskCreationHandler } from "@/hooks/useTaskCreationHandler";

// ============================================================================================
// START OF CHANGES: Implementing the new Task Creation Handler and Role-Based Filtering
// ============================================================================================

/**
 * A new centralized hook to handle the logic for creating tasks. It checks the user's
 * role and opens the correct dialog (Sales, Estimation, or Admin's choice).
 */



/**
 * A new, reusable component to render a list of tasks with a title and an "Add Task" button.
 * This will be used by all user roles to display their relevant tasks.
 */
const TaskListSection = ({ title, tasks, boqId, companyId, contactId, taskProfile, disableTaskCreate }: {
    title: string;
    tasks: CRMTask[];
    boqId: string;
    companyId: string;
    contactId: string;
    taskProfile: 'Sales' | 'Estimates';
    disableTaskCreate?: boolean; // New prop to disable task creation button
}) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    const handleCreateTask = useTaskCreationHandler();

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">{title} ({tasks.length})</h2>
                {(disableTaskCreate !== true) && <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={() => handleCreateTask({ boqId, companyId, contactId, task_profile: taskProfile })}>
                    <Plus className="w-4 h-4 mr-2" />Add New Task
                </Button>}
            </div>
            <div className="max-h-[275px] overflow-y-auto border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Task Details</TableHead>
                            <TableHead className="hidden md:table-cell text-center">Remarks</TableHead>
                            <TableHead className="hidden md:table-cell text-center">Deadline</TableHead>
                            <TableHead className="w-[5%]"><span className="sr-only">View</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <TableRow key={task.name} onClick={() =>  navigate(`/tasks/task?id=${task.name}`)} className="cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <TaskStatusIcon status={task.status} className="flex-shrink-0" />
                                            <div>
                                                <span className="font-medium">{task.type}</span>
                                                {task.remarks && (
                                                    <span className="block text-xs text-muted-foreground mt-1 md:hidden">Remarks: {task.remarks}</span>
                                                )}
                                                <span className="block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
                                                    Scheduled for: {formatDateWithOrdinal(task.start_date)}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center">{task.remarks || "--"}</TableCell>
                                    <TableCell className="hidden md:table-cell text-center">{formatDateWithOrdinal(task.start_date)}</TableCell>
                                    <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No tasks found in this category.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};


/**
 * The `BoqTaskDetails` component is now a smart orchestrator. It receives the full task list
 * and determines which `TaskListSection`(s) to render based on the user's role.
 */
const BoqTaskDetails = ({ allTasks, boqId, companyId, contactId }: { allTasks: CRMTask[], boqId: string, companyId: string, contactId: string }) => {
    const role = localStorage.getItem('role');

    // Filter tasks based on their profile. This logic is now inside the component that uses it.
    const salesTasks = useMemo(() => allTasks?.filter(task => task.task_profile === 'Sales') || [], [allTasks]);
    const estimationTasks = useMemo(() => allTasks?.filter(task => task.task_profile === 'Estimates') || [], [allTasks]);

    // Role-based rendering logic
    if (role === 'Nirmaan Admin User Profile') {
        return (
            <div className="space-y-6">
                <TaskListSection title="Sales Tasks" tasks={salesTasks} boqId={boqId} companyId={companyId} contactId={contactId} taskProfile="Sales" disableTaskCreate={true} />
                <TaskListSection title="Estimation Tasks" tasks={estimationTasks} boqId={boqId} companyId={companyId} contactId={contactId} taskProfile="Estimates" disableTaskCreate={true} />
            </div>
        );
    }

    if (role === 'Nirmaan Sales User Profile') {
        return <TaskListSection title="Sales Tasks" tasks={salesTasks} boqId={boqId} companyId={companyId} contactId={contactId} taskProfile="Sales" />;
    }

    if (role === 'Nirmaan Estimations User Profile') {
        return <TaskListSection title="Estimation Tasks" tasks={estimationTasks} boqId={boqId} companyId={companyId} contactId={contactId} taskProfile="Estimates" />;
    }

    return null; // Render nothing if the role is not recognized
};
// ============================================================================================
// END OF CHANGES
// ============================================================================================


// --- SUB-COMPONENT 1: Header ---
// Inside src/pages/BOQs/BOQ.tsx

// Make sure useStatusStyles is imported at the top of the file

// --- THIS IS THE UPDATED HEADER COMPONENT ---
const BoqDetailsHeader = ({ boq }: { boq: CRMBOQ }) => {
    const { openEditBoqDialog, openAssignBoqDialog, openRenameBoqNameDialog } = useDialogStore();
    const { updateDoc, loading } = useFrappeUpdateDoc();
    const { mutate } = useSWRConfig();
    const getBoqStatusClass = useStatusStyles("boq");
    const role = localStorage.getItem('role');
    const currentUser = localStorage.getItem('userId');
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

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

    // --- NEW: Handler for opening the rename dialog ---
    const handleRenameBoqClick = () => {
        // Ensure boq.name is available before opening
        if (boq?.name) {
            openRenameBoqNameDialog({
                currentDoctype: "CRM BOQ", // Specify your doctype
                currentDocName: boq.boq_name,
            });
        } else {
            toast({ title: "Error", description: "BOQ document name is missing.", variant: "destructive" });
        }
    };


    return (
        <div className="bg-background p-6 rounded-lg border shadow-sm flex justify-between items-start">
            {/* Left Section */}
            <div className="space-y-4">
                <div>
                    {/* <p className="text-sm text-muted-foreground">BOQ Name</p> */}
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">BOQ Name</p>

                        <Button
                            variant="ghost" // Use a ghost variant for a subtle, icon-only button
                            size="icon"     // Make it a small, icon-only button
                            className="h-7 w-7 text-muted-foreground hover:text-primary" // Adjust size/color
                            onClick={handleRenameBoqClick}
                            aria-label="Rename BOQ" // Accessibility
                        >
                            <SquarePen className="w-4 h-4" /> {/* Pencil icon */}
                        </Button>
                    </div>
                    <h1 className="text-lg font-bold">{boq?.boq_name || 'N/A'}</h1>

                </div>
                <div>
                    <p className="text-sm text-muted-foreground">BOQ Link</p>
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
                    <h1 className="text-sm font-bold">{getUserFullNameByEmail(boq?.assigned_sales) || 'N/A'}</h1>
                </div>
                {/* <div>
                    <p className="text-sm text-muted-foreground">Assigned Estimates</p>
                    <h1 className="text-sm font-bold">{getUserFullNameByEmail(boq?.assigned_estimations) || 'N/A'}</h1>
                </div> */}
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
                ) : <span className="px-2 py-1">{" "}</span>}

                <Button
                    onClick={() => openEditBoqDialog({ boqData: boq, mode: 'status' })}
                    className="bg-destructive hover:bg-destructive/90 mt-2" // Added margin for spacing
                >
                    Update BOQ Status
                </Button>
                {role == "Nirmaan Admin User Profile" && (
                    <Button
                        onClick={() => openAssignBoqDialog({ boqData: boq })}
                        className="bg-destructive hover:bg-destructive/90 mt-4" // Added margin for spacing
                    >
                        Edit Assigned
                    </Button>
                )}

                {/* {role === "Nirmaan Estimations User Profile" && !boq.assigned_estimations && (
                    <Button
                        // 5. The button now just opens the local dialog
                        onClick={() => setIsConfirmOpen(true)}
                        disabled={loading}
                        className="bg-destructive hover:bg-destructive/90 mt-4"
                    >
                        {loading ? "Assigning..." : "Assign to Me"}
                    </Button>
                )} */}

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



// // --- SUB-COMPONENT 2: Task List (Now with rendering logic) ---
// const BoqTaskDetails = ({ tasks, boqId, companyId, contactId }: { tasks: CRMTask[], boqId: string, companyId: string, contactId: string }) => {
//     const navigate = useNavigate();
//     // console.log("tasks",tasks)
//     const getTaskStatusClass = useStatusStyles("task")
//     const { isMobile } = useViewport();


//     const { openNewTaskDialog } = useDialogStore();

//     return (
//         <div className="bg-background p-4 rounded-lg border shadow-sm">
//             <div className="flex justify-between items-center mb-2">
//                 <h2 className="font-semibold">{"Task Lists"}</h2>
//                 <Button size="sm" className="bg-destructive hover:bg-destructive/90" onClick={() => openNewTaskDialog({ boqId, companyId, contactId })}>
//                     <Plus className="w-4 h-4 mr-2" />Add New Task
//                 </Button>
//             </div>

//             <div className="max-h-[275px] overflow-y-auto border rounded-md">

//                 <Table>
//                     <TableHeader>

//                         <TableRow>
//                             {/* This column is visible on all screen sizes */}
//                             <TableHead>Task Details</TableHead>

//                             {/* These columns will ONLY appear on desktop (md screens and up) */}
//                             {/* <TableHead className="hidden md:table-cell">Company</TableHead>
//                             <TableHead className="hidden md:table-cell">Status</TableHead> */}
//                             <TableHead className="hidden md:table-cell text-center">Remarks</TableHead>
//                             <TableHead className="hidden md:table-cell text-center">Scheduled for</TableHead>


//                             {/* Chevron column */}
//                             <TableHead className="w-[5%]"><span className="sr-only">View</span></TableHead>
//                         </TableRow>

//                     </TableHeader>
//                     <TableBody >
//                         {tasks.length > 0 ? (
//                             tasks.map((task) => (
//                                 <TableRow key={task.name} onClick={() => isMobile ? navigate(`/tasks/task?id=${task.name}`) : navigate(`/tasks?id=${task.name}`)} className="cursor-pointer">

//                                     {/* --- MOBILE & DESKTOP: Combined Cell --- */}
//                                     <TableCell>
//                                         {isMobile ?
//                                             (<div className="flex items-center gap-3">
//                                                 <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
//                                                 <div className="flex flex-col">
//                                                     <span>                                                <span className="font-semibold">{task?.type}</span>
//                                                         {/* with <span className="font-semibold">{task?.first_name}

//                                                     </span> */}


//                                                     </span>
//                                                     {/* On mobile, show the date here. Hide it on larger screens. */}
//                                                     {task.remarks && (<span className="inline-block text-xs   rounded-md  py-0.5 mt-1 md:hidden self-start">
//                                                         Remarks: {task.remarks}
//                                                     </span>)}
//                                                     <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
//                                                         Scheduled for: {formatDateWithOrdinal(task.start_date)}
//                                                     </span>
//                                                 </div>
//                                             </div>) : (<div className="flex items-center gap-3">
//                                                 <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
//                                                 <div className="flex flex-col">
//                                                     <span className="font-medium">{`${task.type}`}</span>


//                                                 </div>
//                                             </div>)}
//                                     </TableCell>

//                                     {/* --- DESKTOP ONLY Cells --- */}
//                                     {/* <TableCell className="hidden md:table-cell">{task.company_name}</TableCell>
//                                     <TableCell className="hidden md:table-cell"><StatusPill status={task.status} /></TableCell> */}
//                                     <TableCell className="hidden md:table-cell text-center">{task.remarks || "--"}</TableCell>
//                                     <TableCell className="hidden md:table-cell text-right">
//                                         <div className="flex flex-col items-center">
//                                             <span>{formatDateWithOrdinal(task.start_date)}</span>
//                                             <span className="text-xs text-muted-foreground text-center">
//                                                 {formatTime12Hour(task?.time)}
//                                             </span>
//                                         </div>
//                                     </TableCell>


//                                     <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
//                                 </TableRow>
//                             ))
//                         ) : (
//                             <TableRow>
//                                 <TableCell colSpan={6} className="text-center h-24">No tasks found in this category.</TableCell>
//                             </TableRow>
//                         )}
//                     </TableBody>
//                 </Table>
//             </div>
//         </div>
//     );
// };

// --- SUB-COMPONENT 3: Remarks ---
const BoqRemarks = ({ remarks, boqId }: { remarks: CRMNote[], boqId: CRMBOQ }) => {
    const { openRemarkBoqDialog } = useDialogStore();

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Additional Remarks</h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive"
                    // This is a partial BOQ object, which is okay for this specific mode
                    onClick={() => openRemarkBoqDialog({ boqData: boqId })}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Remarks
                </Button>
            </div>
            <div className="max-h-[275px] overflow-y-auto pr-2 mr-2 space-y-2">
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
                            <span className="text-muted-foreground">{formatDateWithOrdinal(remark.creation)}</span>
                            <span><span className="font-semibold">{remark.title}:</span><span>{" "}{remark.content}:</span></span>
                        </div>
                        {/* We don't need a separator if the header provides the line */}
                        {index < remarks.length - 1 && <Separator />}

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
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

    // --- UPDATED: DetailItem component to use <Link> for internal paths ---
    const DetailItem = ({ label, value, href }: { label: string; value: string | React.ReactNode; href?: string }) => {
        const isNA = value === "N/A" || value === "--"; // Check for both "N/A" and "--"
        let content: React.ReactNode;

        if (isNA) {
            content = <p className="font-semibold">{value}</p>;
        } else if (href) {
            if (href.startsWith('/') || href.startsWith('.')) { // Internal path check
                content = (
                    <Link to={href} className="font-semibold text-blue-600 underline">
                        {value}
                    </Link>
                );
            } else { // External path (mailto, tel, http, https)
                content = (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline">
                        {value}
                    </a>
                );
            }
        } else {
            content = <p className="font-semibold">{value}</p>;
        }

        return (
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                {content}
            </div>
        );
    };

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
                <DetailItem label="BOQ Value" value={`${boq?.boq_value} Lakhs` || 'N/A'} />

                <DetailItem label="Package" value={boq?.boq_type || 'N/A'} />
                <DetailItem label="City" value={boq?.city || 'N/A'} />

                <DetailItem label="Submission Deadline" value={formatDateWithOrdinal(boq?.boq_submission_date) || "--"} />
                <DetailItem label="Recevied on" value={formatDateWithOrdinal(boq?.creation)} />
                <DetailItem label="Created by" value={getUserFullNameByEmail(boq?.owner) || "Administrator"} />

                <DetailItem label="Latest Remarks" value={boq?.remarks || 'N/A'} />
            </div>

            <Separator />

            {/* Contact & Company Details Section */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-20">
                <DetailItem label="Contact Name" value={contact?.first_name ? `${contact.first_name} ${contact.last_name}` : 'N/A'} isLink href={`/contacts/contact?id=${contact?.name}`} />
                <DetailItem label="Designation" value={contact?.designation || 'N/A'} />
                <DetailItem label="Company Name" value={company?.name || 'N/A'} isLink href={`/companies/company?id=${company?.name}`} />
                <DetailItem label="Company City" value={company ? company?.company_city : 'N/A'} />
            </div>

            {/* <Separator />

            <div className="flex justify-between items-center">
                <DetailItem label="Additional Attachments" value="n/a" />
                <Button variant="outline" size="sm" className="text-destructive border-destructive">
                    <Plus className="w-4 h-4 mr-2" />ADD ATTACHMENTS
                </Button>
            </div> */}
        </div>
    );
};




// --- TYPE DEFINITIONS ---
interface DocVersion {
    data: string; // A JSON string containing changes
    creation: string; // ISO date string for when the version was created
    owner: string; // The user who made this version/change
}

interface ChangeEntry extends Array<string | any> {
    0: string; // field name, e.g., 'boq_status'
    1: any; // old value
    2: any; // new value
}

interface ParsedVersionData {
    changed?: ChangeEntry[];
}

// 1. UPDATED: TransformedHistoryItem Interface
interface TransformedHistoryItem {
    status: string; // The overall BOQ status after this version's changes
    sub_status: string; // The overall BOQ sub-status after this version's changes
    remark: string;
    submission_date: string;
    date: string; // Updated date for *this specific version entry*
    link?: string;
    owner: string; // Owner for *this specific version entry*
}


// --- MAIN COMPONENT ---
const BoqSubmissionHistory = ({ versions }: { versions: DocVersion[] }) => {
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();


    const transformedHistory = useMemo((): TransformedHistoryItem[] => {
        if (!versions || versions.length === 0) return [];

        let lastKnownStatus = '';
        let lastKnownSubStatus = ''; // NEW: Track sub-status

        // We process in reverse to establish the correct status and sub-status at each point in time.
        // Then, reverse again at the end to display most recent first.
        const tempHistory = versions.slice().reverse().map(version => {
            try {
                const parsedData: ParsedVersionData = JSON.parse(version.data);
                const changes = parsedData.changed || [];

                const statusChange = changes.find(c => c[0] === 'boq_status');
                const subStatusChange = changes.find(c => c[0] === 'boq_sub_status');
                const boqLinkChange = changes.find(c => c[0] === 'boq_link');
                const remarksChange = changes.find(c => c[0] === 'remarks');
                const dateChange = changes.find(c => c[0] === 'boq_submission_date');

                // If this version changed the status, update our tracker.
                if (statusChange) {
                    lastKnownStatus = statusChange[2] as string;
                } else {
                    lastKnownStatus = "-"
                }
                // If this version changed the sub-status, update our tracker.
                if (subStatusChange) {
                    lastKnownSubStatus = subStatusChange[2] as string;
                } else {
                    lastKnownSubStatus = "--"
                }

                // We create a history item if any of the fields we care about were changed.
                // This prevents logging versions where only internal system updates happened.
                if (!statusChange && !subStatusChange && !boqLinkChange && !remarksChange && !dateChange) {
                    return null;
                }

                const remarkValue = remarksChange ? (remarksChange[2] as string) : '--';
                const boqLinkValue = boqLinkChange ? (boqLinkChange[2] as string) : undefined;

                // --- FIX: Robustly parse boq_submission_date to a Date object ---
                let parsedSubmissionDate: Date | null = null;
                if (dateChange && typeof dateChange[2] === 'string' && dateChange[2].trim() !== '') {
                    const rawDateString = dateChange[2];

                    // Try parsing as DD-MM-YYYY first (common ambiguous format)
                    let candidateDate = parse(rawDateString, 'dd-MM-yyyy', new Date());
                    if (isValid(candidateDate)) {
                        parsedSubmissionDate = candidateDate;
                    } else {
                        // If DD-MM-YYYY fails, try parsing as a standard ISO string or whatever new Date() handles
                        candidateDate = new Date(rawDateString);
                        if (isValid(candidateDate)) {
                            parsedSubmissionDate = candidateDate;
                        }
                    }
                }


                // Get owner and creation date for THIS specific version
                const versionOwner = version.owner; // Assuming email format
                const versionDate = formatDateWithOrdinal(version.creation);

                return {
                    status: lastKnownStatus || 'N/A', // Fallback for status
                    sub_status: lastKnownSubStatus || '--', // Fallback for sub-status
                    remark: remarkValue,
                    submission_date: parsedSubmissionDate,
                    date: versionDate, // Date of this specific version
                    link: boqLinkChange ? boqLinkChange[2] : undefined,
                    owner: versionOwner, // Owner of this specific version
                };
            } catch (e) {
                console.error("Failed to parse version data:", e);
                return null;
            }
        });

        // Filter out nulls and reverse again to show most recent first
        return tempHistory.filter((item): item is TransformedHistoryItem => item !== null).reverse();

    }, [versions]);

    // Mobile Card Component
    const MobileHistoryCard = ({ item }: { item: TransformedHistoryItem; }) => (
        <div className="bg-white border border-gray-200 rounded-md p-3 mb-2 shadow-sm"> {/* Increased padding slightly */}
            {/* Header with Status and Sub-Status */}
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-dashed border-gray-200">
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-500 font-semibold">Status:</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getBoqStatusClass(item.status)}`}>
                            {item.status}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getBoqStatusClass(item.status)}`}>
                            {item.sub_status}
                        </span>
                    </div>
                    {/* NEW: Display Sub-Status on mobile */}
                    {/* {item.sub_status && item.sub_status !== '--' && (
                        <div className="flex items-center gap-1 text-xs">
                            <span className="text-[10px] text-gray-500 font-semibold">Sub-Status:</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getBoqStatusClass(item.sub_status)}`}>
                                {item.sub_status}
                            </span>
                        </div>
                    )} */}
                </div>
                {/* NEW: Updated by and Date on mobile */}
                <div className="text-xs text-gray-500 text-right ml-2 mr-1">
                    Updated by: <span className="font-semibold">{getUserFullNameByEmail(item.owner) || "Administrator"}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">({item.date})</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-22 ">
                {/* Remarks */}
                <div className="mt-1">
                    <div className="text-xs font-medium text-gray-600 mb-1 font-semibold">Remarks</div>
                    <div className="text-sm text-gray-800 line-clamp-2">{item.remark || '--'}</div>
                </div>

                {/* Submission Deadline */}
                <div className="mt-1">
                    <div className="text-xs font-medium text-gray-600 mb-1 text-center font-semibold">Submission Deadline</div>
                    <div className="text-sm text-gray-800 text-center">{item.submission_date ? formatDateWithOrdinal(item.submission_date) : '--'}</div>
                </div>
            </div>
            {/* BOQ Link */}
            {item.link && (
                <div className="mt-2 pt-1 border-t border-gray-100">
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 text-xs font-medium hover:text-blue-700"
                    >
                        <svg className="w-2 h-2 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View BOQ Link
                    </a>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">BOQ Submission History</h2>

            {/* Desktop Table View */}
            <div className="hidden md:block max-h-[275px] overflow-y-auto pr-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Status</TableHead>
                            <TableHead className="w-[120px]">Sub-Status</TableHead> {/* NEW: Sub-Status header */}
                            <TableHead>Remarks</TableHead>
                            <TableHead className="w-[150px]">Submission Deadline</TableHead>
                            <TableHead className="w-[180px]">Updated By & Date</TableHead> {/* NEW: Combined header */}
                            <TableHead className="w-[100px]">Link</TableHead>
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
                                    {/* NEW: Sub-Status cell */}
                                    <TableCell>
                                        {item.sub_status && item.sub_status !== '--' ? (
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${getBoqStatusClass(item.sub_status)}`}>
                                                {item.sub_status}
                                            </span>
                                        ) : '--'}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{item.remark || '--'}</TableCell>
                                    <TableCell>{item.submission_date ? formatDateWithOrdinal(item.submission_date) : '--'}</TableCell>
                                    {/* NEW: Combined Updated By & Date cell */}
                                    <TableCell>
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium text-sm">{getUserFullNameByEmail(item.owner) || "Administrator"}</span>
                                            <span className="text-xs text-muted-foreground">{item.date}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.link != undefined ? (
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
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No submission history found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden max-h-[275px] overflow-y-auto">
                {transformedHistory.length > 0 ? (
                    <div className="space-y-3">
                        {transformedHistory.map((item, index) => (
                            // Removed index from props since it's not used in MobileHistoryCard
                            <MobileHistoryCard key={index} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-lg mb-2">📋</div>
                        <div>No submission history found.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoqSubmissionHistory; // Ensure it's exported for use elsewhere


// --- MAIN ORCHESTRATOR COMPONENT ---
export const BOQ = () => {
    const navigate = useNavigate(); // For navigation

    const [id] = useStateSyncedWithParams<string>("id", "");
    const role = localStorage.getItem('role');
    const [searchParams] = useSearchParams(); // To read URL query parameters
    const statusTab = searchParams.get('statusTab'); // Get the 'statusTab' value


    const { data: boqData, isLoading: boqLoading } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", id, `BOQ/${id}`);
    const { data: companyData, isLoading: companyLoading } = useFrappeGetDoc<CRMCompany>("CRM Company", boqData?.company);

    const { data: contactData, isLoading: contactLoading } = useFrappeGetDoc<CRMContacts>("CRM Contacts", boqData?.contact, boqData?.contact ? undefined : null);


    const { data: tasksList, isLoading: tasksLoading } = useFrappeGetDocList<CRMTask>("CRM Task", { filters: { boq: id }, fields: ["name", "status", "start_date", "type", "modified", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation", "remarks", "task_profile"], orderBy: { field: "start_date", order: "desc" }, limit: 0, }, `all-tasks-filterbyBoq-id${id}`);

    const { data: remarksList, isLoading: remarksLoading } = useFrappeGetDocList<CRMNote>("CRM Note", { filters: { reference_doctype: "CRM BOQ", reference_docname: id }, fields: ["name", "title", "content", "creation"], orderBy: { field: "creation", order: "desc" }, limit: 0, }, `all-notes-filterbyBoq-id${id}`);


    const { data: versionsList, isLoading: versionsLoading } = useFrappeGetDocList<DocVersion>("Version", {
        filters: { ref_doctype: "CRM BOQ", docname: id },
        fields: ["name", "owner", "creation", "data"],
        orderBy: { field: "creation", order: "desc" },
        limit: 0,
        // enabled: role != 'Nirmaan Sales User Profile' //
    }, role != 'Nirmaan Sales User Profile' ? `all-boqs-filterbyBoq-id${id}` : null);

    if (boqLoading || companyLoading || contactLoading || tasksLoading || remarksLoading) {
        return <div>Loading BOQ Details...</div>;
    }
    if (!boqData) {
        return <div>BOQ not found.</div>;
    }
    // console.log("boq data", boqData)
    const handleBackToBoqsList = () => {
        // Construct the path back to /boqs, including statusTab if it exists
        // const path = statusTab ? `/boqs?statusTab=${encodeURIComponent(statusTab)}` : '/boqs';
        navigate(-1);

    };

    return (
        <div className="flex flex-col h-full max-h-screen overflow-y-auto space-y-2">
            <div className="sticky top-0 z-20 bg-background p-2  flex-shrink-0">
                <div className="flex items-center gap-4"> {/* Container for back button and header text */}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToBoqsList}
                        aria-label="Back to Company List"
                        className="hidden md:inline-flex" // Hide on mobile, show on desktop
                    >
                        <div className="bg-destructive text-black font-bold p-2 rounded-full">
                            <ArrowLeft className="w-8 h-8" />
                        </div>
                    </Button>

                    <h1 className="text-md md:text-2xl font-bold">{boqData.boq_name}</h1>
                </div>
            </div>
            {/* 
            <div className="flex items-center gap-4 mb-4"> 

                {(role != "Nirmaan Estimations User Profile") && (
                    <Button variant="ghost" size="icon" onClick={handleBackToBoqsList} aria-label="Back to Company List"
                        className="hidden md:inline-flex" // Add these classes
                    >
                        <div className="bg-destructive text-black font-bold p-2 rounded-full">
                            <ArrowLeft className="w-8 h-8" />
                        </div>
                    </Button>
                )}

                <h1 className="text-xl md:text-2xl font-bold ">{boqData.boq_name}</h1> 
            </div> */}

            <BoqDetailsHeader boq={boqData} />


            {(role != "Nirmaan Estimations User Profile") && (
                <BoqDealStatusCard boq={boqData} />
            )}

            {/* {(role != "Nirmaan Estimations User Profile") && ( */}
            <BoqTaskDetails
                // tasks={tasksList}
                allTasks={tasksList || []}
                boqId={boqData.name}
                companyId={boqData.company}
                contactId={boqData.contact}
            />
            {/* )} */}


            <OtherBoqDetails
                boq={boqData}
                contact={contactData}
                company={companyData}
            />
            {role !== "Nirmaan Sales User Profile" && (
                <BoqSubmissionHistory versions={versionsList} boqData={boqData} />

            )}

            <BoqRemarks
                remarks={remarksList}
                boqId={boqData}
            />

        </div>
    );
};
