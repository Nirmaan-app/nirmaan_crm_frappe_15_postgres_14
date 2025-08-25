import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useMemo, useEffect } from "react";

const taskFormSchema = z.object({
  type: z.string().min(1, "Task type is required"),
  start_date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  company: z.string().min(1, "Company is required"),
  contact: z.string().min(1, "Contact is required"),
  boq: z.string().optional(),
  remarks: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface NewTaskFormProps {
  onSuccess?: () => void;
}

export const NewTaskForm = ({ onSuccess }: NewTaskFormProps) => {
  const { newTask, closeNewTaskDialog } = useDialogStore();
  const { createDoc, loading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  
  const { companyId: companyIdFromContext, contactId: contactIdFromContext, boqId: boqIdFromContext } = newTask.context;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {},
  });

  const selectedCompanyByUser = form.watch("company");
  const selectedContactByUser = form.watch("contact");
  
  // --- CASCADING DATA FETCHING ---
  
  // Step 1: Fetch documents based on context IDs to derive other necessary IDs.
  const { data: contactDocFromContext } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext, { enabled: !!contactIdFromContext });
  const { data: boqDocFromContext } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", boqIdFromContext, { enabled: !!boqIdFromContext });

  // Step 2: This is the single source of truth for the company ID.
  const companyId = companyIdFromContext || contactDocFromContext?.company || boqDocFromContext?.company;

  // Step 3: Fetch documents needed for displaying names in disabled fields.
  const { data: companyDoc, isLoading: companyDocLoading } = useFrappeGetDoc<CRMCompany>("CRM Company", companyId, { enabled: !!companyId });
  // Note: contactDocFromContext is reused for the contact's disabled input display.
  
  // Step 4: Fetch lists for populating dropdowns, only if needed.
  const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", { fields: ["name", "company_name"], enabled: !companyIdFromContext });
  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: { company: selectedCompanyByUser || companyId }, fields: ["name", "first_name", "last_name"], enabled: !!(selectedCompanyByUser || companyId) && !contactIdFromContext });
  const { data: boqsList, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", { filters: { contact: selectedContactByUser || contactIdFromContext }, fields: ["name", "boq_name"], enabled: !!(selectedContactByUser || contactIdFromContext) });

  // --- OPTIONS FOR DROPDOWNS ---
  const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_name, value: c.name })) || [], [allCompanies]);
  const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);
  const boqOptions = useMemo(() => boqsList?.map(b => ({ label: b.boq_name, value: b.name })) || [], [boqsList]);
  const taskTypeOptions = [ {label: "Meeting", value: "Meeting"}, {label: "Call", value: "Call"},{label: "Virtual", value: "Virtual"}, {label: "Follow-up", value: "Follow-up"} ];
  
  // Effect to pre-fill the form with the correct context
  useEffect(() => {
    form.reset({
      company: companyId || "",
      contact: contactIdFromContext || "",
      boq: boqIdFromContext || "",status:"Scheduled",
      type: "", start_date: "", time: "", remarks: ""
    });
  }, [companyId, contactIdFromContext, boqIdFromContext, form]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const res = await createDoc("CRM Task", values);
      await mutate("CRM Task");
      toast({ title: "Success!", description: "Task created." });
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Task Type, Date, Time are always selectable */}
        <FormField name="type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Task Type</FormLabel><FormControl><ReactSelect options={taskTypeOptions} value={taskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select Type"/></FormControl><FormMessage /></FormItem> )} />
        <FormField name="start_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="time" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
        
        {/* --- DYNAMIC COMPANY FIELD --- */}
        <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl>
            {contactIdFromContext ? (
                // If a companyId was derived, show the disabled input with the fetched company name.
                <Input value={contactDocFromContext?.company || (companyDocLoading ? "Loading..." : "")} disabled />
            ) : (
                // Only if no context was provided at all, show the searchable dropdown.
                <ReactSelect options={companyOptions} isLoading={companiesLoading} value={companyOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("contact", ""); form.setValue("boq", ""); }} placeholder="Select Company" menuPosition={'auto'}/>
            )}
        </FormControl><FormMessage /></FormItem> )} />

        {/* --- DYNAMIC CONTACT FIELD --- */}
        <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact</FormLabel><FormControl>
            {contactIdFromContext ? (
                // If a contactId was provided directly, show its name disabled.
                <Input value={contactDocFromContext ? `${contactDocFromContext.first_name} ${contactDocFromContext.last_name}` : "Loading..."} disabled />
            ) : (
                // Otherwise, show the dropdown filtered by the selected company.
                <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("boq", ""); }} placeholder="Select Contact" menuPosition={'auto'} isDisabled={!selectedCompanyByUser && !companyId} />
            )}
        </FormControl><FormMessage /></FormItem> )} />
        
        <FormField name="boq" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Project (BOQ)</FormLabel><FormControl>
            <ReactSelect options={boqOptions} isLoading={boqsLoading} value={boqOptions.find(b => b.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'} placeholder="Select BOQ (Optional)" isClearable isDisabled={!(selectedContactByUser || contactIdFromContext)} />
        </FormControl><FormMessage /></FormItem> )} />

        <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Discuss Q3 results." {...field} /></FormControl><FormMessage /></FormItem> )} />
        
        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeNewTaskDialog}>Cancel</Button>
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
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { useForm } from "react-hook-form";
// import * as z from "zod";
// import ReactSelect from 'react-select';
// import { useMemo, useEffect } from "react";

// const taskFormSchema = z.object({
//   type: z.string().min(1, "Task type is required"),
//   start_date: z.string().min(1, "Date is required"),
//   time: z.string().min(1, "Time is required"),
//   company: z.string().min(1, "Company is required"),
//   contact: z.string().min(1, "Contact is required"),
//   boq: z.string().optional(),
//   remarks: z.string().optional(),
// });

// type TaskFormValues = z.infer<typeof taskFormSchema>;

// interface NewTaskFormProps {
//   onSuccess?: () => void;
// }

// export const NewTaskForm = ({ onSuccess }: NewTaskFormProps) => {
//   const { newTask, closeNewTaskDialog } = useDialogStore();
//   const { createDoc, loading } = useFrappeCreateDoc();
//   const { mutate } = useSWRConfig();
  
//   const { companyId: companyIdFromContext, contactId: contactIdFromContext, boqId: boqIdFromContext } = newTask.context;

//   const form = useForm<TaskFormValues>({
//     resolver: zodResolver(taskFormSchema),
//     defaultValues: {},
//   });

//   const selectedCompany = form.watch("company");
//   const selectedContact = form.watch("contact");
  
//   // --- CASCADING DATA FETCHING (REVISED) ---
  
//   // 1. Fetch the specific Contact document if a contactId is passed from context.
//   const { data: contactDocFromContext } = useFrappeGetDoc<CRMContacts>(
//     "CRM Contacts",
//     contactIdFromContext,
//     { enabled: !!contactIdFromContext }
//   );

//   // 2. Determine the final companyId. It's either passed directly from context
//   //    OR derived from the contact we just fetched.
//   const companyId = companyIdFromContext || contactDocFromContext?.company;

//   // 3. Fetch the Company document using the final companyId.
//   const { data: companyDoc } = useFrappeGetDoc<CRMCompany>(
//     "CRM Company",
//     companyId,
//     { enabled: !!companyId }
//   );
  
//   // 4. Fetch lists for dropdowns (only if needed)
//   const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", { fields: ["name", "company_name"], enabled: !companyId });

//   const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: { company: selectedCompany || companyId }, fields: ["name", "first_name", "last_name"], enabled: !!(selectedCompany || companyId) && !contactIdFromContext });

//   const { data: boqsList, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", { filters: { contact: selectedContact || contactIdFromContext }, fields: ["name", "boq_name"], enabled: !!(selectedContact || contactIdFromContext) });

//   // --- OPTIONS FOR DROPDOWNS ---
//   const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_name, value: c.name })) || [], [allCompanies]);
//   const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);
//   const boqOptions = useMemo(() => boqsList?.map(b => ({ label: b.boq_name, value: b.name })) || [], [boqsList]);
//   const taskTypeOptions = [ {label: "Meeting", value: "Meeting"}, {label: "Call", value: "Call"}, {label: "Follow-up", value: "Follow-up"} ];
  
//   // Effect to pre-fill the form with context

//   console.log("contactIdFromContext",contactIdFromContext)
//   useEffect(() => {
//     form.reset({
//       company: companyId || "",
//       contact: contactIdFromContext || "",
//       boq: boqIdFromContext || "",
//       type: "", start_date: "", time: "", remarks: ""
//     });
//   }, [companyId, contactIdFromContext, boqIdFromContext, form]);

//   const onSubmit = async (values: TaskFormValues) => {
//     try {
//       const res = await createDoc("CRM Task", values);
//       await mutate("CRM Task");
//       toast({ title: "Success!", description: "Task created." });
//       onSuccess?.();
//     } catch (error) {
//       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
//     }
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//         {/* Task Type, Date, Time are always selectable */}
//         <FormField name="type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Task Type</FormLabel><FormControl><ReactSelect options={taskTypeOptions} value={taskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select Type"/></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="start_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
//         <FormField name="time" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
        
//         {/* --- DYNAMIC COMPANY FIELD --- */}
//         <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl>
//             {contactIdFromContext ? (
//                 // Use the fetched company doc for the name
//                 <Input value={contactDocFromContext?.company || "Loading..."} disabled />
//             ) : (
//                 <ReactSelect options={companyOptions} isLoading={companiesLoading} value={companyOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("contact", ""); form.setValue("boq", ""); }} placeholder="Select Company"/>
//             )}
//         </FormControl><FormMessage /></FormItem> )} />

//         {/* --- DYNAMIC CONTACT FIELD --- */}
//         <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact</FormLabel><FormControl>
//             {contactIdFromContext ? (
//                 // Use the fetched contact doc for the name
//                 <Input value={contactDocFromContext ? `${contactDocFromContext.first_name} ${contactDocFromContext.last_name}` : "Loading..."} disabled />
//             ) : (
//                 <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("boq", ""); }} placeholder="Select Contact" isDisabled={!selectedCompany && !companyId} />
//             )}
//         </FormControl><FormMessage /></FormItem> )} />
        
//         <FormField name="boq" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Project (BOQ)</FormLabel><FormControl>
//             <ReactSelect options={boqOptions} isLoading={boqsLoading} value={boqOptions.find(b => b.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select BOQ (Optional)" isClearable isDisabled={!(selectedContact || contactIdFromContext)} />
//         </FormControl><FormMessage /></FormItem> )} />

//         <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Discuss Q3 results." {...field} /></FormControl><FormMessage /></FormItem> )} />
        
//         <div className="flex gap-2 justify-end pt-4">
//           <Button type="button" variant="outline" onClick={closeNewTaskDialog}>Cancel</Button>
//           <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>
//             {loading ? "Saving..." : "Confirm"}
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// };
