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
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { CirclePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ReactSelect, { components, MenuListProps } from 'react-select';
import * as z from "zod";

const contactFormSchema = z.object({
    first_name: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!"
        }),
    last_name: z.string({
        required_error: "Required!"
        })
        .min(1, {
            message: "Minimum a character is required!"
        }),
    company: z
        .string({
            required_error: "Required!"
        })
        .min(3, {
            message: "Minimum 3 characters required!",
        }),
    designation: z
        .string()
        .optional(),
    email: z.string().email().optional().or(z.literal('')),
    mobile: z
        .string()
        .max(10, { message: "Mobile number must be of 10 digits" })
        .min(10, { message: "Mobile number must be of 10 digits" })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const NewContactForm = () => {

    const navigate = useNavigate()
    const {mutate} = useSWRConfig()
    const {isMobile} = useViewport()

    const {createDoc , loading: createLoading} = useFrappeCreateDoc()

    const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
        fields: ["name", "company_name"],
        limit: 1000
    })

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {},
        mode: "onBlur",
    });

    const onSubmit = async (values: ContactFormValues) => {
        try {
            const isValid = await form.trigger()
            if(isValid) {
                const res = await createDoc("CRM Contacts", {
                    first_name: values.first_name,
                    last_name: values.last_name,
                    company: values.company,
                    designation: values.designation,
                    email: values.email,
                    mobile: values.mobile,
                })
                await mutate("CRM Contacts")

                navigate("/prospects?tab=contact")

                toast({
                    title: "Success!",
                    description: `Contact: ${res.first_name} ${res.last_name} created successfully!`,
                    variant: "success"
                })
            }
        } catch (error) {
            console.log("error", error)
            toast({
                title: "Failed!",
                description: error?.message || "Failed to create contact!",
                variant: "destructive"
            })
        }
    }

    const companyOptions = companiesList?.map(com => ({label : com?.company_name, value : com?.name}));

    return (
        <div className={`w-full relative ${!isMobile ? "p-4 border cardBorder shadow rounded-lg" : ""}`}>
            {!isMobile && (
                <h2 className="text-center font-bold">Add New Contact</h2>
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
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">First Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter First Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Last Name<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Last Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Company<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Company" options={companyOptions} 
                                        onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} 
                                        components={{ MenuList: CustomMenuList }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Designation</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Designation" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile<sup className="text-sm text-destructive">*</sup></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Mobile Number"
                                        {...field}
                                        value={field.value || ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex">Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Email ID" {...field} />
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
                        navigate("/prospects?tab=contact")
                    }
                }} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
            </div>
        </div>
    )
}

const CustomMenuList = (props : MenuListProps) => {
    const { children} = props;

    const navigate = useNavigate();

    const onNewCompanyClick = () => {
        setTimeout(() => {
            navigate("/prospects/new-company");
          }, 150); // Small delay to prevent accidental click on next screen
    };
  
    return (
      <div>
        <components.MenuList {...props}>
          <div>{children}</div>
        </components.MenuList>
        <div
          className={`sticky top-0 z-10 border-destructive border`}
        >
            <Button
              variant={"ghost"}
              className="w-full rounded-none"
              onClick={onNewCompanyClick}
              onTouchStart={onNewCompanyClick}
            >
              <CirclePlus />
              New Company
            </Button>
        </div>
      </div>
    );
  };