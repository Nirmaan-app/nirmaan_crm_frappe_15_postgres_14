// src/pages/Tasks/Task.tsx
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ, CRMCompany, CRMContacts, CRMNote, CRMTask } from "@/types/NirmaanCRM"; // Assumes an index file for types
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, SquarePen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon'; // Import the status icon
import { StatusPill } from "./TasksVariantPage";
import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";
import { useViewport } from "@/hooks/useViewPort";
import * as z from "zod";


export const taskFormSchema = z.object({
    reference_docname: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    type: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

// --- SUB-COMPONENT: Task Details Card ---
const TaskDetailsCard = ({ task, contact, company, boq }: { task: CRMTask, contact?: CRMContacts, company?: CRMCompany, boq?: CRMBOQ }) => {
    const { openEditTaskDialog } = useDialogStore();
    const getTaskStatusClass = useStatusStyles("task")


    const DetailItem = ({ label, value, href }: { label: string, value?: string | number | null, href?: string }) => {
        // Determine if the value is present and not an empty string
        const hasValue = value !== null && value !== undefined && value !== '';

        return (
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                {href ? (
                    // If a link URL is provided...
                    hasValue ? (
                        <Link to={href} className="font-semibold text-blue-600 hover:underline">
                            {value}
                        </Link>
                    ) : (
                        <p className="font-semibold text-muted-foreground">N/A</p>
                    )
                ) : (
                    // If no link URL is provided...
                    <p className="font-semibold">
                        {hasValue ? value : <span className="text-muted-foreground">N/A</span>}
                    </p>
                )}
            </div>
        );
    };
    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">

                {/* This is the left side */}
                <h2 className="text-lg font-semibold">Task Details</h2>

                {/* This is the right side, which only renders if the task is not completed */}
                {task.status === "Scheduled" && (
                    // This inner div groups the buttons together
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline" // Using 'outline' for a cleaner look than 'ghost' with a border
                            size="sm"
                            onClick={() => openEditTaskDialog({ taskData: task, mode: 'edit' })}
                        >
                            <SquarePen className="w-4 h-4 mr-2" />
                            EDIT
                        </Button>

                        <Button
                            variant="destructive" // Using the 'destructive' variant for the primary action button
                            size="sm"
                            onClick={() => openEditTaskDialog({ taskData: task, mode: 'updateStatus' })}
                        >
                            Update Status
                        </Button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <DetailItem label="Name" value={`${contact?.first_name || ''} ${contact?.last_name || ''}`} href={`/contacts/contact?id=${contact?.name}`} />
                <DetailItem label="Company" value={task?.company} href={`/companies/company?id=${task?.company}`} />
                <DetailItem label="Mobile Number" value={contact?.mobile} href={`tel:${contact?.mobile}`} />
                <DetailItem label="Type" value={task?.type} />
                <DetailItem label="Project" value={task.boq} href={`/boqs/boq?id=${task.boq}`} />
                <div className="flex flex-col">
                    <p className="text-xs text-muted-foreground">Current Status</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${getTaskStatusClass(task.status)}`}>{task.status}</span>
                </div>
                <DetailItem label="Date" className="text-sm" value={`${formatDateWithOrdinal(task?.start_date)}`} />
                <DetailItem label="Remarks" className="text-sm" value={task?.remarks || "--"} />
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Task History ---
const TaskHistory = ({ tasks }: { tasks: CRMTask[] }) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport(); // <-- 2. USE THE HOOK

    return (
        // <div className="bg-background p-4 rounded-lg border shadow-sm">
        //     <h2 className="font-semibold mb-4">Contact Task History</h2>
        //     {tasks.length > 1 ? tasks.map((task, i) => (
        //         <div key={task.name}>
        //             <div onClick={() => navigate(`/contacts/contact?id=${task.contact}`)} className="grid grid-cols-3 items-center py-3 cursor-pointer">
        //                 <span>{task.type}</span>
        //                 <span className="text-muted-foreground text-sm">{formatDate(task.start_date)}</span>
        //                 <div className="flex items-center justify-end gap-2">
        //                      <span className="text-xs font-semibold px-2 py-1 rounded-full">{task.status||"New"}</span>
        //                      <ChevronRight className="w-4 h-4 text-muted-foreground"/>
        //                 </div>
        //             </div>
        //             {i < tasks.length - 1 && <Separator />}
        //         </div>
        //     )) : <p className="text-center text-sm text-muted-foreground py-4">No other tasks for this contact.</p>}
        // </div>
        <>
            <Card className="mt-4 p-0">
                <CardContent className="p-0">
                    
            <div className="max-h-[310px] overflow-y-auto border rounded-md">

                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/* This column is visible on all screen sizes */}
                                <TableHead className="text-black font-bold">Contact Task History</TableHead>

                                {/* These columns will ONLY appear on desktop (md screens and up) */}
                                {/* <TableHead className="hidden md:table-cell">Company</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead> */}
                                <TableHead className="hidden md:table-cell text-center">Remarks</TableHead>


                                <TableHead className="hidden md:table-cell text-center">Scheduled for</TableHead>


                                {/* Chevron column */}
                                <TableHead className="w-[5%]"><span className="sr-only">View</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        
                        <TableBody >
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <TableRow key={task.name} onClick={() => isMobile ? navigate(`/tasks/task?id=${task.name}`) : navigate(`/tasks?id=${task.name}`)} className="cursor-pointer">

                                        {/* --- MOBILE & DESKTOP: Combined Cell --- */}
                                        <TableCell>
                                            {isMobile ?
                                                (<div className="flex items-center gap-3">
                                                    <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span>                                                <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>


                                                        </span>
                                                        {task.remarks && (<span className="inline-block text-xs   rounded-md  py-0.5 mt-1 md:hidden self-start">
                                                            Remarks: {task.remarks}
                                                        </span>)}
                                                        {/* On mobile, show the date here. Hide it on larger screens. */}
                                                        <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
                                                            Scheduled for: {formatDateWithOrdinal(task.start_date)}
                                                        </span>
                                                    </div>
                                                </div>) : (<div className="flex items-center gap-3">
                                                    <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
                                                    <div>
                                                        <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>

                                                    </div>
                                                </div>)}
                                        </TableCell>


                                        {/* --- DESKTOP ONLY Cells --- */}
                                        {/* <TableCell className="hidden md:table-cell">{task.company_name}</TableCell>
                                        <TableCell className="hidden md:table-cell"><StatusPill status={task.status} /></TableCell> */}
                                        <TableCell className="hidden md:table-cell text-center">{task.remarks || "--"}</TableCell>

                                        <TableCell className="hidden md:table-cell text-right">
                                            <div className="flex flex-col items-center">
                                                <span>{formatDateWithOrdinal(task.start_date)}</span>

                                            </div>
                                        </TableCell>

                                        <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No tasks found in this category.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

// --- SUB-COMPONENT: Remarks ---
const TaskRemarks = ({ remarks }: { remarks: CRMNote[] }) => {
    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h2 className="font-semibold mb-4">Remarks</h2>
            {remarks.length > 0 ? (
                <p>{remarks[0].content}</p> /* Showing the latest remark as per mockup */
            ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No remarks found.</p>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: Update Buttons ---
const UpdateTaskButtons = ({ task }: { task: CRMTask }) => {
    const { openEditTaskDialog } = useDialogStore();
    return (
        <div className="fixed full bottom-16 left-0 right-0 p-4 bg-background border-t shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
            <Button className=" bg-destructive" onClick={() => openEditTaskDialog({ taskData: task, mode: 'updateStatus' })}>
                Update Task
            </Button>
        </div>
    );
};


// --- MAIN ORCHESTRATOR COMPONENT ---
export const Task = () => {
    const [id] = useStateSyncedWithParams("id", "");

    // Fetch the main task and all its related documents
    const { data: taskData, isLoading: taskLoading, mutate: taskMutate } = useFrappeGetDoc<CRMTask>("CRM Task", id, `all-tasks-${id}`);

    const { data: contactData, isLoading: contactLoading, mutate: contactMutate } = useFrappeGetDoc<CRMContacts>("CRM Contacts", taskData?.contact);

    const { data: companyData, isLoading: companyLoading, mutate: companyMutate } = useFrappeGetDoc<CRMCompany>("CRM Company", taskData?.company,);
    const { data: boqData, isLoading: boqLoading } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", taskData?.boq,);

    const { data: historyTasks, isLoading: historyLoading } = useFrappeGetDocList<CRMTask>(
        "CRM Task",
        {
            filters: { contact: taskData?.contact, name: ['!=', id] },
            limit: 0,

            fields: ["name", "status", "start_date", "type", "modified", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation", "assigned_sales","remarks"],
            orderBy: { field: "start_date", order: "desc"},
            
        }
        , `all-tasks-contacthistory${taskData?.contact}`);

    // const { data: remarksList, isLoading: remarksLoading } = useFrappeGetDocList<CRMNote>("CRM Note", { filters: { reference_doctype: "CRM Task", reference_docname: id }, orderBy: {field: "creation", order: "desc"} });

    if (taskLoading || contactLoading || companyLoading) {
        return <div>Loading Task Details...</div>
    }

    if (!taskData) {
        return <div>Task not found.</div>
    }
    // console.log("tasks",taskData)

    return (
        <div className="space-y-6 pb-24"> {/* Padding bottom to prevent overlap with fixed button */}
            <TaskDetailsCard task={taskData} contact={contactData} company={companyData} boq={boqData} />
            <TaskHistory tasks={historyTasks || []} />
            {/* <TaskRemarks remarks={remarksList || []} /> */}
            {/* {taskData.status!=="Completed"&&(
            <UpdateTaskButtons task={taskData} />

            )} */}
        </div>
    );
};
