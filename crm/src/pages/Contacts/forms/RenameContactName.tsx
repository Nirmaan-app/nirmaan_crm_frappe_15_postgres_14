
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappePostCall, useSWRConfig,useFrappeGetDocList } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import { useNavigate } from "react-router-dom";

// --- 1. Zod Schema for Validation ---
const renameContactSchema = z.object({
  newName:  z.string().email("Enter a valid email address"),
});

type RenameContactFormValues = z.infer<typeof renameContactSchema>;

// --- Component Props ---
interface RenameContactNameProps {
  onSuccess?: () => void; // Callback when rename is successful (e.g., close dialog)
  currentDoctype: string; // e.g., "CRM Contacts"
  currentDocName: string; // The current 'name' field (ID) of the document (e.g., "CONTACT-001")
}

export const RenameContactName = ({ onSuccess, currentDoctype, currentDocName }: RenameContactNameProps) => {
  const { closeRenameContactNameDialog } = useDialogStore(); // Access closeRenameContactNameDialog from your store
  const { mutate } = useSWRConfig();
  const navigate = useNavigate();

  const { data: allContacts } = useFrappeGetDocList("CRM Contacts", {
          fields: ["name", "email"], limit: 0,
      },"all-contacts-existornot");

  // --- 2. useForm Hook ---
  const form = useForm<RenameContactFormValues>({
    resolver: zodResolver(renameContactSchema),
    defaultValues: {
      newName: currentDocName, // Pre-fill the input with the current document name (ID)
    },
  });

  // --- 3. Frappe API Call Hook ---
  const { call: renameDoc, loading: renameLoading } = useFrappePostCall(
    'frappe.model.rename_doc.update_document_title'
  );

  // const onSubmit = async (values: RenameContactFormValues) => {
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
  //       freeze_message: "Updating contact name and related records...",
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
  //     mutate(key => typeof key === 'string' && key.startsWith('Contact/'));
  //     // Invalidate other related caches (e.g., BOQs, Tasks linked to this contact)
  //     mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));
  //     mutate(key => typeof key === 'string' && key.startsWith('all-tasks-'));


  //     // --- 5. Post-Rename Actions ---
  //     // Navigate to the new Contact URL using the new document name (ID)
  //     navigate(`/contacts/contact?id=${encodeURIComponent(values.newName)}`);

  //     onSuccess?.(); // Call onSuccess to close the dialog

  //   } catch (error: any) {
  //     console.error("Rename Contact Error:", error);
  //     toast({
  //       title: "Error renaming contact",
  //       description: error.message || "An unknown error occurred.",
  //       variant: "destructive",
  //     });
  //   }
  // };

 const onSubmit = async (values: RenameContactFormValues) => {
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

     const trimmedEmail = values.newName.trim().toLowerCase();

            const existingContact = allContacts?.find(
                c => c.email.trim().toLowerCase() === trimmedEmail
            );
            if (existingContact) {
                            toast({
                                title: "Duplicate Contact",
                                description: `A contact with the email "${values.email}" already exists.`,
                                variant: "destructive"
                            });
                            return; // Stop the submission
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
        freeze_message: "Updating contact name and related records...",
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
      mutate(key => typeof key === 'string' && key.startsWith(`${currentDoctype.split(' ').join('')}:`));
      // Invalidate other related caches (e.g., BOQs, Tasks linked to this contact)
      if (currentDoctype === "CRM Contacts") {
          mutate(`Contact/${values.newName}`); // Specific detail key for the new BOQ
          mutate(key => typeof key === 'string' && key.startsWith('all-tasks-')); // Tasks related to this BOQ
         
          mutate(key => typeof key === 'string' && key.startsWith('all-boqs-')); // General BOQ lists
      }

      // 4. Navigate directly to the newly renamed document's detail page
      // Since the rename is complete, the new ID will exist in the DB.
      navigate(`/contacts/contact?id=${encodeURIComponent(values.newName)}`);

    } catch (error: any) {
      console.error("Rename Contact Error:", error);
      toast({
        title: "Error renaming contact",
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
              <FormLabel>New Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter new contact document ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeRenameContactNameDialog}>
            Cancel
          </Button>
          <Button type="submit" disabled={renameLoading}>
            {renameLoading ? "Renaming..." : "Rename Contact"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

RenameContactName.displayName = 'RenameContactName';