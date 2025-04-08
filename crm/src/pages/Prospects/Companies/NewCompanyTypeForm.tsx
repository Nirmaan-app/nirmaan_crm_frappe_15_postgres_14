import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useSWRConfig } from "frappe-react-sdk";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const NewCompanyTypeSchema = z.object({
    company_type_name: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
});

type NewCompanyTypeFormValues = z.infer<typeof NewCompanyTypeSchema>;

interface NewCompanyTypeFormProps {
  toggleNewCompanyTypeDialog: () => void;
}

export const NewCompanyTypeForm: React.FC<NewCompanyTypeFormProps> = ({ toggleNewCompanyTypeDialog }) => {

    const {mutate} = useSWRConfig()
    const { createDoc, loading: createLoading } = useFrappeCreateDoc()

    const form = useForm<NewCompanyTypeFormValues>({
        resolver: zodResolver(NewCompanyTypeSchema),
        defaultValues: {},
        mode: "onBlur",
    });

    const onSubmit = async (values: NewCompanyTypeFormValues) => {
      try {
          
        await createDoc("CRM Company Type", values)
        
        await mutate("CRM Company Type")
        toggleNewCompanyTypeDialog()
        toast({
            title: "Success!",
            description: `Company Type: ${values.company_type_name} created successfully!`,
            variant: "success"
        })
      } catch (error) {
        console.log("error", error)
        toast({
            title: "Failed!",
            description: error?.message || "Failed to create company!",
            variant: "destructive"
        })
      }
    }

    console.log("form", form.getValues("company_type_name"))

    return (
        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.stopPropagation();
                return form.handleSubmit(onSubmit)(event);
              }}
              className="space-y-6 py-4 mb-4"
            >
              <FormField
                  control={form.control}
                name="company_type_name"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel className="flex">Company Type Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                          <FormControl>
                              <Input placeholder="Enter Company Type Name" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              {createLoading ? (
                <div className="flex items-center justify-center gap-2">
                  creating...
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <Button className="flex-1" type="submit">
                    Confirm
                  </Button>
                  <Button variant={"outline"} className="flex-1" onClick={toggleNewCompanyTypeDialog}>
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
    )
}

export default NewCompanyTypeForm;