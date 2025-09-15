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
import { useMemo,useEffect,useState ,useCallback} from "react";
import { CRMCompanyType } from "@/types/NirmaanCRM/CRMCompanyType";
//Getting Role For Assigned
import {useUserRoleLists} from "@/hooks/useUserRoleLists"
import { NewCompanyTypeForm } from "./NewCompanyTypeForm";
import { CustomSelect } from "@/components/ui/custom-select";
import { LocationOptions } from "@/constants/dropdownData";

import { ReusableCompanyTypeDialog } from "@/components/ui/ReusableDialogs";


import { useViewport } from "@/hooks/useViewPort"; // --- NEW: Import useViewport ---
import { Plus } from "lucide-react"; // --- NEW: Import Plus icon ---
import {TeamSizeOptions} from "@/constants/dropdownData";





// Zod Schema based on your Frappe Doctype and UI Mockup
const companyFormSchema = z.object({
company_name: z.string()
    .min(1, "Company name is required")
    .regex(/^[a-zA-Z0-9\s-]/, "Only letters, numbers, spaces, and hyphens are allowed."),

  company_city: z.string().min(1, "Location is required"),
   other_company_city: z.string().optional(), 
  company_type: z.string().min(1, "Company type is required"),
   company_website: z.string().optional(),
  assigned_sales: z.string().optional(),
    team_size: z.enum(TeamSizeOptions.map(opt => opt.value)).optional().nullable()
                 .transform(e => e === null ? undefined : e),

  // projects_per_month remains a number
  projects_per_month: z.union([
      z.number().min(0, "Projects per month cannot be negative"),
      z.literal(NaN),
      z.null()
  ]).optional()
    .transform(e => (e === null || e === undefined) ? undefined : Number(e)),

  
}).superRefine((data, ctx) => {
    // --- Custom validation for 'Other' city option ---
    if (data.company_city === "Others" && (!data.other_company_city || data.other_company_city.trim() === "")) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please specify the city.",
            path: ['other_company_city'],
        });
    }

    // --- Custom validation for website URL ---
    if (data.company_website && data.company_website.trim() !== "" && 
        !data.company_website.startsWith("http://") && !data.company_website.startsWith("https://") && !data.company_website.startsWith("www.")) {
        // If it's not a valid URL starting with http/https, mark it as invalid here.
        // We will prepend 'https://' during submission.
        try {
            z.string().url().parse(`https://${data.company_website}`);
        } catch (e) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please enter a valid URL (e.g., www.example.com or https://example.com).",
                path: ['company_website'],
            });
        }
    }
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
  const {isMobile}=useViewport()

 const [isCompanyTypeDialogOpen, setCompanyTypeDialogOpen] = useState(false);

    const toggleCompanyTypeDialog = useCallback(() => {
        setCompanyTypeDialogOpen((prevState) => !prevState);
    }, []);

// Add this hook to get all company names for validation
const { data: allCompanies } = useFrappeGetDocList("CRM Company", {
    fields: ["name", "company_name"], limit: 0,},"all-companies-existornot");
//Hooks get Sales UserList
  const { salesUserOptions, isLoading: usersLoading } = useUserRoleLists();

  const role=localStorage.getItem("role")
  
  const { data: companyTypes } = useFrappeGetDocList<CRMCompanyType>("CRM Company Type", { fields: ["name"], limit: 0, },"CRM Company Type");
  
  const companyTypeOptions = useMemo(() => 
    companyTypes?.map(ct => ({ label: ct.name, value: ct.name })) || [], 
    [companyTypes]
  );


  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      company_name: "",
      company_city: "",
            other_company_city: "", 
      company_type: "",
      company_website: "",
      assigned_sales: "",
       team_size: undefined, // Changed to undefined for ReactSelect
    projects_per_month: undefined,
    },
  });

   const selectedCompanyCity = form.watch("company_city"); 

    // NEW: Effect to pre-fill the form in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
            const isStandardCity = LocationOptions.some(opt => opt.value === initialData.company_city);
 
      form.reset({
        company_name: initialData.company_name || "",
              company_city: isStandardCity ? initialData.company_city : "Others", // If not standard, set to "Others"
        other_company_city: isStandardCity ? "" : initialData.company_city, // If not standard, fill the 'other' field

        company_type: initialData.company_type || "",
        company_website: initialData.company_website || "",
        assigned_sales: initialData.assigned_sales || "",
              // --- NEW: Pre-fill new fields in edit mode ---
      team_size: initialData.team_size ?? undefined, // Should now be the string value or null/undefined
      projects_per_month: Number(initialData.projects_per_month) ?? undefined,

      });
    }else {
        // Reset default for new forms
        form.reset({
            company_name: "", company_city: "", other_company_city: "",
            company_type: "", company_website: "", assigned_sales: "",
            team_size: undefined, // Reset to undefined
      projects_per_month: undefined,
        });
    }
  }, [isEditMode, initialData, form]);

const onSubmit = async (values: CompanyFormValues) => {
    try {
        const trimmedNewName = values.company_name.trim();
      
      const existingCompany = allCompanies?.find(
        c => c.company_name.toLowerCase() === trimmedNewName.toLowerCase()
      );

      if (existingCompany && (!isEditMode || (isEditMode && existingCompany.name !== initialData?.name))) {
          toast({
              title: "Duplicate Name",
              description: `A company named "${trimmedNewName}" already exists.`,
              variant: "destructive"
          });
          return; // Stop the submission
      }
     
      const dataToSubmit = { ...values };
      
      // 2. City logic: If "Others" is selected, use the value from 'other_company_city'
      if (dataToSubmit.company_city === "Others") {
          dataToSubmit.company_city = dataToSubmit.other_company_city?.trim() || "";
      }
      // Remove the temporary other_company_city field from the payload
      delete dataToSubmit.other_company_city;


      // 3. Website URL formatting logic
      if (dataToSubmit.company_website && dataToSubmit.company_website.trim() !== "") {
          let formattedWebsite = dataToSubmit.company_website.trim();
          if (!formattedWebsite.startsWith("http://") && !formattedWebsite.startsWith("https://")) {
              formattedWebsite = `https://${formattedWebsite}`;
          }
          dataToSubmit.company_website = formattedWebsite;
      }

      if (isEditMode) {
        // --- UPDATE LOGIC ---
        await updateDoc("CRM Company", initialData.name, dataToSubmit);
        await mutate(`Company/${initialData.name}`); // Mutate specific doc
        toast({ title: "Success!", description: "Company updated." });
      } else {
        // --- CREATE LOGIC ---
        const res = await createDoc("CRM Company", dataToSubmit);
        toast({ title: "Success!", description: `Company "${res.company_name}" created.` });
      }
      await mutate( key => typeof key === 'string' && key.startsWith('all-companies-')); // Mutate the list
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

   const loading = createLoading || updateLoading;
  const handleCancel = isEditMode ? closeEditCompanyDialog : closeNewCompanyDialog;


  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name<sup>*</sup></FormLabel>
              <FormControl><Input placeholder="e.g. Zepto" {...field} disabled={isEditMode} 
 /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      
          <FormField
          control={form.control}
          name="company_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City<sup>*</sup></FormLabel>
              <FormControl>
                <ReactSelect
                  options={LocationOptions} // Using the imported LocationOptions
                  value={LocationOptions.find(c => c.value === field.value)}
                  onChange={val => {
                    field.onChange(val?.value);
                    // Clear 'other_company_city' if "Others" is deselected
                    if (val?.value !== "Others") {
                        form.setValue("other_company_city", "");
                    }
                  }}
                  placeholder="Select City"
                  menuPosition={'auto'}
             
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         {selectedCompanyCity === "Others" && (
            <FormField
                control={form.control}
                name="other_company_city"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Specify City<sup>*</sup></FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. New City Name" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}


         

           <FormField
            control={form.control}
            name="company_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Type<sup>*</sup></FormLabel>
                <FormControl>
                 <CustomSelect
                    options={companyTypeOptions}
                    value={companyTypeOptions.find(c => c.value === field.value)}
                    onChange={val => field.onChange(val?.value)}
                    placeholder="Select Type"
                    isOptionDisabled={(option) => option.value === field.value}
                    // Props for the "Add New" button
                    
                 {...(!isMobile && {
                        onAddItemClick: toggleCompanyTypeDialog,
                        addButtonLabel: "Add New Company Type",
                    })}

                     menuPosition={'auto'}
                    
                  />
                </FormControl>
                <FormMessage />
                {isMobile && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full border-dashed"
                        onClick={toggleCompanyTypeDialog}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add New Company Type
                    </Button>
                )}
              </FormItem>
            )}
          />

         {role==="Nirmaan Admin User Profile" &&(
         <FormField
                    control={form.control}
                    name="assigned_sales"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assigned Salesperson</FormLabel>
                            <FormControl>
                                <ReactSelect
                                    options={salesUserOptions}
                                    value={salesUserOptions.find(u => u.value === field.value)}
                                    onChange={val => field.onChange(val?.value)}
                                    placeholder="Select a salesperson..."
                                    isLoading={usersLoading}
                                    className="text-sm"
                                    menuPosition={'auto'}
                                    
                                    isOptionDisabled={(option) => option.value === field.value}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
        )}
        
<FormField
  control={form.control}
  name="team_size"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Team Size</FormLabel>
      <FormControl>
        <ReactSelect
          options={TeamSizeOptions} // Use the defined options
          value={TeamSizeOptions.find(opt => opt.value === field.value) || null} // Find current value
          onChange={val => field.onChange(val ? val.value : undefined)} // Update field with selected value
          placeholder="Select Team Size"
          isClearable={true} // Allow clearing the selection
          menuPosition={'auto'}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* projects_per_month field remains as it was */}
<FormField
  control={form.control}
  name="projects_per_month"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Projects Per Month</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="e.g. 5"
          {...field}
          onChange={(e) => {
            const value = e.target.value;
            field.onChange(value === "" ? undefined : Number(value));
          }}
          value={field.value ?? ""}
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
    <ReusableCompanyTypeDialog
        open={isCompanyTypeDialogOpen}
        onOpenChange={toggleCompanyTypeDialog}
        title="Add New Company Type"
         modal={true}
  className="z-[9999]"
        // We pass the NewCompanyTypeForm as a child
        
      >
        <NewCompanyTypeForm 
            onSuccess={toggleCompanyTypeDialog} 
        />
      </ReusableCompanyTypeDialog>

    </>
  );
};
