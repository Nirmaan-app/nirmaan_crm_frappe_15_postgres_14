import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useViewport } from "@/hooks/useViewPort";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMPRojects } from "@/types/NirmaanCRM/CRMProjects";
import { formatDate } from "@/utils/FormatDate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { NewProjectForm } from "./NewProjectScreens";

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
    project_status: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const Project = () => {

    // const [searchParams] = useSearchParams();
    const {isDesktop} = useViewport()
    const navigate = useNavigate()
    // const id = searchParams.get("id")

    const [id] = useStateSyncedWithParams<string>("id", "")
    
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

    const {data, isLoading: dataLoading, mutate : dataMutate} = useFrappeGetDoc<CRMPRojects>("CRM Projects", id, id ? undefined : null)

    const {data : projectCompany, isLoading: projectCompanyLoading} = useFrappeGetDoc<CRMCompany>("CRM Company", data?.project_company, data?.project_company ? undefined : null)

    const {data : projectContact, isLoading: projectContactLoading} = useFrappeGetDoc<CRMContacts>("CRM Contacts", data?.project_contact, data?.project_contact ? undefined : null)

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            project_name: data?.project_name,
            project_size: data?.project_size,
            project_type: data?.project_type,
            project_company: {value: data?.project_company, label: projectCompany?.company_name},
            project_contact: {value: data?.project_contact, label: `${projectContact?.first_name} ${projectContact?.last_name}`},
            project_location: data?.project_location,
            project_packages: data?.project_packages,
            project_status: data?.project_status,
            boq_date: data?.boq_date,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (data) {
          form.reset({
            project_name: data?.project_name,
            project_size: data?.project_size,
            project_type: data?.project_type,
            project_company: {value: data?.project_company, label: projectCompany?.company_name},
            project_contact: {value: data?.project_contact, label: `${projectContact?.first_name} ${projectContact?.last_name}`},
            project_location: data?.project_location,
            project_packages: data?.project_packages,
            project_status: data?.project_status,
            boq_date: data?.boq_date,
          });
        }
    }, [data, form, projectCompany, projectContact]);

    const onSubmit = async (values: ProjectFormValues) => {
        try {
            const isValid = await form.trigger()
            if(isValid) {
                await updateDoc("CRM Projects", data?.name, {
                  project_name: values?.project_name,
                  project_size: values?.project_size,
                  project_type: values?.project_type,
                  project_company: values.project_company?.value,
                  project_contact: values.project_contact?.value,
                  project_location: values?.project_location,
                  project_packages: values?.project_packages,
                  project_status: values?.project_status,
                  boq_date: values?.boq_date,
                })

                await dataMutate()
                await mutate("CRM Projects")

                toggleEditDialog()

                toast({
                    title: "Success!",
                    description: "Project updated successfully!",
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
            await deleteDoc("CRM Projects", data?.name)

            await mutate("CRM Projects")
            toast({
                title: "Success!",
                description: `Project: ${data?.project_name} deleted successfully!`,
                variant: "success"
            })
            navigate(-1)

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

    return (
        <div className="dark:text-white space-y-4">
            <section>
                <div className="font-medium mb-2 flex items-center gap-1">
                    {isDesktop && (
                        <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
                    )}
                    <h2 className="font-medium">Project Details</h2>
                </div>
                <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Name</p>
                                <p className="text-sm font-semibold text-destructive">{data?.project_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Size</p>
                                <p className="text-sm font-semibold text-destructive">{data?.project_size || "--"}</p>
                            </div>
                            <div>
                                <p className="text-xs">Date Created</p>
                                <p className="text-sm font-semibold text-destructive">{formatDate(data?.creation) || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Location</p>
                                <p className="text-sm font-semibold text-destructive">{data?.project_location || "--"}</p>
                            </div>
                            <div className="text-end">
                                <p className="text-xs">Package</p>
                                <p className="text-sm font-semibold text-destructive">{data?.project_packages || "--"}</p>
                            </div>
                            <div className="text-end">
                                <p className="text-xs">Status</p>
                                <p className="text-sm font-semibold text-destructive">{data?.project_status || "--"}</p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Company Name</p>
                                <p className="text-sm font-semibold text-destructive">{projectCompany?.company_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Contact Name</p>
                                <p className="text-sm font-semibold text-destructive">{projectContact?.first_name} {projectContact?.last_name}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="text-end">
                                <p className="text-xs">Location</p>
                                <p className="text-sm font-semibold text-destructive">{projectCompany?.company_location || "--"}</p>
                            </div>
                            <div className="text-end">
                                <p className="text-xs">Designation</p>
                                <p className="text-sm font-semibold text-destructive">{projectContact?.designation || "--"}</p>
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
                    <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
                        <AlertDialogHeader className="text-start">
                            <AlertDialogTitle className="text-destructive text-center">Edit Project</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                              <NewProjectForm form={form} edit={true} />
                          </AlertDialogDescription>

                        <div className="flex items-end gap-2">
                            <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
                            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                        </div>
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>
            </section>

        </div>
    )
}