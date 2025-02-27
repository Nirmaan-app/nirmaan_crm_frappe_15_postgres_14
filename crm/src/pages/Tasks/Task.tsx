import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { toast } from "@/hooks/use-toast";
import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeDeleteDoc, useFrappeGetDoc, useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ReactSelect from 'react-select';
import * as z from "zod";
import { TaskForm } from "./TaskDialogs";

const taskFormSchema = z.object({
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

type TaskFormValues = z.infer<typeof taskFormSchema>;

export const Task = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const location = useLocation()
    const id = searchParams.get("id")

    const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc("CRM Task", id, id ? undefined : null)

    const {data : contactData, isLoading: contactDataLoading} = useFrappeGetDoc("CRM Contacts", data?.reference_docname, data?.reference_docname ? undefined : null)

    const {data : tasksData, isLoading: tasksDataLoading, mutate : tasksMutate} = useFrappeGetDocList("CRM Task", {
        fields: ["*"],
        filters: [["reference_docname", "=", data?.reference_docname]],
        limit: 1000
    })

    const {updateDoc, loading: updateLoading} = useFrappeUpdateDoc()
    const {createDoc, loading: createLoading} = useFrappeCreateDoc()
    const {deleteDoc, loading: deleteLoading} = useFrappeDeleteDoc()
    const {mutate} = useSWRConfig()

    const [checked, setChecked] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const toggleEditDialog = () => {
        setEditDialogOpen(!editDialogOpen);
    };

    const [deleteDialog, setDeleteDialog] = useState(false);
    const toggleDeleteDialog = () => {
        setDeleteDialog(!deleteDialog);
    };

    const [completeDialog, setCompleteDialog] = useState(false);
    const toggleCompleteDialog = () => {
        setCompleteDialog(!completeDialog);
    };

    const [scheduleTask, setScheduleTask] = useState(false);
    const toggleScheduleTask = () => {
        setScheduleTask(!scheduleTask);
    };

    const [status, setStatus] = useState("");
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
        try {
            await updateDoc("CRM Task", data?.name, {
                reference_docname: values.reference_docname,
                type: values.type,
                start_date: `${values.date} ${values.time}`,
            })

            await dataMutate()
            await mutate("CRM Task")

            toast({
                title: "Success!",
                description: `Task updated successfully!`,
                variant: "success"
            })

            toggleEditDialog()
            
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: error?.message || "Failed to update task!",
                variant: "destructive"
            })
        }
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteDoc("CRM Task", data?.name)

            await mutate("CRM Task")
            toast({
                title: "Success!",
                description: `Task deleted successfully!`,
                variant: "success"
            })
            navigate(-1)

            toggleDeleteDialog()

        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: error?.message || "Failed to delete task!",
                variant: "destructive"
            })
        }
    }

    const handleUpdateTask = async () => {
        try {
            await updateDoc("CRM Task", data?.name, {
                status: status?.value,
                description: remarks,
            })

            await dataMutate()
            await mutate("CRM Task")

            toast({
                title: "Success!",
                description: `Task updated successfully!`,
                variant: "success"
            })

            toggleCompleteDialog()

            if(dialogType === "complete" && checked) {
                newScheduleTask()
                toggleScheduleTask()
            } else if (dialogType === "incomplete" && checked) {
                toggleEditDialog()
                setDialogType("reSchedule")
            }

            setChecked(false)
            setStatus("")
            setRemarks("")
            
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: error?.message || "Failed to update task!",
                variant: "destructive"
            })
        }
    }

    const handleNewScheduleTask = async (values : TaskFormValues) => {
        try {
            const isValid = await form.trigger();
            if(!isValid) return;

            await createDoc("CRM Task", {
                reference_doctype: "CRM Contacts",
                reference_docname: values?.reference_docname,
                type: values.type,
                start_date: `${values.date} ${values.time}`,
                status: "Pending"
            })

            await mutate("CRM Task")

            await tasksMutate()

            await mutate(`CRM Task ${contactData.name}`)

            toast({
                title: "Success!",
                description: `New Task successfully scheduled for contact: ${contactData?.first_name} ${contactData?.last_name}!`,
                variant: "success"
            })

            toggleScheduleTask()
            
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: error?.message || "Failed to add schedule task!",
                variant: "destructive"
            })
        }
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

            <AlertDialog open={deleteDialog} onOpenChange={toggleDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription className="flex gap-2 items-end">
                        <Button 
                        onClick={handleConfirmDelete} 
                        className="flex-1">Delete</Button>
                        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                    </AlertDialogDescription>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={editDialogOpen} onOpenChange={toggleEditDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader className="text-start">
                        <AlertDialogTitle className="text-destructive text-center">{dialogType === "reSchedule" ? "Re-Schedule Task" : "Edit Task"}</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <TaskForm form={form} onSubmit={onSubmit} location={location} reSchedule={dialogType === "reSchedule" ? true : false} />    
                        </AlertDialogDescription>

                    <div className="flex items-end gap-2">
                        <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
                        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                    </div>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" fill="none">
                                      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.70832 6.28927C7.89579 6.4768 8.00111 6.73111 8.00111 6.99627C8.00111 7.26144 7.89579 7.51575 7.70832 7.70327L2.05132 13.3603C1.95907 13.4558 1.84873 13.532 1.72672 13.5844C1.60472 13.6368 1.4735 13.6644 1.34072 13.6655C1.20794 13.6667 1.07626 13.6414 0.953366 13.5911C0.83047 13.5408 0.718817 13.4666 0.624924 13.3727C0.531032 13.2788 0.456778 13.1671 0.406498 13.0442C0.356217 12.9213 0.330915 12.7897 0.332069 12.6569C0.333223 12.5241 0.360809 12.3929 0.413218 12.2709C0.465627 12.1489 0.541809 12.0385 0.637319 11.9463L5.58732 6.99627L0.637319 2.04627C0.455161 1.85767 0.354367 1.60507 0.356645 1.34287C0.358924 1.08068 0.464092 0.829864 0.6495 0.644456C0.834909 0.459047 1.08572 0.353879 1.34792 0.3516C1.61011 0.349322 1.86272 0.450116 2.05132 0.632274L7.70832 6.28927Z" fill="black" fill-opacity="0.9"/>
                                    </svg>
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
                    setStatus({label: "Completed", value: "Completed"})
                    setDialogType("complete")
                    toggleCompleteDialog()
                }}>Complete</Button>
                <Button
                    onClick={() => {
                        setStatus({label: "Incomplete", value: "Incomplete"})
                        setDialogType("incomplete")
                        toggleCompleteDialog()
                    }}
                 variant="outline" className="text-destructive border-destructive">Incomplete</Button>
            </div>

            <AlertDialog open={completeDialog} onOpenChange={toggleCompleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader className="text-start">
                        <AlertDialogTitle className="text-destructive text-center">Task {dialogType === "complete" ? "Completed" : "Incomplete"}</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                <Label htmlFor="status" className="flex">Current Status<sup className="text-sm text-destructive">*</sup></Label>
                                <ReactSelect id="status"
                                    value={status}
                                    className="text-sm text-muted-foreground border-destructive" 
                                    placeholder="Select Status" 
                                    options={dialogType === "complete" ? completeStatusOptions : inCompleteStatusOptions}
                                    onChange={(e) => setStatus(e)} 
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
                        </AlertDialogDescription>

                    <div className="flex items-end gap-2">
                        <Button onClick={handleUpdateTask} className="flex-1">Confirm</Button>
                        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                    </div>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>

        <AlertDialog open={scheduleTask} onOpenChange={toggleScheduleTask}>
            <AlertDialogContent>
                <AlertDialogHeader className="text-start">
                    <AlertDialogTitle className="text-destructive text-center">Schedule Task</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <TaskForm form={form} onSubmit={onSubmit} location={location} />
                    </AlertDialogDescription>
                    <div className="flex items-end gap-2">
                        <Button onClick={() => handleNewScheduleTask(form.getValues())} className="flex-1">Confirm</Button>
                        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                    </div>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
        </div>
    )
}