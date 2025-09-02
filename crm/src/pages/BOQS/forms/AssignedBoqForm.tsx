import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import ReactSelect from "react-select";
import { useEffect } from "react";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";
import { assignedBoqSchema, AssignedBoqFormValues } from "@/constants/boqZodValidation";
import { CRMBoq } from "@/types/NirmaanCRM/CRMBoq"; // Assuming you have a type for your BOQ document
import { useStatusStyles } from "@/hooks/useStatusStyles"; // Import useStatusStyles for consistent UI

interface AssignedBoqFormProps {
  // boqData: CRMBoq; // Pass the BOQ data directly to this component
  onSuccess?: () => void;
}

export const AssignedBoqForm = ({ onSuccess }: AssignedBoqFormProps) => {
  const {assignBoq, closeAssignBoqDialog } = useDialogStore();
  const { boqData} = assignBoq.context;

  console.log("boqData",boqData,assignBoq)
  const { salesUserOptions, estimationUserOptions, isLoading: usersLoading } = useUserRoleLists();
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { mutate } = useSWRConfig();
  const getBoqStatusClass = useStatusStyles('boq'); // Initialize status styles

  const form = useForm<AssignedBoqFormValues>({
    resolver: zodResolver(assignedBoqSchema),
    defaultValues: {
      assigned_sales: "",
      assigned_estimations: "",
    },
  });

  // Pre-fill form fields with existing data from boqData
  useEffect(() => {
    if (boqData) {
      form.reset({
        assigned_sales: boqData.assigned_sales || "",
        assigned_estimations: boqData.assigned_estimations || "",
      });
    }
  }, [boqData, form]);

  const onSubmit = async (values: AssignedBoqFormValues) => {
    try {
      if (!boqData?.name) throw new Error("BOQ document name is missing.");
      console.log(values,"values")
      // Construct the payload with only the fields relevant to 'assigned' mode
      const payload = {
        assigned_sales: values.assigned_sales,
        assigned_estimations: values.assigned_estimations,
      };

      await updateDoc("CRM BOQ", boqData.name, payload);
      toast({ title: "Success", description: "Assigned persons updated." });

      // Invalidate relevant SWR caches to reflect the changes
      await mutate(`BOQ/${boqData.name}`);
      await mutate(key => typeof key === 'string' && key.startsWith('all-boqs-')); // If you have a list of all BOQs that needs refreshing

      if (onSuccess) {
        onSuccess();
      }
      closeAssignBoqDialog(); // Close the dialog after successful submission
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const loading = updateLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* BOQ Header for context */}
        <div className="flex justify-between items-start text-sm mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Project</p>
            <p className="font-semibold">{boqData?.boq_name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-center text-muted-foreground"> Status</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getBoqStatusClass(boqData?.boq_status)}`}>
              {boqData?.boq_status || 'N/A'}
            </span>
          </div>
        </div>

        {/* Form field for Assigned Salesperson */}
        <FormField
          control={form.control}
          name="assigned_sales"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Salesperson For BOQ</FormLabel>
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

        {/* Form field for Assigned Estimateperson */}
        <FormField
          control={form.control}
          name="assigned_estimations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Estimateperson For BOQ</FormLabel>
              <FormControl>
                <ReactSelect
                  options={estimationUserOptions}
                  value={estimationUserOptions.find(u => u.value === field.value)}
                  onChange={val => field.onChange(val?.value)}
                  placeholder="Select an estimation person..."
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

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={closeAssignBoqDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
        </div>
      </form>
    </Form>
  );
};