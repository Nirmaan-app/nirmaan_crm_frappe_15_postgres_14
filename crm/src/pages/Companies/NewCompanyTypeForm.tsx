import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// 1. ZOD SCHEMA FIX: The field name must match the doctype and form.
const NewCompanyTypeSchema = z.object({
    name: z.string().min(1, "Company type name is required."),
});

type NewCompanyTypeFormValues = z.infer<typeof NewCompanyTypeSchema>;

// The prop was named toggleNewCompanyTypeDialog, let's rename to onSuccess for consistency
interface NewCompanyTypeFormProps {
  onSuccess: () => void;
}

export const NewCompanyTypeForm: React.FC<NewCompanyTypeFormProps> = ({ onSuccess }) => {
    const {mutate} = useSWRConfig();
    const { createDoc, loading: createLoading } = useFrappeCreateDoc();

    const form = useForm<NewCompanyTypeFormValues>({
        resolver: zodResolver(NewCompanyTypeSchema),
        defaultValues: { name: "" },
    });

    const onSubmit = async (values: NewCompanyTypeFormValues) => {
      try {
        // 2. PAYLOAD FIX: Frappe expects the field name from the doctype.
        await createDoc("CRM Company Type", {
            company_type_name: values.name
        });
        
        await mutate("CRM Company Type");
        onSuccess(); // Use the passed-in success handler
        toast({
            title: "Success!",
            description: `Company Type "${values.name}" created.`,
            variant: "success"
        });
      } catch (error) {
        toast({
            title: "Failed!",
            description: (error as Error).message || "Failed to create company type!",
            variant: "destructive"
        });
      }
    };

    return (
        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name" // This now correctly matches the Zod schema
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Company Type Name<sup>*</sup></FormLabel>
                        <FormControl><Input placeholder="Enter Company Type Name" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
              />
              <div className="flex gap-2 items-center justify-end pt-4">
                  <Button type="button" variant={"outline"} onClick={onSuccess}>Cancel</Button>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? "Creating..." : "Confirm"}
                  </Button>
              </div>
            </form>
          </Form>
        </div>
    );
};