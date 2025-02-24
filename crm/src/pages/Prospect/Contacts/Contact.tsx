import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { Plus, SquarePen, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactSelect from 'react-select';
import * as z from "zod";

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

    const { taskDialog, toggleTaskDialog, overlayOpen, setOverlayOpen } = useApplicationContext()
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const id = searchParams.get("id")
    const {updateDoc, loading: updateLoading} = useFrappeUpdateDoc()
    const {deleteDoc, loading: deleteLoading} = useFrappeDeleteDoc()

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const toggleEditDialog = () => {
        setEditDialogOpen(!editDialogOpen);
    };

    const [deleteDialog, setDeleteDialog] = useState(false);
    const toggleDeleteDialog = () => {
        setDeleteDialog(!deleteDialog);
    };

    const [isOpen, setIsOpen] = useState(false);
    const handleClose = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).id === "overlay") {
        setIsOpen(false);
      }
    };

    const {mutate} = useSWRConfig()

    const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc("CRM Contacts", id, id ? undefined : null)

    const {data : contactCompany, isLoading: contactCompanyLoading} = useFrappeGetDoc("CRM Company", data?.company, data?.company ? undefined : null)

    const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList("CRM Company", {
        fields: ["name", "company_name"],
        limit: 1000,
    }, "CRM Company")

    const {data : tasksData, isLoading: tasksDataLoading} = useFrappeGetDocList("CRM Task", {
      fields: ["*"],
      filters: [["reference_doctype", "=", "CRM Contacts"], ["reference_docname", "=", id]],
      limit: 1000,
    }, id ? `CRM Task ${id}` : null)

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

    const onSubmit = async (values: ContactFormValues) => {
        try {
            const isValid = await form.trigger()
            if(isValid) {
                await updateDoc("CRM Contacts", data?.name, {
                    first_name: values.first_name,
                    last_name: values.last_name,
                    company: values.company,
                    designation: values.designation,
                    email: values.email,
                    mobile: values.mobile,
                })

                await dataMutate()
                await mutate("CRM Contacts")

                toggleEditDialog()

                toast({
                    title: "Success!",
                    description: "Contact updated successfully!",
                    variant: "success"
                })
            }
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: `${error?.Error || error?.message}`,
                variant: "destructive"
            })
        }
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteDoc("CRM Contacts", data?.name)

            await mutate("CRM Contacts")
            toast({
                title: "Success!",
                description: `Contact: ${data?.first_name} ${data?.last_name} deleted successfully!`,
                variant: "success"
            })
            navigate('/prospects?tab=contact')

            toggleDeleteDialog()

        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: `${error?.Error || error?.message}`,
                variant: "destructive"
            })
        }
    }

    const companyOptions = companiesList?.map(com => ({label : com?.company_name, value : com?.name}));

    return (
        <div className="dark:text-white space-y-4">
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
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.industry || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Location</p>
                                <p className="text-sm font-semibold text-destructive">{contactCompany?.company_location || "--"}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={toggleEditDialog} variant="outline" className="text-destructive border-destructive">
                        <SquarePen />
                        Edit
                    </Button>
                    <Button onClick={toggleDeleteDialog} variant="outline" className="text-destructive border-destructive">
                        <Trash2 />
                        Delete
                    </Button>
                </div>

                <AlertDialog open={deleteDialog} onOpenChange={toggleDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription className="flex gap-2 items-end">
                            <Button onClick={handleConfirmDelete} className="flex-1">Delete</Button>
                            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                        </AlertDialogDescription>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={editDialogOpen} onOpenChange={toggleEditDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader className="text-start">
                            <AlertDialogTitle className="text-destructive text-center">Edit Contact</AlertDialogTitle>
                            <AlertDialogDescription asChild>
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
                                <FormLabel className="flex">Company<sup className="text-sm text-destructive">*</sup></FormLabel>
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
                            <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
                            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                        </div>
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>
            </section>

            <Separator />

            <section>
                <h2 className="font-medium mb-2">Actions</h2>
                <div className="p-4 shadow rounded-md flex flex-col gap-4">
                    <Table>
                      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[30%]">Task</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[5%]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasksData?.length ? (
                            tasksData?.map(task => (
                                <TableRow key={task?.name}>
                                  <TableCell className="font-medium">{task?.type}</TableCell>
                                  <TableCell>{task?.start_date}</TableCell>
                                  <TableCell>{task?.status}</TableCell>
                                  <TableCell>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" fill="none">
                                      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.70832 6.28927C7.89579 6.4768 8.00111 6.73111 8.00111 6.99627C8.00111 7.26144 7.89579 7.51575 7.70832 7.70327L2.05132 13.3603C1.95907 13.4558 1.84873 13.532 1.72672 13.5844C1.60472 13.6368 1.4735 13.6644 1.34072 13.6655C1.20794 13.6667 1.07626 13.6414 0.953366 13.5911C0.83047 13.5408 0.718817 13.4666 0.624924 13.3727C0.531032 13.2788 0.456778 13.1671 0.406498 13.0442C0.356217 12.9213 0.330915 12.7897 0.332069 12.6569C0.333223 12.5241 0.360809 12.3929 0.413218 12.2709C0.465627 12.1489 0.541809 12.0385 0.637319 11.9463L5.58732 6.99627L0.637319 2.04627C0.455161 1.85767 0.354367 1.60507 0.356645 1.34287C0.358924 1.08068 0.464092 0.829864 0.6495 0.644456C0.834909 0.459047 1.08572 0.353879 1.34792 0.3516C1.61011 0.349322 1.86272 0.450116 2.05132 0.632274L7.70832 6.28927Z" fill="black" fill-opacity="0.9"/>
                                    </svg>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-2">
                                    No Tasks Found
                                </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </div>
            </section>

            <section>
                <h2 className="font-medium mb-2">Last Remark</h2>
                <div className="p-4 shadow rounded-md flex flex-col gap-4">
                    hello
                </div>
            </section>

            <div className="fixed z-30 bottom-24 right-6 flex flex-col items-end gap-4">
              {overlayOpen && (
                <div
                  className="p-4 bg-destructive text-white shadow-lg rounded-lg flex flex-col gap-2"
                  style={{ transition: "opacity 0.3s ease-in-out" }}
                >
                  <button>New Project</button>
                  <Separator />
                  <button onClick={() => {
                    toggleTaskDialog()
                    setOverlayOpen(!overlayOpen)
                  }}>New Task</button>
                </div>
              )}
              <button
                onClick={() => setOverlayOpen(!overlayOpen)}
                className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 ${
                    overlayOpen ? "rotate-90" : "rotate-0"
                }`}
              >
                {overlayOpen ? <X size={24} /> : <Plus size={24} />}
              </button>
            </div>
        </div>
    )
}