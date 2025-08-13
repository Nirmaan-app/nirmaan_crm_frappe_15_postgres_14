// src/pages/Tasks/EditTaskForm.tsx
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from "react-select";
import { useEffect } from "react";

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
});
type EditTaskFormValues = z.infer<typeof editTaskSchema>;

// Options for dropdowns
const taskTypeOptions = [ {label: "Call", value: "Call"}, {label: "In Person", value: "In Person"}, {label: "Virtual", value: "Virtual"} ];
const statusOptions = [{label: "Completed", value: "Completed"}, {label: "Incomplete", value: "Incomplete"}, {label: "Scheduled", value: "Scheduled"}];
const reasonOptions = [{label: "Can't be reached", value: "Can't be reached"}, {label: "Wants to reschedule", value: "Wants to reschedule"}, {label: "Others (mention in remarks)", value: "Others"}];

export const EditTaskForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { editTask, closeEditTaskDialog, openEditTaskDialog } = useDialogStore();
  const { taskData, mode } = editTask.context;

  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { createDoc, loading: createLoading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (taskData) {
      form.reset({
        type: taskData.type || "",
        start_date: taskData.start_date?.split(" ")[0] || "",
        time: taskData.time || "",
        status: taskData.status || "Scheduled",
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
      
      if (mode === 'edit') {
        await updateDoc("CRM Task", taskData.name, { type: values.type, start_date: `${values.start_date} ${values.time}`, time: values.time });
        toast({ title: "Success", description: "Task rescheduled." });
      } else if (mode === 'updateStatus') {
        await updateDoc("CRM Task", taskData.name, { status: values.status, description: `${values.reason || ''}\n${values.remarks || ''}`.trim() });
        toast({ title: "Success", description: "Task status updated." });
        if (values.reschedule) {
          // Open the same dialog in a different mode to reschedule
          openEditTaskDialog({ taskData, mode: 'scheduleNext' });
        }
      } else if (mode === 'scheduleNext') {
        // This creates a NEW task, copying details from the original
        await createDoc("CRM Task", {
            type: values.type,
            start_date: `${values.start_date} ${values.time}`,
            time: values.time,
            status: 'Scheduled',
            contact: taskData.contact,
            company: taskData.company,
            boq: taskData.boq,
        });
        toast({ title: "Success", description: "New task scheduled." });
      }

      await mutate("CRM Task"); // Mutate the list
      await mutate(`CRM Task/${taskData.name}`);
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* --- RENDER FOR 'edit' or 'scheduleNext' MODE --- */}
        {(mode === 'edit' || mode === 'scheduleNext') && (
            <>
              <FormField name="type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Task Type</FormLabel><FormControl><ReactSelect options={taskTypeOptions} value={taskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)}/></FormControl><FormMessage /></FormItem> )} />
              <FormField name="start_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField name="time" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </>
        )}
        
        {/* --- RENDER FOR 'updateStatus' MODE --- */}
        {mode === 'updateStatus' && (
            <>
                <div className="flex justify-between items-center text-sm mb-4">
                    <span>Task: {taskData?.type} - {taskData?.["contact.first_name"]}</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">{taskData?.status}</span>
                </div>
                <FormField name="status" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Update Status To</FormLabel><FormControl><ReactSelect options={statusOptions} onChange={val => field.onChange(val?.value)}/></FormControl><FormMessage /></FormItem> )} />
                <FormField name="reason" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Reason</FormLabel><FormControl><ReactSelect options={reasonOptions} onChange={val => field.onChange(val?.value)} isClearable/></FormControl><FormMessage /></FormItem> )} />
                <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="Enter Remarks" {...field} /></FormControl><FormMessage /></FormItem> )} />
                {/* <FormField name="reschedule" control={form.control} render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Re-schedule this task</FormLabel></div></FormItem> )} /> */}
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