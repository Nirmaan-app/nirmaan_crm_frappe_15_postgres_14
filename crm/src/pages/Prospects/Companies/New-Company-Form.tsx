import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useViewport } from "@/hooks/useViewPort";
import { CRMCompanyType } from "@/types/NirmaanCRM/CRMCompanyType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { Control, FieldValues, useController, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ReactSelect from 'react-select';
import * as z from "zod";

const companyFormSchema = z.object({
    company_name: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    company_location: z.string().optional(),
    location: z.string().optional(),
    company_website : z.string().optional(),
    industry : z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const NewCompanyForm = () => {

    const navigate = useNavigate()
    const {mutate} = useSWRConfig()
    const {isMobile} = useViewport()

    const {createDoc , loading: createLoading} = useFrappeCreateDoc()

    const {data : companyTypesList, isLoading: companyTypesListLoading} = useFrappeGetDocList<CRMCompanyType>("CRM Company Type", {
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
                const res = await createDoc("CRM Company", {
                    company_name: values.company_name,
                    company_location: values.company_location === "Other" ? values.location : values.company_location,
                    company_website: values?.company_website && (!values.company_website.startsWith("https://") ? `https://${values.company_website}` : values.company_website),
                    industry: values.industry,
                })
                await mutate("CRM Company")

                navigate(-1)

                toast({
                    title: "Success!",
                    description: `Company ${res.company_name} created successfully!`,
                    variant: "success"
                })
            }
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: error?.message || "Failed to create company!",
                variant: "destructive"
            })
        }
    }

    const companyTypeOptions = companyTypesList?.map(com => ({label : com?.name, value : com?.name}));

    const companyLocationOptions = [
        { label: "Bangalore", value: "Bangalore" },
        { label: "Chennai", value: "Chennai" },
        { label: "Hyderabad", value: "Hyderabad" },
        { label: "Kolkata", value: "Kolkata" },
        { label: "Mumbai", value: "Mumbai" },
        { label: "Pune", value: "Pune" },
        {label: "Delhi", value: "Delhi"},
        {label: "Ahmedabad", value: "Ahmedabad"},
        {label: "Gurgaon", value: "Gurgaon"},
        {label: "Other", value: "Other"},
    ];

    const companyLocation = form.watch("company_location");

    if(companyTypesListLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className={`w-full relative ${!isMobile ? "p-4 border cardBorder shadow rounded-lg" : ""}`}>
             {!isMobile && (
                <h2 className="text-center font-bold">Add New Company</h2>
            )}
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
                        name="company_location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Location</FormLabel>
                                <FormControl>
                                    <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Location" options={companyLocationOptions} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {companyLocation === "Other" && (
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Enter Location manually" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="company_website"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                    <WebsiteInput control={form.control} name="company_website" />
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
                <Button onClick={() => {
                    if(isMobile) {
                        navigate(-1)
                    } else {
                        navigate("/prospects?tab=company")
                    }
                }} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
            </div>
        </div>
    )
}

interface WebsiteInputProps<TFieldValues extends FieldValues = FieldValues> {
    control: Control<TFieldValues>;
    name: string;
  }

const WebsiteInput = <TFieldValues extends FieldValues = FieldValues>({ control, name } : WebsiteInputProps<TFieldValues>) => {
    const { field } = useController({ control, name });
  
    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      field.onChange(value);
    };
  
    return (
      <div className="relative w-full">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-semibold select-none">
          https://
        </span>
  
        <Input
          type="text"
          className="pl-[80px]"
          placeholder="Enter Company Website"
          value={field.value}
          onChange={handleChange}
        />
      </div>
    );
  };