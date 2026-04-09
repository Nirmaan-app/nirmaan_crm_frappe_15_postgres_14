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
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Plus, SquarePen, Wallet, Calendar, Clock, FolderOpen } from "lucide-react";
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
import { BoqBcsStatusCard } from "./components/BoqBcsStatusCard";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTaskCreationHandler } from "@/hooks/useTaskCreationHandler";
import { FullPageSkeleton } from "@/components/common/FullPageSkeleton";
import { parsePackages } from "@/constants/boqPackages";
import { ProjectEstimationsTable, CRMProjectEstimation } from "./components/ProjectEstimationsTable";
import { BoqBcsTaskExport } from "./components/BoqBcsTaskExport";
import { cn } from "@/lib/utils";

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
        <div className="bg-background p-4 rounded-lg border shadow-sm shrink-0">
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
                                <TableRow key={task.name} onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="cursor-pointer">
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

    // Role-based rendering logic
    if (role === 'Nirmaan Admin User Profile') {
        return (
            <div className="space-y-6">
                <TaskListSection title="Sales Tasks" tasks={salesTasks} boqId={boqId} companyId={companyId} contactId={contactId} taskProfile="Sales" disableTaskCreate={true} />
            </div>
        );
    }

    if (role === 'Nirmaan Sales User Profile') {
        return <TaskListSection title="Sales Tasks" tasks={salesTasks} boqId={boqId} companyId={companyId} contactId={contactId} taskProfile="Sales" />;
    }

    return null; // Render nothing if the role is not recognized
};
// ============================================================================================
// END OF CHANGES
// ============================================================================================


// --- NEW COMBINED PROJECT OVERVIEW CARD ---
const ProjectOverviewCard = ({ boq, contact, company, estimations }: { boq: CRMBOQ, contact?: CRMContacts, company?: CRMCompany, estimations?: CRMProjectEstimation[] }) => {
    const { openEditBoqDialog } = useDialogStore();
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail } = useUserRoleLists();
    const role = localStorage.getItem('role');
    const isSalesProfile = role === 'Nirmaan Sales User Profile';

    // Total should be BOQ-only, not BOQ+BCS.
    const boqTotalFromRows = (estimations || [])
        .filter((est) => (est.document_type || '').toUpperCase() === 'BOQ')
        .reduce((sum, est) => sum + (Number(est.value) || 0), 0);
    const bcsTotalFromRows = (estimations || [])
        .filter((est) => (est.document_type || '').toUpperCase() === 'BCS')
        .reduce((sum, est) => sum + (Number(est.value) || 0), 0);

    const totalValue = boqTotalFromRows > 0 ? boqTotalFromRows : (Number(boq?.boq_value) || 0);
    const profitValue = totalValue - bcsTotalFromRows;
    const profitPercent = totalValue > 0 ? (profitValue / totalValue) * 100 : 0;

    return (
        <div className="bg-background rounded-xl border shadow-sm flex flex-col md:flex-row mb-6 overflow-hidden shrink-0">
            {/* Left Column: Title & Totals */}
            <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
                <div>
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3 ${getBoqStatusClass(boq?.boq_status || 'New')}`}>
                        {boq?.boq_status || 'New'}
                    </span>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4 leading-tight">
                        {boq?.boq_name || 'N/A'}
                    </h1>
                </div>

                <div className={cn("grid gap-2 mt-4", isSalesProfile ? "grid-cols-1" : "grid-cols-2")}>
                    <div className="flex items-center gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                        <div className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total BOQ Value</p>
                            <p className="text-sm font-bold text-gray-900">₹{totalValue.toFixed(2)}L</p>
                        </div>
                    </div>

                    {!isSalesProfile && (
                        <div className="flex items-center gap-2 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/60">
                            <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-md">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Profit</p>
                                <p className={cn("text-sm font-bold", profitValue >= 0 ? "text-emerald-700" : "text-red-600")}>
                                    ₹{profitValue.toFixed(2)}L ({profitPercent.toFixed(1)}%)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Details Grid */}
            <div className="md:w-2/3 flex flex-col">
                <div className="flex justify-end p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold bg-gray-50 hover:bg-gray-100"
                            onClick={() => openEditBoqDialog({ boqData: boq, mode: 'status' })}
                        >
                            <SquarePen className="w-3.5 h-3.5 mr-2" />
                            Project Status
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold bg-gray-50 hover:bg-gray-100"
                            onClick={() => openEditBoqDialog({ boqData: boq, mode: 'details' })}
                        >
                            <SquarePen className="w-3.5 h-3.5 mr-2" />
                            Edit Project Details
                        </Button>
                        {/* <BoqBcsTaskExport projectId={boq?.name} /> */}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4 flex-grow">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Carpet Area (Sqft.)</p>
                        <p className="text-sm font-semibold text-gray-900">{boq?.boq_size || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Location</p>
                        <p className="text-sm font-semibold text-gray-900">{boq?.city || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Assigned Sales</p>
                        <p className="text-sm font-semibold text-gray-900">{getUserFullNameByEmail(boq?.assigned_sales || "") || 'N/A'}</p>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Company Name</p>
                        {company?.name ? (
                            <Link to={`/companies/company?id=${company.name}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline transition-colors">
                                {company.name}
                            </Link>
                        ) : (
                            <p className="text-sm font-semibold text-gray-900">N/A</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Contact Name</p>
                        {contact?.name ? (
                            <Link to={`/contacts/contact?id=${contact.name}`} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                {contact.first_name} {contact.last_name}
                            </Link>
                        ) : (
                            <p className="text-sm font-semibold text-gray-900">N/A</p>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Drive Folder</p>
                        {boq?.boq_link ? (
                            <a href={boq.boq_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-semibold px-3 py-1.5 rounded w-full sm:w-auto text-center mx-auto sm:mx-0">
                                <FolderOpen className="w-3.5 h-3.5 mr-1.5" /> MRC Folder
                            </a>
                        ) : (
                            <p className="text-sm font-semibold text-gray-900">N/A</p>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50/50 p-3 lg:px-6 flex items-center justify-start gap-6 border-t border-gray-100 text-[10px] text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Added: {boq?.creation ? formatDateWithOrdinal(boq.creation) : 'N/A'}
                    </div>
                    {boq?.modified && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Updated: {formatDateWithOrdinal(boq.modified)}
                        </div>
                    )}
                </div>
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

export const RemarksDisplayItem = ({ label, value, className }) => {
    const isNA = value === 'N/A' || !value;

    return (
        <div className={className}>
            <p className="text-xs text-muted-foreground">{label}</p>

            <div className="mt-1 p-3 rounded-md bg-gray-50 border border-gray-200 text-gray-800 text-sm whitespace-pre-wrap break-words">
                {isNA ? 'N/A' : value}
            </div>
        </div>
    );

};




// --- TYPE DEFINITIONS ---
interface DocVersion {
    data: string; // A JSON string containing changes
    creation: string; // ISO date string for when the version was created
    owner: string; // The user who made this version/change
    docname?: string; // The document name
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
    submission_date: string | null;
    date: string; // Updated date for *this specific version entry*
    link?: string;
    owner: string; // Owner for *this specific version entry*
    source_type?: string; // e.g. 'Project', 'BOQ', 'BCS'
    source_title?: string;
}


// --- MAIN COMPONENT ---
const BoqSubmissionHistory = ({ versions, estVersions, estimations, boqData }: { versions: DocVersion[], estVersions?: DocVersion[], estimations?: CRMProjectEstimation[], boqData: CRMBOQ }) => {
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail } = useUserRoleLists();


    const transformedHistory = useMemo((): TransformedHistoryItem[] => {
        let allItems: TransformedHistoryItem[] = [];

        // 1. Process Parent BOQ versions
        if (versions && versions.length > 0) {
            let lastKnownStatus = '';
            let lastKnownSubStatus = '';

            const tempHistory = versions.slice().reverse().map((version): TransformedHistoryItem | null => {
                try {
                    const parsedData: ParsedVersionData = JSON.parse(version.data);
                    const changes = parsedData.changed || [];

                    const statusChange = changes.find(c => c[0] === 'boq_status');
                    const subStatusChange = changes.find(c => c[0] === 'boq_sub_status');
                    const boqLinkChange = changes.find(c => c[0] === 'boq_link');
                    const remarksChange = changes.find(c => c[0] === 'remarks');
                    const dateChange = changes.find(c => c[0] === 'boq_submission_date');

                    if (statusChange) lastKnownStatus = statusChange[2] as string;
                    else lastKnownStatus = "-";

                    if (subStatusChange) lastKnownSubStatus = subStatusChange[2] as string;
                    else lastKnownSubStatus = "-";

                    // Filter negligible changes
                    if (!statusChange && !subStatusChange && !boqLinkChange && !remarksChange && !dateChange) {
                        return null;
                    }

                    const remarkValue = remarksChange ? (remarksChange[2] as string) : '--';
                    let parsedSubmissionDate: string | null = null;
                    if (dateChange && typeof dateChange[2] === 'string' && dateChange[2].trim() !== '') {
                        parsedSubmissionDate = dateChange[2];
                    }

                    return {
                        status: lastKnownStatus || 'N/A',
                        sub_status: lastKnownSubStatus || '--',
                        remark: remarkValue,
                        submission_date: parsedSubmissionDate,
                        date: version.creation,
                        link: boqLinkChange ? boqLinkChange[2] : undefined,
                        owner: version.owner,
                        source_type: 'PROJECT',
                        source_title: boqData?.boq_name || 'Project Details'
                    };
                } catch (e) {
                    return null;
                }
            }).filter((item): item is TransformedHistoryItem => item !== null);

            allItems = [...allItems, ...tempHistory];
        }

        // 2. Process Child Estimation versions
        if (estVersions && estVersions.length > 0) {
            // Group versions by their specific document name
            const groupedVersions: Record<string, DocVersion[]> = {};
            estVersions.forEach(v => {
                if (v.docname) {
                    if (!groupedVersions[v.docname]) groupedVersions[v.docname] = [];
                    groupedVersions[v.docname].push(v);
                }
            });

            // Process each estimation's timeline individually
            Object.entries(groupedVersions).forEach(([docname, docs]) => {
                let lastKnownStatus = '';
                let lastKnownSubStatus = '';
                const est = estimations?.find(e => e.name === docname);

                const tempHistory = docs.slice().reverse().map((version): TransformedHistoryItem | null => {
                    try {
                        const parsedData: ParsedVersionData = JSON.parse(version.data);
                        const changes = parsedData.changed || [];

                        const statusChange = changes.find(c => c[0] === 'status');
                        const subStatusChange = changes.find(c => c[0] === 'sub_status');
                        const boqLinkChange = changes.find(c => c[0] === 'link');
                        const remarksChange = changes.find(c => c[0] === 'remarks');
                        const dateChange = changes.find(c => c[0] === 'deadline');

                        if (statusChange) lastKnownStatus = statusChange[2] as string;
                        else lastKnownStatus = "-";

                        if (subStatusChange) lastKnownSubStatus = subStatusChange[2] as string;
                        else lastKnownSubStatus = "-";

                        // Filter negligible changes
                        if (!statusChange && !subStatusChange && !boqLinkChange && !remarksChange && !dateChange) {
                            return null;
                        }

                        const remarkValue = remarksChange ? (remarksChange[2] as string) : '--';

                        let parsedSubmissionDate: string | null = null;
                        if (dateChange && typeof dateChange[2] === 'string' && dateChange[2].trim() !== '') {
                            parsedSubmissionDate = dateChange[2];
                        }

                        return {
                            status: lastKnownStatus || 'N/A',
                            sub_status: lastKnownSubStatus || '--',
                            remark: remarkValue,
                            submission_date: parsedSubmissionDate,
                            date: version.creation,
                            link: boqLinkChange ? boqLinkChange[2] : undefined,
                            owner: version.owner,
                            source_type: est?.document_type || 'ESTIMATION',
                            source_title: est?.title || docname
                        };
                    } catch (e) {
                        return null;
                    }
                }).filter((item): item is TransformedHistoryItem => item !== null);

                allItems = [...allItems, ...tempHistory];
            });
        }

        // 3. Sort chronologically across all documents and format date string
        return allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => ({
            ...item,
            date: formatDateWithOrdinal(item.date)
        }));

    }, [versions, estVersions, estimations, boqData?.boq_name]);

    // Mobile Card Component
    const MobileHistoryCard = ({ item }: { item: TransformedHistoryItem; }) => (
        <div className="bg-white border border-gray-200 rounded-md p-3 mb-2 shadow-sm">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-dashed border-gray-200">
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${item.source_type === 'BOQ' ? 'bg-blue-600' : item.source_type === 'BCS' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                            {item.source_type}
                        </span>
                        <span className="text-xs font-semibold text-gray-800 truncate max-w-[120px]" title={item.source_title}>{item.source_title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getBoqStatusClass(item.status)}`}>
                            {item.status}
                        </span>
                        {item.sub_status && item.sub_status !== '-' && item.sub_status !== '--' && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600`}>
                                {item.sub_status}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-[10px] text-gray-500 text-right ml-2 mr-1">
                    By: <span className="font-semibold text-gray-700">{getUserFullNameByEmail(item.owner) || "Administrator"}</span>
                    <br />
                    <span>{item.date}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                    <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Remarks</div>
                    <div className="text-xs text-gray-800 break-words">{item.remark || '--'}</div>
                </div>
                {item.submission_date && (
                    <div className="mt-1">
                        <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">Deadline</div>
                        <div className="text-xs font-medium text-gray-800">{formatDateWithOrdinal(item.submission_date)}</div>
                    </div>
                )}
            </div>
            {item.link && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 text-xs font-medium hover:text-blue-700"
                    >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Link
                    </a>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-background pt-2 p-4 rounded-lg border shadow-sm flex-col mt-4 shrink-0">
            <h2 className="font-semibold mb-4 text-xs md:text-sm uppercase tracking-wide text-gray-500">BOQ/BCS Submission History</h2>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-auto border border-border/60 rounded-lg max-h-[300px]">
                <Table>
                    <TableHeader className="bg-muted/30 z-10 sticky top-0">
                        <TableRow>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider w-[130px]">Date</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider max-w-[200px]">Source</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider w-[120px]">Status</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider w-[120px]">Sub-Status</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider min-w-[200px]">Remarks</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider w-[100px]">Deadline</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider text-right w-[150px]">Updated By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transformedHistory.length > 0 ? (
                            transformedHistory.map((item, index) => (
                                <TableRow key={index} className="hover:bg-muted/10 transition-colors">
                                    <TableCell className="font-medium text-xs text-foreground whitespace-nowrap align-top pt-3">{item.date}</TableCell>
                                    <TableCell className="align-top pt-3">
                                        <div className="flex flex-col gap-0.5">
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-white ${item.source_type === 'BOQ' ? 'bg-blue-600' : item.source_type === 'BCS' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                                                {item.source_type}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-900 truncate max-w-[180px]" title={item.source_title}>{item.source_title}</span>
                                            {item.link && (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline mt-0.5 inline-flex items-center">
                                                    Open Link <svg className="w-2.5 h-2.5 ml-0.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top pt-3">
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded text-blue-700 bg-blue-50 whitespace-nowrap`}>
                                            {item.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="align-top pt-3">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 whitespace-nowrap`}>
                                            {item.sub_status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-700 align-top pt-3 break-words">
                                        {item.remark || '--'}
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-gray-600 whitespace-nowrap align-top pt-3">
                                        {item.submission_date ? formatDateWithOrdinal(item.submission_date) : '--'}
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap align-top pt-3">
                                        {getUserFullNameByEmail(item.owner) || "Nirmaan User"}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-32 text-muted-foreground text-sm">No submission history available.</TableCell>
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


    const canFetchVersionHistory = role != 'Nirmaan Sales User Profile';

    const { data: versionsList, isLoading: versionsLoading } = useFrappeGetDocList<DocVersion>("Version", {
        filters: { ref_doctype: "CRM BOQ", docname: id },
        fields: ["name", "owner", "creation", "data"],
        orderBy: { field: "creation", order: "desc" },
        limit: 0,
        // enabled: role != 'Nirmaan Sales User Profile' //
    }, canFetchVersionHistory ? `all-boqs-filterbyBoq-id${id}` : null, {
        // Avoid recurring retry loops on 403 permission responses.
        shouldRetryOnError: false,
    });

    const { data: estimationsList, isLoading: estimationsLoading } = useFrappeGetDocList<CRMProjectEstimation>("CRM Project Estimation", {
        filters: [['parent_project', '=', id]],
        fields: ["name", "title", "package_name", "document_type", "value", "link", "status", "sub_status", "deadline", "remarks", "assigned_to", "creation"],
        limit: 0
    }, `project-estimations-${id}`);

    const estimationNames = estimationsList?.map(e => e.name) || [];

    const { data: estVersionsList, isLoading: estVersionsLoading } = useFrappeGetDocList<DocVersion>("Version", {
        filters: [['ref_doctype', '=', 'CRM Project Estimation'], ['docname', 'in', estimationNames]],
        fields: ["name", "owner", "creation", "data", "docname"],
        orderBy: { field: "creation", order: "desc" },
        limit: 0,
    }, canFetchVersionHistory && estimationNames.length > 0 ? `all-est-versions-project-${id}` : null, {
        // Avoid recurring retry loops on 403 permission responses.
        shouldRetryOnError: false,
    });

    if (boqLoading || companyLoading || contactLoading || tasksLoading || remarksLoading || estimationsLoading || estVersionsLoading) {
        return <FullPageSkeleton />
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
        <div className="flex flex-col h-full max-h-screen overflow-y-auto space-y-4 mb-6">
            <div className="sticky top-0 z-20 bg-background p-2 shrink-0">
                <div className="flex items-center gap-4"> {/* Container for back button and header text */}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBackToBoqsList}
                        aria-label="Back to Company List"
                        className="hidden md:inline-flex" // Hide on mobile, show on desktop
                    >
                        <div className="bg-destructive text-black font-bold p-2 rounded-full">
                            <ArrowLeft color="#ffffff" className="w-8 h-8" />
                        </div>
                    </Button>

                    <h1 className=" hidden md:block text-md md:text-2xl font-bold">Project Details</h1>
                </div>
            </div>
            {/* 
            <div className="flex items-center gap-4 mb-4"> 

                {(role != "Nirmaan Estimations User Profile" && role != "Nirmaan Estimations Lead Profile") && (
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

            <ProjectOverviewCard
                boq={boqData}
                company={companyData}
                contact={contactData}
                estimations={estimationsList}
            />

            {(role != "Nirmaan Estimations User Profile" && role != "Nirmaan Estimations Lead Profile") && (
                <BoqDealStatusCard boq={boqData} />
            )}

            <ProjectEstimationsTable
                projectId={boqData.name}
                estimations={estimationsList}
                isLoading={estimationsLoading}
            />

            <BoqTaskDetails
                allTasks={tasksList || []}
                boqId={boqData.name || ''}
                companyId={boqData.company || ''}
                contactId={boqData.contact || ''}
            />
            {role !== "Nirmaan Sales User Profile" && (
                <BoqSubmissionHistory
                    versions={versionsList || []}
                    estVersions={estVersionsList || []}
                    estimations={estimationsList}
                    boqData={boqData}
                />
            )}

            <BoqRemarks
                remarks={remarksList || []}
                boqId={boqData}
            />

        </div>
    );
};
