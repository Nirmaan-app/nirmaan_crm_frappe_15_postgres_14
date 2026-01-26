// src/pages/BOQS/forms/EditBcsStatusForm.tsx

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useEffect } from "react";

// --- Zod Schema for Validation ---
const editBcsStatusSchema = z.object({
  bcs_status: z.string().min(1, "BCS Status is required"),
});

type EditBcsStatusFormValues = z.infer<typeof editBcsStatusSchema>;

// --- Options for BCS Status Dropdown ---
const bcsStatusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Review Pending", value: "Review Pending" },
  { label: "Completed", value: "Completed" },
];

// --- Component Props ---
interface EditBcsStatusFormProps {
  onSuccess?: () => void;
  boqData: CRMBOQ;
}

export const EditBcsStatusForm = ({ onSuccess, boqData }: EditBcsStatusFormProps) => {
  const { closeEditBcsStatusDialog } = useDialogStore();
  const { mutate } = useSWRConfig();

  const form = useForm<EditBcsStatusFormValues>({
    resolver: zodResolver(editBcsStatusSchema),
    defaultValues: {
      bcs_status: boqData.bcs_status || "Pending",
    },
  });

  // Ensure form is reset if boqData changes
  useEffect(() => {
    form.reset({
      bcs_status: boqData.bcs_status || "Pending",
    });
  }, [boqData, form]);

  // --- Frappe API Call Hook ---
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();

  const onSubmit = async (values: EditBcsStatusFormValues) => {
    // Prevent updating to the same status
    if (values.bcs_status === boqData.bcs_status) {
      toast({
        title: "No Change",
        description: "The selected status is the same as current.",
        variant: "info",
      });
      onSuccess?.();
      return;
    }

    try {
      await updateDoc("CRM BOQ", boqData.name, {
        bcs_status: values.bcs_status,
      });

      toast({
        title: "Success",
        description: `BCS Status for BOQ "${boqData.boq_name}" updated.`,
        variant: "success",
      });

      // --- Cache Invalidation ---
      mutate(`BOQ/${boqData.name}`);
      mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));

      onSuccess?.();
    } catch (error: any) {
      console.error("Update BCS Status Error:", error);
      toast({
        title: "Error updating status",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-32">
        <FormField
          control={form.control}
          name="bcs_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BCS Status</FormLabel>
              <FormControl>
                <ReactSelect
                  options={bcsStatusOptions}
                  value={bcsStatusOptions.find(opt => opt.value === field.value) || null}
                  onChange={val => field.onChange(val?.value)}
                  placeholder="Select BCS status"
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeEditBcsStatusDialog}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateLoading}>
            {updateLoading ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
