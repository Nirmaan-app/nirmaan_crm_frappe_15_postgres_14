import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc,useFrappeUpdateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { useMemo,useEffect } from "react";
import { CRMCompanyType } from "@/types/NirmaanCRM/CRMCompanyType";

// Zod Schema based on your Frappe Doctype and UI Mockup
const companyFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_city: z.string().min(1, "Location is required"),
  company_type: z.string().min(1, "Company type is required"),
  company_website: z.string().optional(), // Now optional
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface NewCompanyFormProps {
  onSuccess?: () => void;
   isEditMode?: boolean;
  initialData?: CRMCompany | null;
}

export const NewCompanyForm = ({ onSuccess, isEditMode = false, initialData = null }: NewCompanyFormProps) => {
  const { closeNewCompanyDialog,closeEditCompanyDialog } = useDialogStore();
  const { createDoc, loading:createLoading } = useFrappeCreateDoc();
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { mutate } = useSWRConfig();
  
  const { data: companyTypes } = useFrappeGetDocList<CRMCompanyType>("CRM Company Type", { fields: ["name"] });
  const companyTypeOptions = useMemo(() => 
    companyTypes?.map(ct => ({ label: ct.name, value: ct.name })) || [], 
    [companyTypes]
  );
 // CORRECTED: Static list for Company Type as requested
//   const companyTypeOptions = [
//     { label: "Type 1", value: "Type 1" },
//     { label: "Type 2", value: "Type 2" },
//     { label: "Type 3", value: "Type 3" },
//     { label: "Type 4", value: "Type 4" },
//   ];
  // CORRECTED: Added location options as requested
  
  const companyLocationOptions = useMemo(() => [
    { label: "Bengaluru", value: "Bengaluru" },
    { label: "Chennai", value: "Chennai" },
    { label: "Hyderabad", value: "Hyderabad" },
    { label: "Mumbai", value: "Mumbai" },
    // Add more cities as needed
  ], []);


  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      company_name: "",
      company_city: "",
      company_type: "",
       company_website: "",
    },
  });

    // NEW: Effect to pre-fill the form in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({
        company_name: initialData.company_name || "",
        company_city: initialData.company_city || "",
        company_type: initialData.company_type || "",
        company_website: initialData.company_website || "",
      });
    }
  }, [isEditMode, initialData, form]);


//   const onSubmit = async (values: CompanyFormValues) => {
//     try {
//       const res = await createDoc("CRM Company", values);
//       await mutate("CRM Company");
//       toast({ title: "Success!", description: `Company "${res.company_name}" created.` });
//       onSuccess?.();
//     } catch (error) {
//       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
//     }
//   };

const onSubmit = async (values: CompanyFormValues) => {
    try {
      if (isEditMode) {
        // --- UPDATE LOGIC ---
        await updateDoc("CRM Company", initialData.name, values);
        await mutate(`CRM Company/${initialData.name}`); // Mutate specific doc
        toast({ title: "Success!", description: "Company updated." });
      } else {
        // --- CREATE LOGIC ---
        const res = await createDoc("CRM Company", values);
        toast({ title: "Success!", description: `Company "${res.company_name}" created.` });
      }
      await mutate("CRM Company"); // Mutate the list
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

   const loading = createLoading || updateLoading;
  const handleCancel = isEditMode ? closeEditCompanyDialog : closeNewCompanyDialog;


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl><Input placeholder="e.g. Zepto" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl><Input placeholder="e.g. Bengaluru" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Type</FormLabel>
              <FormControl>
                <ReactSelect
                  options={companyTypeOptions}
                  value={companyTypeOptions.find(c => c.value === field.value)}
                  onChange={val => field.onChange(val?.value)}
                  placeholder="Select Type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Website is no longer required but still here */}
        <FormField
          control={form.control}
          name="company_website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Website</FormLabel>
              <FormControl><Input placeholder="e.g. www.zepto.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

       <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button type="submit" className="bg-destructive hover:bg-destructive/90" disabled={loading}>
            {loading ? "Saving..." : "Confirm"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { CustomSelect } from "@/components/ui/custom-select";
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
// import { CRMCompanyType } from "@/types/NirmaanCRM/CRMCompanyType";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useFrappeCreateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
// import { useCallback, useMemo, useState } from "react";
// import { Control, FieldValues, useController, useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
// import ReactSelect from 'react-select';
// import * as z from "zod";
// import NewCompanyTypeForm from "./NewCompanyTypeForm";

// const companyFormSchema = z.object({
//     company_name: z
//         .string({
//             required_error: "Required!"
//         })
//         .min(3, {
//             message: "Minimum 3 characters required!",
//         }),
//     company_location: z.string().optional(),
//     location: z.string().optional(),
//     company_website : z.string().optional(),
//     industry : z.string().optional(),
// });

// type CompanyFormValues = z.infer<typeof companyFormSchema>;

// export const NewCompanyForm = () => {

//     const navigate = useNavigate()
//     const {mutate} = useSWRConfig()
//     const {isMobile} = useViewport()
//     const [companyTypeDialogOpen, setCompanyTypeDialogOpen] = useState(false);

//     const toggleCompanyTypeDialog = useCallback(() => {
//         setCompanyTypeDialogOpen((prevState) => !prevState);
//     }, [companyTypeDialogOpen]);

//     const {createDoc , loading: createLoading} = useFrappeCreateDoc()

//     const {data : companyTypesList, isLoading: companyTypesListLoading} = useFrappeGetDocList<CRMCompanyType>("CRM Company Type", {
//         fields: ["*"],
//         limit: 1000
//     }, "CRM Company Type")

//     const form = useForm<CompanyFormValues>({
//         resolver: zodResolver(companyFormSchema),
//         defaultValues: {},
//         mode: "onBlur",
//     });

//     const onSubmit = async (values: CompanyFormValues) => {
//         try {
//             const isValid = await form.trigger()
//             if(isValid) {
//                 const res = await createDoc("CRM Company", {
//                     company_name: values.company_name,
//                     company_location: values.company_location === "Other" ? values.location : values.company_location,
//                     company_website: values?.company_website && (!values.company_website.startsWith("https://") ? `https://${values.company_website}` : values.company_website),
//                     industry: values.industry,
//                 })
//                 await mutate("CRM Company")

//                 navigate(-1)

//                 toast({
//                     title: "Success!",
//                     description: `Company ${res.company_name} created successfully!`,
//                     variant: "success"
//                 })
//             }
//         } catch (error) {
//             console.log("error", error)
//             toast({
//                 title: "Failed!",
//                 description: error?.message || "Failed to create company!",
//                 variant: "destructive"
//             })
//         }
//     }

//     const companyTypeOptions = useMemo(() => companyTypesList?.map(com => ({label : com?.name, value : com?.name})) || [], [companyTypesList])

//     const companyLocationOptions = useMemo(() => [
//         { label: "Bangalore", value: "Bangalore" },
//         { label: "Chennai", value: "Chennai" },
//         { label: "Hyderabad", value: "Hyderabad" },
//         { label: "Kolkata", value: "Kolkata" },
//         { label: "Mumbai", value: "Mumbai" },
//         { label: "Pune", value: "Pune" },
//         {label: "Delhi", value: "Delhi"},
//         {label: "Ahmedabad", value: "Ahmedabad"},
//         {label: "Gurgaon", value: "Gurgaon"},
//         {label: "Other", value: "Other"},
//     ], []);

//     const companyLocation = form.watch("company_location");

//     if(companyTypesListLoading) {
//         return <div>Loading...</div>
//     }

//     return (
//         <div className={`w-full relative ${!isMobile ? "p-4 border cardBorder shadow rounded-lg" : ""}`}>
//              {!isMobile && (
//                 <h2 className="text-center font-bold">Add New Company</h2>
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
//                         name="company_name"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Company Name<sup className="text-sm text-destructive">*</sup></FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="Enter Company Name" {...field} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="company_location"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Location</FormLabel>
//                                 <FormControl>
//                                     <ReactSelect className="text-sm text-muted-foreground" placeholder="Select Location" options={companyLocationOptions} onBlur={field.onBlur} name={field.name} onChange={(e) => field.onChange(e.value)} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />

//                     {companyLocation === "Other" && (
//                         <FormField
//                             control={form.control}
//                             name="location"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormControl>
//                                         <Input placeholder="Enter Location manually" {...field} />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     )}

//                     <FormField
//                         control={form.control}
//                         name="company_website"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Website</FormLabel>
//                                 <FormControl>
//                                     <WebsiteInput control={form.control} name="company_website" />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="industry"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel className="flex">Company Type</FormLabel>
//                                 <FormControl>
//                                 <CustomSelect 
//                                     options={companyTypeOptions}
//                                     onAddItemClick={toggleCompanyTypeDialog}
//                                     addButtonLabel="Add New Company Type"
//                                     placeholder="Select Company Type"
//                                     onChange={(e) => field.onChange(e?.value)}
//                                     value={companyTypeOptions.find(opt => opt.value === field.value)}
//                                     // isSearchable
//                                     // menuPortalTarget={document.body}
//                                     // menuPosition="absolute"
//                                     // styles={{
//                                     //     menuPortal: base => ({ ...base, zIndex: 9999 }),
//                                     // }}
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                 </form>
//             </Form>
//             <AlertDialog open={companyTypeDialogOpen} onOpenChange={toggleCompanyTypeDialog}>
//                 <AlertDialogContent>
//                     <AlertDialogHeader className="text-start">
//                         <AlertDialogTitle className="text-destructive text-center">Add New Company Type</AlertDialogTitle>
//                         <AlertDialogDescription asChild>
//                             <NewCompanyTypeForm toggleNewCompanyTypeDialog={toggleCompanyTypeDialog} />
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>
//                 </AlertDialogContent>
//             </AlertDialog>
//             <div className="sticky bottom-0 flex flex-col gap-2">
//                 <Button onClick={() => onSubmit(form.getValues())}>Next</Button>
//                 <Button onClick={() => {
//                     if(isMobile) {
//                         navigate(-1)
//                     } else {
//                         navigate("/prospects?tab=company")
//                     }
//                 }} variant={"outline"} className="text-destructive border-destructive">Cancel</Button>
//             </div>
//         </div>
//     )
// }

// interface WebsiteInputProps<TFieldValues extends FieldValues = FieldValues> {
//     control: Control<TFieldValues>;
//     name: string;
//   }

// const WebsiteInput = <TFieldValues extends FieldValues = FieldValues>({ control, name } : WebsiteInputProps<TFieldValues>) => {
//     const { field } = useController({ control, name });
  
//     const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
//       let value = e.target.value;
//       field.onChange(value);
//     };
  
//     return (
//       <div className="relative w-full">
//         <span className="absolute left-3 top-1/2 transform -translate-y-1/2 font-semibold select-none">
//           https://
//         </span>
  
//         <Input
//           type="text"
//           className="pl-[80px]"
//           placeholder="Enter Company Website"
//           value={field.value}
//           onChange={handleChange}
//         />
//       </div>
//     );
//   };