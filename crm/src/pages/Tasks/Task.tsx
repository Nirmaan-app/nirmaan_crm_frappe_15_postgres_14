// src/pages/Tasks/Task.tsx
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ, CRMCompany, CRMContacts, CRMNote, CRMTask } from "@/types/NirmaanCRM"; // Assumes an index file for types
import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, SquarePen } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
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
    const getStatusClass = (status: string) => {
        // ... (same status class function for 'Incomplete', etc.)
        return 'bg-red-100 text-red-800'; // Example
    };

    const DetailItem = ({ label, value, href }) => (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {href ? <Link to={href} className="font-semibold text-blue-600 underline">{value}</Link> : <p className="font-semibold">{value}</p>}
        </div>
    );

    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Task Details</h2>
               {task.status!="Completed" &&(<Button variant="ghost" size="sm" className="text-destructive" onClick={() => openEditTaskDialog({ taskData: task, mode: 'edit' })}>
                    <SquarePen className="w-4 h-4 mr-2" />EDIT
                </Button>)}
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <DetailItem label="Name" value={`${contact?.first_name || ''} ${contact?.last_name || ''}`} href={`/contacts/contact?id=${contact?.name}`} />
                <DetailItem label="Company" value={task?.company} href={`/companies/company?id=${task?.company}`} />
                <DetailItem label="Mobile Number" value={contact?.mobile} href={`tel:${contact?.mobile}`} />
                <DetailItem label="Type" value={task?.type} />
                <DetailItem label="Project" value={task.boq || 'N/A'} href={`/boqs/boq?id=${task.boq}`} />
                <div className="flex flex-col">
                    <p className="text-xs text-muted-foreground">Current Status</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${getStatusClass(task.status)}`}>{task.status}</span>
                </div>
                <DetailItem label="Date" value={formatDate(task?.start_date)} />
                <DetailItem label="Time" value={formatTime12Hour(task?.time)} />
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: Task History ---
const TaskHistory = ({ tasks }: { tasks: CRMTask[] }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-background p-4 rounded-lg border shadow-sm">
            <h2 className="font-semibold mb-4">Contact Task History</h2>
            {tasks.length > 1 ? tasks.map((task, i) => (
                <div key={task.name}>
                    <div onClick={() => navigate(`/contacts/contact?id=${task.contact}`)} className="grid grid-cols-3 items-center py-3 cursor-pointer">
                        <span>{task.type}</span>
                        <span className="text-muted-foreground text-sm">{formatDate(task.start_date)}</span>
                        <div className="flex items-center justify-end gap-2">
                             <span className="text-xs font-semibold px-2 py-1 rounded-full">{task.status||"New"}</span>
                             <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                        </div>
                    </div>
                    {i < tasks.length - 1 && <Separator />}
                </div>
            )) : <p className="text-center text-sm text-muted-foreground py-4">No other tasks for this contact.</p>}
        </div>
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
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
            <Button className=" bg-destructive" onClick={() => openEditTaskDialog({ taskData: task, mode: 'updateStatus' })}>
                Update Task
            </Button>
        </div>
    );
};


// --- MAIN ORCHESTRATOR COMPONENT ---
export const Task = () => {
    const [id] = useStateSyncedWithParams<string>("id", "");

    // Fetch the main task and all its related documents
    const { data: taskData, isLoading: taskLoading,mutate:taskMutate } = useFrappeGetDoc<CRMTask>("CRM Task", id);

    const { data: contactData, isLoading: contactLoading,mutate:contactMutate } = useFrappeGetDoc<CRMContacts>("CRM Contacts", taskData?.contact, { enabled: !!taskData?.contact });
    
    const { data: companyData, isLoading: companyLoading,mutate:companyMutate } = useFrappeGetDoc<CRMCompany>("CRM Company", taskData?.company, { enabled: !!taskData?.company });
    const { data: boqData, isLoading: boqLoading } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", taskData?.boq, { enabled: !!taskData?.boq });

   const { data: historyTasks, isLoading: historyLoading } = useFrappeGetDocList<CRMTask>(
        "CRM Task", 
        { 
            filters: { contact: taskData?.contact, name: ['!=', id] }, 
            limit: 5, 
            enabled: !!taskData?.contact,
            fields: ["*"] // Specify required fields here
        }
    );
    const { data: remarksList, isLoading: remarksLoading } = useFrappeGetDocList<CRMNote>("CRM Note", { filters: { reference_doctype: "CRM Task", reference_docname: id }, orderBy: {field: "creation", order: "desc"} });

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
            <TaskRemarks remarks={remarksList || []} />
            {taskData.status!=="Completed"&&(
            <UpdateTaskButtons task={taskData} />

            )}
        </div>
    );
};

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { ReusableAlertDialog } from "@/components/ui/ReusableDialogs";
// import { Separator } from "@/components/ui/separator";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow
// } from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
// import { useTaskActions } from "@/hooks/useTaskActions";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { ChevronRight, SquarePen, Trash2 } from "lucide-react";
// import { useCallback, useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import * as z from "zod";
// import { NewTaskForm } from "./NewTaskForm";

// export const taskFormSchema = z.object({
//     reference_docname: z
//         .string({
//             required_error: "Required!"
//         })
//         .min(3, {
//             message: "Minimum 3 characters required!",
//         }),
//     type: z.string().optional(),
//     date: z.string().optional(),
//     time: z.string().optional(),
// });

// export type TaskFormValues = z.infer<typeof taskFormSchema>;

// export const Task = () => {

//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate()
//     const id = searchParams.get("id")

//     const {deleteTask, updateTask, scheduleTask} = useTaskActions()

//     const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc<CRMTask>("CRM Task", id, id ? undefined : null)

//     const {data : contactData, isLoading: contactDataLoading} = useFrappeGetDoc<CRMContacts>("CRM Contacts", data?.reference_docname, data?.reference_docname ? undefined : null)

//     const {data : tasksData, isLoading: tasksDataLoading, mutate : tasksMutate} = useFrappeGetDocList<CRMTask>("CRM Task", {
//         fields: ["*"],
//         filters: [["reference_docname", "=", data?.reference_docname]],
//         limit: 1000
//     },
//     data?.reference_docname ? undefined : null
//     )
    
//     const {mutate} = useSWRConfig()

//     const [checked, setChecked] = useState(false);

//     const [editDialogOpen, setEditDialogOpen] = useState(false);
//     const toggleEditDialog = useCallback(() => {
//         setEditDialogOpen(!editDialogOpen);
//     }, [editDialogOpen]);

//     const [deleteDialog, setDeleteDialog] = useState(false);
//     const toggleDeleteDialog = useCallback(() => {
//         setDeleteDialog(!deleteDialog);
//     }, [deleteDialog]);

//     const [completeDialog, setCompleteDialog] = useState(false);
//     const toggleCompleteDialog = useCallback(() => {
//         setCompleteDialog(!completeDialog);
//     }, [completeDialog]);

//     const [scheduleTaskDialog, setScheduleTaskDialog] = useState(false);
//     const toggleScheduleTaskDialog = useCallback(() => {
//         setScheduleTaskDialog(!scheduleTaskDialog);
//     }, [scheduleTaskDialog]);

//     // const [status, setStatus] = useState<{ label : string, value : string }>({label : "", value : ""});
//     const [status, setStatus] = useState<string>("");
//     const [remarks, setRemarks] = useState("");
//     const [dialogType, setDialogType] = useState("");

//     const form = useForm<TaskFormValues>({
//         resolver: zodResolver(taskFormSchema),
//         defaultValues: {
//             reference_docname: data?.reference_docname,
//             type: data?.type,
//             date: data?.start_date?.split(" ")?.[0],
//             time: data?.start_date?.split(" ")?.[1],
//         },
//         mode: "onBlur",
//     });

//     useEffect(() => {
//         if (data) {
//           form.reset({
//             reference_docname: data?.reference_docname,
//             type: data?.type,
//             date: data?.start_date?.split(" ")?.[0],
//             time: data?.start_date?.split(" ")?.[1],
//           });
//         }
//     }, [data]);

//     const newScheduleTask = () => {
//         form.reset({
//             reference_docname: data?.reference_docname,
//             type: undefined,
//             date: undefined,
//             time: undefined,
//         })
//     }

//     const onSubmit = async (values: TaskFormValues) => {

//         await updateTask(data?.name, {
//             reference_docname: values.reference_docname,
//             type: values.type,
//             start_date: `${values.date} ${values.time}`,
//         })

//         await dataMutate()
//         toggleEditDialog()
//     }

//     const handleConfirmDelete = async () => {
//         await deleteTask(data?.name)
//         navigate(-1)
//         toggleDeleteDialog()
//     }

//     const handleUpdateTask = async () => {
//         await updateTask(data?.name, {
//             // status: status?.value,
//             status: status,
//             description: remarks,
//         })

//         await dataMutate()

//         toggleCompleteDialog()

//         if(dialogType === "complete" && checked) {
//             newScheduleTask()
//             toggleScheduleTaskDialog()
//         } else if (dialogType === "incomplete" && checked) {
//             setDialogType("reSchedule")
//             toggleEditDialog()
//         }
//         setChecked(false)
//         // setStatus({ label : "", value : ""})
//         setStatus("")
//         setRemarks("")
//     }

//     const handleNewScheduleTask = async (values : TaskFormValues) => {
//         const isValid = await form.trigger();
//         if(!isValid) return;

//         await scheduleTask(values)
//         await tasksMutate()
//         await mutate(`CRM Task ${contactData.name}`)
//         toggleScheduleTaskDialog()  
//     }

//     const completeStatusOptions = [
//         {label: "Pending", value: "Pending"},
//         {label: "Completed", value: "Completed"},
//     ]

//     const inCompleteStatusOptions = [
//         {label: "Pending", value: "Pending"},
//         {label: "Incomplete", value: "Incomplete"},
//     ]

//     return (
//         <div className="dark:text-white space-y-4">
//         <section>
//             <div className="flex justify-between items-center">
//                 <h2 className="font-medium mb-2">Task Details</h2>
//                 <p className="text-xs text-background bg-muted-foreground rounded-2xl px-2 py-1 flex items-center">{data?.status}</p>
//             </div>
//             <div className="p-4 shadow rounded-md">
//                 <div className="flex justify-between">
//                     <div className="flex flex-col gap-6">
//                         <div>
//                             <p className="text-xs">Contact</p>
//                             <p className="text-sm font-semibold text-destructive">{contactData?.first_name} {contactData?.last_name}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs">Date</p>
//                             <p className="text-sm font-semibold text-destructive">{formatDate(data?.start_date?.split(" ")?.[0])}</p>
//                         </div>
//                     </div>
//                     <div className="flex flex-col gap-6">
//                         <div className="text-end">
//                             <p className="text-xs">Type</p>
//                             <p className="text-sm font-semibold text-destructive">{data?.type || "--"}</p>
//                         </div>
//                         <div className="text-end">
//                             <p className="text-xs">Time</p>
//                             <p className="text-sm font-semibold text-destructive">{formatTime12Hour(data?.start_date?.split(" ")?.[1])}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//                 <Button onClick={toggleEditDialog} variant="outline" className="text-destructive border-destructive">
//                     <SquarePen />
//                     Edit
//                 </Button>
//                 <Button onClick={toggleDeleteDialog} variant="outline" className="text-destructive border-destructive">
//                     <Trash2 />
//                     Delete
//                 </Button>
//             </div>

//             <ReusableAlertDialog 
//             open={deleteDialog} onOpenChange={toggleDeleteDialog} 
//             title="Are you sure?" 
//             confirmText="Delete" 
//             cancelText="Cancel" 
//             onConfirm={handleConfirmDelete}
//             />

//             <ReusableAlertDialog
//                 open={editDialogOpen} onOpenChange={toggleEditDialog}
//                 title={dialogType === "reSchedule" ? "Re-Schedule Task" : "Edit Task"}
//                 confirmText="Save"
//                 cancelText="Cancel"
//                 onConfirm={() => onSubmit(form.getValues())}
//                 children={<TaskForm form={form} reSchedule={dialogType === "reSchedule" ? true : false} />}
//              />
//         </section>

//         <Separator />

//         <section>
//                 <h2 className="font-medium mb-2">Contact History</h2>
//                 <div className="p-4 shadow rounded-md flex flex-col gap-4">
//                     <Table>
//                       {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead className="w-[45%]">Task</TableHead>
//                           <TableHead className="w-[45%]">Date</TableHead>
//                           <TableHead className="w-[5%]"></TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {tasksData?.length ? (
//                             tasksData?.map(task => (
//                                 <TableRow key={task?.name}>
//                                   <TableCell className="font-medium">{task?.type}</TableCell>
//                                   <TableCell>{formatDate(task?.start_date?.split(" ")?.[0])}</TableCell>
//                                     <TableCell>
//                                         <ChevronRight className="w-4 h-4" />
//                                     </TableCell>
//                                 </TableRow>
//                             ))
//                         ) : (
//                             <TableRow>
//                                 <TableCell colSpan={3} className="text-center py-2">
//                                     No Tasks Found
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                       </TableBody>
//                     </Table>
//                 </div>
//             </section>

//             <section>
//                 <h2 className="font-medium mb-2">Last Remark</h2>
//                 <div className="p-4 shadow rounded-md flex flex-col gap-4">
//                     hello
//                 </div>
//             </section>

//             <div className="flex flex-col gap-4">
//                 <Button onClick={() => {
//                     // setStatus({label: "Completed", value: "Completed"})
//                     setStatus("Completed")
//                     setDialogType("complete")
//                     toggleCompleteDialog()
//                 }}>Complete</Button>
//                 <Button
//                     onClick={() => {
//                         // setStatus({label: "Incomplete", value: "Incomplete"})
//                         setStatus("Incomplete")
//                         setDialogType("incomplete")
//                         toggleCompleteDialog()
//                     }}
//                  variant="outline" className="text-destructive border-destructive">Incomplete</Button>
//             </div>

//             <ReusableAlertDialog 
//             open={completeDialog} onOpenChange={toggleCompleteDialog} 
//             title={dialogType === "complete" ? "Task Completed" : "Task Incomplete"} 
//             confirmText="Confirm" 
//             cancelText="Cancel"
//             disableConfirm={!status}
//             onConfirm={handleUpdateTask}
//             children={
//                             <div className="space-y-4">
//                                 <div className="space-y-2">
//                                 <Label htmlFor="status" className="flex">Current Status<sup className="text-sm text-destructive">*</sup></Label>
//                                 {/* <ReactSelect id="status"
//                                     value={status}
//                                     className="text-sm text-muted-foreground border-destructive" 
//                                     placeholder="Select Status" 
//                                     options={dialogType === "complete" ? completeStatusOptions : inCompleteStatusOptions}
//                                     onChange={(e) => setStatus(e)} 
//                                 /> */}
//                                 <Input
//                                     value={status || ""}
//                                     onChange={(e) => setStatus(e.target.value)}
//                                     placeholder="Type Status"
//                                 />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="remarks" className="flex">Remarks</Label>
//                                     <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter Remarks" className="text-sm text-muted-foreground" rows={3} />
//                                 </div>
//                                 <div className="flex items-center gap-2"> 
//                                     <input className="w-5 h-5" id="schedule" type="checkbox" value={checked} onChange={(e) => setChecked(e.target.checked)} />
//                                     <Label htmlFor="schedule" className="flex">{dialogType === "complete" ? 
//                                     "Schedule next task?" : "Re-schedule this task?"}</Label>
//                                 </div>
//                             </div>
//             }
//             />

//             <ReusableAlertDialog 
//             open={scheduleTaskDialog} onOpenChange={toggleScheduleTaskDialog} 
//             title="Schedule Task" 
//             confirmText="Confirm" 
//             cancelText="Cancel" 
//             onConfirm={() => handleNewScheduleTask(form.getValues())}
//             children={ <TaskForm form={form} />}
//             disableConfirm={!form.getValues("type") || !form.getValues("time") || !form.getValues("date")}
//             />
//         </div>
//     )
// }