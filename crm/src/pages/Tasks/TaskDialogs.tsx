import { useApplicationContext } from "@/contexts/ApplicationContext";
import { useContext, useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useController } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ReactSelect from 'react-select'
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFrappeCreateDoc, useFrappeGetDoc, useSWRConfig, useFrappeGetDocList } from "frappe-react-sdk";

const taskFormSchema = z.object({
    reference_docname: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    type: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export const NewTaskForm = () => {

    const { taskDialog, toggleTaskDialog } = useApplicationContext()

    const {createDoc , loading: createLoading} = useFrappeCreateDoc()

    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const id = searchParams.get("id")

    const location = useLocation()

    const {mutate} = useSWRConfig()

    const {data : contactData, isLoading: contactDataLoading} = useFrappeGetDoc("CRM Contacts", id, (id && taskDialog) ? undefined : null)

    const {data : contactsData, isLoading: contactsDataLoading} = useFrappeGetDocList("CRM Contacts", {
        fields: ["first_name", "last_name", "name"],
        limit: 1000,
    })

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            reference_docname: (id && taskDialog) ? contactData?.name : undefined,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (contactData) {
          form.reset({
            reference_docname: contactData?.name
          });
        }
      }, [contactData, form, id, taskDialog]);

    const onSubmit = async (values : TaskFormValues) => {
        try {
            const isValid = await form.trigger();
            if(!isValid) return;

            const contact = contactsData?.find((contact) => contact.name === values.reference_docname)
            const res = await createDoc("CRM Task", {
                reference_doctype: "CRM Contacts",
                reference_docname: values?.reference_docname,
                type: values.type,
                start_date: `${values.date} ${values.time}`,
                status: "Pending"
            })

            await mutate("CRM Task")

            await mutate(`CRM Task ${contact.name}`)

            toast({
                title: "Success!",
                description: `New Task for contact: ${contact?.first_name} ${contact?.last_name} created successfully!`,
                variant: "success"
            })

            if(location.pathname === "/tasks/new") {
                navigate(-1)
            } else {
                toggleTaskDialog()
            }
            
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: error?.message || "Failed to add task!",
                variant: "destructive"
            })
        }
    }

    if(location.pathname === "/tasks/new") {
        return (
            <div>
                <TaskForm form={form} onSubmit={onSubmit} location={location} contactsData={contactsData} />
                <div className="flex flex-col gap-2">
                    <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
                    <Button onClick={() => navigate(-1)} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
                </div>
            </div>
        )
    }

    return (
        <AlertDialog open={taskDialog} onOpenChange={toggleTaskDialog}>
            <AlertDialogContent>
                <AlertDialogHeader className="text-start">
                    <AlertDialogTitle className="text-destructive text-center">Add New Task</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <TaskForm form={form} onSubmit={onSubmit} location={location} />
                    </AlertDialogDescription>
                    <div className="flex items-end gap-2">
                        <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
                        <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                    </div>
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export const TaskForm = ({ form, onSubmit, location, contactsData, reSchedule = false }) => {

    const contactOptions = contactsData?.map((contact) => ({
        label: `${contact?.first_name} ${contact?.last_name}`,
        value: contact?.name,
    }))

    return (

        <Form {...form}>
                <form
                    onSubmit={(event) => {
                        event.stopPropagation();
                        return form.handleSubmit(onSubmit)(event);
                    }}
                    className="space-y-4 py-4"
                >
                    {location.pathname === "/tasks/new" && (
                        <FormField
                            control={form.control}
                            name="reference_docname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex">Contact<sup className="text-sm text-destructive">*</sup></FormLabel>
                                    <FormControl>
                                        <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Contact" options={contactOptions} 
                                            onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {!reSchedule && (
                         <FormField
                         control={form.control}
                         name="type"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel className="flex">Type</FormLabel>
                                 <FormControl>
                                     <Input placeholder="Enter Task Type" {...field} />
                                 </FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />
                    )}
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Date</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date"
                                        placeholder="DD/MM/YYYY"
                                        {...field}
                                        // max={new Date().toISOString().split("T")[0]}
                                        // onKeyDown={(e) => e.preventDefault()}
                                     />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                    <Input type="time" placeholder="Enter Time..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
    )
}