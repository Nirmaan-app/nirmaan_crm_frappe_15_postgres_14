// src/pages/BOQs/BOQ.tsx

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useViewport } from "@/hooks/useViewPort";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ"; // 1. Use new type
import { formatDate } from "@/utils/FormatDate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeDeleteDoc, useFrappeGetDoc, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { ArrowLeft, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { NewBoqForm } from "./NewBoqForm"; // 2. Use new form component

// 3. Define a new schema for the BOQ form
const boqFormSchema = z.object({
    boq_name: z
        .string({ required_error: "Required!" })
        .min(3, { message: "Minimum 3 characters required!" }),
    boq_company: 
        z.object({ label: z.string(), value: z.string() }),
    boq_contact: 
        z.object({ label: z.string(), value: z.string() }),
    submission_date: 
        z.string({ required_error: "Submission date is required" }),
    boq_value: z.coerce.number().optional(),
    boq_status: z.string().optional(),
    // Add any other fields from your BOQ doctype here
});

type BOQFormValues = z.infer<typeof boqFormSchema>;

// 4. Rename the component
export const BOQ = () => {
    const { isDesktop } = useViewport();
    const navigate = useNavigate();
    const [id] = useStateSyncedWithParams<string>("id", "");
    
    const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
    const { deleteDoc, loading: deleteLoading } = useFrappeDeleteDoc();

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const toggleEditDialog = () => setEditDialogOpen(!editDialogOpen);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const toggleDeleteDialog = () => setDeleteDialog(!deleteDialog);

    const { mutate } = useSWRConfig();

    // 5. Fetch from "CRM BOQ" Doctype
    const { data, isLoading: dataLoading, mutate: dataMutate } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", id, { enabled: !!id });

    // 6. Fetch related data using new BOQ field names
    const { data: boqCompany } = useFrappeGetDoc<CRMCompany>("CRM Company", data?.boq_company, { enabled: !!data?.boq_company });
    const { data: boqContact } = useFrappeGetDoc<CRMContacts>("CRM Contacts", data?.boq_contact, { enabled: !!data?.boq_contact });

    const form = useForm<BOQFormValues>({
        resolver: zodResolver(boqFormSchema),
        defaultValues: {}, // Will be set by useEffect
        mode: "onBlur",
    });

    useEffect(() => {
        if (data) {
          // 7. Update form.reset with new BOQ fields
          form.reset({
            boq_name: data.boq_name,
            boq_company: { value: data.boq_company, label: boqCompany?.company_name },
            boq_contact: { value: data.boq_contact, label: `${boqContact?.first_name} ${boqContact?.last_name}` },
            submission_date: data.submission_date,
            boq_value: data.boq_value,
            boq_status: data.boq_status,
          });
        }
    }, [data, form, boqCompany, boqContact]);

    const onSubmit = async (values: BOQFormValues) => {
        try {
            const isValid = await form.trigger();
            if(isValid) {
                // 8. Update "CRM BOQ" Doctype
                await updateDoc("CRM BOQ", data?.name, {
                  boq_name: values.boq_name,
                  boq_company: values.boq_company?.value,
                  boq_contact: values.boq_contact?.value,
                  submission_date: values.submission_date,
                  boq_value: values.boq_value,
                  boq_status: values.boq_status,
                });

                await dataMutate();
                await mutate("CRM BOQ"); // Mutate BOQ list key
                toggleEditDialog();

                toast({
                    title: "Success!",
                    description: "BOQ updated successfully!", // Updated toast message
                    variant: "success",
                });
            }
        } catch (error) {
            toast({
                title: "Failed!",
                description: `${error?.Error || error?.message}`,
                variant: "destructive",
            });
        }
    };

    const handleConfirmDelete = async () => {
        try {
            // 9. Delete from "CRM BOQ"
            await deleteDoc("CRM BOQ", data?.name);
            await mutate("CRM BOQ");
            toast({
                title: "Success!",
                description: `BOQ: ${data?.boq_name} deleted successfully!`, // Updated toast message
                variant: "success",
            });
            navigate(-1);
            toggleDeleteDialog();
        } catch (error) {
            toast({
                title: "Failed!",
                description: `${error?.Error || error?.message}`,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="dark:text-white space-y-4">
            <section>
                <div className="font-medium mb-2 flex items-center gap-1">
                    {isDesktop && <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />}
                    {/* 10. Update all static text and displayed data */}
                    <h2 className="font-medium">BOQ Details</h2>
                </div>
                <div className="p-4 border cardBorder shadow rounded-md flex flex-col gap-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">BOQ Name</p>
                                <p className="text-sm font-semibold text-destructive">{data?.boq_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Value</p>
                                <p className="text-sm font-semibold text-destructive">{data?.boq_value || "--"}</p>
                            </div>
                            <div>
                                <p className="text-xs">Date Created</p>
                                <p className="text-sm font-semibold text-destructive">{formatDate(data?.creation) || "--"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 text-end">
                            <div>
                                <p className="text-xs">Submission Date</p>
                                <p className="text-sm font-semibold text-destructive">{formatDate(data?.submission_date) || "--"}</p>
                            </div>
                            <div>
                                <p className="text-xs">Status</p>
                                <p className="text-sm font-semibold text-destructive">{data?.boq_status || "--"}</p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-xs">Company Name</p>
                                <p className="text-sm font-semibold text-destructive">{boqCompany?.company_name}</p>
                            </div>
                            <div>
                                <p className="text-xs">Contact Name</p>
                                <p className="text-sm font-semibold text-destructive">{boqContact?.first_name} {boqContact?.last_name}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6 text-end">
                            <div>
                                <p className="text-xs">Company Location</p>
                                <p className="text-sm font-semibold text-destructive">{boqCompany?.company_location || "--"}</p>
                            </div>
                            <div>
                                <p className="text-xs">Contact Designation</p>
                                <p className="text-sm font-semibold text-destructive">{boqContact?.designation || "--"}</p>
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
                            <AlertDialogTitle className="text-destructive text-center">Edit BOQ</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                              <NewBoqForm form={form} edit={true} />
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
    );
};