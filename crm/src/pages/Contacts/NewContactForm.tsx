import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useSWRConfig,useFrappeGetDocList,FrappeFileUpload } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef,useMemo } from "react"; // Import useState and useRef
import { Upload } from "lucide-react";

const contactFormSchema = z.object({
  first_name: z.string().min(1, "Name is required"),
  last_name: z.string().optional(),
  mobile: z.string().min(10, "Enter a valid mobile number").max(13, "Enter a valid mobile number"),
  email: z.string().email("Enter a valid email address"),
  company: z.string().min(1, "Company is required"),
  department: z.string().optional(),
  designation: z.string().optional(),
  visiting_card: z.any().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface NewContactFormProps {
  onSuccess?: () => void;
}

export const NewContactForm = ({ onSuccess }: NewContactFormProps) => {
  const { newContact, closeNewContactDialog } = useDialogStore();
  const { createDoc, loading } = useFrappeCreateDoc();
  const { mutate } = useSWRConfig();
  

  // CORRECTED: State and ref for file handling
  const [visitingCard, setVisitingCard] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companyIdFromContext = newContact.context.companyId;

  
  // Fetch the company name to display in the disabled input
  const { data: companyDoc } = useFrappeGetDoc("CRM Company", newContact.context.companyId, { enabled: !!newContact.context.companyId });

  // 2. Fetch the full list of companies ONLY if NO ID is passed in the context
  const { data: allCompanies } = useFrappeGetDocList<CRMCompany>(
    "CRM Company", 
    {
      fields: ["name", "company_name"],
      limit: 1000
    },
    { enabled: !companyIdFromContext }
  );

  const companyOptions = useMemo(() =>
    allCompanies?.map(c => ({ label: c.company_name, value: c.name })) || [],
    [allCompanies]
  );

    // *** NEW: Define the static options for the Department dropdown ***
  const departmentOptions = useMemo(() => [
    { label: "Project", value: "Project" },
    { label: "Quantity Survey Estimation", value: "Quantity Survey Estimation" },
    { label: "Procurement", value: "Procurement" },
    { label: "Senior Management", value: "Senior Management" },
    { label: "Others", value: "Others" },
  ], []);
  

  

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      company: companyIdFromContext || "", // Pre-fill from store context
      first_name: "",
      last_name: "",
      mobile: "",
      email: "",
      department: "",
      designation: "",
    },
  });

  useEffect(() => {
    form.reset({
      company: companyIdFromContext || "",
      first_name: "",
      mobile: "",
      email: "",
      department: "",
      designation: "",
    });
  }, [companyIdFromContext, form]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setVisitingCard(event.target.files[0]);
    }
  };

   const onSubmit = async (values: ContactFormValues) => {
    try {
      let uploadedFile: FrappeFileUpload | undefined;
      // Step 1: Upload the file if it exists
      if (visitingCard) {
        // This is a placeholder for the actual upload function
        // You need to implement this using `useFrappeFileUpload` or a custom fetch
        console.log("Uploading file:", visitingCard.name);
        // uploadedFile = await uploadFile(visitingCard); // This would be your actual upload call
      }
      
      // Step 2: Create the document with the file attachment's URL/name
      const docToCreate = {
        ...values,
        visiting_card: uploadedFile?.file_url || '', // Pass the URL from the upload response
      };
      
      const res = await createDoc("CRM Contacts", docToCreate);
      await mutate("CRM Contacts");
      toast({ title: "Success!", description: `Contact "${res.first_name}" created.` });
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile*</FormLabel>
              <FormControl><Input type="tel" placeholder="e.g. 9876543210" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl><Input type="email" placeholder="e.g. john.doe@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                {companyIdFromContext ? (
                  // If context exists, show a disabled input with the company name.
                  <Input value={companyDoc?.company_name || 'Loading...'} disabled />
                ) : (
                  // If no context, show a searchable, enabled dropdown.
                  <ReactSelect
                    options={companyOptions}
                    value={companyOptions.find(c => c.value === field.value)}
                    onChange={val => field.onChange(val?.value)}
                    placeholder="Search and select a company"
                    isLoading={!allCompanies} // Show loading indicator while fetching
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Department and Designation would be ReactSelect or simple inputs */}
        <FormField
          control={form.control}
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation</FormLabel>
              <FormControl><Input placeholder="e.g. Senior Developer" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* *** THIS IS THE CORRECTED FILE UPLOAD FIELD *** */}
        <FormField
          control={form.control}
          name="visiting_card"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visiting Card</FormLabel>
              <FormControl>
                <>
                  {/* This hidden input is what react-hook-form actually tracks */}
                  <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // This updates the form's internal state with the file object
                      field.onChange(file);
                    }}
                  />
                  {/* This is the visible button that the user clicks */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-muted-foreground font-normal"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {/* Display the name of the selected file */}
                    {field.value?.name ? field.value.name : 'Upload Document'}
                  </Button>
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={closeNewContactDialog}>Cancel</Button>
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
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { CirclePlus } from "lucide-react";
// import { useMemo } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import ReactSelect, { components, MenuListProps } from 'react-select';
// import * as z from "zod";

// const contactFormSchema = z.object({
//     first_name: z
//         .string({
//             required_error: "Required!"
//         })
//         .min(3, {
//             message: "Minimum 3 characters required!"
//         }),
//     last_name: z.string({
//         required_error: "Required!"
//         })
//         .min(1, {
//             message: "Minimum a character is required!"
//         }),
//     company: z
//         .string({
//             required_error: "Required!"
//         })
//         .min(3, {
//             message: "Minimum 3 characters required!",
//         }),
//     designation: z
//         .string()
//         .optional(),
//     email: z.string().email().optional().or(z.literal('')),
//     mobile: z
//         .string()
//         .max(10, { message: "Mobile number must be of 10 digits" })
//         .min(10, { message: "Mobile number must be of 10 digits" })
// });

// type ContactFormValues = z.infer<typeof contactFormSchema>;

// export const NewContactForm = () => {

//     const navigate = useNavigate()
//     const {mutate} = useSWRConfig()
//     const {isMobile} = useViewport()

//     const {createDoc , loading: createLoading} = useFrappeCreateDoc()

//     const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
//         fields: ["name", "company_name"],
//         limit: 1000
//     })

//     const form = useForm<ContactFormValues>({
//         resolver: zodResolver(contactFormSchema),
//         defaultValues: {},
//         mode: "onBlur",
//     });

//     const onSubmit = async (values: ContactFormValues) => {
//         try {
//             const isValid = await form.trigger()
//             if(isValid) {
//                 const res = await createDoc("CRM Contacts", {
//                     first_name: values.first_name,
//                     last_name: values.last_name,
//                     company: values.company,
//                     designation: values.designation,
//                     email: values.email,
//                     mobile: values.mobile,
//                 })
//                 await mutate("CRM Contacts")

//                 navigate("/prospects?tab=contact")

//                 toast({
//                     title: "Success!",
//                     description: `Contact: ${res.first_name} ${res.last_name} created successfully!`,
//                     variant: "success"
//                 })
//             }
//         } catch (error) {
//             console.log("error", error)
//             toast({
//                 title: "Failed!",
//                 description: error?.message || "Failed to create contact!",
//                 variant: "destructive"
//             })
//         }
//     }

//     const companyOptions = useMemo(() => companiesList?.map(com => ({label : com?.company_name, value : com?.name})) || [], [companiesList])

//     return (
//         <div className={`w-full relative ${!isMobile ? "p-4 border cardBorder shadow rounded-lg" : ""}`}>
//             {!isMobile && (
//                 <h2 className="text-center font-bold">Add New Contact</h2>
//             )}
//             <Form {...form}>
//                 <form
//                     onSubmit={(event) => {
//                         event.stopPropagation();
//                         return form.handleSubmit(onSubmit)(event);
//                     }}
//                     className="space-y-6 py-4 mb-4"
//                 >
//                     <FormField
//                         control={form.control}
//                         name="first_name"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">First Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter First Name" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="last_name"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Last Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter Last Name" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="company"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Company<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Company" options={companyOptions} 
//                                         onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} 
//                                         components={{ MenuList: CustomMenuList }}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="designation"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Designation</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter Designation" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="mobile"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Mobile<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input
//                                         type="number"
//                                         placeholder="Mobile Number"
//                                         {...field}
//                                         value={field.value || ""}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="email"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Email</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter Email ID" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </form>
//             </Form>
//             <div className="sticky bottom-0 flex flex-col gap-2">
//                 <Button onClick={() => onSubmit(form.getValues())}>Next</Button>
//                 <Button onClick={() => {
//                     if(isMobile) {
//                         navigate(-1)
//                     } else {
//                         navigate("/prospects?tab=contact")
//                     }
//                 }} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
//             </div>
//         </div>
//     )
// }

// const CustomMenuList = (props : MenuListProps) => {
//     const { children} = props;

//     const navigate = useNavigate();

//     const onNewCompanyClick = () => {
//         setTimeout(() => {
//             navigate("/prospects/new-company");
//           }, 150); // Small delay to prevent accidental click on next screen
//     };
  
//     return (
//       <div>
//         <components.MenuList {...props}>
//           <div>{children}</div>
//         </components.MenuList>
//         <div
//           className={`sticky top-0 z-10 border-destructive border`}
//         >
//             <Button
//               variant={"ghost"}
//               className="w-full rounded-none"
//               onClick={onNewCompanyClick}
//               onTouchStart={onNewCompanyClick}
//             >
//               <CirclePlus />
//               New Company
//             </Button>
//         </div>
//       </div>
//     );
//   };