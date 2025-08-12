import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useMemo } from "react";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";

const boqFormSchema = z.object({
  boq_name: z.string().min(1, "BOQ name is required"),
  boq_size: z.string().optional(),
  boq_type: z.string().optional(),
  boq_value: z.string().optional(),
  boq_submission_date: z.string().min(1, "Submission date is required"),
  boq_link: z.string().optional(),
  city: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  contact: z.string().min(1, "Contact is required"),
  remarks: z.string().optional(),
});

type BoqFormValues = z.infer<typeof boqFormSchema>;

interface NewBoqFormProps {
  onSuccess?: () => void;
}

export const NewBoqForm = ({ onSuccess }: NewBoqFormProps) => {
  const { newBoq, closeNewBoqDialog } = useDialogStore();
  const { createDoc, loading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  
  const { data: companyDoc } = useFrappeGetDoc("CRM Company", newBoq.context.companyId, { enabled: !!newBoq.context.companyId });
  const { data: contacts } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { 
      filters: { company: newBoq.context.companyId }, 
      fields: ["name", "first_name", "last_name"] 
  });
  
  const contactOptions = useMemo(() => 
    contacts?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], 
    [contacts]
  );

  const form = useForm<BoqFormValues>({
    resolver: zodResolver(boqFormSchema),
    defaultValues: {
      company: newBoq.context.companyId || "",
      // ...other defaults
    },
  });

  const onSubmit = async (values: BoqFormValues) => {
    try {
      const res = await createDoc("CRM BOQ", values);
      await mutate("CRM BOQ");
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
        <FormField name="boq_size" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Size</FormLabel><FormControl><Input placeholder="e.g. 10000 Sqft." {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Type</FormLabel><FormControl><Input placeholder="Select Project Type" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_value" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Value</FormLabel><FormControl><Input placeholder="e.g. Rs.2,00,00,000" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_submission_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Submission Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq_link" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ Link</FormLabel><FormControl><Input placeholder="e.g. Google Drive, Dropbox" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="city" control={form.control} render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Mumbai" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input value={companyDoc?.company_name || field.value} disabled /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact</FormLabel><FormControl><ReactSelect options={contactOptions} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select Contact" /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Only use Schnider products in this project." {...field} /></FormControl><FormMessage /></FormItem> )} />

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
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { toast } from "@/hooks/use-toast";
// import { useViewport } from "@/hooks/useViewPort";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { useMemo } from "react";
// import { useForm, UseFormReturn } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import ReactSelect from 'react-select';
// import * as z from "zod";

// // 1. Define a new schema for the BOQ form
// const boqFormSchema = z.object({
//     boq_name: z
//         .string({ required_error: "Required!" })
//         .min(3, { message: "Minimum 3 characters required!" }),
//     boq_company: 
//         z.object({ label: z.string(), value: z.string() }, { required_error: "Company is required." }),
//     boq_contact: 
//         z.object({ label: z.string(), value: z.string() }, { required_error: "Contact is required." }),
//     submission_date: 
//         z.string({ required_error: "Submission date is required" }),
//     boq_value: z.coerce.number().optional(),
//     boq_status: z.string().optional(),
// });

// type BOQFormValues = z.infer<typeof boqFormSchema>;

// // 2. Rename the main component
// export const NewBOQScreen = () => {
//     const navigate = useNavigate();
//     const { mutate } = useSWRConfig();
//     const { createDoc, loading: createLoading } = useFrappeCreateDoc();

//     const form = useForm<BOQFormValues>({
//       resolver: zodResolver(boqFormSchema),
//       defaultValues: { boq_status: "Draft" }, // Example default value
//       mode: "onBlur",
//     });

//     const onSubmit = async (values: BOQFormValues) => {
//         try {
//             const isValid = await form.trigger();
//             if(isValid) {
//                 // 3. Create a "CRM BOQ" document
//                 const res = await createDoc("CRM BOQ", {
//                     boq_name: values.boq_name,
//                     boq_company: values.boq_company?.value,
//                     boq_contact: values.boq_contact?.value,
//                     submission_date: values.submission_date,
//                     boq_value: values.boq_value,
//                     boq_status: values.boq_status,
//                 });
//                 await mutate("CRM BOQ"); // 4. Mutate the correct list key

//                 navigate(-1);

//                 toast({
//                     title: "Success!",
//                     description: `BOQ ${res.boq_name} created successfully!`, // 5. Update toast message
//                     variant: "success",
//                 });
//             }
//         } catch (error) {
//             console.log("error", error);
//             toast({
//                 title: "Failed!",
//                 description: "Failed to create BOQ!", // 6. Update toast message
//                 variant: "destructive",
//             });
//         }
//     };

//     return (
//         <div className="w-full h-full relative p-4">
//             <NewBOQForm form={form} />
//             <div className="sticky bottom-0 flex flex-col gap-2 mt-4">
//                 <Button onClick={form.handleSubmit(onSubmit)} disabled={createLoading}>
//                   {createLoading ? "Saving..." : "Save BOQ"}
//                 </Button>
//                 <Button onClick={() => navigate(-1)} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
//             </div>
//         </div>
//     );
// };

// // 7. Rename the form component and update its props
// export const NewBOQForm = ({form, edit = false} : {form : UseFormReturn<BOQFormValues>, edit? : boolean}) => {
//   const { isMobile } = useViewport();
//   const { data: companiesList, isLoading: companiesListLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", {
//     fields: ["name", "company_name"],
//     limit: 1000,
//     orderBy: {field: "company_name", order: "asc"}
//   });

//   // 8. Watch the new company field name
//   const companySelected = form.watch("boq_company");

//   const { data: contactsList, isLoading: contactsListLoading } = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
//     fields: ["name", "first_name", "last_name"],
//     filters: [["company", "=", companySelected?.value]],
//     limit: 1000,
//     orderBy: {field: "first_name", order: "asc"}
//   });

//   const companyOptions = useMemo(() => companiesList?.map(com => ({label : com.company_name, value : com.name})) || [], [companiesList]);
//   const contactOptions = useMemo(() => contactsList?.map(con => ({label : `${con.first_name} ${con.last_name}`, value : con.name})) || [], [contactsList]);

//   return (
//         <div className={`w-full relative ${!isMobile && !edit ? "p-4 border cardBorder shadow rounded-lg" : ""}`}>
//              {!isMobile && !edit && (
//                 <h2 className="text-center font-bold">Add New BOQ</h2>
//             )}
//             <Form {...form}>
//                 <form className="space-y-6 py-4 mb-4">
//                     {/* 9. Update all FormFields with new names, labels, and placeholders */}
//                     <FormField
//                         control={form.control}
//                         name="boq_name"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">BOQ Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter BOQ Name" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
                    
//                     <FormField
//                         control={form.control}
//                         name="boq_value"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">BOQ Value ($)</FormLabel>
//                                 <FormControl>
//                                     <Input type="number" placeholder="Enter estimated value" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     <FormField
//                         control={form.control}
//                         name="submission_date"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Submission Date<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input type="date" placeholder="DD/MM/YYYY" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     <FormField
//                         control={form.control}
//                         name="boq_company"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Company Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                      <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Company" options={companyOptions} onBlur={field.onBlur} name={field.name} value={field.value} onChange={(e) => field.onChange(e)} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="boq_contact"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Contact Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <ReactSelect isLoading={contactsListLoading} className="text-sm text-muted-foreground" placeholder="Select Contact" options={contactOptions} value={field.value} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e)} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     {edit && ( // This logic is preserved for when the form is used in an edit dialog
//                       <FormField
//                             control={form.control}
//                             name="boq_status"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="flex">BOQ Status</FormLabel>
//                                     <FormControl>
//                                         <Input placeholder="Enter BOQ Status" {...field} />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     )}
//                 </form>
//             </Form>
//         </div>
//   );
// };