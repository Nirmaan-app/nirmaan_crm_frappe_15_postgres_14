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


// Schema based on your Frappe Doctype and UI Mockup
const boqFormSchema = z.object({
  boq_name: z.string().min(1, "BOQ name is required"),
  boq_size: z.string().optional(),
  boq_type: z.string().optional(),
  boq_value: z.string().optional(),
  boq_submission_date: z.string().min(1, "Submission date is required"),
  boq_link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  city: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  contact: z.string().min(1, "Contact is required"),
  remarks: z.string().optional(),
  assigned_sales: z.string().optional(),
  assigned_estimations:z.string().optional()
  

});

type BoqFormValues = z.infer<typeof boqFormSchema>;

interface NewBoqFormProps {
  onSuccess?: () => void;
}

export const NewBoqForm = ({ onSuccess }: NewBoqFormProps) => {
  const { newBoq, closeNewBoqDialog } = useDialogStore();
  const { createDoc, loading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  const role=localStorage.getItem("role")
    const { salesUserOptions,estimationUserOptions, isLoading: usersLoading } = useUserRoleLists();
  
  
  const { companyId: companyIdFromContext, contactId: contactIdFromContext } = newBoq.context;

  const form = useForm<BoqFormValues>({
    resolver: zodResolver(boqFormSchema),
    defaultValues: {},
  });
  
  // Watch the company field to dynamically update the contact list
  const selectedCompany = form.watch("company");

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
      boq_submission_date: "", boq_link: "", city: "", remarks: "", assigned_sales: "",assigned_estimations:""
    });
  }, [companyId, contactIdFromContext, form]);

  const onSubmit = async (values: BoqFormValues) => {
    try {
      const res = await createDoc("CRM BOQ", values);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="boq_name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Name</FormLabel><FormControl><Input placeholder="e.g. Zepto P1" {...field} /></FormControl><FormMessage /></FormItem> )} />
        assigned_estimations
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
        <FormField name="boq_size" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Size</FormLabel><FormControl><Input placeholder="e.g. 10000 Sqft." {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Type</FormLabel><FormControl><Input placeholder="e.g. Interior Fitout" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_value" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Value</FormLabel><FormControl><Input placeholder="e.g. ₹2,00,00,000" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Submission Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_link" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Link</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="city" control={form.control} render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl><FormMessage /></FormItem> )} />
        
        <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl>
            {contactIdFromContext ? (
                <Input value={contactDoc?.company || "Loading..."} disabled />
            ) : (
                <ReactSelect options={companyOptions} isLoading={companiesLoading} value={companyOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("contact", ""); }} menuPosition={'auto'} placeholder="Select Company"/>
            )}
        </FormControl><FormMessage /></FormItem> )} />
        
        <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact</FormLabel><FormControl>
            {contactIdFromContext ? (
                <Input value={contactDoc ? `${contactDoc.first_name} ${contactDoc.last_name}` : "Loading..."} disabled />
            ) : (
                <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} placeholder="Select Contact" isDisabled={!selectedCompany && !companyId} />
            )}
        </FormControl><FormMessage /></FormItem> )} />

        <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Only use Schneider products in this project." {...field} /></FormControl><FormMessage /></FormItem> )} />

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
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import ReactSelect from 'react-select';
// import { useMemo } from "react";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";

// const boqFormSchema = z.object({
//   boq_name: z.string().min(1, "BOQ name is required"),
//   boq_size: z.string().optional(),
//   boq_type: z.string().optional(),
//   boq_value: z.string().optional(),
//   boq_submission_date: z.string().min(1, "Submission date is required"),
//   boq_link: z.string().optional(),
//   city: z.string().optional(),
//   company: z.string().min(1, "Company is required"),
//   contact: z.string().min(1, "Contact is required"),
//   remarks: z.string().optional(),
// });

// type BoqFormValues = z.infer<typeof boqFormSchema>;

// interface NewBoqFormProps {
//   onSuccess?: () => void;
// }

// export const NewBoqForm = ({ onSuccess }: NewBoqFormProps) => {
//   const { newBoq, closeNewBoqDialog } = useDialogStore();
//   const { createDoc, loading } = useFrappeCreateDoc();
//   const { mutate } = useSWRConfig();
  
//   const { data: companyDoc } = useFrappeGetDoc("CRM Company", newBoq.context.companyId, { enabled: !!newBoq.context.companyId });
//   const { data: contacts } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { 
//       filters: { company: newBoq.context.companyId }, 
//       fields: ["name", "first_name", "last_name"] 
//   });
  
//   const contactOptions = useMemo(() => 
//     contacts?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], 
//     [contacts]
//   );

//   const form = useForm<BoqFormValues>({
//     resolver: zodResolver(boqFormSchema),
//     defaultValues: {
//       company: newBoq.context.companyId || "",
//       // ...other defaults
//     },
//   });

//   const onSubmit = async (values: BoqFormValues) => {
//     try {
//       const res = await createDoc("CRM BOQ", values);
//       await mutate("CRM BOQ");
//       toast({ title: "Success!", description: `BOQ "${res.boq_name}" created.` });
//       onSuccess?.();
//     } catch (error) {
//       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
//     }
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         <FormField name="boq_name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Name</FormLabel><FormControl><Input placeholder="e.g. Zepto P1" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="boq_size" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Size</FormLabel><FormControl><Input placeholder="e.g. 10000 Sqft." {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="boq_type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Type</FormLabel><FormControl><Input placeholder="Select Project Type" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="boq_value" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Value</FormLabel><FormControl><Input placeholder="e.g. Rs.2,00,00,000" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Submission Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="boq_link" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Link</FormLabel><FormControl><Input placeholder="e.g. Google Drive, Dropbox" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="city" control={form.control} render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input value={companyDoc?.company_name || field.value} disabled /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact</FormLabel><FormControl><ReactSelect options={contactOptions} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select Contact" /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Only use Schnider products in this project." {...field} /></FormControl><FormMessage /></FormItem> )} />

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


