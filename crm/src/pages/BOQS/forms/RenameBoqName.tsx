
// src/BOQS/forms/RenameBoqName.tsx // <--- NEW FILE PATH AND NAME

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappePostCall, useSWRConfig,useFrappeGetDocList } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- 1. Zod Schema for Validation ---
const renameBoqSchema = z.object({
  newName: z.string().min(1, "New BOQ name is required."),
});

type RenameBoqFormValues = z.infer<typeof renameBoqSchema>;

// --- Component Props ---
interface RenameBoqNameProps { // <--- UPDATED INTERFACE NAME
  onSuccess?: () => void;
  currentDoctype: string;
  currentDocName: string;
}

export const RenameBoqName = ({ onSuccess, currentDoctype, currentDocName }: RenameBoqNameProps) => { // <--- UPDATED COMPONENT NAME
  const { closeRenameBoqNameDialog } = useDialogStore();
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();

console.log("currentDocName",currentDocName)
  //Validation Check 
    const { data: allBoqs } = useFrappeGetDocList("CRM BOQ", {
      fields: ["boq_name"]
    },"all-boqs-existornot");

  // --- 2. useForm Hook ---
  const form = useForm<RenameBoqFormValues>({
    resolver: zodResolver(renameBoqSchema),
    defaultValues: {
      newName: currentDocName, // Pre-fill with the current name
    },
  });

  // --- 3. Frappe API Call Hook ---
  const { call: renameDoc, loading: renameLoading } = useFrappePostCall(
    'frappe.model.rename_doc.update_document_title'
  );

  // const onSubmit = async (values: RenameBoqFormValues) => {
  //   // Prevent renaming to the same name
  //   if (values.newName === currentDocName) {
  //     toast({
  //       title: "No Change",
  //       description: "The new name is the same as the current name.",
  //       variant: "info",
  //     });
  //     onSuccess?.();
  //     return;
  //   }

  //   try {
  //     const payload = {
  //       doctype: currentDoctype,
  //       docname: currentDocName, // Old name
  //       name: values.newName,    // New name
  //       //enqueue: true,
  //       merge: 0,
  //       freeze: true,
  //       freeze_message: "Updating related fields and document name...",
  //     };

  //     await renameDoc(payload);

  //     toast({
  //       title: "Success",
  //       description: `Document "${currentDocName}" successfully renamed to "${values.newName}".`,
  //       variant: "success",
  //     });

  //     // --- 4. Cache Invalidation ---

  //     // // Invalidate SWR cache for the old document name
  //     // mutate(`${currentDoctype}:${currentDocName}`);
  //     mutate(`BOQ/${values.newName}`);
  //     mutate(key => typeof key === 'string' && key.startsWith(`BOQ/`));
  //     // Assuming a specific detail key for the new BOQ
  //     mutate(key => typeof key === 'string' && key.startsWith('all-tasks-'));
  //     mutate(key => typeof key === 'string' && key.startsWith('all-notes-'));
  //     mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));

  //    navigate(`/boqs/boq?id=${encodeURIComponent(values.newName)}`);
      

  //     onSuccess?.(); // Call onSuccess to close the dialog
  //   } catch (error: any) {
  //     console.error("Rename BOQ Error:", error);
  //     toast({
  //       title: "Error renaming document",
  //       description: error.message || "An unknown error occurred.",
  //       variant: "destructive",
  //     });
  //   }
  // };

 const onSubmit = async (values: RenameBoqFormValues) => {
    // Prevent renaming to the same name
    if (values.newName === currentDocName) {
      toast({
        title: "No Change",
        description: "The new name is the same as the current name.",
       variant: "destructive"
      });
      onSuccess?.(); // Close dialog if no change needed
      return;
    }
     const trimmedBoqName = values.newName.trim();
          
          // Check if a BOQ with the same name already exists (case-insensitive).
          const existingBoq = allBoqs?.find(
            b => b.boq_name.trim().toLowerCase() === trimmedBoqName.toLowerCase()
          );
    
          if (existingBoq) {
            // If a duplicate is found, show an error and stop the submission.
            toast({
                title: "Duplicate BOQ",
                description: `A BOQ with the name "${trimmedBoqName}" already exists.`,
                variant: "destructive"
            });
            return; // Stop the function here
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
        freeze: true,            // Freeze UI during rename on Frappe's side (still useful for synchronous calls)
        freeze_message: "Updating related fields and document name...",
      };

      // Await the API call. Now, when this line resolves, the rename is guaranteed to be done.
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
      // Invalidate SWR cache for the OLD document name
      mutate(`${currentDoctype}:${currentDocName}`);
      // Invalidate SWR cache for the NEW document name
      mutate(`${currentDoctype}:${values.newName}`);
      // Invalidate any list caches that might contain this document type
      mutate(key => typeof key === 'string' && key.startsWith(`${currentDoctype.split(' ').join('%20')}:`));

      // Invalidate specific related caches for a BOQ (if currentDoctype is "CRM BOQ"):
      if (currentDoctype === "CRM BOQ") {
          mutate(`BOQ/${values.newName}`); // Specific detail key for the new BOQ
          mutate(key => typeof key === 'string' && key.startsWith('all-tasks-')); // Tasks related to this BOQ
          mutate(key => typeof key === 'string' && key.startsWith('all-notes-')); // Notes related to this BOQ
          mutate(key => typeof key === 'string' && key.startsWith('all-boqs-')); // General BOQ lists
      }


      // 4. Navigate directly to the newly renamed document's detail page
      // This will cause the target page to re-fetch its data using the new ID.
      // Since the rename is complete, the new ID will exist in the DB.
      navigate(`/boqs/boq?id=${encodeURIComponent(values.newName)}`);

    } catch (error: any) {
      console.error("Rename BOQ Error:", error);
      toast({
        title: "Error renaming document",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Current Name: <span className="font-medium text-gray-800 dark:text-gray-200">{currentDocName}</span>
        </p>

        <FormField
          control={form.control}
          name="newName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New BOQ Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter new BOQ name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeRenameBoqNameDialog}>
            Cancel
          </Button>
          <Button type="submit" disabled={renameLoading}>
            {renameLoading ? "Renaming..." : "Rename BOQ"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

RenameBoqName.displayName = 'RenameBoqName'; // <--- UPDATED DISPLAY NAME