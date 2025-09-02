// src/components/boq/RemarkBoqForm.tsx

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBoq } from "@/types/NirmaanCRM/CRMBoq"; // Assuming this is the correct BOQ type
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import { remarkBoqSchema, RemarkBoqFormValues } from "@/constants/boqZodValidation"; // Import new schema

interface RemarkBoqFormProps {
  onSuccess?: () => void;
}

export const RemarkBoqForm = ({ onSuccess }: RemarkBoqFormProps) => {
  const { remarkBoq, closeRemarkBoqDialog } = useDialogStore();
  console.log("remarkBoq",remarkBoq)
  const { boqData } = remarkBoq.context; // Get boqData from the dialog store context
  console.log("boqDataremarks",boqData)

  const { createDoc, loading: createLoading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();

  const form = useForm<RemarkBoqFormValues>({
    resolver: zodResolver(remarkBoqSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (values: RemarkBoqFormValues) => {
    try {
      if (!boqData?.name) {
        throw new Error("BOQ document name is missing from context. Cannot add remark.");
      }

      await createDoc("CRM Note", {
        reference_doctype: "CRM BOQ",
        reference_docname: boqData.name,
        content: values.content,
        title: values.title || `Remark for ${boqData.boq_name || boqData.name}`, // Use BOQ name for default title
      });

      toast({ title: "Success", description: "Remark added successfully." });

      // Invalidate relevant SWR caches to reflect the changes
      await mutate(`BOQ/${boqData.name}`); // Refresh the specific BOQ data
      await mutate(key => typeof key === 'string' && key.startsWith('all-notes-')); // Refresh any list of notes
      // If you have a specific SWR key for BOQ details that includes notes, you might need to mutate that too.

      if (onSuccess) {
        onSuccess();
      }
      closeRemarkBoqDialog(); // Close the dialog after successful submission
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const loading = createLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* BOQ Header for context */}
        <div className="flex items-start text-sm mb-4 border-b pb-2">
          <div>
            <p className="text-xs text-muted-foreground">Adding Remark for Project</p>
            <p className="font-semibold">{boqData?.boq_name || 'N/A'}</p>
          </div>
          {/* Consider adding BOQ status here for more context, similar to AssignedBoqForm */}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title <sup>*</sup></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Follow-up Notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark Content<sup>*</sup></FormLabel>
              <FormControl>
                <Textarea placeholder="Type your remark here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={closeRemarkBoqDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>{loading ? "Adding..." : "Add Remark"}</Button>
        </div>
      </form>
    </Form>
  );
};