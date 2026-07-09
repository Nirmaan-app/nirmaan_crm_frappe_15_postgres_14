
// src/pages/Tasks/EditTaskForm.tsx
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeUpdateDoc, useSWRConfig,useFrappeGetDocList} from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from "react-select";
import { useEffect, useMemo, useState } from "react";
import { formatDate, formatTime12Hour,formatDateWithOrdinal } from "@/utils/FormatDate";
import { Building2, Calendar, Clock } from "lucide-react"; // Import icons for a nicer UI
import { salesTaskTypeOptions } from "@/constants/dropdownData";
import { useUserRoleLists } from "@/hooks/useUserRoleLists"
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { UNKNOWN_CONTACT_ID, UNKNOWN_CONTACT_OPTION } from "@/constants/unknownContact";
import { ResolveContactSection } from "./ResolveContactSection";


// A flexible schema for all modes
const editTaskSchema = z.object({
  // For 'edit' and 'scheduleNext' modes
  type: z.string().optional(),
  start_date: z.string().optional(),
  // time: z.string().optional(),
  contact: z.string().optional(),
  // For 'updateStatus' mode
  status: z.string().optional(), // Status is always required in update mode
  reason: z.string().optional(),
  remarks: z.string().min(1, "Remark is required"),
  reschedule: z.boolean().optional(),
  assigned_sales: z.string().optional(),
}).superRefine((data, ctx) => {
  // This logic only applies when updating a task's status

 if (data.status && data.status !== 'Scheduled') {
    if (!data.remarks || data.remarks.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remarks are required.",
        path: ['remarks'],
      });
    }
  }

  if (data.status === 'Incomplete') {
    // If status is 'Incomplete', the reason field is mandatory.
    if (!data.reason || data.reason.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A reason is required for incomplete tasks.",
        path: ['reason'],
      });
    }

    

    
    // If the reason is 'Others', the remarks field becomes mandatory.
    if (data.reason === 'Others' && (!data.remarks || data.remarks.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the reason in remarks.",
        path: ['remarks'],
      });
    }
  }
});
type EditTaskFormValues = z.infer<typeof editTaskSchema>;

// Options for dropdowns
// const taskTypeOptions = [ {label: "Call", value: "Call"}, {label: "In Person", value: "In Person"}, {label: "Virtual", value: "Virtual"},{label: "Follow-up", value: "Follow-up"} ];

const statusOptions = [
  { label: "Completed", value: "Completed" },
  { label: "Incomplete", value: "Incomplete" }
];

// {label: "Scheduled", value: "Scheduled"}
const reasonOptions = [
  { label: "Can't be reached", value: "Can't be reached" },
  { label: "Wants to reschedule", value: "Wants to reschedule" },
  { label: "Others (mention in remarks)", value: "Others" }
];

export const EditTaskForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { editTask, closeEditTaskDialog, openEditTaskDialog } = useDialogStore();
  const { taskData, mode } = editTask.context;

  // console.log("taskDatasales",taskData)

  // When the task still points at the global "Unknown" placeholder, let the user
  // resolve it inline (create the real contact + link it) without leaving this
  // dialog. Once resolved we hold it locally so the panel hides and the header
  // reflects the real contact immediately.
  const [resolvedContact, setResolvedContact] = useState<{ name: string; first_name: string } | null>(null);
  const isUnknownContact = !resolvedContact && taskData?.contact === UNKNOWN_CONTACT_ID;

  const { salesUserOptions, isLoading: usersLoading } = useUserRoleLists();
  const role = localStorage.getItem("role")

  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { createDoc, loading: createLoading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  const { data: contactDoc, isLoading: contactLoading } = useFrappeGetDoc<CRMContacts>(
    "CRM Contacts",
    taskData?.contact, // The ID of the contact from the task
   // Only run this fetch if taskData and its contact field exist
  );
  // Prefer the just-resolved contact so the header updates without a refetch.
  const displayContactName = resolvedContact?.first_name || contactDoc?.first_name;
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {},
  });

  const selectedStatus = form.watch("status");
  const selectedReason = form.watch("reason");

  // Filter by the task's company directly (the linked contact — e.g. the Unknown
  // placeholder — may have no company, which would otherwise hide real contacts).
  // Explicit "all-contacts-" SWR key so creating a contact (which mutates all
  // "all-contacts-*" keys) invalidates this list and it refetches with the new one.
  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: [["company", "=", taskData?.company || contactDoc?.company]], fields: ["name", "first_name", "last_name"], limit: 0 }, `all-contacts-taskform-${taskData?.company || contactDoc?.company || ''}`);

  const contactOptions = useMemo(() => {
    const options = contactsList?.map(c => ({ label: c.first_name, value: c.name })) || [];
    // Show a just-resolved contact immediately, before the list cache refetches.
    if (resolvedContact && !options.some(o => o.value === resolvedContact.name)) {
      options.push({ label: resolvedContact.first_name, value: resolvedContact.name });
    }
    // Offer the global "Unknown" placeholder for follow-ups on companies with
    // no real contact yet.
    if (!options.some(o => o.value === UNKNOWN_CONTACT_OPTION.value)) {
      options.push(UNKNOWN_CONTACT_OPTION);
    }
    return options;
  }, [contactsList, resolvedContact]);

  useEffect(() => {
    if (taskData) {
      form.reset({
        type: taskData.type || "",
        start_date: taskData.start_date?.split(" ")[0] || "",
        // time: taskData.time || "",
        contact:taskData.contact||"",
        assigned_sales: taskData.assigned_sales || "",
        status:"",
        reschedule: false,
        reason: "",
        remarks: "",
      });
    }

    if(mode=="scheduleNext"){
      form.reset({
        type: taskData.type || "",
        start_date: "",
        // time: taskData.time || "",
        contact:taskData.contact||"",
        assigned_sales: taskData.assigned_sales || "",
        status:"",
        reschedule: false,
        reason: "",
        remarks: "",
      });
    }
  }, [taskData, form,mode]);

  // Reflect a just-resolved contact in the (scheduleNext) contact dropdown.
  useEffect(() => {
    if (resolvedContact) {
      form.setValue("contact", resolvedContact.name);
    }
  }, [resolvedContact, form]);

  // --- STEP 2: ADD A useEffect TO CLEAR/VALIDATE FIELDS ON CHANGE ---
  useEffect(() => {
    // When status changes, clear the reason if it's no longer 'Incomplete'
    if (selectedStatus !== 'Incomplete') {
      form.setValue('reason', '', { shouldValidate: true });
    }
    // When the reason changes, trigger validation on remarks
    form.trigger("remarks");
  }, [selectedStatus, selectedReason, form]);

  const loading = updateLoading || createLoading;

        // console.log("dataTask",taskData)

  const onSubmit = async (values: EditTaskFormValues) => {
    try {
      // if (!taskData) throw new Error("Task data is missing");

      let shouldCloseDialog = true; // Assume we will close the dialog by default
      
 if (mode === 'updateStatus' && (!values.status || values.status.trim() === '')) {
        form.setError('status', {
            type: 'manual',
            message: 'Status is required to update.',
        });

        toast({ title: "Validation Error", description: "Please select a status.", variant: "destructive" });
        return; // Stop submission if status is missing in updateStatus mode
      }

       if ((mode === 'edit'||mode === 'scheduleNext') && (!values.start_date || values.start_date.trim() === '')) {
        form.setError('start_date', {
            type: 'manual',
            message: 'Date is required to update.',
        });
        toast({ title: "Validation Error", description: "Please select a Date.", variant: "destructive" });
        return; // Stop submission if status is missing in updateStatus mode
      }

      if (mode === 'edit') {
        // console.log("dataTask",taskData)
        await updateDoc("CRM Task", taskData.name, { type: values.type, start_date:values.start_date, assigned_sales: values.assigned_sales,remarks:values.remarks||taskData.remarks});
        toast({ title: "Success", description: "Task Updated." });
      } else if (mode === 'updateStatus') {
        if (!values.status) {
                    form.setError('status', { message: 'Status is required.' });
                    return;
                }
                if (!values.remarks) {
                    form.setError('remarks', { message: 'Remarks is required.' });
                    return;
                }
        await updateDoc("CRM Task", taskData.name, { status: values.status,remarks:values.remarks, reason: values.reason || ''});
        toast({ title: "Success", description: "Task status updated." });

        // --- THIS IS THE KEY LOGIC CHANGE ---
        if (values.reschedule) {
          shouldCloseDialog = false; // Prevent the current dialog from closing
          // Immediately open the dialog again, but in the new 'scheduleNext' mode.
          // React will efficiently re-render the dialog's content.
          openEditTaskDialog({
            taskData: { ...taskData, contact: resolvedContact?.name || taskData.contact },
            mode: 'scheduleNext',
          });
        }
      } else if (mode === 'scheduleNext') {
        await createDoc("CRM Task", {
          type: values.type,
          start_date:values.start_date,
          // time: values.time,
          status: 'Scheduled',
          // Respect the user's explicit dropdown choice first (they may pick
          // Unknown on purpose); fall back to a just-resolved contact, then the task's.
          contact: values.contact || resolvedContact?.name || taskData.contact,
          company: taskData.company,
          task_profile:"Sales",
          assigned_sales: values.assigned_sales||taskData.assigned_sales,
          boq: taskData.boq,
          remarks:values.remarks || taskData.remarks,
        });
        toast({ title: "Success", description: "New task scheduled." });
      }

      // Refresh the data for the list and detail pages
      await mutate("CRM Task");
      if (mode !== 'scheduleNext') { // Don't mutate the old task if we just created a new one
        await mutate(`all-tasks-${taskData.name}`);
      }

      // Only call onSuccess (which closes the dialog) if we are not rescheduling

      await mutate(`all-tasks-${taskData.name}`);

      if (shouldCloseDialog && onSuccess) {
        await mutate(key => typeof key === 'string' && key.startsWith('all-tasks-'));

        onSuccess();
      }

    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  // console.log("TaskData", taskData)
  // --- STEP 3: ADD HELPER FUNCTIONS FOR CONDITIONAL UI ---
  const isRequired = (fieldName: keyof EditTaskFormValues) => {
    if (mode !== 'updateStatus') return false;
    const currentStatus = form.getValues("status");
    const currentReason = form.getValues("reason");

    if (fieldName === 'reason' && currentStatus === 'Incomplete') return true;
    if (fieldName === 'remarks' && currentReason === 'Others') return true;

    return false;
  };

  return (
    <div className="space-y-4">
      {/* --- RESOLVE UNKNOWN CONTACT (inline collapsible) --- */}
      {isUnknownContact && taskData && (
        <ResolveContactSection
          companyId={taskData.company}
          taskName={taskData.name}
          onResolved={setResolvedContact}
        />
      )}
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* --- RENDER FOR 'edit' or 'scheduleNext' MODE --- */}
        {(mode === 'edit' || mode === 'scheduleNext') && (
          <>
            <div className="flex justify-between items-start text-sm mb-4 border-b pb-4">
              {/* Main Task Info */}
              <div className="flex flex-col gap-2">
                {mode === 'scheduleNext' && (
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-destructive underline underline-offset-2">Previous Task</span>
                )}
                <p className="font-semibold">{taskData?.type} for {displayContactName}</p>

                {/* --- START: 2. ADDED UI ELEMENTS FOR DATE AND TIME --- */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDateWithOrdinal(taskData?.start_date)}</span>
                  </div>
                  {taskData?.company && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{taskData.company}</span>
                    </div>
                  )}
                  {/* <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTime12Hour(taskData?.time)}</span>
                  </div> */}
                </div>
                {/* --- END: 2. ADDED UI ELEMENTS FOR DATE AND TIME --- */}
              </div>

              {/* Status Pill */}
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{taskData?.status}</span>
            </div>
            <FormField name="type" control={form.control} render={({ field }) => (<FormItem><FormLabel>Task Type<sup>*</sup></FormLabel><FormControl><ReactSelect options={salesTaskTypeOptions} value={salesTaskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)} isOptionDisabled={(option) => option.value === field.value} /></FormControl><FormMessage /></FormItem>)} />
            {role === "Nirmaan Admin User Profile" && (
              <FormField
                control={form.control}
                name="assigned_sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Sales User</FormLabel>
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
             {
              mode=="scheduleNext"&&(
                 <FormField name="contact" control={form.control} render={({ field }) => (<FormItem><FormLabel>Contact</FormLabel><FormControl>
                      
                        <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("boq", ""); }} placeholder="Select Contact" menuPosition={'auto'}  />
                      
                    </FormControl><FormMessage /></FormItem>)} />
              )
             }
            <FormField name="start_date" control={form.control} render={({ field }) => (<FormItem><FormLabel>Date<sup>*</sup></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />

            {/* <FormField name="time" control={form.control} render={({ field }) => (<FormItem><FormLabel>Time<sup>*</sup></FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} /> */}
          </>
        )}

        {/* --- RENDER FOR 'updateStatus' MODE --- */}
        {mode === 'updateStatus' && (
          <>
            <div className="flex justify-between items-start text-sm mb-4 border-b pb-4">
              <div className="flex flex-col gap-2"><p className="font-semibold">{taskData?.type} for {displayContactName}</p><div className="flex items-center gap-4 text-xs text-muted-foreground"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{formatDateWithOrdinal(taskData?.start_date)}</span></div>{taskData?.company && (<div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /><span>{taskData.company}</span></div>)}</div></div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{taskData?.status}</span>
            </div>

            <FormField name="status" control={form.control} render={({ field }) => (<FormItem><FormLabel>Update Status To<sup>*</sup></FormLabel><FormControl><ReactSelect options={statusOptions} onChange={val => field.onChange(val?.value)} /></FormControl><FormMessage /></FormItem>)} />

            {/* Conditionally render Reason field */}
            {selectedStatus === 'Incomplete' && (
              <FormField name="reason" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason{isRequired("reason") && <sup className="text-destructive">*</sup>}</FormLabel>
                  <FormControl><ReactSelect options={reasonOptions} value={reasonOptions.find(r => r.value === field.value)} onChange={val => field.onChange(val?.value)} isClearable menuPosition={'auto'} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {/* Always render Remarks, but add asterisk conditionally */}
           
          </>
        )}

        <FormField name="remarks" control={form.control} render={({ field }) => (<FormItem><FormLabel>Remarks <sup>*</sup></FormLabel><FormControl><Textarea placeholder="Enter Remarks" {...field} /></FormControl><FormMessage /></FormItem>)} />

         {selectedStatus &&
              <>
                {/* <FormField name="remarks" control={form.control} render={({ field }) => (<FormItem><FormLabel>Remarks{isRequired("remarks") && <sup className="text-destructive">*</sup>}</FormLabel><FormControl><Textarea placeholder="Enter Remarks" {...field} /></FormControl><FormMessage /></FormItem>)} /> */}

                <FormField name="reschedule" control={form.control} render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>{selectedStatus === "Incomplete" ? "Re-schedule this task?" : "Schedule a follow-up?"} </FormLabel></div></FormItem>)} />
              </>
            }

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={closeEditTaskDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
        </div>
      </form>
      </Form>
    </div>
  );
};


// // src/pages/Tasks/EditTaskForm.tsx
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/hooks/use-toast";
// import { useDialogStore } from "@/store/dialogStore";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import ReactSelect from "react-select";
// import { useEffect } from "react";
// import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
// import { Calendar, Clock } from "lucide-react";
// import { taskTypeOptions } from "@/constants/dropdownData";
// import { useUserRoleLists } from "@/hooks/useUserRoleLists"
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";


// // A flexible schema for all modes
// const editTaskSchema = z.object({
//   // For 'edit' and 'scheduleNext' modes
//   type: z.string().optional(),
//   start_date: z.string().optional(),
//   time: z.string().optional(),
//   // For 'updateStatus' mode
//   status: z.string().optional(), // Status is always required in update mode
//   reason: z.string().optional(),
//   remarks: z.string().optional(),
//   reschedule: z.boolean().optional(),
//   assigned_sales: z.string().optional(),
// }).superRefine((data, ctx) => {
//   // This logic only applies when updating a task's status
//   if (data.status === 'Incomplete') {
//     // If status is 'Incomplete', the reason field is mandatory.
//     if (!data.reason || data.reason.trim() === "") {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "A reason is required for incomplete tasks.",
//         path: ['reason'],
//       });
//     }
//     // If the reason is 'Others', the remarks field becomes mandatory.
//     if (data.reason === 'Others' && (!data.remarks || data.remarks.trim() === "")) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please specify the reason in remarks.",
//         path: ['remarks'],
//       });
//     }
//   }
// });
// type EditTaskFormValues = z.infer<typeof editTaskSchema>;

// // Options for dropdowns
// const statusOptions = [
//   { label: "Completed", value: "Completed" },
//   { label: "Incomplete", value: "Incomplete" }
// ];

// const reasonOptions = [
//   { label: "Can't be reached", value: "Can't be reached" },
//   { label: "Wants to reschedule", value: "Wants to reschedule" },
//   { label: "Others (mention in remarks)", value: "Others" }
// ];

// export const EditTaskForm = ({ onSuccess }: { onSuccess?: () => void }) => {
//   const { editTask, closeEditTaskDialog, openEditTaskDialog } = useDialogStore();
//   const { taskData, mode } = editTask.context;

//   // --- DEBUG 1: Initial render check ---
//   console.log("EditTaskForm: Initial Render - taskData:", taskData, "Mode:", mode);

//   const { salesUserOptions, isLoading: usersLoading } = useUserRoleLists();
//   const role = localStorage.getItem("role")

//   const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
//   const { createDoc, loading: createLoading } = useFrappeCreateDoc();
//   const { mutate } = useSWRConfig();
//   const { data: contactDoc, isLoading: contactLoading } = useFrappeGetDoc<CRMContacts>(
//     "CRM Contacts",
//     taskData?.contact, // The ID of the contact from the task
//     { enabled: !!taskData?.contact } // Only run this fetch if taskData and its contact field exist
//   );
//   const form = useForm<EditTaskFormValues>({
//     resolver: zodResolver(editTaskSchema),
//     defaultValues: {},
//   });

//   const selectedStatus = form.watch("status");
//   const selectedReason = form.watch("reason");

//   // --- DEBUG 2: Form reset and data population ---
//   useEffect(() => {
//     if (taskData) {
//       console.log("EditTaskForm: useEffect - taskData is present, resetting form with:", taskData);
//       form.reset({
//         type: taskData.type || "",
//         start_date: taskData.start_date?.split(" ")[0] || "",
//         time: taskData.time || "",
//         assigned_sales: taskData.assigned_sales || "",
//         status: "", // Status is typically set later by user or in updateStatus mode
//         reschedule: false,
//         reason: "",
//         remarks: "",
//       });
//     } else {
//         console.log("EditTaskForm: useEffect - taskData is NOT present.");
//     }
//   }, [taskData, form]);

//   useEffect(() => {
//     if (selectedStatus !== 'Incomplete') {
//       form.setValue('reason', '', { shouldValidate: true });
//     }
//     form.trigger("remarks");
//   }, [selectedStatus, selectedReason, form]);

//   const loading = updateLoading || createLoading;

//   const onSubmit = async (values: EditTaskFormValues) => {
//     // --- DEBUG 3: onSubmit entry point ---
//     console.log("EditTaskForm: onSubmit - values:", values, "taskData:", taskData, "Mode:", mode);

//     try {
//       if (!taskData) {
//         console.error("EditTaskForm: onSubmit - taskData is missing, cannot proceed.");
//         throw new Error("Task data is missing");
//       }

//       let shouldCloseDialog = true;
      
//       if (mode === 'edit') {
//         console.log("EditTaskForm: onSubmit - Entering 'edit' mode logic. Task name:", taskData.name);
//         await updateDoc("CRM Task", taskData.name, { type: values.type, start_date: `${values.start_date}`, time: values.time, assigned_sales: values.assigned_sales });
//         toast({ title: "Success", description: "Task rescheduled." });
//       } else if (mode === 'updateStatus') {
//         console.log("EditTaskForm: onSubmit - Entering 'updateStatus' mode logic. Task name:", taskData.name);
//         await updateDoc("CRM Task", taskData.name, { status: values.status, assigned_sales: values.assigned_sales, reason: values.reason || ''});
//         toast({ title: "Success", description: "Task status updated." });

//         if (values.reschedule) {
//           shouldCloseDialog = false;
//           openEditTaskDialog({ taskData, mode: 'scheduleNext' });
//         }
//       } else if (mode === 'scheduleNext') {
//         console.log("EditTaskForm: onSubmit - Entering 'scheduleNext' mode logic. Contact:", taskData.contact);
//         await createDoc("CRM Task", {
//           type: values.type,
//           start_date: `${values.start_date} ${values.time}`,
//           time: values.time,
//           status: 'Scheduled',
//           contact: taskData.contact,
//           company: taskData.company,
//           assigned_sales: taskData.assigned_sales,
//           boq: taskData.boq,
//         });
//         toast({ title: "Success", description: "New task scheduled." });
//       }

//       // Refresh the data for the list and detail pages
//       await mutate(key => typeof key === 'string' && key.startsWith('all-tasks-')); // Invalidate all tasks lists
//       await mutate(`CRM Task`); // Invalidate single task cache if needed for detail view

//       if (shouldCloseDialog && onSuccess) {
//         onSuccess();
//       }

//     } catch (error) {
//       console.error("EditTaskForm: onSubmit - Error:", error); // --- DEBUG 4: Error during submission ---
//       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
//     }
//   };

//   const isRequired = (fieldName: keyof EditTaskFormValues) => {
//     if (mode !== 'updateStatus') return false;
//     const currentStatus = form.getValues("status");
//     const currentReason = form.getValues("reason");

//     if (fieldName === 'reason' && currentStatus === 'Incomplete') return true;
//     if (fieldName === 'remarks' && currentReason === 'Others') return true;

//     return false;
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

//         {/* --- RENDER FOR 'edit' or 'scheduleNext' MODE --- */}
//         {(mode === 'edit' || mode === 'scheduleNext') && (
//           <>
//             <div className="flex justify-between items-start text-sm mb-4 border-b pb-4">
//               <div className="flex flex-col gap-2">
//                 <p className="font-semibold">{taskData?.type} for {displayContactName}</p>

//                 <div className="flex items-center gap-4 text-xs text-muted-foreground">
//                   <div className="flex items-center gap-1.5">
//                     <Calendar className="w-3.5 h-3.5" />
//                     <span>{formatDate(taskData?.start_date)}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5">
//                     <Clock className="w-3.5 h-3.5" />
//                     <span>{formatTime12Hour(taskData?.time)}</span>
//                   </div>
//                 </div>
//               </div>

//               <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{taskData?.status}</span>
//             </div>
//             <FormField name="type" control={form.control} render={({ field }) => (<FormItem><FormLabel>Task Type<sup>*</sup></FormLabel><FormControl><ReactSelect options={taskTypeOptions} value={taskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)} /* isOptionDisabled={(option) => option.value === field.value} */ /></FormControl><FormMessage /></FormItem>)} />
//             {role === "Nirmaan Admin User Profile" && (
//               <FormField
//                 control={form.control}
//                 name="assigned_sales"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Assign Sales User</FormLabel>
//                     <FormControl>
//                       <ReactSelect
//                         options={salesUserOptions}
//                         value={salesUserOptions.find(u => u.value === field.value)}
//                         onChange={val => field.onChange(val?.value)}
//                         placeholder="Select a salesperson..."
//                         isLoading={usersLoading}
//                         className="text-sm"
//                         menuPosition={'auto'}
                       
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}
//             <FormField name="start_date" control={form.control} render={({ field }) => (<FormItem><FormLabel>Date<sup>*</sup></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
//             <FormField name="time" control={form.control} render={({ field }) => (<FormItem><FormLabel>Time<sup>*</sup></FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
//           </>
//         )}

//         {/* --- RENDER FOR 'updateStatus' MODE --- */}
//         {mode === 'updateStatus' && (
//           <>
//             <div className="flex justify-between items-start text-sm mb-4 border-b pb-4">
//               <div className="flex flex-col gap-2"><p className="font-semibold">{taskData?.type} for {displayContactName}</p><div className="flex items-center gap-4 text-xs text-muted-foreground"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{formatDate(taskData?.start_date)}</span></div><div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /><span>{formatTime12Hour(taskData?.time)}</span></div></div></div>
//               <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{taskData?.status}</span>
//             </div>

//             <FormField name="status" control={form.control} render={({ field }) => (<FormItem><FormLabel>Update Status To<sup>*</sup></FormLabel><FormControl><ReactSelect options={statusOptions} value={statusOptions.find(opt => opt.value === field.value)} onChange={val => field.onChange(val?.value)} menuPortalTarget={document.body} /></FormControl><FormMessage /></FormItem>)} />

//             {/* Conditionally render Reason field */}
//             {selectedStatus === 'Incomplete' && (
//               <FormField name="reason" control={form.control} render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Reason{isRequired("reason") && <sup className="text-destructive">*</sup>}</FormLabel>
//                   <FormControl><ReactSelect options={reasonOptions} value={reasonOptions.find(r => r.value === field.value)} onChange={val => field.onChange(val?.value)} isClearable menuPosition={'auto'} menuPortalTarget={document.body} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//             )}

//             {/* Always render Remarks, but add asterisk conditionally */}
//             {selectedStatus &&
//               <>
//                 <FormField name="remarks" control={form.control} render={({ field }) => (<FormItem><FormLabel>Remarks{isRequired("remarks") && <sup className="text-destructive">*</sup>}</FormLabel><FormControl><Textarea placeholder="Enter Remarks" {...field} /></FormControl><FormMessage /></FormItem>)} />

//                 <FormField name="reschedule" control={form.control} render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>{selectedStatus === "Incomplete" ? "Re-schedule this task?" : "Schedule a follow-up?"} </FormLabel></div></FormItem>)} />
//               </>
//             }
//           </>
//         )}

//         <div className="flex gap-2 justify-end pt-4">
//           <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={closeEditTaskDialog}>Cancel</Button>
//           <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
//         </div>
//       </form>
//     </Form>
//   );
// };
