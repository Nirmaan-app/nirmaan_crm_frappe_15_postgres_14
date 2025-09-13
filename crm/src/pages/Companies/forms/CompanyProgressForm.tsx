// src/components/forms/CompanyProgressForm.tsx
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk"; // useFrappeGetDoc removed as it's not needed
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useEffect } from "react";

import { CompanyProgressPriorityOptions } from "@/constants/dropdownData";
import { CRMCompanyProgress } from "@/store/dialogStore"; // CRMCompany no longer needed as parent_company is removed


// Zod Schema for CompanyProgressForm
const companyProgressFormSchema = z.object({
  priority: z.enum(CompanyProgressPriorityOptions.map(opt => opt.value))
              .optional().nullable()
              .transform(e => e === null ? undefined : e),
  expected_boq_count: z.union([
      z.number().min(0, "Expected BOQ count cannot be negative"),
      z.literal(NaN),
      z.null()
  ]).optional()
    .transform(e => (e === NaN || e === null || e === undefined) ? undefined : Number(e)),
});

type CompanyProgressFormValues = z.infer<typeof companyProgressFormSchema>;

interface CompanyProgressFormProps {
  onSuccess?: () => void;
  initialData?: CRMCompanyProgress | null; // Data if editing an existing Company Progress document
  companyId: string; // The ID of the CRM Company (still useful for cache invalidation)
}

export const CompanyProgressForm = ({
  onSuccess,
  initialData = null,
  companyId,
}: CompanyProgressFormProps) => {
  const { closeCompanyProgressDialog } = useDialogStore();
  const { createDoc, loading: createLoading } = useFrappeCreateDoc(); // createDoc is not used in this form's onSubmit
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { mutate } = useSWRConfig();

  // Determine if in edit mode based on initialData
  const isEditMode = initialData;

  // console.log("initialData",initialData,companyId)

  const form = useForm<CompanyProgressFormValues>({
    resolver: zodResolver(companyProgressFormSchema),
    defaultValues: {
      priority: undefined,
      expected_boq_count: undefined,
    },
  });

  // Pre-fill form in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        priority: initialData.priority ?? "",
        expected_boq_count: initialData.expected_boq_count ?? undefined,
      });
    } else {
        // If not in edit mode (e.g., initialData is null), reset to empty defaults.
        // This form is primarily for editing, so this path might indicate an incorrect usage.
        form.reset({
            priority: undefined,
            expected_boq_count: undefined,
        });
    }
  }, [isEditMode, initialData, form]); // Removed companyId from dependencies as it doesn't affect form data reset

  const onSubmit = async (values: CompanyProgressFormValues) => {
    try {
      // console.log("values",values)
      if (!isEditMode || !initialData) {
        // This form is intended for updates only. If initialData is missing, it's an error.
        toast({ title: "Error", description: "No Company Progress document provided for update.", variant: "destructive" });
        return;
      }
      
      // Update existing Company Progress document
      await updateDoc("CRM Company", initialData.name, values);
      toast({ title: "Success!", description: "Company progress updated." });
      

      await mutate(`Company/${companyId}`); // Mutate the parent CRM Company to reflect changes
      await mutate( key => typeof key === 'string' && key.startsWith('all-companies-')); // Mutate relevant lists
      
      onSuccess?.();
      closeCompanyProgressDialog(); // Close the dialog on success
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const loading = createLoading || updateLoading ;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Display company name from fetched data for context */}
        {/* We use initialData.company_name for displaying, as per your "initialdata has all details" comment. */}
        <p className="text-sm text-muted-foreground">Updating progress for: <span className="font-semibold">{initialData?.company_name || "Company"}</span></p>

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <ReactSelect
                  options={CompanyProgressPriorityOptions}
                  value={CompanyProgressPriorityOptions.find(opt => opt.value === field.value) || null}
                  onChange={val => field.onChange(val ? val.value : undefined)}
                  placeholder="Select Priority"
                  isClearable={true}
                  menuPosition={'auto'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expected_boq_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected BOQ Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === "" ? undefined : Number(value));
                  }}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeCompanyProgressDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>
            {loading ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </form>
    </Form>
  );
};