// pages/Users/NewUserForm.tsx

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappePostCall } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useMemo } from "react";

// 1. Zod schema for form validation
const newUserSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  first_name: z.string().min(2, "Name is required."),
  role_profile_name: z.string().min(1, "Role Profile is required."),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

interface NewUserFormProps {
  onSuccess?: () => void;
}

export const NewUserForm = ({ onSuccess }: NewUserFormProps) => {
  // 2. Hook to call our custom Python API method
  const { call, loading } = useFrappePostCall('nirmaan_crm.api.add_crm_user.create_crm_user');

  // Hardcoded role profiles for the dropdown
  const roleProfileOptions = useMemo(() => [
    { label: "Nirmaan Sales User Profile", value: "Nirmaan Sales User Profile" },
    { label: "Nirmaan Estimations User Profile", value: "Nirmaan Estimations User Profile" },
    { label: "Nirmaan Admin User Profile", value: "Nirmaan Admin User Profile" },
  ], []);

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { email: "", first_name: "", role_profile_name: "" },
  });

  // 3. onSubmit function that calls the backend
  const onSubmit = async (values: NewUserFormValues) => {
    try {
      await call({
        email: values.email,
        first_name: values.first_name,
        role_profile_name: values.role_profile_name,
      });
      toast({
        title: "Success!",
        description: `User ${values.email} has been created.`,
        variant: "success",
      });
      onSuccess?.(); // This would typically close the dialog
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input type="email" placeholder="e.g. jane.doe@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role_profile_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Profile</FormLabel>
              <FormControl>
                <ReactSelect
                  options={roleProfileOptions}
                  value={roleProfileOptions.find(opt => opt.value === field.value)}
                  onChange={val => field.onChange(val?.value)}
                  placeholder="Select a role profile..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>
            {loading ? "Creating User..." : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  );
};