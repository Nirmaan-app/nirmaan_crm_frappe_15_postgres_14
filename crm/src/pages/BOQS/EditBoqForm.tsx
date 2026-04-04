import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect, { MenuPosition } from "react-select";
import { useEffect, useMemo } from "react";
import { BOQmainStatusOptions } from "@/constants/dropdownData";
import { boqFormSchema, boqDetailsSchema } from "@/constants/boqZodValidation"
import { LocationOptions } from "@/constants/dropdownData";
import { INVALID_NAME_CHARS_REGEX } from "@/constants/nameValidation";
import { PackagesMultiSelect } from "./components/PackagesMultiSelect";
import { parsePackages, serializePackages } from "@/constants/boqPackages";

const normalizeStatus = (status?: string) =>
  (status || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const boqStatusOnlySchema = z.object({
  boq_status: z.string().min(1, "Status is required"),
  remarks: z.string().optional(),
}).superRefine((data, ctx) => {
  const normalizedStatus = normalizeStatus(data.boq_status);
  if (["negotiation", "lost", "dropped", "hold"].includes(normalizedStatus) && (!data.remarks || data.remarks.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Remarks are required for "${data.boq_status}" status.`,
      path: ["remarks"],
    });
  }
});

type EditBoqFormValues = z.infer<typeof boqFormSchema>;

interface EditBoqFormProps { onSuccess?: () => void; }

export const EditBoqForm = ({ onSuccess }: EditBoqFormProps) => {
  const { editBoq, closeEditBoqDialog } = useDialogStore();
  const { boqData, mode } = editBoq.context;

  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { mutate } = useSWRConfig();

  // 1. Fetch ALL companies to populate the company dropdown.
  const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>(
    "CRM Company",
    { fields: ["name", "company_name", "company_nick"], limit: 0 }
  );

  // 2. Fetch estimations to check if we should show manual value input
  const { data: estimations } = useFrappeGetDocList<any>(
    "CRM Project Estimation",
    {
      filters: boqData?.name ? [["parent_project", "=", boqData.name]] : [],
      fields: ["value", "document_type"],
      limit: 0
    },
    `project-estimations-edit-${boqData?.name}`
  );

  const hasBoqEstimations = useMemo(() => {
    return (estimations || []).some(e => e.document_type === "BOQ");
  }, [estimations]);

  const totalBoqValue = useMemo(() => {
    return (estimations || [])
      .filter(e => e.document_type === "BOQ")
      .reduce((sum, e) => sum + (Number(e.value) || 0), 0);
  }, [estimations]);

  const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_nick ? `${c.company_name} (${c.company_nick})` : c.company_name, value: c.name })) || [], [allCompanies]);

  const form = useForm<EditBoqFormValues>({
    resolver: zodResolver(mode === 'status' ? boqStatusOnlySchema : boqDetailsSchema),
    defaultValues: {},
  });

  const watchedBoqStatus = form.watch("boq_status");
  const selectedCity = form.watch("city");
  const selectedCompany = form.watch("company");

  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>(
    "CRM Contacts",
    {
      filters: (selectedCompany || boqData?.company) ? [["company", "=", (selectedCompany || boqData?.company) as string]] : [],
      fields: ["name", "first_name", "last_name"],
      limit: 0
    }
  );

  const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);

  useEffect(() => {
    if (boqData) {
      const isStandardCity = LocationOptions.some(opt => opt.value === boqData.city);
      const initialCityValue = isStandardCity ? boqData.city : "Others";
      const initialOtherCityValue = isStandardCity ? "" : boqData.city || "";

      form.reset({
        ...boqData,
        city: initialCityValue || "",
        other_city: initialOtherCityValue,
        boq_type: parsePackages(boqData.boq_type),
        boq_value: Number(boqData.boq_value) || 0,
        boq_size: Number(boqData.boq_size) || 0,
        boq_status: boqData.boq_status || "",
        boq_link: "",
        company: boqData.company || "",
        contact: boqData.contact || "",
        remarks: boqData.remarks || "",
        boq_submission_date: boqData.boq_submission_date || ""
      });
    }
  }, [boqData, form]);

  useEffect(() => {
    const clearFieldsBasedOnStatus = (status: string | undefined) => {
      const normalizedStatus = normalizeStatus(status);
      const deadlineNotRequiredStatuses = new Set(["won", "lost", "dropped", "hold", "negotiation"]);
      if (deadlineNotRequiredStatuses.has(normalizedStatus)) {
        if (form.getValues("boq_submission_date") !== "") {
          form.setValue("boq_submission_date", "", { shouldValidate: true });
          form.clearErrors("boq_submission_date");
        }
      }
      if (["won", "new", "in progress"].includes(normalizedStatus)) {
        if (form.getValues("remarks") !== "") {
          form.setValue("remarks", "", { shouldValidate: true });
          form.clearErrors("remarks");
        }
      }
    };
    clearFieldsBasedOnStatus(watchedBoqStatus);
  }, [watchedBoqStatus, form]);

  const loading = updateLoading;
  const refreshProjectCaches = async (projectId: string) => {
    await Promise.all([
      mutate(`BOQ/${projectId}`),
      mutate(`project-estimations-${projectId}`),
      mutate(`project-estimations-edit-${projectId}`),
      mutate("all-project-estimation-values"),
      mutate("all-boqs-all-view"),
      mutate("home-estimation-review-estimations"),
      mutate("home-estimation-review-projects"),
      mutate((key) => typeof key === 'string' && key.startsWith('all-notes-')),
      mutate((key) => typeof key === 'string' && key.startsWith('all-version-')),
      mutate((key) => typeof key === 'string' && key.startsWith('all-boqs-')),
    ]);
  };

  const onSubmit = async (values: EditBoqFormValues) => {
    try {
      if (!boqData) throw new Error("BOQ data is missing");
      const dataToSave: any = { ...values };

      if (mode === 'status') {
        await updateDoc("CRM BOQ", boqData.name, {
          boq_status: dataToSave.boq_status,
          remarks: dataToSave?.remarks || boqData.remarks,
          boq_sub_status: null,
        });
        toast({ title: "Success", description: "Status updated." });

        await refreshProjectCaches(boqData.name);
        if (onSuccess) onSuccess();
        return;
      }

      if (dataToSave.boq_type && Array.isArray(dataToSave.boq_type)) {
        dataToSave.boq_type = serializePackages(dataToSave.boq_type);
      }
      if (dataToSave.city === "Others") {
        dataToSave.city = dataToSave.other_city?.trim() || "";
      }
      delete dataToSave.other_city;
      if (dataToSave.boq_link && dataToSave.boq_link.trim() !== "") {
        let formattedLink = dataToSave.boq_link.trim();
        if (!formattedLink.startsWith("http://") && !formattedLink.startsWith("https://") && !formattedLink.startsWith("www.")) {
          formattedLink = `https://${formattedLink}`;
        } else if (formattedLink.startsWith("www.")) {
          formattedLink = `https://${formattedLink}`;
        }
        dataToSave.boq_link = formattedLink;
      }
      await updateDoc("CRM BOQ", boqData.name, {
        ...dataToSave, boq_link: dataToSave.boq_link || boqData.boq_link, remarks: dataToSave?.remarks || boqData.remarks, boq_sub_status: null
      });
      toast({ title: "Success", description: "Project details updated." });
      await refreshProjectCaches(boqData.name);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const isRequired = (fieldName: keyof EditBoqFormValues) => {
    const normalizedStatus = normalizeStatus(watchedBoqStatus);
    switch (fieldName) {
      case "boq_submission_date":
        return normalizedStatus === "new" || normalizedStatus === "in progress";
      case "remarks":
        return ["negotiation", "lost", "dropped", "hold"].includes(normalizedStatus);
      default:
        return false;
    }
  };

  const isHidden = (fieldName: keyof EditBoqFormValues | "boq_value") => {
    const normalizedStatus = normalizeStatus(watchedBoqStatus);
    switch (fieldName) {
      case "boq_submission_date":
        return ["won", "lost", "dropped", "hold", "negotiation"].includes(normalizedStatus);
      case "boq_value":
        return ["new", "in progress", "revision pending", "hold"].includes(normalizedStatus);
      default:
        return false;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between items-start text-sm mb-4 border-b pb-2"></div>
        {mode === 'details' && (
          <>
            <FormField
              name="boq_name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name<sup>*</sup></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={(field.value as any) || ""}
                      disabled={true}
                      onChange={(e) => {
                        const sanitizedValue = e.target.value.replace(INVALID_NAME_CHARS_REGEX, "");
                        field.onChange(sanitizedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City<sup>*</sup></FormLabel>
                  <FormControl>
                    <ReactSelect
                      options={LocationOptions}
                      value={LocationOptions.find(c => c.value === field.value)}
                      onChange={val => {
                        field.onChange(val?.value);
                        if (val?.value !== "Others") {
                          form.setValue("other_city", "");
                        }
                      }}
                      placeholder="Select City"
                      menuPosition={'auto' as MenuPosition}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedCity === "Others" && (
              <FormField
                control={form.control}
                name="other_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify City<sup>*</sup></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New City Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              name="boq_type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Packages<sup>*</sup></FormLabel>
                  <FormControl>
                    <PackagesMultiSelect
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select packages..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isHidden("boq_submission_date") && (
              <FormField
                name="boq_submission_date"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Submission Deadline{isRequired("boq_submission_date") && <sup>*</sup>}</FormLabel>
                    <FormControl>
                      <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!isHidden("boq_link") && (
              <FormField
                name="boq_link"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Link{isRequired("boq_link") && <sup>*</sup>}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. https://link.to/drive" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField name="boq_size" control={form.control} render={({ field }) => (<FormItem><FormLabel>Carpet Area (Sqft)</FormLabel><FormControl><div className="relative"><Input type="number" {...field} value={field.value ?? ""} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Sq.ft.</span></div></FormControl><FormMessage /></FormItem>)} />
            {hasBoqEstimations ? (
              <div className="space-y-1">
                <FormLabel>Project Value (Sum of BOQs)</FormLabel>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">₹</span>
                  <Input value={totalBoqValue.toFixed(2)} disabled className="pl-7 pr-8 bg-muted/30" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">L</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic">Calculated from associated BOQ packages.</p>
              </div>
            ) : (
                <FormField
                    name="boq_value"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Value (Lakhs)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">₹</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 5.00"
                                        {...field}
                                        value={field.value ?? ""}
                                        className="pl-7 pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">L</span>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <FormField
              name="company"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company<sup>*</sup></FormLabel>
                  <FormControl>
                    <ReactSelect
                      options={companyOptions}
                      isLoading={companiesLoading}
                      value={companyOptions.find(c => c.value === field.value)}
                      onChange={val => {
                        field.onChange(val?.value);
                        form.setValue("contact", "");
                      }}
                      menuPosition={'auto' as MenuPosition}
                      isOptionDisabled={(option) => option.value === field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField name="contact" control={form.control} render={({ field }) => (<FormItem><FormLabel>Contact </FormLabel><FormControl><ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value) || ""}
              onChange={val => field.onChange((val as any)?.value || "")}
              menuPosition={'auto' as MenuPosition} isOptionDisabled={(option) => option.value === field.value} 
            /></FormControl><FormMessage /></FormItem>)} />
          </>
        )}
        {mode === 'status' && (
          <>
            <FormField name="boq_status" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Update Status</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={(field.value as string) || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="" disabled>Select Status</option>
                    {BOQmainStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
            )} />
            <FormField
              name="remarks"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks{isRequired("remarks") && <sup>*</sup>}</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter remarks..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={closeEditBoqDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
        </div>
      </form>
    </Form>
  );
};
