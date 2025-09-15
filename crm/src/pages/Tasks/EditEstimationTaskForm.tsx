// src/pages/Tasks/EditEstimationTaskForm.tsx

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // --- CHANGE: Import Textarea ---
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"; // --- CHANGE: Import useFrappeCreateDoc ---
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useEffect } from "react";
import { estimationTaskTypeOptions } from "@/constants/dropdownData";
import { formatDateWithOrdinal } from "@/utils/FormatDate";
import { Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// --- CHANGE 1: Create a flexible Zod schema for all modes ---
const editEstimationTaskSchema = z.object({
    type: z.string().optional(),
    start_date: z.string().optional(),
    remarks: z.string().optional(), // Add remarks field
    status: z.string().optional(),
    reschedule: z.boolean().optional(),
    // Core identifiers
    boq: z.string().optional(),
    task_profile: z.string().default("Estimates"),
});

type EditEstimationTaskFormValues = z.infer<typeof editEstimationTaskSchema>;

// --- Options for Status Dropdown ---
const statusOptions = [
    { label: "Completed", value: "Completed" },
    { label: "Incomplete", value: "Incomplete" }
];

interface EditEstimationTaskFormProps {
    onSuccess?: () => void;
}

export const EditEstimationTaskForm = ({ onSuccess }: EditEstimationTaskFormProps) => {
    // --- CHANGE 2: Get mode from context and access dialog controls ---
    const { editEstimationTask, openEditEstimationTaskDialog } = useDialogStore();
    const { taskData, mode } = editEstimationTask.context;

    const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
    const { createDoc, loading: createLoading } = useFrappeCreateDoc(); // Add createDoc
    const { mutate } = useSWRConfig();

    const loading = updateLoading || createLoading;

    const form = useForm<EditEstimationTaskFormValues>({
        resolver: zodResolver(editEstimationTaskSchema),
        defaultValues: {},
    });

    // Fetch BOQ details for context display
    const { data: boqDoc } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", taskData?.boq, {
        enabled: !!taskData?.boq,
    });

    // --- CHANGE 3: useEffect to reset form based on mode ---
    useEffect(() => {
        if (!taskData) return;
        if (mode === 'edit') {
            form.reset({
                type: taskData.type || "",
                start_date: taskData.start_date?.split(" ")[0] || "",
                remarks: taskData.remarks || "",
                boq: taskData.boq,
                task_profile: "Estimates",
            });
        } else if (mode === 'scheduleNext') {
            form.reset({
                type: taskData.type || "",
                start_date: "", // Clear date for the new task
                remarks: "",      // Clear remarks
                boq: taskData.boq,
                task_profile: "Estimates",
            });
        } else { // 'updateStatus'
            form.reset({
                status: "",
                remarks: "",
                reschedule: false,
                boq: taskData.boq,
                task_profile: "Estimates",
            });
        }
    }, [taskData, mode, form]);

    // --- CHANGE 4: Expanded onSubmit handler for all modes ---
    const onSubmit = async (values: EditEstimationTaskFormValues) => {
        try {
            if (!taskData?.name) throw new Error("Task ID is missing.");

            let shouldCloseDialog = true;

            if (mode === 'edit') {
                await updateDoc("CRM Task", taskData.name, {
                    type: values.type,
                    start_date: values.start_date,
                    remarks: values.remarks,
                });
                toast({ title: "Success!", description: "Estimation task updated." });
            } else if (mode === 'updateStatus') {
                if (!values.status) {
                    form.setError('status', { message: 'Status is required.' });
                    return;
                }
                await updateDoc("CRM Task", taskData.name, {
                    status: values.status,
                    remarks: values.remarks,
                });
                toast({ title: "Success!", description: "Task status updated." });

                if (values.reschedule) {
                    shouldCloseDialog = false;
                    // Open the same dialog in 'scheduleNext' mode
                    openEditEstimationTaskDialog({ taskData, mode: 'scheduleNext' });
                }
            } else if (mode === 'scheduleNext') {
                if (!values.start_date) {
                    form.setError('start_date', { message: 'Deadline is required.' });
                    return;
                }
                await createDoc("CRM Task", {
                    type: values.type,
                    start_date: values.start_date,
                    remarks: values.remarks,
                    status: 'Scheduled',
                    boq: taskData.boq, // Carry over the BOQ link
                    company: taskData.company, // Carry over company
                    contact: taskData.contact, // Carry over contact
                    task_profile: 'Estimates',
                });
                toast({ title: "Success!", description: "New follow-up task scheduled." });
            }

            // Refresh all task-related data
            await mutate(key => typeof key === 'string' && key.startsWith('all-tasks-'));

            if (shouldCloseDialog) {
                onSuccess?.();
            }
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* --- Common Header UI --- */}
                <div className="text-sm mb-4 border-b pb-4">
                    <p className="font-semibold">{boqDoc?.boq_name || 'Loading BOQ...'}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Original Date: {formatDateWithOrdinal(taskData?.start_date)}</span>
                    </div>
                </div>

                {/* --- CHANGE 5: Conditional UI for 'edit' and 'scheduleNext' modes --- */}
                {(mode === 'edit' || mode === 'scheduleNext') && (
                    <>
                        <FormField
                            name="type"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Type<sup>*</sup></FormLabel>
                                    <FormControl>
                                        <ReactSelect
                                            options={estimationTaskTypeOptions}
                                            value={estimationTaskTypeOptions.find(t => t.value === field.value)}
                                            onChange={val => field.onChange(val?.value)}
                                            placeholder="Select Type"
                                            menuPosition={'fixed'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="start_date"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{mode === 'edit' ? 'New Deadline' : 'Deadline'}<sup>*</sup></FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="remarks"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add any relevant remarks..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {/* --- CHANGE 6: Conditional UI for 'updateStatus' mode --- */}
                {mode === 'updateStatus' && (
                    <>
                        <FormField
                            name="status"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Update Status To<sup>*</sup></FormLabel>
                                    <FormControl>
                                        <ReactSelect
                                            options={statusOptions}
                                            onChange={val => field.onChange(val?.value)}
                                            placeholder="Select status..."
                                            menuPosition={'fixed'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="remarks"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="e.g., Awaiting final drawing from client." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="reschedule"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Schedule new task?</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </>
                )}

                {/* --- Common Footer with Buttons --- */}
                <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
                    <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>
                        {loading ? "Saving..." : "Confirm"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};