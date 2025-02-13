import { useApplicationContext } from "@/contexts/ApplicationContext";
import { useContext, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

export const NewTaskDialog = () => {

    const { taskDialog, toggleTaskDialog } = useApplicationContext()

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {},
        mode: "onBlur",
    });

    const onSubmit = async () => {

    }

    const date = form.watch("date");
    console.log("date", date)
    console.log("formvalues", form.getValues())
    return (
        <div>
                <AlertDialog open={taskDialog} onOpenChange={toggleTaskDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader className="text-start">
                            <AlertDialogTitle className="text-destructive text-center">Add New Task</AlertDialogTitle>
                            <AlertDialogDescription>
                            <Form {...form}>
                <form
                    onSubmit={(event) => {
                        event.stopPropagation();
                        return form.handleSubmit(onSubmit)(event);
                    }}
                    className="space-y-4 py-4"
                >
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
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Date</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date"
                                        // value={newPayment.payment_date}
                                        placeholder="DD/MM/YYYY"
                                        {...field}
                                        // onChange={(e) => setNewPayment({...newPayment, payment_date: e.target.value})}
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
                                
            </AlertDialogDescription>

                        <div className="flex items-end gap-2">
                            <Button onClick={() => onSubmit(form.getValues())} className="flex-1">Save</Button>
                            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
                        </div>
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>
        </div>
    )
}