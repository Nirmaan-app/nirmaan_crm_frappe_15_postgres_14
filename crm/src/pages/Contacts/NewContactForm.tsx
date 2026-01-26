

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useDialogStore } from "@/store/dialogStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFrappeCreateDoc, useFrappeGetDoc, useSWRConfig,useFrappeGetDocList,useFrappeFileUpload,useFrappeUpdateDoc } from "frappe-react-sdk";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactSelect from 'react-select';
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef,useMemo,useEffect,useCallback } from "react"; // Import useState and useRef
import { Upload } from "lucide-react";
import {CRMContacts} from "@/types/NirmaanCRM/CRMContacts"
import {CustomAttachment} from "@/components/helpers/CustomAttachment"
//Getting Role For Assigned
import {useUserRoleLists} from "@/hooks/useUserRoleLists"


const contactFormSchema = z.object({
  first_name: z.string().min(1, "Name is required"),
  last_name: z.string().optional(),
  mobile: z.string().min(10, "Enter a valid mobile number").max(13, "Enter a valid mobile number"),
  email: z.string().email("Enter a valid email address"),
  company: z.string().min(1, "Company is required"),
  department: z.string().optional(),
  designation: z.string().optional(),
  visiting_card: z.any().optional(),
  assigned_sales: z.string().optional(),
  linkedin_profile: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    // Add a new field for the "Other" department input
  other_department: z.string().optional(), 
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// --- CHANGE 1: Update component props ---
interface ContactFormProps {
  onSuccess?: () => void;
  isEditMode?: boolean;
  initialData?: CRMContacts | null;
}

export const NewContactForm = ({ onSuccess, isEditMode = false, initialData = null }: ContactFormProps) => {
  const { newContact, editContact, closeNewContactDialog, closeEditContactDialog } = useDialogStore();
  const { createDoc, loading :createLoading} = useFrappeCreateDoc();
    const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc(); 

const { data: allContacts } = useFrappeGetDocList("CRM Contacts", {
        fields: ["name", "email"], limit: 0,
    },"all-contacts-existornot");

//Hooks get Sales UserList
  const { salesUserOptions, isLoading: usersLoading } = useUserRoleLists();
    
  const { mutate } = useSWRConfig();
  const { upload: uploadFile, loading: isUploading } = useFrappeFileUpload()
  const role=localStorage.getItem("role")

  // CORRECTED: State and ref for file handling
  const [visitingCard, setVisitingCard] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
 // Determine the context based on the mode
  const context = isEditMode ? editContact.context.contactData : newContact.context;
  const companyIdFromContext = isEditMode ? initialData?.company : newContact.context.companyId;

   const { data: allCompaniesData, isLoading: companiesLoading } = useFrappeGetDocList<CRMCompany>(
    "CRM Company",
   { 
      fields: ["name", "company_name", "company_nick"],
      limit: 0,
      enabled: !companyIdFromContext
    }
  );

  // 2. Fetch the full list of companies ONLY if NO ID is passed in the context

const allCompanies = allCompaniesData || [];
  // console.log("All Companies ",allCompanies)

  const companyOptions = useMemo(() =>
    allCompanies?.map(c => ({ label: c.company_nick ? `${c.company_name} (${c.company_nick})` : c.company_name, value: c.name })),
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
      other_department: "",
      linkedin_profile: "",
    },
  });
   // --- 2. WATCH THE DEPARTMENT FIELD ---
  const watchedDepartment = form.watch("department");

  // --- CHANGE 3: useEffect to pre-fill form for both create and edit ---
  useEffect(() => {
    if (isEditMode && initialData) {
      // Pre-fill form with existing data for editing
       const standardDepartments = departmentOptions.map(opt => opt.value);
      const initialDept = initialData.department || "";
      const isOther = initialDept && !standardDepartments.includes(initialDept);

      form.reset({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        mobile: initialData.mobile || "",
        email: initialData.email || "",
        company: initialData.company || "",
        department: isOther ? "Others" : initialDept,
        other_department: isOther ? initialDept : "",
        designation: initialData.designation || "",
        assigned_sales:initialData.assigned_sales|| "",
        linkedin_profile: initialData.linkedin_profile || "", // *** NEW: Pre-fill LinkedIn ***

      });
    } else {
      // Reset form for creating a new contact
      form.reset({
        company: companyIdFromContext || "",
        first_name: "",
        last_name: "",
        mobile: "",
        email: "",
        department: "",
        designation: "",
        linkedin_profile: "", // *** NEW: Reset LinkedIn ***
      });
    }
  }, [isEditMode, initialData, newContact.context, form]);




const uploadVisitingCard = useCallback(async (contactName: string, file: File) => {
    if (!file) return null;

    try {
        const result = await uploadFile(file, {
            doctype: "CRM Contacts",
            docname: contactName,
            fieldname: "visiting_card", // Ensure this fieldname matches your DocType
            isPrivate: true // Good practice for personal info
        });
        // console.log("Visiting card upload successful:", result);
        return result.file_url; // Return the URL
    } catch (error) {
        console.error("Upload Error:", error);
        toast({
            title: "Upload Failed",
            description: `Failed to upload visiting card: ${error instanceof Error ? error.message : String(error)}`,
            variant: "destructive"
        });
        throw error; // Stop the form submission if upload fails
    }
}, [uploadFile]); 


  const onSubmit = async (values: ContactFormValues) => {
    try {

              if (!isEditMode) {
            const trimmedEmail = values.email.trim().toLowerCase();
            const existingContact = allContacts?.find(
                c => c.email.trim().toLowerCase() === trimmedEmail
            );

            if (existingContact) {
                toast({
                    title: "Duplicate Contact",
                    description: `A contact with the email "${values.email}" already exists.`,
                    variant: "destructive"
                });
                return; // Stop the submission
            }
        }
        

        
   const visitingCardFile = values.visiting_card; 

const dataToSave={
  ...values,
    department: values.department === 'Others' ? values.other_department : values.department,
    full_name:`${values.first_name} ${values.last_name}`

}
      if (isEditMode) {
        // UPDATE logic
        let fileUrl = initialData.visiting_card || null; // Start with the existing URL

            // If a *new* file has been selected, upload it
            if (visitingCardFile && typeof visitingCardFile !== 'string') {
                fileUrl = await uploadVisitingCard(initialData.name, visitingCardFile);
            }

        await updateDoc("CRM Contacts", initialData.name,{...dataToSave,visiting_card: fileUrl} );
        mutate(`Contact/${initialData.name}`);
        toast({ title: "Success!", description: "Contact updated." });
      } else {
            // --- CREATE LOGIC (CORRECTED) ---
            
            // Step 1: Create the contact document WITHOUT the file URL first.
            const newContactDoc = await createDoc("CRM Contacts", {...dataToSave,visiting_card:""});
            toast({ title: "Success!", description: `Contact "${newContactDoc.first_name}" created.` });

            // Step 2: If a visiting card file exists, upload it and update the document.
            if (visitingCardFile) {
                toast({ title: "Uploading File...", description: "Please wait." });
                // Use the name from the newly created document
                const fileUrl = await uploadVisitingCard(newContactDoc.name, visitingCardFile);

                // Step 3: Update the new contact with the file's URL.
                await updateDoc("CRM Contacts", newContactDoc.name, { visiting_card: fileUrl });
            }
        }
      
       
     await mutate( key => typeof key === 'string' && key.startsWith('all-contacts-')); // Mutate the list
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  const loading = createLoading || updateLoading;
  const handleCancel = isEditMode ? closeEditContactDialog : closeNewContactDialog;




  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name<sup>*</sup></FormLabel>
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
              <FormLabel>Mobile<sup>*</sup></FormLabel>
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
              <FormLabel>Email<sup>*</sup></FormLabel>
              <FormControl><Input type="email" placeholder="e.g. john.doe@example.com" {...field} disabled={isEditMode} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company<sup>*</sup></FormLabel>
              <FormControl>
                {/* {companyIdFromContext ? (
                  // If context exists, show a disabled input with the company name.
                  <Input value={companyIdFromContext || 'Loading...'} disabled />
                ) : ( */}
                  <ReactSelect
                    options={companyOptions}
                    value={companyOptions.find(c => c.value === field.value)}
                    onChange={val => field.onChange(val?.value)}
                    placeholder="Search and select a company"
                    isLoading={!allCompanies} // Show loading indicator while fetching
                    menuPosition="auto"
                    isOptionDisabled={(option) => option.value === field.value}
                  />
                {/* )} */}
              </FormControl>
              <FormMessage />
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
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <ReactSelect
                  options={departmentOptions}
                  // Find the full option object that matches the current field value
                  value={departmentOptions.find(d => d.value === field.value)}
                  // When an option is selected, update the form state with just the value
                  onChange={option => field.onChange(option?.value)}
                  placeholder="Select Department"
                  isOptionDisabled={(option) => option.value === field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         {watchedDepartment === 'Others' && (
          <FormField
            control={form.control}
            name="other_department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Please specify department</FormLabel>
                <FormControl>
                  <Input placeholder="Enter department name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

         <FormField
          control={form.control}
          name="linkedin_profile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile URL</FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://linkedin.com/in/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

         <FormField
  control={form.control}
  name="visiting_card"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Visiting Card</FormLabel>
      <FormControl>
       
        <CustomAttachment
          maxFileSize={20 * 1024 * 1024} // 20MB
          selectedFile={field.value} // Use the value from the form field
          onFileSelect={field.onChange} // Use the onChange from the form field
          label="Attach Visiting Card"
          className="w-full"
          disabled={loading} // Use the combined loading state
        />
      </FormControl>
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
