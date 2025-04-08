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
import { toast } from "@/hooks/use-toast";
import { useViewport } from "@/hooks/useViewPort";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ReactSelect from 'react-select';
import * as z from "zod";

const projectFormSchema = z.object({
    project_name: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    project_company: 
    // z.string({
    //   required_error: "Required!"
    //     })
    //     .min(3, {
    //         message: "Minimum 3 characters required!",
    //     }),
    z.object({
        label: z.string(),
        value: z.string(),
      }),
    project_contact: 
    // z.string({
    //   required_error: "Required!"
    //     })
    //     .min(3, {
    //         message: "Minimum 3 characters required!",
    //     }),
    z.object({
      label: z.string(),
      value: z.string(),
    }),
    boq_date: z
        .string({
            required_error: "Project must have a BOQ date"
        }),
    project_location: z.string().optional(),
    project_size: z.string().optional(),
    project_type: z.string().optional(),
    project_packages: z.string().optional(),
    project_status: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const NewProjectScreens = () => {

    const navigate = useNavigate()
    const {mutate} = useSWRConfig()
    const {createDoc , loading: createLoading} = useFrappeCreateDoc()

    const form = useForm<ProjectFormValues>({
      resolver: zodResolver(projectFormSchema),
      defaultValues: {},
      mode: "onBlur",
  });

    const onSubmit = async (values: ProjectFormValues) => {
        try {
            const isValid = await form.trigger()
            if(isValid) {
                const res = await createDoc("CRM Projects", {
                    project_name: values.project_name,
                    project_company: values.project_company?.value,
                    project_contact: values.project_contact?.value,
                    project_location: values.project_location,
                    project_size: values.project_size,
                    project_type: values.project_type,
                    boq_date: values.boq_date,
                })
                await mutate("CRM Projects")

                navigate(-1)

                toast({
                    title: "Success!",
                    description: `Project ${res.project_name} created successfully!`,
                    variant: "success"
                })
            }
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: "Failed to create Project!",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="w-full h-full relative">
            <NewProjectForm form={form} />
            <div className="sticky bottom-0 flex flex-col gap-2">
                <Button onClick={() => onSubmit(form.getValues())}>Next</Button>
                <Button onClick={() => navigate(-1)} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
            </div>
        </div>
    )
}

export const NewProjectForm = ({form, edit = false} : {form : UseFormReturn<ProjectFormValues>, edit? : boolean}) => {

  const {isMobile} = useViewport()
  const {data: companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
    fields: ["name", "company_name"],
    limit: 1000,
    orderBy: {field: "company_name", order: "asc"}
  })

  const companySelected = form.watch("project_company")

  const {data: contactsList, isLoading: contactsListLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
    fields: ["name", "first_name", "last_name"],
    filters: [["company", "=", companySelected?.value]],
    limit: 1000,
    orderBy: {field: "first_name", order: "asc"}
  })

  const companyOptions = useMemo(() => companiesList?.map(com => ({label : com?.company_name, value : com?.name})) || [], [companiesList]);

  const contactOptions = useMemo(() => contactsList?.map(con => ({label : `${con?.first_name} ${con?.last_name}`, value : con?.name})) || [], [contactsList]);

  return (
        <div className={`w-full relative ${!isMobile && !edit ? "p-4 border cardBorder shadow rounded-lg" : ""}`}>
             {!isMobile && !edit && (
                <h2 className="text-center font-bold">Add New Project</h2>
            )}
            <Form {...form}>
                <form
                    // onSubmit={(event) => {
                    //     event.stopPropagation();
                    //     return form.handleSubmit(onSubmit)(event);
                    // }}
                    className="space-y-6 py-4 mb-4"
                >
                    <FormField
                        control={form.control}
                        name="project_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Project Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Project Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="project_size"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Project Size</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Project Size" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />

                          <FormField
                            control={form.control}
                            name="project_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex">Project Type</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Project Type" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="project_location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex">Project Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Project Location" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    <FormField
                        control={form.control}
                        name="boq_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">BOQ Date</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date"
                                        placeholder="DD/MM/YYYY"
                                        {...field}
                                        // max={new Date().toISOString().split("T")[0]}
                                        // onKeyDown={(e) => e.preventDefault()}
                                     />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="project_company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                     <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Company" options={companyOptions} onBlur={field.onBlur} name={field.name} value={field.value} onChange={(e) => field.onChange(e)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="project_contact"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Contact Name</FormLabel>
                                <FormControl>
                                    <ReactSelect isLoading={contactsListLoading} className="text-sm text-muted-foreground" placeholder="Select Contact" options={contactOptions} value={field.value} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {edit && (
                      <>
                      <FormField
                            control={form.control}
                            name="project_packages"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex">Project Packages</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Package names separated by commas" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="project_status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex">Project Status</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Project Status" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        </>
                    )}
                </form>
            </Form>
        </div>
  )
}