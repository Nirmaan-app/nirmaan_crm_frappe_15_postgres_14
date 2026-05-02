import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useEffect, useMemo, useState } from "react";
import { BOQmainStatusOptions } from "@/constants/dropdownData";
import { boqFormSchema, boqDetailsSchema } from "@/constants/boqZodValidation"
import { LocationOptions } from "@/constants/dropdownData";
import { INVALID_NAME_CHARS_REGEX } from "@/constants/nameValidation";
import { PackagesMultiSelect } from "./components/PackagesMultiSelect";
import { parsePackages, serializePackages } from "@/constants/boqPackages";
import { ReusableAlertDialog } from "@/components/ui/ReusableDialogs";
import { isCascadeDerivedBoqStatus } from "@/hooks/useStatusStyles";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";

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

  const normalizedRole = (localStorage.getItem("role") || "").toLowerCase().trim();
  const canEditAssignedSales =
    normalizedRole === "nirmaan admin user profile" ||
    normalizedRole === "nirmaan estimations lead profile";
  const { salesUserOptions, isLoading: salesUsersLoading } = useUserRoleLists();

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
      fields: ["value", "document_type", "package_name"],
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
  const selectedPackages = form.watch("boq_type") || [];

  const existingBcsPackages = useMemo(() => {
    const packages = new Set<string>();
    (estimations || []).forEach((est) => {
      if ((est.document_type || "").trim().toUpperCase() !== "BCS") return;
      const pkg = (est.package_name || "").trim();
      if (pkg) packages.add(pkg);
    });
    return packages;
  }, [estimations]);

  const packagesWithAnyTasks = useMemo(() => {
    const packages = new Set<string>();
    (estimations || []).forEach((est) => {
      const pkg = (est.package_name || "").trim();
      if (pkg) packages.add(pkg);
    });
    return Array.from(packages);
  }, [estimations]);

  // Detect if this project has legacy tasks (migrated from old data)
  const hasLegacyTasks = useMemo(() => {
    return (estimations || []).some(
      (est) => (est.package_name || "").trim() === "Legacy"
    );
  }, [estimations]);

  const pendingBcsPackages = useMemo(() => {
    return (selectedPackages || [])
      .map((pkg: string) => (pkg || "").trim())
      .filter((pkg: string) => pkg && !existingBcsPackages.has(pkg));
  }, [selectedPackages, existingBcsPackages]);

  const hasPendingBcsForSelectedPackages = pendingBcsPackages.length > 0;

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

      // Build packages list, injecting "Legacy" if legacy tasks exist
      const parsedPackages = parsePackages(boqData.boq_type);
      if (hasLegacyTasks && !parsedPackages.includes("Legacy")) {
        parsedPackages.unshift("Legacy");
      }

      form.reset({
        ...boqData,
        city: initialCityValue || "",
        other_city: initialOtherCityValue,
        boq_type: parsedPackages,
        create_bcs: boqData.create_bcs === 1,
        boq_value: Number(boqData.boq_value) || 0,
        boq_size: Number(boqData.boq_size) || 0,
        boq_status: (mode === 'status' && isCascadeDerivedBoqStatus(boqData.boq_status))
          ? ""
          : (boqData.boq_status || ""),
        boq_link: "",
        company: boqData.company || "",
        contact: boqData.contact || "",
        remarks: boqData.remarks || "",
        boq_submission_date: boqData.boq_submission_date || "",
        assigned_sales: boqData.assigned_sales || "",
      });
    }
  }, [boqData, form, hasLegacyTasks]);

  // Note: previously the `create_bcs` checkbox was forcibly re-checked when the
  // backend reported `isCreateBcsLocked`. The server-side lock has been removed
  // and unchecking now triggers a hard-delete flow. The force-check effect has
  // been intentionally deleted so users can uncheck (with confirmation).

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

  // State for cascade-deadline confirm dialog
  const [cascadeDialogOpen, setCascadeDialogOpen] = useState(false);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<EditBoqFormValues | null>(null);

  // State for BCS uncheck confirm dialog
  const [bcsUncheckDialogOpen, setBcsUncheckDialogOpen] = useState(false);
  // Tracks whether the checkbox is currently unchecked AFTER an edit (was previously checked)
  const [bcsPendingDelete, setBcsPendingDelete] = useState(false);

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

  const performSave = async (values: EditBoqFormValues, cascadeDeadline?: 0 | 1) => {
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
      dataToSave.create_bcs = dataToSave.create_bcs ? 1 : 0;
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
      if (typeof cascadeDeadline === "number") {
        dataToSave.cascade_deadline = cascadeDeadline;
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

  const onSubmit = async (values: EditBoqFormValues) => {
    // Edit-mode only: if deadline changed, ask user whether to cascade.
    const isEdit = !!boqData?.name;
    const deadlineDirty =
      isEdit &&
      mode === 'details' &&
      (values.boq_submission_date || "") !== (boqData?.boq_submission_date || "");

    if (deadlineDirty) {
      setPendingSubmitValues(values);
      setCascadeDialogOpen(true);
      return;
    }
    await performSave(values);
  };

  const handleCascadeChoice = async (cascade: boolean) => {
    const values = pendingSubmitValues;
    setCascadeDialogOpen(false);
    setPendingSubmitValues(null);
    if (!values) return;
    await performSave(values, cascade ? 1 : 0);
  };

  const handleCascadeDialogOpenChange = (open: boolean) => {
    if (!open) {
      // User dismissed (Escape / outside click) — do NOT submit.
      setCascadeDialogOpen(false);
      setPendingSubmitValues(null);
      return;
    }
    setCascadeDialogOpen(true);
  };

  // Track whether the BCS checkbox is currently in a "pending delete" state.
  // True only when the BOQ was previously checked and the user has now unchecked it.
  const watchedCreateBcs = form.watch("create_bcs");
  useEffect(() => {
    const originallyChecked = Number(boqData?.create_bcs || 0) === 1;
    setBcsPendingDelete(originallyChecked && !watchedCreateBcs);
  }, [watchedCreateBcs, boqData?.create_bcs]);

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
                      packagesWithTasks={packagesWithAnyTasks}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="create_bcs"
              control={form.control}
              render={({ field }) => {
                // Allow toggling if: (a) there are pending packages needing BCS (can check on),
                // OR (b) the BOQ currently has existing BCS estimations (can uncheck to delete),
                // OR (c) the form value is currently true (so user can toggle off).
                const canUncheck = existingBcsPackages.size > 0 || !!field.value;
                const canCheck = hasPendingBcsForSelectedPackages;
                const toggleDisabled = field.value ? !canUncheck : !canCheck;
                return (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        disabled={toggleDisabled}
                        onCheckedChange={(checked) => {
                          const next = !!checked;
                          if (!next && !!field.value) {
                            // Going from checked -> unchecked: confirm destructive action.
                            setBcsUncheckDialogOpen(true);
                            return;
                          }
                          field.onChange(next);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none flex-1">
                      <FormLabel>Create BCS tasks for selected packages</FormLabel>
                      {existingBcsPackages.size > 0 && field.value && (
                        <p className="text-[11px] text-muted-foreground">
                          BCS estimations exist for this project. Unchecking will delete all BCS rows.
                        </p>
                      )}
                      {!field.value && !hasPendingBcsForSelectedPackages && existingBcsPackages.size === 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          No new packages pending for BCS. Add a new package to enable this option.
                        </p>
                      )}
                      {field.value && hasPendingBcsForSelectedPackages && existingBcsPackages.size === 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          New package(s): {pendingBcsPackages.join(", ")}. Enable this to create BCS only for these package(s).
                        </p>
                      )}
                      {bcsPendingDelete && (
                        <p className="text-[11px] text-destructive font-medium">
                          Warning: Saving will permanently delete all BCS-type Project Estimations for this Project. This cannot be undone.
                        </p>
                      )}
                    </div>
                  </FormItem>
                );
              }}
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
            <FormField name="contact" control={form.control} render={({ field }) => (<FormItem><FormLabel>Company Contact</FormLabel><FormControl><ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value) || ""}
              onChange={val => field.onChange((val as any)?.value || "")}
              menuPosition={'auto' as MenuPosition} isOptionDisabled={(option) => option.value === field.value}
            /></FormControl><FormMessage /></FormItem>)} />
            {canEditAssignedSales && (
              <FormField
                control={form.control}
                name="assigned_sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Salesperson</FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={salesUserOptions}
                        value={salesUserOptions.find(u => u.value === field.value) || null}
                        onChange={val => field.onChange((val as any)?.value || "")}
                        placeholder="Select a salesperson..."
                        isLoading={salesUsersLoading}
                        isClearable
                        className="text-sm"
                        menuPosition={'auto' as MenuPosition}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        {mode === 'status' && (
          <>
            {isCascadeDerivedBoqStatus(boqData?.boq_status) && (
              <p className="text-xs text-muted-foreground">
                Current auto-status: <span className="font-medium text-foreground">{boqData?.boq_status}</span>
              </p>
            )}
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

      {/* Deadline cascade confirmation */}
      <ReusableAlertDialog
        open={cascadeDialogOpen}
        onOpenChange={handleCascadeDialogOpenChange}
        title="Update Linked Project Estimations?"
        confirmText="Yes, update all"
        cancelText="No, keep as is"
        onConfirm={() => handleCascadeChoice(true)}
      >
        <p className="text-sm text-foreground">
          The Project Deadline has changed. Do you also want to update the deadline on all linked Project Estimations (BOQ and BCS)?
        </p>
      </ReusableAlertDialog>

      {/* BCS uncheck confirmation */}
      <ReusableAlertDialog
        open={bcsUncheckDialogOpen}
        onOpenChange={(open) => {
          if (!open) setBcsUncheckDialogOpen(false);
        }}
        title="Disable BCS for this Project?"
        confirmText="Yes, delete BCS estimations"
        cancelText="Cancel"
        onConfirm={() => {
          form.setValue("create_bcs", false, { shouldDirty: true });
          setBcsUncheckDialogOpen(false);
        }}
      >
        <p className="text-sm text-foreground">
          Disabling BCS will permanently delete all BCS-type Project Estimations for this Project. This action cannot be undone. Proceed?
        </p>
      </ReusableAlertDialog>
    </Form>
  );
};
