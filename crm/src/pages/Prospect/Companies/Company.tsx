import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFrappeGetDoc, useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig, useFrappeDeleteDoc } from "frappe-react-sdk";
import { SquarePen, Trash2, Plus, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useController } from "react-hook-form";
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
import { useNavigate } from "react-router-dom";
import { useApplicationContext } from "@/contexts/ApplicationContext";

const companyFormSchema = z.object({
    company_name: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    company_location: z.string().optional(),
    company_website : z.string().optional(),
    industry : z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const Company = () => {

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

    const {mutate} = useSWRConfig()

    const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc("CRM Company", id, id ? undefined : null)

    const {data : companyTypesList, isLoading: companyTypesListLoading} = useFrappeGetDocList("CRM Company Type", {
        fields: ["*"],
        limit: 1000
    })

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {
            company_name: data?.company_name,
            company_location: data?.company_location,
            company_website : data?.company_website ? data?.company_website?.slice(8) : undefined,
            industry : data?.industry,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (data) {
          form.reset({
            company_name: data?.company_name,
            company_location: data?.company_location,
            company_website: data?.company_website ? data?.company_website?.slice(8) : undefined,
            industry : data?.industry,
          });
        }
    }, [data, form]);

    const onSubmit = async (values: ContactFormValues) => {
        try {
            const isValid = await form.trigger()
            if(isValid) {
                await updateDoc("CRM Company", data?.name, {
                    company_name: values.company_name,
                    company_location: values.company_location,
                    company_website: values?.company_website && (!values.company_website.startsWith("https://") ? `https://${values.company_website}` : values.company_website),
                    industry: values.industry,
                })

                await dataMutate()
                await mutate("CRM Company")

                toggleEditDialog()

                toast({
                    title: "Success!",
                    description: `Company: ${data?.company_name} updated successfully!`,
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
            await deleteDoc("CRM Company", data?.name)

            await mutate("CRM Company")
            toast({
                title: "Success!",
                description: `Company: ${data?.company_name} deleted successfully!`,
                variant: "success"
            })
            navigate('/prospects?tab=company')

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

    const companyTypeOptions = companyTypesList?.map(com => ({label : com?.name, value : com?.name}));

    return (
        <div className="dark:text-white">
            <section>
                <h2 className="font-medium mb-2">Company Details</h2>
                <div className="p-4 shadow rounded-md flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Company Name</p>
                                <p className="text-sm font-semibold text-destructive">{data?.company_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Company Type</p>
                                <p className="text-sm font-semibold text-destructive">{data?.industry || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Location</p>
                                <p className="text-sm font-semibold text-destructive">{data?.company_location || "--"}</p>
                            </div>
                            <div className="text-end">
                                <p className="text-xs">Website</p>
                                <a  href={data?.company_website} target="_blank" rel="noreferrer">
                                    <p className="text-sm font-semibold text-destructive underline">{data?.company_website || "--"}</p>
                                </a>
                                {/* <p className="text-sm font-semibold text-destructive">{data?.company_website || "--"}</p> */}
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Total Projects</p>
                                <p className="text-sm font-semibold text-destructive">N/A</p>
                            </div>
                            <div>
                                <p className="text-xs">Total Contacts</p>
                                <p className="text-sm font-semibold text-destructive">N/A</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Active Projects</p>
                                <p className="text-sm font-semibold text-destructive">N/A</p>
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
                        name="company_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Company Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Company Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="company_location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Location</FormLabel>
                                <FormControl>
                                <Input placeholder="Enter Location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="company_website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <WebsiteInput control={form.control} name="company_website" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Company Type</FormLabel>
                                <FormControl>
                                    <ReactSelect defaultValue={companyTypeOptions.find(i => i?.value === field.value)} className="text-sm text-muted-foreground" placeholder="Select Company Type" options={companyTypeOptions} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} />
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

            <div className="fixed z-30 bottom-24 right-6 flex flex-col items-end gap-4">
              {overlayOpen && (
                <div
                  className="p-4 bg-destructive text-white shadow-lg rounded-lg flex flex-col gap-2"
                  style={{ transition: "opacity 0.3s ease-in-out" }}
                >
                  <button>New Contact</button>
                  <Separator />
                  <button >New Project</button>
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

const WebsiteInput = ({ control, name }) => {
    const { field } = useController({ control, name });
  
    const handleChange = (e) => {
      let value = e.target.value;
      field.onChange(value);
    };
  
    return (
      <div className="relative w-full">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-semibold select-none">
          https://
        </span>
  
        <Input
          type="text"
          className="pl-[80px]"
          placeholder="Enter Company Website"
          value={field.value}
          onChange={handleChange}
        />
      </div>
    );
  };