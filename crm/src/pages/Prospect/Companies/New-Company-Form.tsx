import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import ReactSelect from 'react-select'
import { toast } from "@/hooks/use-toast";

const companyFormSchema = z.object({
    company_name: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    company_address: z.string().optional(),
    company_website : z.string().url().optional(),
    industry : z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const NewCompanyForm = () => {

    const navigate = useNavigate()

    const {mutate} = useSWRConfig()

    const {createDoc , loading: createLoading} = useFrappeCreateDoc()

    const {data : companyTypesList, isLoading: companyTypesListLoading} = useFrappeGetDocList("CRM Company Type", {
        fields: ["*"],
        limit: 1000
    })

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companyFormSchema),
        defaultValues: {},
        mode: "onBlur",
    });

    const onSubmit = async (values: CompanyFormValues) => {
        try {
            const isValid = await form.trigger()
            if(isValid) {
                await createDoc("CRM Company", {
                    company_name: values.company_name,
                    company_address: values.company_address,
                    company_website: values.company_website,
                    industry: values.industry,
                })
                await mutate("CRM Company")

                navigate("/prospects?tab=company")

                toast({
                    title: "Success!",
                    description: "Company created successfully!",
                    variant: "success"
                })
            }
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: `${error?.Error || error?.message}`,
                variant: "destructive"
            })
        }
    }

    const companyTypeOptions = companyTypesList?.map(com => ({label : com?.name, value : com?.name}));

    return (
        <div className="w-full h-full relative">
            <Form {...form}>
                <form
                    onSubmit={(event) => {
                        event.stopPropagation();
                        return form.handleSubmit(onSubmit)(event);
                    }}
                    className="space-y-6 py-4 mb-4"
                >
                    <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Company Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Company Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="company_address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Company Location" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="company_website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <Input type="url" placeholder="Enter Company Website URL" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Company Type</FormLabel>
                                <FormControl>
                                    <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Company Type" options={companyTypeOptions} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <div className="sticky bottom-0 flex flex-col gap-2">
                <Button onClick={() => onSubmit(form.getValues())}>Next</Button>
                <Button onClick={() => navigate(-1)} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
            </div>
        </div>
    )
}