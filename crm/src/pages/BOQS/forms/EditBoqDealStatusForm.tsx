// src/components/forms/EditDealStatusForm.tsx

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ"; // Assuming CRMBOQ is your full BOQ type
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import React, { useEffect } from "react";

// --- Zod Schema for Validation ---
const editDealStatusSchema = z.object({
  deal_status: z.string().min(1, "Deal status is required."),
});

type EditDealStatusFormValues = z.infer<typeof editDealStatusSchema>;

// --- Options for Deal Status Dropdown ---
const dealStatusOptions = [
  { label: "Hot", value: "Hot" },
  { label: "Warm", value: "Warm" },
  { label: "Cold", value: "Cold" },
];

// --- Component Props ---
interface EditDealStatusFormProps {
  onSuccess?: () => void; // Callback when successful
  boqData: CRMBOQ; // The BOQ data for which to update the status
}

export const EditDealStatusForm = ({ onSuccess, boqData }: EditDealStatusFormProps) => {
  const { closeEditDealStatusDialog } = useDialogStore(); // Use the specific close action
  const { mutate } = useSWRConfig();

  const form = useForm<EditDealStatusFormValues>({
    resolver: zodResolver(editDealStatusSchema),
    defaultValues: {
      deal_status: boqData.deal_status || "", // Pre-fill with current status
    },
  });

  // Ensure form is reset if boqData changes
  useEffect(() => {
    form.reset({
      deal_status: boqData.deal_status || "",
    });
  }, [boqData, form]);

  // --- Frappe API Call Hook ---
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();

  const onSubmit = async (values: EditDealStatusFormValues) => {
    // Prevent updating to the same status
    if (values.deal_status === boqData.deal_status) {
      toast({
        title: "No Change",
        description: "The selected status is the same as the current status.",
        variant: "info",
      });
      onSuccess?.(); // Close dialog if no change needed
      return;
    }

    try {
      // Update the CRM BOQ document
      await updateDoc("CRM BOQ", boqData.name, {
        deal_status: values.deal_status,
      });

      toast({
        title: "Success",
        description: `Deal status for BOQ "${boqData.boq_name}" updated to "${values.deal_status}".`,
        variant: "success",
      });

      // --- Cache Invalidation ---
      // Invalidate the specific BOQ document cache
      mutate(`BOQ/${boqData.name}`);
      // Invalidate any list caches that might show BOQs
      mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));


      onSuccess?.(); // Call onSuccess to close the dialog
    } catch (error: any) {
      console.error("Update Deal Status Error:", error);
      toast({
        title: "Error updating deal status",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <p className="text-sm text-muted-foreground">
          Current Deal Status: <span className={`font-semibold text-gray-800 dark:text-gray-200 ${getDealStatusClass(boqData.deal_status)}`}>
            {boqData.deal_status || 'N/A'}
          </span>
        </p>

        <FormField
          control={form.control}
          name="deal_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Deal Status<sup>*</sup></FormLabel>
              <FormControl>
                <ReactSelect
                  options={dealStatusOptions}
                  value={dealStatusOptions.find(opt => opt.value === field.value) || null}
                  onChange={val => field.onChange(val?.value)}
                  placeholder="Select new status"
                  className="text-sm"
                  menuPosition={'auto'}
                 
                  isClearable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeEditDealStatusDialog}>
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

// Helper function (re-defined here for clarity, assuming it's from BoqDealStatusCard.tsx)
const getDealStatusClass = (status?: string) => {
    switch (status) {
        case 'Hot':
            return 'bg-red-100 text-red-800';
        case 'Warm':
            return 'bg-yellow-100 text-yellow-800';
        case 'Cold':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};