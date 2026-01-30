import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from "react-select";
import { useEffect, useMemo } from "react";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { BOQmainStatusOptions, BOQsubStatusOptions } from "@/constants/dropdownData";
import { boqFormSchema, boqDetailsSchema } from "@/constants/boqZodValidation"
import { LocationOptions } from "@/constants/dropdownData";
import { INVALID_NAME_CHARS_REGEX } from "@/constants/nameValidation";
import { PackagesMultiSelect } from "./components/PackagesMultiSelect";
import { parsePackages, serializePackages } from "@/constants/boqPackages";

type EditBoqFormValues = z.infer<typeof boqFormSchema>;

interface EditBoqFormProps { onSuccess?: () => void; }

export const EditBoqForm = ({ onSuccess }: EditBoqFormProps) => {
  const { editBoq, closeEditBoqDialog } = useDialogStore();
  const { boqData, mode } = editBoq.context;
  const getBoqStatusClass = useStatusStyles('boq');


  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { mutate } = useSWRConfig();

  // **FIX:** Initialize the form hook at the top level

  // 1. Fetch ALL companies to populate the company dropdown.
  const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>(
    "CRM Company",

    { fields: ["name", "company_name", "company_nick"], limit: 0, }
  );




  const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_nick ? `${c.company_name} (${c.company_nick})` : c.company_name, value: c.name })) || [], [allCompanies]);

  const form = useForm<EditBoqFormValues>({
    resolver: zodResolver(mode === 'status' ? boqFormSchema : boqDetailsSchema),
    defaultValues: {},
  });

  const watchedBoqStatus = form.watch("boq_status");
  const selectedCity = form.watch("city");
  const selectedCompany = form.watch("company"); // Watch the company field for changes

  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>(
    "CRM Contacts",
    // Use selectedCompany for filtering, falling back to boqData?.company only initially if needed (though form.watch usually handles init via defaultValues/reset)
    {
      filters: { company: selectedCompany || boqData?.company },
      fields: ["name", "first_name", "last_name"],
      limit: 0,
      enabled: !!(selectedCompany || boqData?.company)
    }
  );

  const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);


  // --- STEP 2: PRE-FILL ALL FIELDS ---
  useEffect(() => {
    if (boqData) {
      const isStandardCity = LocationOptions.some(opt => opt.value === boqData.city);
      const initialCityValue = isStandardCity ? boqData.city : "Others";
      const initialOtherCityValue = isStandardCity ? "" : boqData.city || "";

      form.reset({
        boq_name: boqData.boq_name || "",
        city: initialCityValue || "",
        other_city: initialOtherCityValue,
        boq_type: parsePackages(boqData.boq_type),
        boq_value: Number(boqData.boq_value) || 0,
        boq_size: Number(boqData.boq_size) || 0,
        boq_status: boqData.boq_status || "",
        boq_sub_status: boqData.boq_sub_status || "",
        // boq_link: boqData.boq_link || "",
        boq_link: "",

        company: boqData.company || "",
        contact: boqData.contact || "",
        remarks: "",
        boq_submission_date: boqData.boq_submission_date || ""

      });
    }
  }, [boqData, form]);

  useEffect(() => {
    const clearFieldsBasedOnStatus = (status: string | undefined) => {
      // Clear boq_sub_status if status doesn't require it
      if (status !== "In-Progress" && status !== "Revision Pending") {
        if (form.getValues("boq_sub_status") !== "") { // Only clear if it has a value
          form.setValue("boq_sub_status", "", { shouldValidate: true });
          form.clearErrors("boq_sub_status");
        }
      }

      // Clear boq_submission_date if status doesn't require it (X)
      const deadlineNotRequiredStatuses = ["BOQ Submitted", "Revision Submitted", "Negotiation", "Won", "Lost", "Dropped", "Hold"];
      if (deadlineNotRequiredStatuses.includes(status || "")) {
        if (form.getValues("boq_submission_date") !== "") {
          form.setValue("boq_submission_date", "", { shouldValidate: true });
          form.clearErrors("boq_submission_date");
        }
      }

      // Clear boq_link if status doesn't require it (X)
      const linkNotRequiredStatuses = ["Negotiation", "Won", "Lost", "Dropped", "Hold"];
      if (linkNotRequiredStatuses.includes(status || "")) {
        if (form.getValues("boq_link") !== "") {
          form.setValue("boq_link", "", { shouldValidate: true });
          form.clearErrors("boq_link");
        }
      }

      // if (mode === 'status') {
      //   const valueNotRequiredStatuses = ["In Progress", "Revision Pending", "Negotiation", "Lost", "Dropped", "Hold"];
      //   if (valueNotRequiredStatuses.includes(status || "")) {
      //     if (form.getValues("boq_value") !== "") {
      //       form.setValue("boq_value", "", { shouldValidate: true });
      //       form.clearErrors("boq_value");
      //     }
      //   }
      // }

      // Clear remarks if status makes them optional/not required AND it currently has a value
      // Specifically for "Won" where remarks become optional from being required in other states
      if (status === "Won") {
        if (form.getValues("remarks") !== "") {
          form.setValue("remarks", "", { shouldValidate: true });
          form.clearErrors("remarks");
        }
      }
    };

    clearFieldsBasedOnStatus(watchedBoqStatus);
  }, [watchedBoqStatus, form]);




  const loading = updateLoading;

  const onSubmit = async (values: EditBoqFormValues) => {
    try {
      if (!boqData) throw new Error("BOQ data is missing");
      const dataToSave: any = { ...values };

      // Serialize packages array to JSON string for backend storage
      if (dataToSave.boq_type && Array.isArray(dataToSave.boq_type)) {
        dataToSave.boq_type = serializePackages(dataToSave.boq_type);
      }

      if (dataToSave.city === "Others") {
        dataToSave.city = dataToSave.other_city?.trim() || "";
      }
      // Remove the temporary other_city field from the payload
      delete dataToSave.other_city;

      // 3. Website URL formatting logic for boq_link
      if (dataToSave.boq_link && dataToSave.boq_link.trim() !== "") {
        let formattedLink = dataToSave.boq_link.trim();
        if (!formattedLink.startsWith("http://") && !formattedLink.startsWith("https://") && !formattedLink.startsWith("www.")) {
          formattedLink = `https://${formattedLink}`;
        } else if (formattedLink.startsWith("www.")) { // Handle www. without protocol
          formattedLink = `https://${formattedLink}`;
        }
        dataToSave.boq_link = formattedLink;
      }
      // --- END Processing ---


      if (!['In-Progress', 'Revision Pending'].includes(values.boq_status ?? '')) {
        dataToSave.boq_sub_status = ''; // Clear the sub-status
      }
      if (mode === 'details') {
        // --- STEP 4: UPDATE ALL FIELDS ON SUBMIT ---
        await updateDoc("CRM BOQ", boqData.name, {
          ...dataToSave, boq_link: dataToSave.boq_link || boqData.boq_link, remarks: dataToSave?.remarks || boqData.remarks,
          //  boq_value: dataToSave?.boq_value || boqData.boq_value
          boq_value: (dataToSave?.boq_value !== undefined && dataToSave?.boq_value !== null) ? dataToSave.boq_value : boqData.boq_value
        });
        toast({ title: "Success", description: "BOQ details updated." });
      } else if (mode === 'status') {
        console.log("boqData", boqData)
        // Handle only the status update
        await updateDoc("CRM BOQ", boqData.name, {
          boq_status: dataToSave.boq_status,
          boq_sub_status: dataToSave.boq_sub_status,
          boq_link: dataToSave.boq_link || boqData.boq_link,
          boq_submission_date: dataToSave.boq_submission_date,
          remarks: dataToSave?.remarks || boqData.remarks,
          boq_value: dataToSave?.boq_value || boqData.boq_value
          //  boq_value: (dataToSave?.boq_value !== undefined && dataToSave?.boq_value !== null) ? dataToSave.boq_value : boqData.boq_value
        });

        toast({ title: "Success", description: "Status updated." });

      }

      await mutate(`BOQ/${boqData.name}`);//update specific boq

      await mutate(key => typeof key === 'string' && key.startsWith('all-notes-'));
      await mutate(key => typeof key === 'string' && key.startsWith('all-version-'));
      await mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const selectMenuStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  // Helper functions for conditional rendering and label asterisks
  const isRequired = (fieldName: keyof BoqFormValues) => {
    switch (fieldName) {
      case "boq_value":
        return ["BOQ Submitted", "Partial BOQ Submitted", "Revision Submitted"].includes(watchedBoqStatus || "");
      case "boq_submission_date":
        return ["New", "In-Progress", "Partial BOQ Submitted", "Revision Pending"].includes(watchedBoqStatus || "");
      case "boq_link":
        return ["BOQ Submitted", "Partial BOQ Submitted", "Revision Submitted"].includes(watchedBoqStatus || "");
      case "remarks":
        return ["Negotiation", "Partial BOQ Submitted", "Lost", "Dropped", "Hold"].includes(watchedBoqStatus || "");
      case "boq_sub_status":
        return ["In-Progress", "Revision Pending"].includes(watchedBoqStatus || "");

      default:
        return false;
    }
  };

  const isHidden = (fieldName: keyof BoqFormValues) => {
    switch (fieldName) {
      case "boq_submission_date":
        return ["BOQ Submitted", "Revision Submitted", "Negotiation", "Won", "Lost", "Dropped", "Hold"].includes(watchedBoqStatus || "");
      case "boq_link":
        return ["Negotiation", "Won", "Lost", "Dropped", "Hold"].includes(watchedBoqStatus || "");
      // Remarks is always visible but its required status changes
      case "boq_value":
        return ["New", "In-Progress", "Revision Pending", "Negotiation", "Won", "Lost", "Dropped", "Hold"].includes(watchedBoqStatus || "");
      case "boq_sub_status":
        return !["In-Progress", "Revision Pending"].includes(watchedBoqStatus || "");
      default:
        return false;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* --- STEP 3: RENDER ALL FIELDS FOR 'details' MODE --- */}
        <div className="flex justify-between items-start text-sm mb-4 border-b pb-2">
          <div>
            <p className="text-xs text-muted-foreground">Project</p>
            <p className="font-semibold">{boqData?.boq_name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-center text-muted-foreground"> Status</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getBoqStatusClass(boqData?.boq_status)}`}>
              {boqData?.boq_status || 'N/A'}
            </span>
          </div>
        </div>

        {mode === 'details' && (
          <>
            <FormField
              name="boq_name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BOQ Name<sup>*</sup></FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={boqData}
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

            {/* <FormField name="city" control={form.control} render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /> */}

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
                          form.setValue("other_city", ""); // Clear other_city if not "Others"
                        }
                      }}
                      placeholder="Select City"
                      menuPosition={'auto'}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Conditional 'Other City' input */}
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
                  <FormLabel>Packages</FormLabel>
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

            <FormField name="boq_size" control={form.control} render={({ field }) => (<FormItem><FormLabel>Carpet Area (Sqft)</FormLabel><FormControl><div className="relative"><Input type="number"  {...field} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Sq.ft.</span></div></FormControl><FormMessage /></FormItem>)} />

            <FormField name="boq_value" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Value <span className="text-[10px] text-muted-foreground ">(IN Lakhs)</span></FormLabel><FormControl><Input type="number" placeholder="e.g. 5 Lakhs" {...field} /></FormControl><FormMessage /></FormItem>)} />

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
                      // When the company changes, clear the selected contact
                      onChange={val => {
                        field.onChange(val?.value);
                        form.setValue("contact", "");
                      }}
                      menuPosition={'auto'}
                      isOptionDisabled={(option) => option.value === field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField name="contact" control={form.control} render={({ field }) => (<FormItem><FormLabel>Contact </FormLabel><FormControl><ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value) || ""} // Ensure it's explicitly null if not found
              onChange={val => field.onChange(val ? val.value : "")} // Explicitly set to null when clearedmenuPosition={'auto'} isOptionDisabled={(option) => option.value === field.value} 
            /></FormControl><FormMessage /></FormItem>)} />
          </>
        )}


        {/* ONLY RENDER STATUS FIELDS IF MODE IS 'status' */}
        {mode === 'status' && (
          <>
            <FormField name="boq_status" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Update Status</FormLabel><FormControl><ReactSelect options={BOQmainStatusOptions} value={BOQmainStatusOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} isOptionDisabled={(option) => option.value === field.value}
              /></FormControl></FormItem>
            )} />

            {['In-Progress', 'Revision Pending'].includes(watchedBoqStatus) && (
              <FormField
                name="boq_sub_status"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Status{isRequired("boq_sub_status") && <sup>*</sup>}</FormLabel>
                    <FormControl>
                      <ReactSelect
                        options={BOQsubStatusOptions}
                        value={BOQsubStatusOptions.find(s => s.value === field.value)}
                        onChange={val => field.onChange(val?.value)}
                        placeholder="Select Sub Status"
                        menuPosition={'auto'}
                        isOptionDisabled={(option) => option.value === field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {
              !isHidden("boq_value") && (
                <FormField name="boq_value" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Value <span className="text-[10px] text-muted-foreground ">(IN Lakhs)</span></FormLabel><FormControl><Input type="number" placeholder="e.g. 5 Lakhs" {...field} /></FormControl><FormMessage /></FormItem>)} />
              )
            }

            {
              !isHidden("boq_submission_date") && (
                <FormField name="boq_submission_date" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Submission Deadline{isRequired("boq_submission_date") && <sup>*</sup>}</FormLabel><FormControl><Input type="date" min={new Date().toISOString().split('T')[0]} {...field} /></FormControl><FormMessage /></FormItem>)} />
              )
            }

            {
              !isHidden("boq_link") && (
                <FormField name="boq_link" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Link{isRequired("boq_link") && <sup>*</sup>}</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem>)} />
              )
            }

            {!isHidden("remarks") && (
              <FormField name="remarks" control={form.control} render={({ field }) => (<FormItem><FormLabel>Remarks{isRequired("remarks") && <sup>*</sup>}</FormLabel><FormControl><Textarea placeholder="e.g. Only use  products in this project." {...field} /></FormControl><FormMessage /></FormItem>)} />
            )}

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