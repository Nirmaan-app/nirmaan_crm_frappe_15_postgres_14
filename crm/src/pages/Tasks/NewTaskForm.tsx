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
import {useUserRoleLists} from "@/hooks/useUserRoleLists"


import { taskTypeOptions } from "@/constants/dropdownData";

const taskFormSchema = z.object({
  type: z.string().min(1, "Task type is required"),
  start_date: z.string().min(1, "Date is required"),
  // time: z.string().min(1, "Time is required"),
  company: z.string().min(1, "Company is required"),
  contact: z.string().min(1, "Contact is required"),
  boq: z.string().optional(),
   assigned_sales: z.string().optional(),
  remarks: z.string().optional(),
}).refine(
    (data) => {
        // Use the new, more descriptive task type values
        if (data.type === "Submit BOQ" || data.type === "Follow-up BOQ") {
            // The validation logic remains the same: the 'boq' field must have a value.
            return !!data.boq; 
        }
        return true;
    },
    {
        message: "BOQ is required for this task type.",
        path: ["boq"], // Attach the error to the 'boq' field
    }
);

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface NewTaskFormProps {
  onSuccess?: () => void;
}

export const NewTaskForm = ({ onSuccess }: NewTaskFormProps) => {
  const { newTask, closeNewTaskDialog } = useDialogStore();
  const { createDoc, loading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  const role=localStorage.getItem("role")

  const { salesUserOptions, isLoading: usersLoading } = useUserRoleLists();
    
  const { companyId: companyIdFromContext, contactId: contactIdFromContext, boqId: boqIdFromContext ,taskId:taskIdFromContext} = newTask.context;

  // console.log("newTask.context",newTask.context)
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {},
  });

  const selectedCompanyByUser = form.watch("company");
  const selectedContactByUser = form.watch("contact");
  
  const selectedTypeByUser = form.watch("type");

  
  // // --- CASCADING DATA FETCHING ---
  //  const { data: TaskDocFromContext } = useFrappeGetDoc<CRMBOQ>("CRM Task", taskIdFromContext);
  // // Step 1: Fetch documents based on context IDs to derive other necessary IDs.
  // const { data: contactDocFromContext } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext||TaskDocFromContext?.contact, { enabled: !!contactIdFromContext });

  // const { data: boqDocFromContext } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", boqIdFromContext, { enabled: !!boqIdFromContext });

    // --- CASCADING DATA FETCHING ---
   const { data: TaskDocFromContext } = useFrappeGetDoc<CRMBOQ>("CRM Task", taskIdFromContext);
  // Step 1: Fetch documents based on context IDs to derive other necessary IDs.
  const { data: contactDocFromContext } = useFrappeGetDoc<CRMContacts>("CRM Contacts", contactIdFromContext||TaskDocFromContext?.contact);

  const { data: boqDocFromContext } = useFrappeGetDoc<CRMBOQ>("CRM BOQ", boqIdFromContext);

  
  

  //  console.log("TaskDocFromContext",TaskDocFromContext)

  // Step 2: This is the single source of truth for the company ID.
  const companyId = companyIdFromContext || contactDocFromContext?.company || boqDocFromContext?.company||TaskDocFromContext?.company


  // Step 3: Fetch documents needed for displaying names in disabled fields.
  const { data: companyDoc, isLoading: companyDocLoading } = useFrappeGetDoc<CRMCompany>("CRM Company");
  // Note: contactDocFromContext is reused for the contact's disabled input display.
  
  // Step 4: Fetch lists for populating dropdowns, only if needed.
  const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", { fields: ["name", "company_name"],limit:0 });
  
  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: { company: selectedCompanyByUser || companyId }, fields: ["name", "first_name", "last_name"],limit:0});
  const { data: boqsList, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", { filters: { contact: selectedContactByUser || contactIdFromContext }, fields: ["name", "boq_name"], limit: 0});

  // --- OPTIONS FOR DROPDOWNS ---
  const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_name, value: c.name })) || [], [allCompanies]);
  const contactOptions = useMemo(() => contactsList?.map(c => ({ label:c.first_name, value: c.name })) || [], [contactsList]);
  const boqOptions = useMemo(() => boqsList?.map(b => ({ label: b.boq_name, value: b.name })) || [], [boqsList]);
  
  // const taskTypeOptions = [ {label: "Meeting", value: "Meeting"}, {label: "Call", value: "Call"},{label: "Virtual", value: "Virtual"}, {label: "Follow-up", value: "Follow-up"} ];
  
  // Effect to pre-fill the form with the correct context
  useEffect(() => {
    form.reset({
      company: companyId || "",
      contact: contactDocFromContext?.name ||TaskDocFromContext?.contact||boqDocFromContext?.contact||"",
      boq: boqIdFromContext ||TaskDocFromContext?.boq|| "",
      status:"Scheduled",
      type: "", start_date: "",
      //  time: "", 
       remarks: "",assigned_sales: "",
    });
  }, [companyId, contactIdFromContext, boqIdFromContext,taskIdFromContext, form]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const res = await createDoc("CRM Task", values);
      await mutate(key => typeof key === 'string' && key.startsWith('all-tasks-'));
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
        {role==="Nirmaan Admin User Profile" &&(
                         <FormField
                                    control={form.control}
                                    name="assigned_sales"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sales Person:</FormLabel>
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
        <FormField name="type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Task Type<sup>*</sup></FormLabel><FormControl><ReactSelect options={taskTypeOptions} value={taskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select Type"/></FormControl><FormMessage /></FormItem> )} />
        <FormField name="start_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date<sup>*</sup></FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />

        {/* <FormField name="time" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Time<sup>*</sup></FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} /> */}
        
        {/* --- DYNAMIC COMPANY FIELD --- */}
        <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company<sup>*</sup></FormLabel><FormControl>
            {contactIdFromContext ? (
                // If a companyId was derived, show the disabled input with the fetched company name.
                <Input value={contactDocFromContext?.company || (companyDocLoading ? "Loading..." : "")} disabled />
            ) : (
                // Only if no context was provided at all, show the searchable dropdown.
                <ReactSelect options={companyOptions} isLoading={companiesLoading} value={companyOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("contact", ""); form.setValue("boq", ""); }} placeholder="Select Company" menuPosition={'auto'}/>
            )}
        </FormControl><FormMessage /></FormItem> )} />
                        

        {/* --- DYNAMIC CONTACT FIELD --- */}
        <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact<sup>*</sup></FormLabel><FormControl>
            {contactIdFromContext ? (
                // If a contactId was provided directly, show its name disabled.
                <Input value={contactDocFromContext ? `${contactDocFromContext.first_name} ${contactDocFromContext.last_name}` : "Loading..."} disabled />
            ) : (
                // Otherwise, show the dropdown filtered by the selected company.
                <ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={(val) => { field.onChange(val?.value); form.setValue("boq", ""); }} placeholder="Select Contact" menuPosition={'auto'} isDisabled={!selectedCompanyByUser && !companyId} />
            )}
        </FormControl><FormMessage /></FormItem> )} />
        
        <FormField name="boq" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ</FormLabel><FormControl>
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
