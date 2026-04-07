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
import { BOQmainStatusOptions } from "@/constants/dropdownData";
import { LocationOptions } from "@/constants/dropdownData";
import { nameValidationSchema, INVALID_NAME_CHARS_REGEX } from "@/constants/nameValidation";
import { PackagesMultiSelect } from "./components/PackagesMultiSelect";
import { serializePackages } from "@/constants/boqPackages";

const normalizeStatus = (status?: string) =>
  (status || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Schema based on your Frappe Doctype and UI Mockup
const boqFormSchema = z.object({
  boq_name: nameValidationSchema,
   boq_size: z.coerce
      .number({
          // This message will be shown if the input cannot be converted to a number (e.g., "abc").
          invalid_type_error: "Please enter a valid number for size.",
      })
      .nonnegative({ message: "Size must be a positive number." })
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
      .nonnegative({ message: "Value must be a positive number." })
      .nullable()
      .optional(),
  // boq_size: z.number().optional(),
  boq_type: z.array(z.string()).optional().default([]),
  // boq_value: z.number().optional(),
  boq_submission_date: z.string().optional(),
  boq_link: z.string().optional(),
  city: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  contact: z.string().optional(),
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
  if (!data.boq_type || data.boq_type.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one package is required.",
      path: ['boq_type'],
    });
  }
  // if (!data.contact || data.contact.trim() === "") {
  //   ctx.addIssue({
  //     code: z.ZodIssueCode.custom,
  //     message: "Contact is required.",
  //     path: ['contact'],
  //   });
  // }
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
  const normalizedStatus = (data.boq_status || "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  switch (normalizedStatus) {
    case "new":
    case "in progress":
      if (!data.boq_submission_date || data.boq_submission_date.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Project Submission Deadline is required.",
          path: ['boq_submission_date'],
        });
      }
      break;

    case "negotiation":
    case "hold":
    case "lost":
    case "dropped":
      if (!data.remarks || data.remarks.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Remarks are required for "${data.boq_status}" status.`,
          path: ['remarks'],
        });
      }
      break;

    case "won":
      break;

    default:
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
  const normalizedRole = (role || "").toLowerCase().trim();
  const currentUserId = localStorage.getItem("userId") || "";
    const { salesUserOptions,estimationUserOptions, isLoading: usersLoading } = useUserRoleLists();
  
  
  const { companyId: companyIdFromContext, contactId: contactIdFromContext } = newBoq.context;
  const isAdminOrEstimationsLead =
    normalizedRole === "nirmaan admin user profile" ||
    normalizedRole === "nirmaan estimations lead profile";
  const isEstimationsUser =
    normalizedRole === "nirmaan estimations user profile";
  const canManageAssignments = isAdminOrEstimationsLead || isEstimationsUser;

  const form = useForm<BoqFormValues>({
    resolver: zodResolver(boqFormSchema),
     defaultValues: { // Set a default boq_status
        boq_status: "New" // This is important for initial state
    },
  });
  
  // Watch the company field to dynamically update the contact list
   const selectedCompany = form.watch("company");
  const selectedBoqStatus = form.watch("boq_status");
   const selectedCity = form.watch("city"); 
   


  // --- CASCADING DATA FETCHING ---
  // 1. Fetch the contact if a contactId was passed. We need this to find its companyId.
  const { data: contactForCompany } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext, { enabled: !!contactIdFromContext && !companyIdFromContext });
  
  // 2. Determine the final companyId. It's either passed directly or derived from the fetched contact.
  const companyId = companyIdFromContext || contactForCompany?.company;

  // 3. Fetch the company document (for display in disabled input)
  const { data: companyDoc } = useFrappeGetDoc<CRMCompany>("CRM Company", companyId, { enabled: !!companyId });
  // 4. Fetch ALL companies (for the dropdown if no context)
  const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", { fields: ["name", "company_name", "company_nick", "assigned_sales"], limit: 1000, enabled: !companyId });
  
  // 5. Fetch the contact document (for display in disabled input)
  const { data: contactDoc } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext, { enabled: !!contactIdFromContext });
  // console.log("contactDoc",contactDoc)
  // 6. Fetch contacts for the selected company (for the dropdown)
  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: { company: selectedCompany || companyId }, fields: ["name", "first_name", "last_name"], enabled: !!(selectedCompany || companyId) });

  // --- OPTIONS FOR DROPDOWNS ---
  const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_nick ? `${c.company_name} (${c.company_nick})` : c.company_name, value: c.name})) || [], [allCompanies]);
  const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);
  
  // Effect to pre-fill the form with context
  useEffect(() => {
    form.reset({
      company: companyId || "",
      contact: contactIdFromContext || "",
      boq_name: "", boq_size: "", boq_type: [], boq_value: "",
      boq_submission_date: "", boq_link: "",
      city:
      
      "", remarks: "", assigned_sales: "", assigned_estimations: isEstimationsUser ? currentUserId : "",
       boq_status: "New",
        boq_sub_status: "",
    });
  }, [companyId, contactIdFromContext, currentUserId, form, isEstimationsUser]);

  useEffect(() => {
    const clearFieldsBasedOnStatus = (status: string | undefined) => {
      const normalizedStatus = normalizeStatus(status);

      // Clear boq_submission_date if status doesn't require it
      const deadlineNotRequiredStatuses = new Set(["won", "lost", "dropped", "hold", "negotiation"]);
      if (deadlineNotRequiredStatuses.has(normalizedStatus)) {
        if (form.getValues("boq_submission_date") !== "") {
          form.setValue("boq_submission_date", "", { shouldValidate: true });
          form.clearErrors("boq_submission_date");
        }
      }

      // Clear remarks if status makes them optional/not required
      if (["won", "new", "in progress"].includes(normalizedStatus)) {
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

      const dataToSubmit: any = { ...values };
      if (isEstimationsUser && !dataToSubmit.assigned_estimations) {
        dataToSubmit.assigned_estimations = currentUserId;
      }

      // Serialize packages array to JSON string for backend storage
      if (dataToSubmit.boq_type && Array.isArray(dataToSubmit.boq_type)) {
        dataToSubmit.boq_type = serializePackages(dataToSubmit.boq_type);
      }

      if (dataToSubmit.city === "Others") {
        dataToSubmit.city = dataToSubmit.other_city?.trim() || "";
      }
      // Remove the temporary other_city field from the payload
      delete dataToSubmit.other_city;

      // Format URL for backend consistency
      if (dataToSubmit.boq_link && dataToSubmit.boq_link.trim() !== "") {
        let formattedLink = dataToSubmit.boq_link.trim();
        if (!formattedLink.startsWith("http://") && !formattedLink.startsWith("https://") && !formattedLink.startsWith("www.")) {
          formattedLink = `https://${formattedLink}`;
        } else if (formattedLink.startsWith("www.")) {
          formattedLink = `https://${formattedLink}`;
        }
        dataToSubmit.boq_link = formattedLink;
      }



      const res = await createDoc("CRM BOQ", dataToSubmit);
      // await mutate("All BOQ");
      // await mutate("AllBOQsList")
      // await mutate("PendingBOQsList")
      await Promise.all([
        mutate("all-boqs-all-view"),
        mutate("home-estimation-review-projects"),
        mutate("all-project-estimation-values"),
        mutate(key => typeof key === 'string' && key.startsWith('all-boqs-')),
      ]);

      toast({ title: "Success!", description: `BOQ "${res.boq_name}" created.` });
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };


  // Helper functions for conditional rendering and label asterisks
  const isRequired = (fieldName: keyof BoqFormValues) => {
    const normalizedStatus = normalizeStatus(selectedBoqStatus);
    switch (fieldName) {
      case "boq_submission_date":
        return normalizedStatus === "new" || normalizedStatus === "in progress";
      case "remarks":
        return ["negotiation", "lost", "dropped", "hold"].includes(normalizedStatus);
      default:
        return false;
    }
  };

  const isHidden = (fieldName: keyof BoqFormValues) => {
    const normalizedStatus = normalizeStatus(selectedBoqStatus);
    switch (fieldName) {
      case "boq_submission_date":
        return ["negotiation", "won", "lost", "dropped", "hold"].includes(normalizedStatus);
      default:
        return false;
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="boq_name" control={form.control} render={({ field }) => ( 
          <FormItem>
            <FormLabel>Project Name<sup>*</sup></FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. Zepto P1" 
                {...field} 
                onChange={(e) => {
                  const sanitizedValue = e.target.value.replace(INVALID_NAME_CHARS_REGEX, "");
                  field.onChange(sanitizedValue);
                }} 
              />
            </FormControl>
            <FormMessage />
          </FormItem> 
        )} />

                <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company<sup>*</sup></FormLabel><FormControl>
            {contactIdFromContext ? (
                <Input value={contactDoc?.company || "Loading..."} disabled />
            ) : (
                <ReactSelect options={companyOptions} isLoading={companiesLoading} value={companyOptions.find(c => c.value === field.value)}
                 onChange={(val) => { 
                  field.onChange(val?.value); form.setValue("contact", "");
                  const selectedPerson=allCompanies?.find(comp=>comp.name===val?.value);
                    if (selectedPerson) {
                                            // Existing logic: Auto-select company and contact
                                            // NEW LOGIC: Auto-set assigned_sales from BOQ data
                                            if (selectedPerson.assigned_sales) {
                                                form.setValue("assigned_sales", selectedPerson.assigned_sales, { shouldValidate: true });
                                            } else {
                                                // Clear if the selected BOQ has no assigned sales
                                                form.setValue("assigned_sales", ""); 
                                            }
                                          }

                }
                } 
                 
                 menuPosition={'auto'} placeholder="Select Company"/>
            )}
        </FormControl><FormMessage /></FormItem> )} />
        
        {/* For test New validation  */}
        <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact</FormLabel><FormControl>
            {contactIdFromContext ? (
                <Input value={contactDoc ? `${contactDoc.first_name} ${contactDoc.last_name}` : "Loading..."} disabled />
            ) : (
                <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} placeholder="Select Contact" isDisabled={!selectedCompany && !companyId} />
            )}
        </FormControl><FormMessage /></FormItem> )} />
                 {canManageAssignments &&(
                 <FormField
                            control={form.control}
                            name="assigned_sales"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned Salesperson</FormLabel>
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

                {isAdminOrEstimationsLead && (
                  <FormField
                    control={form.control}
                    name="assigned_estimations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Estimation Person</FormLabel>
                        <FormControl>
                          <ReactSelect
                            options={estimationUserOptions}
                            value={estimationUserOptions.find(u => u.value === field.value)}
                            onChange={val => field.onChange(val?.value)}
                            placeholder="Select estimation assignee..."
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

        <FormField name="boq_size" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Carpet Area (Sqft)</FormLabel><FormControl><Input type="number" placeholder="e.g. 10000 Sqft." {...field} /></FormControl><FormMessage /></FormItem> )} />

        <FormField name="boq_type" control={form.control} render={({ field }) => (
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
        )} />
        
<FormField name="boq_status" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Project Status<sup>*</sup></FormLabel><FormControl><ReactSelect options={BOQmainStatusOptions} value={BOQmainStatusOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} isOptionDisabled={(option) => option.value === field.value}/></FormControl></FormItem>
                    )}/>


        {
          !isHidden("boq_submission_date")&&(
 <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Project Submission Deadline{isRequired("boq_submission_date") && <sup>*</sup>}</FormLabel><FormControl><Input type="date" min={new Date().toISOString().split('T')[0]} {...field} /></FormControl><FormMessage /></FormItem> )} />
          )
        }
        {/* <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Submission Deadline<sup>*</sup></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} /> */}

{
!isHidden("boq_link")&&(
 <FormField name="boq_link" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Project Link{isRequired("boq_link")&&<sup>*</sup>}</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
