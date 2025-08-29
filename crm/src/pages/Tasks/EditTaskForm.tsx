// src/pages/Tasks/EditTaskForm.tsx
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc,useFrappeGetDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from "react-select";
import { useEffect } from "react";
import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
import { Calendar, Clock } from "lucide-react"; // Import icons for a nicer UI
import { taskTypeOptions } from "@/constants/dropdownData";
import {useUserRoleLists} from "@/hooks/useUserRoleLists"


// A flexible schema for all modes
const editTaskSchema = z.object({
  // For 'edit' and 'scheduleNext' modes
  type: z.string().optional(),
  start_date: z.string().optional(),
  time: z.string().optional(),
  // For 'updateStatus' mode
  status: z.string().optional(),
  reason: z.string().optional(),
  remarks: z.string().optional(),
  reschedule: z.boolean().optional(),
    assigned_sales: z.string().optional(),
  
});
type EditTaskFormValues = z.infer<typeof editTaskSchema>;

// Options for dropdowns
// const taskTypeOptions = [ {label: "Call", value: "Call"}, {label: "In Person", value: "In Person"}, {label: "Virtual", value: "Virtual"},{label: "Follow-up", value: "Follow-up"} ];

const statusOptions = [{label: "Completed", value: "Completed"}, {label: "Incomplete", value: "Incomplete"} ];

// {label: "Scheduled", value: "Scheduled"}
const reasonOptions = [{label: "Can't be reached", value: "Can't be reached"}, {label: "Wants to reschedule", value: "Wants to reschedule"}, {label: "Others (mention in remarks)", value: "Others"}];

export const EditTaskForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { editTask, closeEditTaskDialog, openEditTaskDialog } = useDialogStore();
  const { taskData, mode } = editTask.context;
   const { salesUserOptions, isLoading: usersLoading } = useUserRoleLists();
  const role=localStorage.getItem("role")

  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { createDoc, loading: createLoading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  const { data: contactDoc, isLoading: contactLoading } = useFrappeGetDoc<CRMContacts>(
    "CRM Contacts",
    taskData?.contact, // The ID of the contact from the task
    { enabled: !!taskData?.contact } // Only run this fetch if taskData and its contact field exist
  );
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {},
  });

  const selectedStatus = form.watch("status");

  useEffect(() => {
    if (taskData) {
      form.reset({
        type: taskData.type || "",
        start_date: taskData.start_date?.split(" ")[0] || "",
        time: taskData.time || "",
        assigned_sales:taskData.assigned_sales||"",
        status: "",
        reschedule: false,
        reason: "",
        remarks: "",
      });
    }
  }, [taskData, form]);

  const loading = updateLoading || createLoading;

 const onSubmit = async (values: EditTaskFormValues) => {
    try {
      if (!taskData) throw new Error("Task data is missing");
      
      let shouldCloseDialog = true; // Assume we will close the dialog by default

      if (mode === 'edit') {
        await updateDoc("CRM Task", taskData.name, { type: values.type, start_date: `${values.start_date} ${values.time}`, time: values.time ,assigned_sales:values.assigned_sales});
        toast({ title: "Success", description: "Task rescheduled." });
      } else if (mode === 'updateStatus') {
        await updateDoc("CRM Task", taskData.name, { status: values.status,assigned_sales:values.assigned_sales, description: `${values.reason || ''}\n${values.remarks || ''}`.trim() });
        toast({ title: "Success", description: "Task status updated." });
        
        // --- THIS IS THE KEY LOGIC CHANGE ---
        if (values.reschedule) {
          shouldCloseDialog = false; // Prevent the current dialog from closing
          // Immediately open the dialog again, but in the new 'scheduleNext' mode.
          // React will efficiently re-render the dialog's content.
          openEditTaskDialog({ taskData, mode: 'scheduleNext' });
        }
      } else if (mode === 'scheduleNext') {
        await createDoc("CRM Task", {
            type: values.type,
            start_date: `${values.start_date} ${values.time}`,
            time: values.time,
            status: 'Scheduled',
            contact: taskData.contact,
            company: taskData.company,
            assigned_sales:taskData.assigned_sales,
            boq: taskData.boq,
        });
        toast({ title: "Success", description: "New task scheduled." });
      }

      // Refresh the data for the list and detail pages
      await mutate("CRM Task"); 
      if (mode !== 'scheduleNext') { // Don't mutate the old task if we just created a new one
          await mutate(`Task/${taskData.name}`);
      }
      
      // Only call onSuccess (which closes the dialog) if we are not rescheduling

      await mutate(`Task/${taskData.name}`);

      if (shouldCloseDialog && onSuccess) {
        await mutate("All Tasks")

        onSuccess();
      }

    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  console.log("TaskData",taskData)
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* --- RENDER FOR 'edit' or 'scheduleNext' MODE --- */}
        {(mode === 'edit' || mode === 'scheduleNext') && (
            <>
             <div className="flex justify-between items-start text-sm mb-4 border-b pb-4">
                    {/* Main Task Info */}
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold">{taskData?.type} for {contactDoc?.first_name}</p>
                        
                        {/* --- START: 2. ADDED UI ELEMENTS FOR DATE AND TIME --- */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(taskData?.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatTime12Hour(taskData?.time)}</span>
                            </div>
                        </div>
                        {/* --- END: 2. ADDED UI ELEMENTS FOR DATE AND TIME --- */}
                    </div>
                    
                    {/* Status Pill */}
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{taskData?.status}</span>
                </div>
              <FormField name="type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Task Type<sup>*</sup></FormLabel><FormControl><ReactSelect options={taskTypeOptions} value={taskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)} isOptionDisabled={(option) => option.value === field.value}/></FormControl><FormMessage /></FormItem> )} />
               {role==="Nirmaan Admin User Profile" &&(
                                       <FormField
                                                  control={form.control}
                                                  name="assigned_sales"
                                                  render={({ field }) => (
                                                      <FormItem>
                                                          <FormLabel>Assigned Salesperson For Task</FormLabel>
                                                          <FormControl>
                                                              <ReactSelect
                                                                  options={salesUserOptions}
                                                                  value={salesUserOptions.find(u => u.value === field.value)}
                                                                  onChange={val => field.onChange(val?.value)}
                                                                  placeholder="Select a salesperson..."
                                                                  isLoading={usersLoading}
                                                                  className="text-sm"
                                                                  menuPosition={'auto'}
                                                                  isOptionDisabled={(option) => option.value === field.value}
                                                              />
                                                          </FormControl>
                                                          <FormMessage />
                                                      </FormItem>
                                                  )}
                                              />
                                      )}
              <FormField name="start_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date<sup>*</sup></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField name="time" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Time<sup>*</sup></FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </>
        )}
        
        {/* --- RENDER FOR 'updateStatus' MODE --- */}
        {mode === 'updateStatus' && (
            <>
                {/* <div className="flex justify-between items-center text-sm mb-4">
                    <span>Task: {taskData?.type} for {contactDoc?.first_name}</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">{taskData?.status}</span>
                </div> */}
                                <div className="flex justify-between items-start text-sm mb-4 border-b pb-4">
                    {/* Main Task Info */}
                    <div className="flex flex-col gap-2">
                        <p className="font-semibold">{taskData?.type} for {contactDoc?.first_name}</p>
                        
                        {/* --- START: 2. ADDED UI ELEMENTS FOR DATE AND TIME --- */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(taskData?.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatTime12Hour(taskData?.time)}</span>
                            </div>
                        </div>
                        {/* --- END: 2. ADDED UI ELEMENTS FOR DATE AND TIME --- */}
                    </div>
                    
                    {/* Status Pill */}
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{taskData?.status}</span>
                </div>

                <FormField name="status" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Update Status To</FormLabel><FormControl><ReactSelect options={statusOptions} onChange={val => field.onChange(val?.value)} isOptionDisabled={(option) => option.value === field.value}/></FormControl><FormMessage /></FormItem> )} />
               
                                {selectedStatus === 'Incomplete' && (
                    <FormField
                      name="reason"
                      control={form.control}
                      render={({ field }) => ( 
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <ReactSelect
                              options={reasonOptions}
                              value={reasonOptions.find(r => r.value === field.value)}
                              onChange={val => field.onChange(val?.value)}
                              isClearable
                              menuPosition={'auto'}
                              isOptionDisabled={(option) => option.value === field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                )}


                <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="Enter Remarks" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="reschedule" control={form.control} render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Re-schedule this task</FormLabel></div></FormItem> )} />
            </>
        )}
        
        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={closeEditTaskDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
        </div>
      </form>
    </Form>
  );
};