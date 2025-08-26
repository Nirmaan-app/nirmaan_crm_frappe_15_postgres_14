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
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { BOQmainStatusOptions,BOQsubStatusOptions } from "@/constants/dropdownData";
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
    boq_submission_date: z.string().optional(), // Add this if it's part of the form
  
  // Add the new sub_status field
  boq_sub_status: z.string().optional(),
 boq_link:z.string().optional(),
remarks:z.string().optional(),
  // Field for 'remark' mode
  title:z.string().optional(),
  content:z.string().optional(),
  remark_content: z.string().optional(),
});

type EditBoqFormValues = z.infer<typeof editBoqSchema>;

interface EditBoqFormProps { onSuccess?: () => void; }

export const EditBoqForm = ({ onSuccess }: EditBoqFormProps) => {
  const { editBoq, closeEditBoqDialog } = useDialogStore();
  const { boqData, mode } = editBoq.context;
   const getBoqStatusClass = useStatusStyles('boq');

  
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
  
    const watchedBoqStatus = form.watch("boq_status");

  // --- STEP 2: PRE-FILL ALL FIELDS ---
  useEffect(() => {
    if (boqData) {
        form.reset({
            boq_name: boqData.boq_name || "",
            city: boqData.city || "",
            boq_type: boqData.boq_type || "",
            boq_size: boqData.boq_size || "",
            boq_status: boqData.boq_status || "",
            boq_sub_status: boqData.boq_sub_status || "",
            boq_link:boqData.boq_link ||"",
            company: boqData.company || "",
            contact: boqData.contact || "",
            remarks: boqData.remarks||"",
            boq_submission_date: boqData.boq_submission_date||"",
            title:"",
            content:"",
            
        });
    }
  }, [boqData, form]);
  
  const loading = updateLoading || createLoading;

  const onSubmit = async (values: EditBoqFormValues) => {
    try {
      if (!boqData) throw new Error("BOQ data is missing");
       const dataToSave = { ...values };
      if (!['In-Progress', 'Revision Pending'].includes(values.boq_status ?? '')) {
          dataToSave.boq_sub_status = ''; // Clear the sub-status
      }
      if (mode === 'details') {
         // --- STEP 4: UPDATE ALL FIELDS ON SUBMIT ---
         await updateDoc("CRM BOQ", boqData.name,dataToSave);
         toast({ title: "Success", description: "BOQ details updated." });
      } else if (mode === 'status') {
        // Handle only the status update
     await updateDoc("CRM BOQ", boqData.name, { 
            boq_status: dataToSave.boq_status, 
            boq_sub_status: dataToSave.boq_sub_status,
            boq_link:dataToSave.boq_link,
            boq_submission_date: dataToSave.boq_submission_date,
            remarks:dataToSave.remarks
        });

        toast({ title: "Success", description: "Status updated." });

      }else if (mode === 'remark') {
        console.log(values)
        if (!values.title?.trim()) return toast({ title: "Error", description: "Title cannot be empty.", variant: "destructive" });
        await createDoc("CRM Note", { reference_doctype: "CRM BOQ", reference_docname: boqData.name, content: values.content,title:values.title });
        await mutate("All Note");
        toast({ title: "Success", description: "Remark added." });
      }
      
      await mutate(`BOQ/${boqData.name}`);
      await mutate("BOQ Version")
      // await mutate("AllBOQsList")
      await mutate("PendingBOQsList")

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
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* --- STEP 3: RENDER ALL FIELDS FOR 'details' MODE --- */}
        <div className="flex justify-between items-start text-sm mb-4">
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
            <FormField name="boq_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="city" control={form.control} render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="boq_type" control={form.control} render={({ field }) => (<FormItem><FormLabel>Package</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField name="boq_size" control={form.control} render={({ field }) => (<FormItem><FormLabel>Size</FormLabel><FormControl><div className="relative"><Input {...field} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Sq.ft.</span></div></FormControl><FormMessage /></FormItem>)} />

           
            {/* {['In-Progress', 'Revision Pending'].includes(watchedBoqStatus) && (
                <FormField
                  name="boq_sub_status"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Status</FormLabel>
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
            )} */}
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
                      menuPosition={'auto'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField name="contact" control={form.control} render={({ field }) => (<FormItem><FormLabel>Contact Name</FormLabel><FormControl><ReactSelect options={contactOptions} isLoading={contactsLoading} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'}/></FormControl><FormMessage /></FormItem>)} />
           </>
        )}
        
       
                {/* Status-only mode is also correct */}
        {(mode === 'status' || mode ==="details") && (
          <>
          <FormField name="boq_status" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Update Status</FormLabel><FormControl><ReactSelect options={BOQmainStatusOptions} value={BOQmainStatusOptions.find(s => s.value === field.value)} onChange={val => field.onChange(val?.value)} menuPosition={'auto'}/></FormControl></FormItem>
            )}/>

                {['In-Progress', 'Revision Pending'].includes(watchedBoqStatus) && (
                <FormField
                  name="boq_sub_status"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Status</FormLabel>
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
 <FormField name="boq_submission_date" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Submission Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />

  <FormField name="boq_link" control={form.control} render={({ field }) => (
 <FormItem><FormLabel>BOQ Link</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem> )} />

 <FormField name="remarks" control={form.control} render={({ field }) => (<FormItem><FormLabel>remarks</FormLabel><FormControl><Input type="text" {...field} /></FormControl><FormMessage /></FormItem>)} />

          </>
            
        )}
{/*        
        {['In-Progress', 'Revision Pending'].includes(watchedBoqStatus) && (
                <FormField
                  name="boq_sub_status"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Status</FormLabel>
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
 <FormField name="boq_submission_date" control={form.control} render={({ field }) => (<FormItem><FormLabel>BOQ Submission Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />

  <FormField name="boq_link" control={form.control} render={({ field }) => (
 <FormItem><FormLabel>BOQ Link</FormLabel><FormControl><Input placeholder="e.g. https://link.to/drive" {...field} /></FormControl><FormMessage /></FormItem> )} />

 <FormField name="remarks" control={form.control} render={({ field }) => (<FormItem><FormLabel>remarks</FormLabel><FormControl><Input type="text" {...field} /></FormControl><FormMessage /></FormItem>)} /> */}

                {/* --- STEP 2: UPDATE THE JSX FOR REMARK MODE --- */}
        {(mode === 'remark') && (
          <>
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for the remark (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your remark here..." {...field} />
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