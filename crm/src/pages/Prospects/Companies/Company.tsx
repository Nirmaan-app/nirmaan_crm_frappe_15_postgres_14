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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { toast } from "@/hooks/use-toast";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useViewport } from "@/hooks/useViewPort";
import { CRMCompanyType } from "@/types/NirmaanCRM/CRMCompanyType";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMPRojects } from "@/types/NirmaanCRM/CRMProjects";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ReactSelect from 'react-select';
import * as z from "zod";
import { CompanyContacts, CompanyDetails, CompanyProjects } from "./CompanyDetails";

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

    const {isMobile} = useViewport()
    const { overlayOpen, setOverlayOpen } = useApplicationContext()
    const navigate = useNavigate()
    const {updateDoc, loading: updateLoading} = useFrappeUpdateDoc()
    const {deleteDoc, loading: deleteLoading} = useFrappeDeleteDoc()

    const [id] = useStateSyncedWithParams<string>("id", "");

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const toggleEditDialog = useCallback(() => {
        setEditDialogOpen(!editDialogOpen);
    }, [editDialogOpen]);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const toggleDeleteDialog = useCallback(() => {
        setDeleteDialog(!deleteDialog);
    }, [deleteDialog]);

    const [innerTab, setInnerTab] = useStateSyncedWithParams<"details" | "projects" | "contacts">("innerTab", "details");

    const handleChangeInnerTab = useCallback((e : "details" | "projects" | "contacts") => {
        if(innerTab === e) return;
        setInnerTab(e);
    }, [innerTab, setInnerTab]);

    const {mutate} = useSWRConfig()

    const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc("CRM Company", id, id ? undefined : null)

    const {data : companyTypesList, isLoading: companyTypesListLoading} = useFrappeGetDocList<CRMCompanyType>("CRM Company Type", {
        fields: ["*"],
        limit: 1000
    })

    const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
        fields: ["*"],
        filters: [["company", "=", id]],
        limit: 1000,
    }, id ? `CRM Contacts ${id}` : null)

    const {data : companyProjects, isLoading: companyProjectsLoading} = useFrappeGetDocList<CRMPRojects>("CRM Projects", {
        fields: ["*"],
        filters: [["project_company", "=", id]],
        limit: 1000
    }, id ? `CRM Projects ${id}` : null)


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

    const onSubmit = async (values: CompanyFormValues) => {
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

    const companyTypeOptions = useMemo(() => companyTypesList?.map(com => ({label : com?.name, value : com?.name})) || [], [companyTypesList])

    return (
        <div className="dark:text-white">
            {isMobile ? (
                    <>
                        <h2 className="font-medium mb-2">Company Details</h2>
                        <CompanyDetails data={data} toggleEditDialog={toggleEditDialog} toggleDeleteDialog={toggleDeleteDialog} />
                    </>
                ) : (
                    <Tabs onValueChange={(e) => handleChangeInnerTab(e)} defaultValue={innerTab}>
                        <div className="flex items-center justify-between relative">
                        <TabsList>
                            <TabsTrigger value="details">Company Details</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="contacts">Contacts</TabsTrigger>
                        </TabsList>
                        {
                            innerTab === "projects" &&
                                <Button>
                                    <Plus className="w-4 h-4" />
                                    New Project
                                </Button>
                            }
                        {
                            innerTab === "contacts" && (
                                <Button>
                                    <Plus className="w-4 h-4" />
                                    New Contact
                                </Button>
                            ) 
                        }
                        </div>
                        <TabsContent value="details">
                            <CompanyDetails data={data} toggleEditDialog={toggleEditDialog} toggleDeleteDialog={toggleDeleteDialog} />
                        </TabsContent>
                        <TabsContent value="projects">
                            <CompanyProjects projectsData={companyProjects} contactsData={contactsList} />
                        </TabsContent>
                        <TabsContent value="contacts">
                            <CompanyContacts contactsData={contactsList} />
                        </TabsContent>
                    </Tabs>
                )}
            {isMobile && (
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
            )}

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