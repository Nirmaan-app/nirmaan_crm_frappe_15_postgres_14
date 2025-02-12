import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { SquarePen, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ReactSelect from 'react-select'
import { toast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
    first_name: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!"
        }),
    last_name: z.string({
        required_error: "Required!"
        })
        .min(1, {
            message: "Minimum a character is required!"
        }),
    company: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    designation: z
        .string()
        .optional(),
    email: z.string().email().optional().or(z.literal('')),
    mobile: z
        .string()
        .max(10, { message: "Mobile number must be of 10 digits" })
        .min(10, { message: "Mobile number must be of 10 digits" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const Contact = () => {

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id")
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const toggleEditDialog = () => {
        setEditDialogOpen(!editDialogOpen);
    };

    const {data, isLoading: dataLoading} = useFrappeGetDoc("CRM Contacts", id, id ? undefined : null)

    const {data : contactCompany, isLoading: contactCompanyLoading} = useFrappeGetDoc("CRM Company", data?.company, data?.company ? undefined : null)

    const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
        fields: ["name", "company_name"],
        limit: 1000,
      }, "CRM Company")

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            first_name: data?.first_name,
            last_name: data?.last_name,
            designation: data?.designation,
            email: data?.email,
            mobile: data?.mobile,
            company: data?.company,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (data) {
          form.reset({
            first_name: data?.first_name,
            last_name: data?.last_name,
            designation: data?.designation,
            email: data?.email,
            mobile: data?.mobile,
            company: data?.company,
          });
        }
    }, [data, form]);

    const onSubmit = (data: ContactFormValues) => {
        console.log(data);
    };

    const companyOptions = companiesList?.map(com => ({label : com?.company_name, value : com?.name}));

    return (
        <div className="dark:text-white">
            <section>
                <h2 className="font-medium mb-2">Contact Details</h2>
                <div className="p-4 shadow rounded-md flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Name</p>
                                <p className="text-sm font-semibold text-destructive">{data?.first_name} {data?.last_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Email</p>
                                <p className="text-sm font-semibold text-destructive">{data?.email || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Designation</p>
                                <p className="text-sm font-semibold text-destructive">{data?.designation || "--"}</p>
                            </div>
                            <div className="text-end">
                                <p className="text-xs">Mobile</p>
                                <p className="text-sm font-semibold text-destructive">{data?.mobile || "--"}</p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Company Name</p>
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.company_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Company Type</p>
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.company_type}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Location</p>
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.company_address || "--"}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={toggleEditDialog} variant="outline" className="text-destructive border-destructive">
                        <SquarePen />
                        Edit
                    </Button>
                    <Button variant="outline" className="text-destructive border-destructive">
                        <Trash2 />
                        Delete
                    </Button>
                </div>

                <AlertDialog open={editDialogOpen} onOpenChange={toggleEditDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader className="text-start">
                            <AlertDialogTitle className="text-destructive text-center">Edit Contact</AlertDialogTitle>
                            <AlertDialogDescription>
                            <Form {...form}>
                <form
                    onSubmit={(event) => {
                        event.stopPropagation();
                        return form.handleSubmit(onSubmit)(event);
                    }}
                    className="space-y-4 py-4"
                >
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">First Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter First Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Last Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Last Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Company Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <ReactSelect defaultValue={companyOptions.find(i => i?.value === field.value)} className="text-sm text-muted-foreground" placeholder="Select Company" options={companyOptions} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Designation</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Designation" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Mobile Number"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Email ID" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
                                
                            </AlertDialogDescription>

                        <div className="flex items-end gap-2">
                            <Button className="flex-1">Save</Button>
                            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                        </div>
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>
            </section>
        </div>
    )
}