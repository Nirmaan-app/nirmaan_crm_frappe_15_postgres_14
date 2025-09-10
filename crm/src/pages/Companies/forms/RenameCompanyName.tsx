// src/pages/Companies/forms/RenameCompanyName.tsx

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappePostCall, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import { useNavigate } from "react-router-dom";

// --- 1. Zod Schema for Validation ---
const renameCompanySchema = z.object({
  newName: z.string().min(1, "New company name is required."),
});

type RenameCompanyFormValues = z.infer<typeof renameCompanySchema>;

// --- Component Props ---
interface RenameCompanyNameProps {
  onSuccess?: () => void; // Callback when rename is successful (e.g., close dialog)
  currentDoctype: string; // e.g., "CRM Company"
  currentDocName: string; // The current 'name' field (ID) of the document (e.g., "COMP-001")
}

export const RenameCompanyName = ({ onSuccess, currentDoctype, currentDocName }: RenameCompanyNameProps) => {
  const { closeDialog } = useDialogStore(); // Access closeDialog from your store
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();

  // --- 2. useForm Hook ---
  const form = useForm<RenameCompanyFormValues>({
    resolver: zodResolver(renameCompanySchema),
    defaultValues: {
      newName: currentDocName, // Pre-fill the input with the current document name (ID)
    },
  });

  // --- 3. Frappe API Call Hook ---
  const { call: renameDoc, loading: renameLoading } = useFrappePostCall(
    'frappe.model.rename_doc.update_document_title'
  );

  // const onSubmit = async (values: RenameCompanyFormValues) => {
  //   // Prevent renaming to the same name
  //   if (values.newName === currentDocName) {
  //     toast({
  //       title: "No Change",
  //       description: "The new name is the same as the current name.",
  //       variant: "info",
  //     });
  //     onSuccess?.(); // Close dialog if no change needed
  //     return;
  //   }

  //   try {
  //     const payload = {
  //       doctype: currentDoctype,
  //       docname: currentDocName, // Old Frappe 'name' (ID)
  //       name: values.newName,    // New Frappe 'name' (ID)
  //       enqueue: true,           // Run as a background job
  //       merge: 0,                // Do not merge with an existing document
  //       freeze: true,            // Freeze UI during rename
  //       freeze_message: "Updating company name and related records...",
  //     };

  //     await renameDoc(payload);

  //     toast({
  //       title: "Success",
  //       description: `Document "${currentDoctype}" with ID "${currentDocName}" successfully renamed to "${values.newName}".`,
  //       variant: "success",
  //     });

  //     // --- 4. Cache Invalidation ---
  //     // Invalidate SWR cache for the old document name
  //     mutate(`${currentDoctype}:${currentDocName}`);
  //     // Invalidate SWR cache for the new document name
  //     mutate(`${currentDoctype}:${values.newName}`);
  //     // Invalidate any list caches that might contain this document type
  //     mutate(key => typeof key === 'string' && key.startsWith('Company/'));
  //     // Invalidate other related caches (e.g., BOQs, Contacts linked to this company)
  //     mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));
  //     mutate(key => typeof key === 'string' && key.startsWith('all-contacts-'));


  //     // --- 5. Post-Rename Actions ---
  //     // Navigate to the new Company URL using the new document name (ID)
  //     navigate(`/companies/company?id=${encodeURIComponent(values.newName)}`);

  //     onSuccess?.(); // Call onSuccess to close the dialog

  //   } catch (error: any) {
  //     console.error("Rename Company Error:", error);
  //     toast({
  //       title: "Error renaming company",
  //       description: error.message || "An unknown error occurred.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const onSubmit = async (values: RenameCompanyFormValues) => {
    // Prevent renaming to the same name
    if (values.newName === currentDocName) {
      toast({
        title: "No Change",
        description: "The new name is the same as the current name.",
        variant: "info",
      });
      onSuccess?.(); // Close dialog if no change needed
      return;
    }

    try {
      const payload = {
        doctype: currentDoctype,
        docname: currentDocName, // Old Frappe 'name' (ID)
        name: values.newName,    // New Frappe 'name' (ID)
        // CRITICAL CHANGE: Removed 'enqueue: true'
        // This makes the API call synchronous, meaning it will return only AFTER
        // the rename operation (including related doc updates) is fully completed in the database.
        merge: 0,
        freeze: true,            // Freeze UI during rename on Frappe's side
        freeze_message: "Updating company name and related records...",
      };

      // Await the API call. When this resolves, the rename is guaranteed to be done.
      await renameDoc(payload);

      // --- All actions after successful API response ---

      // 1. Show success toast (immediate feedback)
      toast({
        title: "Success",
        description: `Document "${currentDoctype}" with ID "${currentDocName}" successfully renamed to "${values.newName}".`,
        variant: "success",
      });

      // 2. Close the dialog (immediate UI cleanup)
      onSuccess?.(); 


      // 3. Trigger cache invalidation (run in background, no await)
      // Invalidate SWR cache for the old document name
      mutate(`${currentDoctype}:${currentDocName}`);
      // Invalidate SWR cache for the new document name
      mutate(`${currentDoctype}:${values.newName}`);
      // Invalidate any list caches that might contain this document type
      mutate(key => typeof key === 'string' && key.startsWith(`${currentDoctype.split(' ').join('%20')}:`));
      // Invalidate other related caches (e.g., BOQs, Contacts linked to this company)
      mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));
      mutate(key => typeof key === 'string' && key.startsWith('all-contacts-'));


      // 4. Navigate directly to the newly renamed document's detail page
      // Since the rename is complete, the new ID will exist in the DB.
      navigate(`/companies/company?id=${encodeURIComponent(values.newName)}`);

    } catch (error: any) {
      console.error("Rename Company Error:", error);
      toast({
        title: "Error renaming company",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Current Document ID: <span className="font-medium text-gray-800 dark:text-gray-200">{currentDocName}</span>
        </p>

        <FormField
          control={form.control}
          name="newName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Document ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter new company document ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button type="submit" disabled={renameLoading}>
            {renameLoading ? "Renaming..." : "Rename Company"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

RenameCompanyName.displayName = 'RenameCompanyName';