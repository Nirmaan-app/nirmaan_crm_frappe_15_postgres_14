import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useMemo, useEffect } from "react";
import {useUserRoleLists} from "@/hooks/useUserRoleLists"
import { BOQmainStatusOptions,BOQsubStatusOptions } from "@/constants/dropdownData";
import { LocationOptions } from "@/constants/dropdownData";

// Schema based on your Frappe Doctype and UI Mockup
const boqFormSchema = z.object({
  boq_name: z.string() .min(1, "BOQ name is required")
    .regex(/^[a-zA-Z0-9\s-]/, "Only letters, numbers, spaces, and hyphens are allowed."),
   boq_size: z.coerce
      .number({
          // This message will be shown if the input cannot be converted to a number (e.g., "abc").
          invalid_type_error: "Please enter a valid number for size.",
      })
      .positive({ message: "Size must be a positive number." })
      // Use .nullable().optional() to correctly handle an empty field
      .nullable()
      .optional(),
      boq_sub_status: z.string().optional(),
      boq_status: z.string().optional(), 
       other_city: z.string().optional(), 
    
    boq_value: z.coerce
      .number({
          // A specific, user-friendly message for the value field.
          invalid_type_error: "Please enter a valid number for value.",
      })
      .positive({ message: "Value must be a positive number." })
      .nullable()
      .optional(),
  // boq_size: z.number().optional(),
  boq_type: z.string().optional(),
  // boq_value: z.number().optional(),
  boq_submission_date: z.string().optional(),
  boq_link: z.string().optional(),
  city: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  contact: z.string().min(1, "Contact is required"),
  remarks: z.string().optional(),
  assigned_sales: z.string().optional(),
  assigned_estimations:z.string().optional()
  

}).superRefine((data, ctx) => {
  // --- Global Validations ---
  if (!data.company || data.company.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Company is required.",
      path: ['company'],
    });
  }
  if (!data.contact || data.contact.trim() === "") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Contact is required.",
      path: ['contact'],
    });
  }
 if (data.city === "Others" && (!data.other_city || data.other_city.trim() === "")) {
         ctx.addIssue({
             code: z.ZodIssueCode.custom,
             message: "Please specify the city.",
             path: ['other_city'],
         });
     }

       // --- Custom validation for website URL ---
         if (data.boq_link && data.boq_link.trim() !== "" && 
             !data.boq_link.startsWith("http://") && !data.boq_link.startsWith("https://") && !data.boq_link.startsWith("www.")) {
             // If it's not a valid URL starting with http/https, mark it as invalid here.
             // We will prepend 'https://' during submission.
             try {
                 z.string().url().parse(`https://${data.boq_link}`);
             } catch (e) {
                 ctx.addIssue({
                     code: z.ZodIssueCode.custom,
                     message: "Please enter a valid URL (e.g., www.example.com or https://example.com).",
                     path: ['boq_link'],
                 });
             }
         }

  // --- Status-Specific Validations ---
  switch (data.boq_status) {
    case "New":
      // Deadline: Required
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for New BOQs.",
          path: ['boq_submission_date'],
        });
      }
      // Link: Optional (handled by original schema)
      // Remarks: Optional (handled by original schema)
      break;

    case "In-Progress":
      // Sub Status: Required
      if (!data.boq_sub_status || data.boq_sub_status.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sub Status is required for In-Progress BOQs.",
          path: ['boq_sub_status'],
        });
      }
      // Deadline: Required (Copy old)
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for In-Progress BOQs.",
          path: ['boq_submission_date'],
        });
      }
      // Link: Optional
      // Remarks: Optional
      break;

    case "BOQ Submitted":
    case "Partial BOQ Submitted": // Same rules for both
      // Deadline: Not Required (X) - we might want to clear it in UI if set
      // Link: Required (*)
      if (!data.boq_link || data.boq_link.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Link is required when BOQ is Submitted.",
          path: ['boq_link'],
        });
      } else if (!z.string().url().safeParse(data.boq_link).success) {
         ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid URL for BOQ Link.",
          path: ['boq_link'],
        });
      }
      // Remarks: Required for "Partial BOQ Submitted"
      if (data.boq_status === "Partial BOQ Submitted" && (!data.remarks || data.remarks.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remarks are required for Partial BOQ Submitted.",
          path: ['remarks'],
        });
      }
       if (data.boq_status === "Partial BOQ Submitted" && (!data.boq_submission_date || data.boq_submission_date.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for In-Progress BOQs.",
          path: ['boq_submission_date'],
        });
      }
      

      break;

    case "Revision Pending":
      // Sub Status: Required
      if (!data.boq_sub_status || data.boq_sub_status.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sub Status is required for Revision Pending BOQs.",
          path: ['boq_sub_status'],
        });
      }
      // Deadline: Required (Copy old)
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Submission Deadline is required for Revision Pending BOQs.",
          path: ['boq_submission_date'],
        });
      }
      // Link: Optional
      // Remarks: Optional
      break;

    case "Revision Submitted":
      // Deadline: Not Required (X)
      // Link: Required (*)
      if (!data.boq_link || data.boq_link.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "BOQ Link is required when Revision is Submitted.",
          path: ['boq_link'],
        });
      } else if (!z.string().url().safeParse(data.boq_link).success) {
         ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid URL for BOQ Link.",
          path: ['boq_link'],
        });
      }
      // Remarks: Optional
      break;

    case "Negotiation":
      // Deadline: Not Required (X)
      // Link: Not Required (X)
      // Remarks: Required (*)
      if (!data.remarks || data.remarks.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remarks are required for Negotiation BOQs.",
          path: ['remarks'],
        });
      }
      break;

    case "Won":
    case "Lost":
    case "Dropped":
      // Deadline: Not Required (X)
      // Link: Not Required (X)
      // Remarks: Required (*) for Lost/Dropped
      if ((data.boq_status === "Lost" || data.boq_status === "Dropped") && (!data.remarks || data.remarks.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Remarks are required for ${data.boq_status} BOQs.`,
          path: ['remarks'],
        });
      }
      break;

    case "Hold":
      // Deadline: Not Required (X)
      // Link: Not Required (X)
      // Remarks: Required (*)
      if (!data.remarks || data.remarks.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Remarks are required for Hold BOQs.",
          path: ['remarks'],
        });
      }
      break;

    default:
      // Default case, perhaps for initial load or unhandled statuses
      break;
  }
});

type BoqFormValues = z.infer<typeof boqFormSchema>;

interface NewBoqFormProps {
  onSuccess?: () => void;
}

export const NewBoqForm = ({ onSuccess }: NewBoqFormProps) => {
  const { newBoq, closeNewBoqDialog } = useDialogStore();
  const { createDoc, loading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  const { data: allBoqs } = useFrappeGetDocList("CRM BOQ", {
    fields: ["boq_name"]
  },"all-boqs-existornot");
  const role=localStorage.getItem("role")
    const { salesUserOptions,estimationUserOptions, isLoading: usersLoading } = useUserRoleLists();
  
  
  const { companyId: companyIdFromContext, contactId: contactIdFromContext } = newBoq.context;

  const form = useForm<BoqFormValues>({
    resolver: zodResolver(boqFormSchema),
     defaultValues: { // Set a default boq_status
        boq_status: "New" // This is important for initial state
    },
  });
  
  // Watch the company field to dynamically update the contact list
   const selectedCompany = form.watch("company");
  const selectedBoqStatus = form.watch("boq_status");
   const selectedBoqLink = form.watch("boq_link")
   const selectedCity = form.watch("city"); 
   


  // --- CASCADING DATA FETCHING ---
  // 1. Fetch the contact if a contactId was passed. We need this to find its companyId.
  const { data: contactForCompany } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext, { enabled: !!contactIdFromContext && !companyIdFromContext });
  
  // 2. Determine the final companyId. It's either passed directly or derived from the fetched contact.
  const companyId = companyIdFromContext || contactForCompany?.company;

  // 3. Fetch the company document (for display in disabled input)
  const { data: companyDoc } = useFrappeGetDoc<CRMCompany>("CRM Company", companyId, { enabled: !!companyId });
  // 4. Fetch ALL companies (for the dropdown if no context)
  const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", { fields: ["name", "company_name"], limit: 1000, enabled: !companyId });
  
  // 5. Fetch the contact document (for display in disabled input)
  const { data: contactDoc } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext, { enabled: !!contactIdFromContext });
  console.log("contactDoc",contactDoc)
  // 6. Fetch contacts for the selected company (for the dropdown)
  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: { company: selectedCompany || companyId }, fields: ["name", "first_name", "last_name"], enabled: !!(selectedCompany || companyId) });

  // --- OPTIONS FOR DROPDOWNS ---
  const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_name, value: c.name })) || [], [allCompanies]);
  const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);
  
  // Effect to pre-fill the form with context
  useEffect(() => {
    form.reset({
      company: companyId || "",
      contact: contactIdFromContext || "",
      boq_name: "", boq_size: "", boq_type: "", boq_value: "",
      boq_submission_date: "", boq_link: "", 
      city:
      
      "", remarks: "", assigned_sales: "",assigned_estimations:"",
       boq_status: "New",
        boq_sub_status: "",
    });
  }, [companyId, contactIdFromContext, form]);

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

      // Clear remarks if status makes them optional/not required AND it currently has a value
      // Specifically for "Won" where remarks become optional from being required in other states
      if (status === "Won") {
         if (form.getValues("remarks") !== "") {
          form.setValue("remarks", "", { shouldValidate: true });
          form.clearErrors("remarks");
        }
      }
    };

    clearFieldsBasedOnStatus(selectedBoqStatus);
  }, [selectedBoqStatus, form]);




  const onSubmit = async (values: BoqFormValues) => {
    try {
            const trimmedBoqName = values.boq_name.trim();
      
      // Check if a BOQ with the same name already exists (case-insensitive).
      const existingBoq = allBoqs?.find(
        b => b.boq_name.trim().toLowerCase() === trimmedBoqName.toLowerCase()
      );

      if (existingBoq) {
        // If a duplicate is found, show an error and stop the submission.
        toast({
            title: "Duplicate BOQ",
            description: `A BOQ with the name "${trimmedBoqName}" already exists.`,
            variant: "destructive"
        });
        return; // Stop the function here
      }

      const dataToSubmit = { ...values };

         if (dataToSubmit.city === "Others") {
          dataToSubmit.city = dataToSubmit.other_city?.trim() || "";
      }
      // Remove the temporary other_city field from the payload
      delete dataToSubmit.other_city;



      const res = await createDoc("CRM BOQ", dataToSubmit);
      // await mutate("All BOQ");
      // await mutate("AllBOQsList")
      // await mutate("PendingBOQsList")
      await mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));

      toast({ title: "Success!", description: `BOQ "${res.boq_name}" created.` });
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };


  // Helper functions for conditional rendering and label asterisks
  const isRequired = (fieldName: keyof BoqFormValues) => {
    switch (fieldName) {
      case "boq_submission_date":
        return ["New", "In-Progress","Partial BOQ Submitted", "Revision Pending"].includes(selectedBoqStatus || "");
      case "boq_link":
        return ["BOQ Submitted", "Partial BOQ Submitted", "Revision Submitted"].includes(selectedBoqStatus || "");
      case "remarks":
        return ["Negotiation", "Partial BOQ Submitted", "Lost", "Dropped", "Hold"].includes(selectedBoqStatus || "");
      case "boq_sub_status":
        return ["In-Progress", "Revision Pending"].includes(selectedBoqStatus || "");
        
      default:
        return false;
    }
  };

  const isHidden = (fieldName: keyof BoqFormValues) => {
    switch (fieldName) {
      case "boq_submission_date":
        return ["BOQ Submitted", "Revision Submitted", "Negotiation", "Won", "Lost", "Dropped", "Hold"].includes(selectedBoqStatus || "");
      case "boq_link":
        return ["Negotiation", "Won", "Lost", "Dropped", "Hold"].includes(selectedBoqStatus || "");
      // Remarks is always visible but its required status changes
      case "boq_sub_status":
        return !["In-Progress", "Revision Pending"].includes(selectedBoqStatus || "");
      default:
        return false;
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="boq_name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Name<sup>*</sup></FormLabel><FormControl><Input placeholder="e.g. Zepto P1" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 {(role==="Nirmaan Admin User Profile"||role==="Nirmaan Estimations User Profile") &&(
                 <FormField
                            control={form.control}
                            name="assigned_sales"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned Salesperson For BOQ</FormLabel>
                                    <FormControl>
                                        <ReactSelect
                                            options={salesUserOptions}
                                            value={salesUserOptions.find(u => u.value === field.value)}
                                            onChange={val => field.onChange(val?.value)}
                                            placeholder="Select a salesperson..."
                                            isLoading={usersLoading}
                                            className="text-sm"
                                            menuPosition={'auto'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                )}
                {role==="Nirmaan Admin User Profile" &&(
                 <FormField
                            control={form.control}
                            name="assigned_estimations"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned Estimateperson For BOQ</FormLabel>
                                    <FormControl>
                                        <ReactSelect
                                            options={estimationUserOptions}
                                            value={estimationUserOptions.find(u => u.value === field.value)}
                                            onChange={val => field.onChange(val?.value)}
                                            placeholder="Select a salesperson..."
                                            isLoading={usersLoading}
                                            className="text-sm"
                                            menuPosition={'auto'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                )}
        <FormField name="boq_size" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Size (Sqft)<sup>*</sup></FormLabel><FormControl><Input type="number" placeholder="e.g. 10000 Sqft." {...field} /></FormControl><FormMessage /></FormItem> )} />

        <FormField name="boq_type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Package</FormLabel><FormControl><Input placeholder="e.g. Interior Fitout" {...field} /></FormControl><FormMessage /></FormItem> )} />
        
        <FormField name="boq_value" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Value<sup>*</sup></FormLabel><FormControl><Input type="number" placeholder="e.g. ₹2,00,00,000" {...field} /></FormControl><FormMessage /></FormItem> )} />



<FormField name="boq_status" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>BOQ Status</FormLabel><FormControl><ReactSelect options={BOQmainStatusOptions} value={BOQmainStatusOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} isOptionDisabled={(option) => option.value === field.value}/></FormControl></FormItem>
                    )}/>

                           {(selectedBoqStatus === "In-Progress" || selectedBoqStatus === "Revision Pending") && (
          <FormField
            name="boq_sub_status"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Sub Status{isRequired("boq_sub_status")&& <sup>*</sup>} {/* Always add asterisk when shown in these states */}
                </FormLabel>
                <FormControl>
                  <ReactSelect
                    options={BOQsubStatusOptions}
                    value={BOQsubStatusOptions.find(s => s.value === field.value)}
                    onChange={val => field.onChange(val?.value)}
                    placeholder="Select Sub Status"
                    menuPosition={'auto'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {
          !isHidden("boq_submission_date")&&(
 <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Submission Deadline{isRequired("boq_submission_date") && <sup>*</sup>}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
          )
        }
        {/* <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Submission Deadline<sup>*</sup></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} /> */}

{
!isHidden("boq_link")&&(
 <FormField name="boq_link" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Link{isRequired("boq_link")&&<sup>*</sup>}</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem> )} />
)
}
  
        {/* <FormField name="boq_link" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Link</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem> )} /> */}

{/*         
        <FormField name="city" control={form.control} render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl><FormMessage /></FormItem> )} />
         */}

  <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City<sup>*</sup></FormLabel>
              <FormControl>
                <ReactSelect
                  options={LocationOptions} // Using the imported LocationOptions
                  value={LocationOptions.find(c => c.value === field.value)}
                  onChange={val => {
                    field.onChange(val?.value);
                    // Clear 'other_company_city' if "Others" is deselected
                    if (val?.value !== "Others") {
                        form.setValue("other_city", "");
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

        <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company<sup>*</sup></FormLabel><FormControl>
            {contactIdFromContext ? (
                <Input value={contactDoc?.company || "Loading..."} disabled />
            ) : (
                <ReactSelect options={companyOptions} isLoading={companiesLoading} value={companyOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("contact", ""); }} menuPosition={'auto'} placeholder="Select Company"/>
            )}
        </FormControl><FormMessage /></FormItem> )} />
        
        {/* For test New validation  */}
        <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact<sup>*</sup></FormLabel><FormControl>
            {contactIdFromContext ? (
                <Input value={contactDoc ? `${contactDoc.first_name} ${contactDoc.last_name}` : "Loading..."} disabled />
            ) : (
                <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} placeholder="Select Contact" isDisabled={!selectedCompany && !companyId} />
            )}
        </FormControl><FormMessage /></FormItem> )} />

{!isHidden("remarks")&&(
     <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks{isRequired("remarks")&&<sup>*</sup>}</FormLabel><FormControl><Textarea placeholder="e.g. Only use  products in this project." {...field} /></FormControl><FormMessage /></FormItem> )} />
)}
        {/* <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Only use  products in this project." {...field} /></FormControl><FormMessage /></FormItem> )} /> */}


        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeNewBoqDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>
            {loading ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </form>
    </Form>
  );
};







// import { Button } from "@/components/ui/button";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/hooks/use-toast";
// import { useDialogStore } from "@/store/dialogStore";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import ReactSelect from 'react-select';
// import { useMemo, useEffect } from "react";
// import {useUserRoleLists} from "@/hooks/useUserRoleLists"


// // Schema based on your Frappe Doctype and UI Mockup
// const boqFormSchema = z.object({
//   boq_name: z.string() .min(1, "BOQ name is required")
//     .regex(/^[a-zA-Z0-9\s-]/, "Only letters, numbers, spaces, and hyphens are allowed."),
//    boq_size: z.coerce
//       .number({
//           // This message will be shown if the input cannot be converted to a number (e.g., "abc").
//           invalid_type_error: "Please enter a valid number for size.",
//       })
//       .positive({ message: "Size must be a positive number." })
//       // Use .nullable().optional() to correctly handle an empty field
//       .nullable()
//       .optional(),
  
//     boq_value: z.coerce
//       .number({
//           // A specific, user-friendly message for the value field.
//           invalid_type_error: "Please enter a valid number for value.",
//       })
//       .positive({ message: "Value must be a positive number." })
//       .nullable()
//       .optional(),
//   // boq_size: z.number().optional(),
//   boq_type: z.string().optional(),
//   // boq_value: z.number().optional(),
//   boq_submission_date: z.string().min(1, "Submission date is required"),
//   boq_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
//   city: z.string().optional(),
//   company: z.string().min(1, "Company is required"),
//   contact: z.string().min(1, "Contact is required"),
//   remarks: z.string().optional(),
//   assigned_sales: z.string().optional(),
//   assigned_estimations:z.string().optional()
  

// });

// type BoqFormValues = z.infer<typeof boqFormSchema>;

// interface NewBoqFormProps {
//   onSuccess?: () => void;
// }

// export const NewBoqForm = ({ onSuccess }: NewBoqFormProps) => {
//   const { newBoq, closeNewBoqDialog } = useDialogStore();
//   const { createDoc, loading } = useFrappeCreateDoc();
//   const { mutate } = useSWRConfig();
//   const { data: allBoqs } = useFrappeGetDocList("CRM BOQ", {
//     fields: ["boq_name"]
//   },"all-boqs-existornot");
//   const role=localStorage.getItem("role")
//     const { salesUserOptions,estimationUserOptions, isLoading: usersLoading } = useUserRoleLists();
  
  
//   const { companyId: companyIdFromContext, contactId: contactIdFromContext } = newBoq.context;

//   const form = useForm<BoqFormValues>({
//     resolver: zodResolver(boqFormSchema),
//     defaultValues: {},
//   });
  
//   // Watch the company field to dynamically update the contact list
//   const selectedCompany = form.watch("company");

//   // --- CASCADING DATA FETCHING ---
//   // 1. Fetch the contact if a contactId was passed. We need this to find its companyId.
//   const { data: contactForCompany } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext, { enabled: !!contactIdFromContext && !companyIdFromContext });
  
//   // 2. Determine the final companyId. It's either passed directly or derived from the fetched contact.
//   const companyId = companyIdFromContext || contactForCompany?.company;

//   // 3. Fetch the company document (for display in disabled input)
//   const { data: companyDoc } = useFrappeGetDoc<CRMCompany>("CRM Company", companyId, { enabled: !!companyId });
//   // 4. Fetch ALL companies (for the dropdown if no context)
//   const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", { fields: ["name", "company_name"], limit: 1000, enabled: !companyId });
  
//   // 5. Fetch the contact document (for display in disabled input)
//   const { data: contactDoc } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext, { enabled: !!contactIdFromContext });
//   console.log("contactDoc",contactDoc)
//   // 6. Fetch contacts for the selected company (for the dropdown)
//   const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: { company: selectedCompany || companyId }, fields: ["name", "first_name", "last_name"], enabled: !!(selectedCompany || companyId) });

//   // --- OPTIONS FOR DROPDOWNS ---
//   const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_name, value: c.name })) || [], [allCompanies]);
//   const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);
  
//   // Effect to pre-fill the form with context
//   useEffect(() => {
//     form.reset({
//       company: companyId || "",
//       contact: contactIdFromContext || "",
//       boq_name: "", boq_size: "", boq_type: "", boq_value: "",
//       boq_submission_date: "", boq_link: "", city: "", remarks: "", assigned_sales: "",assigned_estimations:""
//     });
//   }, [companyId, contactIdFromContext, form]);

//   const onSubmit = async (values: BoqFormValues) => {
//     try {
//             const trimmedBoqName = values.boq_name.trim();
      
//       // Check if a BOQ with the same name already exists (case-insensitive).
//       const existingBoq = allBoqs?.find(
//         b => b.boq_name.trim().toLowerCase() === trimmedBoqName.toLowerCase()
//       );

//       if (existingBoq) {
//         // If a duplicate is found, show an error and stop the submission.
//         toast({
//             title: "Duplicate BOQ",
//             description: `A BOQ with the name "${trimmedBoqName}" already exists.`,
//             variant: "destructive"
//         });
//         return; // Stop the function here
//       }

//       const res = await createDoc("CRM BOQ", values);
//       // await mutate("All BOQ");
//       // await mutate("AllBOQsList")
//       // await mutate("PendingBOQsList")
//       await mutate(key => typeof key === 'string' && key.startsWith('all-boqs-'));

//       toast({ title: "Success!", description: `BOQ "${res.boq_name}" created.` });
//       onSuccess?.();
//     } catch (error) {
//       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
//     }
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <FormField name="boq_name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Name<sup>*</sup></FormLabel><FormControl><Input placeholder="e.g. Zepto P1" {...field} /></FormControl><FormMessage /></FormItem> )} />
//                  {(role==="Nirmaan Admin User Profile"||role==="Nirmaan Estimations User Profile") &&(
//                  <FormField
//                             control={form.control}
//                             name="assigned_sales"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Assigned Salesperson For BOQ</FormLabel>
//                                     <FormControl>
//                                         <ReactSelect
//                                             options={salesUserOptions}
//                                             value={salesUserOptions.find(u => u.value === field.value)}
//                                             onChange={val => field.onChange(val?.value)}
//                                             placeholder="Select a salesperson..."
//                                             isLoading={usersLoading}
//                                             className="text-sm"
//                                             menuPosition={'auto'}
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                 )}
//                 {role==="Nirmaan Admin User Profile" &&(
//                  <FormField
//                             control={form.control}
//                             name="assigned_estimations"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Assigned Estimateperson For BOQ</FormLabel>
//                                     <FormControl>
//                                         <ReactSelect
//                                             options={estimationUserOptions}
//                                             value={estimationUserOptions.find(u => u.value === field.value)}
//                                             onChange={val => field.onChange(val?.value)}
//                                             placeholder="Select a salesperson..."
//                                             isLoading={usersLoading}
//                                             className="text-sm"
//                                             menuPosition={'auto'}
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                 )}
//         <FormField name="boq_size" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Size (Sqft)<sup>*</sup></FormLabel><FormControl><Input type="number" placeholder="e.g. 10000 Sqft." {...field} /></FormControl><FormMessage /></FormItem> )} />

//         <FormField name="boq_type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Package</FormLabel><FormControl><Input placeholder="e.g. Interior Fitout" {...field} /></FormControl><FormMessage /></FormItem> )} />

//         <FormField name="boq_value" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Value<sup>*</sup></FormLabel><FormControl><Input type="number" placeholder="e.g. ₹2,00,00,000" {...field} /></FormControl><FormMessage /></FormItem> )} />

//         <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Submission Deadline<sup>*</sup></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="boq_link" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Link</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="city" control={form.control} render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl><FormMessage /></FormItem> )} />
        
//         <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company<sup>*</sup></FormLabel><FormControl>
//             {contactIdFromContext ? (
//                 <Input value={contactDoc?.company || "Loading..."} disabled />
//             ) : (
//                 <ReactSelect options={companyOptions} isLoading={companiesLoading} value={companyOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("contact", ""); }} menuPosition={'auto'} placeholder="Select Company"/>
//             )}
//         </FormControl><FormMessage /></FormItem> )} />
        
//         <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact<sup>*</sup></FormLabel><FormControl>
//             {contactIdFromContext ? (
//                 <Input value={contactDoc ? `${contactDoc.first_name} ${contactDoc.last_name}` : "Loading..."} disabled />
//             ) : (
//                 <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} placeholder="Select Contact" isDisabled={!selectedCompany && !companyId} />
//             )}
//         </FormControl><FormMessage /></FormItem> )} />

//         <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Only use  products in this project." {...field} /></FormControl><FormMessage /></FormItem> )} />

//         <div className="flex gap-2 justify-end pt-4">
//           <Button type="button" variant="outline" onClick={closeNewBoqDialog}>Cancel</Button>
//           <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>
//             {loading ? "Saving..." : "Confirm"}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// };



