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
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";

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
  
  const companyId = newTask.context.companyId;
  
  const { data: companyDoc } = useFrappeGetDoc("CRM Company", companyId, { enabled: !!companyId });
  const { data: contacts } = useFrappeGetDocList<CRMContacts>("CRM Contacts", { filters: { company: companyId }, fields: ["name", "first_name", "last_name"] });
  const { data: boqs } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", { filters: { company: companyId }, fields: ["name", "boq_name"] });
  
  const contactOptions = useMemo(() => contacts?.map(c => ({ label: `${c.first_name} ${c.last_name}`, value: c.name })) || [], [contacts]);
  const boqOptions = useMemo(() => boqs?.map(b => ({ label: b.boq_name, value: b.name })) || [], [boqs]);
  const taskTypeOptions = [ {label: "Meeting", value: "Meeting"}, {label: "Call", value: "Call"}, {label: "Follow-up", value: "Follow-up"} ];

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      company: companyId || "",
      contact: newTask.context.contactId || "",
      boq: newTask.context.boqId || "",
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const payload = {
        ...values,
        start_date: `${values.start_date} ${values.time}` // Combine date and time if your backend expects datetime
      }
      const res = await createDoc("CRM Task", payload);
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
        <FormField name="type" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Task Type</FormLabel><FormControl><ReactSelect options={taskTypeOptions} value={taskTypeOptions.find(t => t.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select Type"/></FormControl><FormMessage /></FormItem> )} />
        <FormField name="start_date" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" placeholder="dd/mm/yyyy" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="time" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="company" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input value={companyDoc?.company_name || field.value} disabled /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="contact" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Contact</FormLabel><FormControl><ReactSelect options={contactOptions} value={contactOptions.find(c => c.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select Contact" /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="boq" control={form.control} render={({ field }) => ( <FormItem><FormLabel>BOQ</FormLabel><FormControl><ReactSelect options={boqOptions} value={boqOptions.find(b => b.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select BOQ" /></FormControl><FormMessage /></FormItem> )} />
        <FormField name="remarks" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Remarks</FormLabel><FormControl><Textarea placeholder="e.g. Meeting with John to discuss Q3 results." {...field} /></FormControl><FormMessage /></FormItem> )} />
        
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


// import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
// import { useApplicationContext } from "@/contexts/ApplicationContext";
// import { toast } from "@/hooks/use-toast";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { useEffect, useMemo } from "react";
// import { useForm } from "react-hook-form";
// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
// import ReactSelect from 'react-select';
// import * as z from "zod";

// const taskFormSchema = z.object({
//     reference_docname: z
//         .string({
//             required_error: "Required!"
//         })
//         .min(3, {
//             message: "Minimum 3 characters required!",
//         }),
//     type: z.string().optional(),
//     date: z.string().optional(),
//     time: z.string().optional(),
// });

// type TaskFormValues = z.infer<typeof taskFormSchema>;

// export const NewTaskForm = () => {

//     const { taskDialog, toggleTaskDialog } = useApplicationContext()

//     const {createDoc , loading: createLoading} = useFrappeCreateDoc()

//     const [searchParams] = useSearchParams();
//     const navigate = useNavigate()
//     const id = searchParams.get("id")

//     const location = useLocation()

//     const {mutate} = useSWRConfig()

//     const {data : contactData, isLoading: contactDataLoading} = useFrappeGetDoc<CRMContacts>("CRM Contacts", id, (id && taskDialog) ? undefined : null)

//     const {data : contactsData, isLoading: contactsDataLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
//         fields: ["first_name", "last_name", "name"],
//         limit: 1000,
//     }, "CRM Contacts")

//     const form = useForm<TaskFormValues>({
//         resolver: zodResolver(taskFormSchema),
//         defaultValues: {
//             reference_docname: (id && taskDialog) ? contactData?.name : undefined,
//         },
//         mode: "onBlur",
//     });

//     useEffect(() => {
//         if (contactData) {
//           form.reset({
//             reference_docname: contactData?.name
//           });
//         }
//       }, [contactData, form, id, taskDialog]);

//     const onSubmit = async (values : TaskFormValues) => {
//         try {
//             const isValid = await form.trigger();
//             if(!isValid) return;

//             const contact = contactsData?.find((contact) => contact.name === values.reference_docname)
//             await createDoc("CRM Task", {
//                 reference_doctype: "CRM Contacts",
//                 reference_docname: values?.reference_docname,
//                 type: values.type,
//                 start_date: `${values.date} ${values.time}`,
//                 status: "Pending"
//             })

//             await mutate("CRM Task")

//             await mutate(`CRM Task ${contact?.name}`)

//             toast({
//                 title: "Success!",
//                 description: `New Task for contact: ${contact?.first_name} ${contact?.last_name} created successfully!`,
//                 variant: "success"
//             })

//             if(location.pathname === "/tasks/new") {
//                 navigate(-1)
//             } else {
//                 toggleTaskDialog()
//             }
            
//         } catch (error) {
//             console.log("error", error)
//             toast({
//                 title: "Failed!",
//                 description: error?.message || "Failed to add task!",
//                 variant: "destructive"
//             })
//         }
//     }

//     if(location.pathname === "/tasks/new") {
//         return (
//             <div>
//                 <TaskForm form={form} onSubmit={onSubmit} contactsData={contactsData} />
//                 <div className="flex flex-col gap-2">
//                     <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
//                     <Button onClick={() => navigate(-1)} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <AlertDialog open={taskDialog} onOpenChange={toggleTaskDialog}>
//             <AlertDialogContent>
//                 <AlertDialogHeader className="text-start">
//                     <AlertDialogTitle className="text-destructive text-center">Add New Task</AlertDialogTitle>
//                     <AlertDialogDescription asChild>
//                         <TaskForm form={form} onSubmit={onSubmit} contactsData={contactsData} />
//                     </AlertDialogDescription>
//                     <div className="flex items-end gap-2">
//                         <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
//                         <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
//                     </div>
//                 </AlertDialogHeader>
//             </AlertDialogContent>
//         </AlertDialog>
//     )
// }

// interface TaskFormProps {
//     form: any;
//     onSubmit?: (values: any) => void;
//     contactsData?: any[];
//     reSchedule?: boolean;
// }

// export const TaskForm = ({ form, onSubmit, contactsData, reSchedule = false } : TaskFormProps) => {

//     const location = useLocation();

//     const contactOptions = useMemo(() => contactsData?.map((contact) => ({
//         label: `${contact?.first_name} ${contact?.last_name}`,
//         value: contact?.name,
//     })) || [], [contactsData])

//     return (

//         <Form {...form}>
//                 <form
//                     onSubmit={(event) => {
//                         event.stopPropagation();
//                         return form.handleSubmit(onSubmit)(event);
//                     }}
//                     className="space-y-4 py-4"
//                 >
//                     {["/tasks/new", "/calendar", "/tasks"].includes(location.pathname) && (
//                         <FormField
//                             control={form.control}
//                             name="reference_docname"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel className="flex">Contact<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                     <FormControl>
//                                         <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Contact" options={contactOptions} 
//                                             onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} 
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     )}

//                     {!reSchedule && (
//                          <FormField
//                          control={form.control}
//                          name="type"
//                          render={({ field }) => (
//                              <FormItem>
//                                  <FormLabel className="flex">Type</FormLabel>
//                                  <FormControl>
//                                      <Input placeholder="Enter Task Type" {...field} />
//                                  </FormControl>
//                                  <FormMessage />
//                              </FormItem>
//                          )}
//                      />
//                     )}
//                     <FormField
//                         control={form.control}
//                         name="date"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Date</FormLabel>
//                                 <FormControl>
//                                     <Input 
//                                         type="date"
//                                         placeholder="DD/MM/YYYY"
//                                         {...field}
//                                         // max={new Date().toISOString().split("T")[0]}
//                                         // onKeyDown={(e) => e.preventDefault()}
//                                      />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     <FormField
//                         control={form.control}
//                         name="time"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Time</FormLabel>
//                                 <FormControl>
//                                     <Input type="time" placeholder="Enter Time..." {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </form>
//             </Form>
//     )
// }