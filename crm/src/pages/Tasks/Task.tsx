import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReusableAlertDialog } from "@/components/ui/ReusableDialogs";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useTaskActions } from "@/hooks/useTaskActions";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { ChevronRight, SquarePen, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as z from "zod";
import { TaskForm } from "./TaskDialogs";

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

export const Task = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const id = searchParams.get("id")

    const {deleteTask, updateTask, scheduleTask} = useTaskActions()

    const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc<CRMTask>("CRM Task", id, id ? undefined : null)

    const {data : contactData, isLoading: contactDataLoading} = useFrappeGetDoc<CRMContacts>("CRM Contacts", data?.reference_docname, data?.reference_docname ? undefined : null)

    const {data : tasksData, isLoading: tasksDataLoading, mutate : tasksMutate} = useFrappeGetDocList<CRMTask>("CRM Task", {
        fields: ["*"],
        filters: [["reference_docname", "=", data?.reference_docname]],
        limit: 1000
    },
    data?.reference_docname ? undefined : null
    )
    
    const {mutate} = useSWRConfig()

    const [checked, setChecked] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const toggleEditDialog = useCallback(() => {
        setEditDialogOpen(!editDialogOpen);
    }, [editDialogOpen]);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const toggleDeleteDialog = useCallback(() => {
        setDeleteDialog(!deleteDialog);
    }, [deleteDialog]);

    const [completeDialog, setCompleteDialog] = useState(false);
    const toggleCompleteDialog = useCallback(() => {
        setCompleteDialog(!completeDialog);
    }, [completeDialog]);

    const [scheduleTaskDialog, setScheduleTaskDialog] = useState(false);
    const toggleScheduleTaskDialog = useCallback(() => {
        setScheduleTaskDialog(!scheduleTaskDialog);
    }, [scheduleTaskDialog]);

    // const [status, setStatus] = useState<{ label : string, value : string }>({label : "", value : ""});
    const [status, setStatus] = useState<string>("");
    const [remarks, setRemarks] = useState("");
    const [dialogType, setDialogType] = useState("");

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            reference_docname: data?.reference_docname,
            type: data?.type,
            date: data?.start_date?.split(" ")?.[0],
            time: data?.start_date?.split(" ")?.[1],
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (data) {
          form.reset({
            reference_docname: data?.reference_docname,
            type: data?.type,
            date: data?.start_date?.split(" ")?.[0],
            time: data?.start_date?.split(" ")?.[1],
          });
        }
    }, [data]);

    const newScheduleTask = () => {
        form.reset({
            reference_docname: data?.reference_docname,
            type: undefined,
            date: undefined,
            time: undefined,
        })
    }

    const onSubmit = async (values: TaskFormValues) => {

        await updateTask(data?.name, {
            reference_docname: values.reference_docname,
            type: values.type,
            start_date: `${values.date} ${values.time}`,
        })

        await dataMutate()
        toggleEditDialog()
    }

    const handleConfirmDelete = async () => {
        await deleteTask(data?.name)
        navigate(-1)
        toggleDeleteDialog()
    }

    const handleUpdateTask = async () => {
        await updateTask(data?.name, {
            // status: status?.value,
            status: status,
            description: remarks,
        })

        await dataMutate()

        toggleCompleteDialog()

        if(dialogType === "complete" && checked) {
            newScheduleTask()
            toggleScheduleTaskDialog()
        } else if (dialogType === "incomplete" && checked) {
            setDialogType("reSchedule")
            toggleEditDialog()
        }
        setChecked(false)
        // setStatus({ label : "", value : ""})
        setStatus("")
        setRemarks("")
    }

    const handleNewScheduleTask = async (values : TaskFormValues) => {
        const isValid = await form.trigger();
        if(!isValid) return;

        await scheduleTask(values)
        await tasksMutate()
        await mutate(`CRM Task ${contactData.name}`)
        toggleScheduleTaskDialog()  
    }

    const completeStatusOptions = [
        {label: "Pending", value: "Pending"},
        {label: "Completed", value: "Completed"},
    ]

    const inCompleteStatusOptions = [
        {label: "Pending", value: "Pending"},
        {label: "Incomplete", value: "Incomplete"},
    ]

    return (
        <div className="dark:text-white space-y-4">
        <section>
            <div className="flex justify-between items-center">
                <h2 className="font-medium mb-2">Task Details</h2>
                <p className="text-xs text-background bg-muted-foreground rounded-2xl px-2 py-1 flex items-center">{data?.status}</p>
            </div>
            <div className="p-4 shadow rounded-md">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-6">
                        <div>
                            <p className="text-xs">Contact</p>
                            <p className="text-sm font-semibold text-destructive">{contactData?.first_name} {contactData?.last_name}</p>
                        </div>
                        <div>
                            <p className="text-xs">Date</p>
                            <p className="text-sm font-semibold text-destructive">{formatDate(data?.start_date?.split(" ")?.[0])}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <div className="text-end">
                            <p className="text-xs">Type</p>
                            <p className="text-sm font-semibold text-destructive">{data?.type || "--"}</p>
                        </div>
                        <div className="text-end">
                            <p className="text-xs">Time</p>
                            <p className="text-sm font-semibold text-destructive">{formatTime12Hour(data?.start_date?.split(" ")?.[1])}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button onClick={toggleEditDialog} variant="outline" className="text-destructive border-destructive">
                    <SquarePen />
                    Edit
                </Button>
                <Button onClick={toggleDeleteDialog} variant="outline" className="text-destructive border-destructive">
                    <Trash2 />
                    Delete
                </Button>
            </div>

            <ReusableAlertDialog 
            open={deleteDialog} onOpenChange={toggleDeleteDialog} 
            title="Are you sure?" 
            confirmText="Delete" 
            cancelText="Cancel" 
            onConfirm={handleConfirmDelete}
            />

            <ReusableAlertDialog
                open={editDialogOpen} onOpenChange={toggleEditDialog}
                title={dialogType === "reSchedule" ? "Re-Schedule Task" : "Edit Task"}
                confirmText="Save"
                cancelText="Cancel"
                onConfirm={() => onSubmit(form.getValues())}
                children={<TaskForm form={form} reSchedule={dialogType === "reSchedule" ? true : false} />}
             />
        </section>

        <Separator />

        <section>
                <h2 className="font-medium mb-2">Contact History</h2>
                <div className="p-4 shadow rounded-md flex flex-col gap-4">
                    <Table>
                      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[45%]">Task</TableHead>
                          <TableHead className="w-[45%]">Date</TableHead>
                          <TableHead className="w-[5%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData?.length ? (
                            tasksData?.map(task => (
                                <TableRow key={task?.name}>
                                  <TableCell className="font-medium">{task?.type}</TableCell>
                                  <TableCell>{formatDate(task?.start_date?.split(" ")?.[0])}</TableCell>
                                    <TableCell>
                                        <ChevronRight className="w-4 h-4" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-2">
                                    No Tasks Found
                                </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </div>
            </section>

            <section>
                <h2 className="font-medium mb-2">Last Remark</h2>
                <div className="p-4 shadow rounded-md flex flex-col gap-4">
                    hello
                </div>
            </section>

            <div className="flex flex-col gap-4">
                <Button onClick={() => {
                    // setStatus({label: "Completed", value: "Completed"})
                    setStatus("Completed")
                    setDialogType("complete")
                    toggleCompleteDialog()
                }}>Complete</Button>
                <Button
                    onClick={() => {
                        // setStatus({label: "Incomplete", value: "Incomplete"})
                        setStatus("Incomplete")
                        setDialogType("incomplete")
                        toggleCompleteDialog()
                    }}
                 variant="outline" className="text-destructive border-destructive">Incomplete</Button>
            </div>

            <ReusableAlertDialog 
            open={completeDialog} onOpenChange={toggleCompleteDialog} 
            title={dialogType === "complete" ? "Task Completed" : "Task Incomplete"} 
            confirmText="Confirm" 
            cancelText="Cancel"
            disableConfirm={!status}
            onConfirm={handleUpdateTask}
            children={
                            <div className="space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="status" className="flex">Current Status<sup className="text-sm text-destructive">*</sup></Label>
                                {/* <ReactSelect id="status"
                                    value={status}
                                    className="text-sm text-muted-foreground border-destructive" 
                                    placeholder="Select Status" 
                                    options={dialogType === "complete" ? completeStatusOptions : inCompleteStatusOptions}
                                    onChange={(e) => setStatus(e)} 
                                /> */}
                                <Input
                                    value={status || ""}
                                    onChange={(e) => setStatus(e.target.value)}
                                    placeholder="Type Status"
                                />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks" className="flex">Remarks</Label>
                                    <Textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter Remarks" className="text-sm text-muted-foreground" rows={3} />
                                </div>
                                <div className="flex items-center gap-2"> 
                                    <input className="w-5 h-5" id="schedule" type="checkbox" value={checked} onChange={(e) => setChecked(e.target.checked)} />
                                    <Label htmlFor="schedule" className="flex">{dialogType === "complete" ? 
                                    "Schedule next task?" : "Re-schedule this task?"}</Label>
                                </div>
                            </div>
            }
            />

            <ReusableAlertDialog 
            open={scheduleTaskDialog} onOpenChange={toggleScheduleTaskDialog} 
            title="Schedule Task" 
            confirmText="Confirm" 
            cancelText="Cancel" 
            onConfirm={() => handleNewScheduleTask(form.getValues())}
            children={ <TaskForm form={form} />}
            disableConfirm={!form.getValues("type") || !form.getValues("time") || !form.getValues("date")}
            />
        </div>
    )
}