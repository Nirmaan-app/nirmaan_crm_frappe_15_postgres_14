// src/pages/Tasks/NewEstimationTaskForm.tsx

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useMemo } from "react";
import { estimationTaskTypeOptions } from "@/constants/dropdownData";
import { Textarea } from "@/components/ui/textarea";
import { useUserRoleLists } from "@/hooks/useUserRoleLists"


// Simplified Zod schema for the Estimation Task
const estimationTaskFormSchema = z.object({
    boq: z.string().min(1, "BOQ is required"),
    type: z.string().min(1, "Task type is required"),
    start_date: z.string().min(1, "Date is required"),
    assigned_sales: z.string().optional(),
    // Hidden fields that will be set automatically
    company: z.string().optional(),
    contact: z.string().optional(),
    task_profile: z.string().default("Estimates"),
    remarks: z.string().optional(),
});

type EstimationTaskFormValues = z.infer<typeof estimationTaskFormSchema>;

interface NewEstimationTaskFormProps {
    onSuccess?: () => void;
}

export const NewEstimationTaskForm = ({ onSuccess }: NewEstimationTaskFormProps) => {
    const { newEstimationTask } = useDialogStore();
    const { createDoc, loading } = useFrappeCreateDoc();
    const { mutate } = useSWRConfig();
  const role = localStorage.getItem("role")

    const { boqId: boqIdFromContext } = newEstimationTask.context;
      const { estimationUserOptions, isLoading: usersLoading } = useUserRoleLists();

    const form = useForm<EstimationTaskFormValues>({
        resolver: zodResolver(estimationTaskFormSchema),
        defaultValues: {
            boq: boqIdFromContext || "",
            task_profile: "Estimates", // Always set this for this form
        },
    });

    const selectedBoqId = form.watch("boq");

    // Fetch all BOQs for the dropdown (if no context is provided)
    const { data: boqsList, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", {
        fields: ["name", "boq_name"],
        limit: 0,
        enabled: !boqIdFromContext // Only fetch if no BOQ is passed via context
    });

    // Fetch the selected BOQ to derive company and contact
    const { data: selectedBoqDoc } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", selectedBoqId, {
        enabled: !!selectedBoqId
    });


    console.log("selectedBoqDoc",selectedBoqDoc)
    // Memoize options for the BOQ dropdown
    const boqOptions = useMemo(() =>
        boqsList?.map(b => ({ label: b.boq_name, value: b.name })) || [],
        [boqsList]
    );

    const onSubmit = async (values: EstimationTaskFormValues) => {
        try {
            if (!selectedBoqDoc) {
                toast({ title: "Error", description: "Please select a valid BOQ.", variant: "destructive" });
                return;
            }

            const payload = {
                ...values,
                // company: selectedBoqDoc.company,
                // contact: selectedBoqDoc.contact,
                status: 'Scheduled', // Always set to Scheduled on creation
            };

            await createDoc("CRM Task", payload);
            await mutate(key => typeof key === 'string' && key.startsWith('all-tasks-'));
            toast({ title: "Success!", description: "Estimation task created." });
            onSuccess?.();
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                   {role === "Nirmaan Admin User Profile" && (
                          <FormField
                            control={form.control}
                            name="assigned_sales"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estimates Person:</FormLabel>
                                <FormControl>
                                  <ReactSelect
                                    options={estimationUserOptions}
                                    value={estimationUserOptions.find(u => u.value === field.value)}
                                    onChange={val => field.onChange(val?.value)}
                                    placeholder="Select a Estimates Person..."
                                    isLoading={usersLoading}
                                    className="text-sm"
                                    menuPosition={'auto'}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                <FormField
                    name="boq"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>BOQ<sup>*</sup></FormLabel>
                            <FormControl>
                                {boqIdFromContext ? (
                                    <Input value={boqIdFromContext} disabled />
                                ) : (
                                    <ReactSelect
                                        options={boqOptions}
                                        isLoading={boqsLoading}
                                        value={boqOptions.find(b => b.value === field.value)}
                                        onChange={val => field.onChange(val?.value)}
                                        placeholder="Select a BOQ"
                                        menuPosition={'auto'}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                    menuPosition={'auto'}
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
                            <FormLabel>Deadline<sup>*</sup></FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField name="remarks" control={form.control} render={({ field }) => (<FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. vendor call pending" {...field} /></FormControl><FormMessage /></FormItem>)} />
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