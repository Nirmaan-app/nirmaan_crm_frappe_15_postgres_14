import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from "react-select";
import { useEffect, useMemo } from "react";

// --- STEP 1: EXPAND THE SCHEMA ---
// Matches the Frappe Doctype and the UI Mockup
const editBoqSchema = z.object({
  // Fields for 'details' mode
  boq_name: z.string().optional(),
  city: z.string().optional(), // 'Location' in UI
  boq_type: z.string().optional(), // 'Package' in UI
  boq_size: z.string().optional(),
  boq_status: z.string().optional(), // 'Status' in UI (different from status-only mode)
  company: z.string().optional(),
  contact: z.string().optional(),

  // Field for 'remark' mode
  remark_content: z.string().optional(),
});

type EditBoqFormValues = z.infer<typeof editBoqSchema>;

interface EditBoqFormProps { onSuccess?: () => void; }

// --- STEP 1: DEFINE THE STATUS OPTIONS ---
const statusOptions = [
    { label: 'Won', value: 'Won' },
    { label: 'New', value: 'New' },
    { label: 'Lost', value: 'Lost' },
    { label: 'Hold', value: 'Hold' },
    { label: 'Revision Pending', value: 'Revision Pending' },
    { label: 'Negotiation', value: 'Negotiation' },
    { label: 'Revision Submitted', value: 'Revision Submitted' },
];

export const EditBoqForm = ({ onSuccess }: EditBoqFormProps) => {
  const { editBoq, closeEditBoqDialog } = useDialogStore();
  const { boqData, mode } = editBoq.context;
  
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { createDoc, loading: createLoading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  
   // **FIX:** Initialize the form hook at the top level
  
  // 1. Fetch ALL companies to populate the company dropdown.
  const { data: allCompanies, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>(
      "CRM Company", 
      { fields: ["name", "company_name"] }
  );
  
  const { data: contactsList, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>(
      "CRM Contacts", 
      { filters: { company: boqData?.company }, fields: ["name", "first_name", "last_name"], enabled: !!boqData?.company }
  );

  const contactOptions = useMemo(() => contactsList?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contactsList]);

  const companyOptions = useMemo(() => allCompanies?.map(c => ({ label: c.company_name, value: c.name })) || [], [allCompanies]);

  const form = useForm<EditBoqFormValues>({
    resolver: zodResolver(editBoqSchema),
    defaultValues: {},
  });
  
  // --- STEP 2: PRE-FILL ALL FIELDS ---
  useEffect(() => {
    if (boqData) {
        form.reset({
            boq_name: boqData.boq_name || "",
            city: boqData.city || "",
            boq_type: boqData.boq_type || "",
            boq_size: boqData.boq_size || "",
            boq_status: boqData.boq_status || "",
            company: boqData.company || "",
            contact: boqData.contact || "",
            remark_content: "",
        });
    }
  }, [boqData, form]);
  
  const loading = updateLoading || createLoading;

  const onSubmit = async (values: EditBoqFormValues) => {
    try {
      if (!boqData) throw new Error("BOQ data is missing");
      
      if (mode === 'details') {
         // --- STEP 4: UPDATE ALL FIELDS ON SUBMIT ---
         await updateDoc("CRM BOQ", boqData.name, {
            boq_name: values.boq_name,
            city: values.city,
            boq_type: values.boq_type,
            boq_size: values.boq_size,
            boq_status: values.boq_status,
            contact: values.contact,
             company: values.company,
            // company is not editable in this form
         });
         toast({ title: "Success", description: "BOQ details updated." });
      } else if (mode === 'status') {
        // Handle only the status update
        await updateDoc("CRM BOQ", boqData.name, { boq_status: values.boq_status });
        toast({ title: "Success", description: "Status updated." });

      }else if (mode === 'remark') {
        if (!values.remark_content?.trim()) return toast({ title: "Error", description: "Remark cannot be empty.", variant: "destructive" });
        await createDoc("CRM Note", { reference_doctype: "CRM BOQ", reference_docname: boqData.name, content: values.remark_content });
        await mutate("CRM Note");
        toast({ title: "Success", description: "Remark added." });
      }
      
      await mutate(`CRM BOQ/${boqData.name}`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* --- STEP 3: RENDER ALL FIELDS FOR 'details' MODE --- */}
        {mode === 'details' && (
           <>
            <FormField name="boq_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="city" control={form.control} render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="boq_type" control={form.control} render={({ field }) => (<FormItem><FormLabel>Package</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="boq_size" control={form.control} render={({ field }) => (<FormItem><FormLabel>Size</FormLabel><FormControl><div className="relative"><Input {...field} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Sq.ft.</span></div></FormControl><FormMessage /></FormItem>)} />

            <FormField
              name="boq_status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <ReactSelect
                      options={statusOptions}
                      value={statusOptions.find(s => s.value === field.value)}
                      onChange={val => field.onChange(val?.value)}
                      placeholder="Select a status"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

         <FormField
              name="company"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField name="contact" control={form.control} render={({ field }) => (<FormItem><FormLabel>Contact Name</FormLabel><FormControl><ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} /></FormControl><FormMessage /></FormItem>)} />
           </>
        )}
        
        {/* Remark mode is separate */}
        {mode === 'remark' && (
          <FormField name="remark_content" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>New Remark</FormLabel><FormControl><Textarea placeholder="Type your remark here..." {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
        )}
                {/* Status-only mode is also correct */}
        {mode === 'status' && (
            <FormField name="boq_status" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Update Status</FormLabel><FormControl><ReactSelect options={statusOptions} value={statusOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val?.value)}/></FormControl></FormItem>
            )}/>
        )}


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" className="border-destructive text-destructive" onClick={closeEditBoqDialog}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>{loading ? "Saving..." : "Confirm"}</Button>
        </div>
      </form>
    </Form>
  );
};