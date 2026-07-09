// Inline, collapsible "resolve the Unknown contact" panel shown inside the task
// update dialog. On open it first lets the user SELECT an existing contact of
// this company (the "Unknown" placeholder is excluded); if none fits they switch
// to CREATE a new contact. Either way the chosen contact is linked to the task
// directly — no second dialog.
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReactSelect from "react-select";
import { useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDocList, useSWRConfig } from "frappe-react-sdk";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { UNKNOWN_CONTACT_ID } from "@/constants/unknownContact";

const resolveContactSchema = z.object({
  first_name: z.string().min(1, "Name is required"),
  last_name: z.string().optional(),
  mobile: z.string().min(10, "Enter a valid mobile number").max(13, "Enter a valid mobile number"),
  email: z.string().email("Enter a valid email address"),
  designation: z.string().optional(),
  department: z.string().optional(),
  other_department: z.string().optional(),
  linkedin_profile: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  assigned_sales: z.string().optional(),
});
type ResolveContactValues = z.infer<typeof resolveContactSchema>;

const departmentOptions = [
  { label: "Project", value: "Project" },
  { label: "Quantity Survey Estimation", value: "Quantity Survey Estimation" },
  { label: "Procurement", value: "Procurement" },
  { label: "Senior Management", value: "Senior Management" },
  { label: "Others", value: "Others" },
];

interface ResolveContactSectionProps {
  companyId: string;
  taskName: string;
  onResolved: (contact: { name: string; first_name: string }) => void;
}

export const ResolveContactSection = ({ companyId, taskName, onResolved }: ResolveContactSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subMode, setSubMode] = useState<"select" | "create">("select");
  const [selectedExisting, setSelectedExisting] = useState<string | null>(null);

  const { createDoc, loading: creating } = useFrappeCreateDoc();
  const { updateDoc, loading: updating } = useFrappeUpdateDoc();
  const { mutate } = useSWRConfig();
  const role = localStorage.getItem("role");
  const { salesUserOptions, isLoading: usersLoading } = useUserRoleLists();

  // This company's real contacts (the Unknown placeholder has no company, so it
  // is already out, but exclude it defensively).
  const { data: companyContacts, isLoading: contactsLoading } = useFrappeGetDocList<CRMContacts>(
    "CRM Contacts",
    { filters: [["company", "=", companyId]], fields: ["name", "first_name", "last_name"], limit: 0 },
    `all-contacts-resolve-${companyId}`
  );
  const existingOptions = (companyContacts || [])
    .filter(c => c.name !== UNKNOWN_CONTACT_ID)
    .map(c => ({ label: `${c.first_name} ${c.last_name || ""}`.trim(), value: c.name }));
  const hasExisting = existingOptions.length > 0;
  const showSelect = subMode === "select" && hasExisting;

  const form = useForm<ResolveContactValues>({
    resolver: zodResolver(resolveContactSchema),
    defaultValues: {
      first_name: "", last_name: "", mobile: "", email: "",
      designation: "", department: "", other_department: "", linkedin_profile: "", assigned_sales: "",
    },
  });
  const watchedDepartment = form.watch("department");
  const loading = creating || updating;

  // Link an already-existing contact of this company to the task.
  const onLinkExisting = async () => {
    if (!selectedExisting) return;
    try {
      await updateDoc("CRM Task", taskName, { contact: selectedExisting });
      await mutate(key => typeof key === "string" && key.startsWith("all-tasks-"));
      await mutate("CRM Task");
      const chosen = companyContacts?.find(c => c.name === selectedExisting);
      const firstName = chosen?.first_name || selectedExisting;
      toast({ title: "Contact linked", description: `Task linked to "${firstName}".` });
      setIsOpen(false);
      onResolved({ name: selectedExisting, first_name: firstName });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  // Create a brand-new contact and link it to the task.
  const onCreate = async (values: ResolveContactValues) => {
    try {
      const department = values.department === "Others" ? values.other_department : values.department;
      const newContact = await createDoc("CRM Contacts", {
        first_name: values.first_name,
        last_name: values.last_name || "",
        mobile: values.mobile,
        email: values.email,
        company: companyId,
        designation: values.designation || "",
        department: department || "",
        linkedin_profile: values.linkedin_profile || "",
        // For Sales users the backend overwrites this with the owner; for Admin
        // the picked value is kept (before_insert only stamps Sales users).
        assigned_sales: values.assigned_sales || "",
      });

      await updateDoc("CRM Task", taskName, { contact: newContact.name });
      await mutate(key => typeof key === "string" && key.startsWith("all-contacts-"));
      await mutate(key => typeof key === "string" && key.startsWith("all-tasks-"));
      await mutate("CRM Task");

      toast({ title: "Contact resolved", description: `Task linked to "${newContact.first_name}".` });
      setIsOpen(false);
      form.reset();
      onResolved({ name: newContact.name, first_name: newContact.first_name });
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-900">This task's contact is “Unknown”.</p>
          <p className="text-xs text-amber-700">Pick an existing contact for this company, or add a new one.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-amber-500 text-amber-900 hover:bg-amber-100 whitespace-nowrap"
          onClick={() => setIsOpen(o => !o)}
        >
          Resolve Contact
          {isOpen ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3 border-t border-amber-200 pt-3">
          <p className="text-xs text-amber-800">Company: <span className="font-medium">{companyId}</span></p>

          {contactsLoading ? (
            <p className="text-sm text-amber-700">Loading contacts…</p>
          ) : showSelect ? (
            /* --- SELECT AN EXISTING COMPANY CONTACT --- */
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Select existing contact</label>
                <ReactSelect
                  options={existingOptions}
                  value={existingOptions.find(o => o.value === selectedExisting) || null}
                  onChange={opt => setSelectedExisting(opt?.value || null)}
                  placeholder="Select a contact from this company"
                  menuPosition="auto"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" className="px-0 text-amber-900" onClick={() => setSubMode("create")}>
                  + Create new contact
                </Button>
                <Button type="button" className="bg-destructive hover:bg-destructive/90" onClick={onLinkExisting} disabled={!selectedExisting || loading}>
                  {loading ? "Linking…" : "Link Contact"}
                </Button>
              </div>
            </div>
          ) : (
            /* --- CREATE A NEW CONTACT --- */
            <Form {...form}>
              <div className="space-y-3">
                <FormField name="first_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Name<sup>*</sup></FormLabel><FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="mobile" control={form.control} render={({ field }) => (<FormItem><FormLabel>Mobile<sup>*</sup></FormLabel><FormControl><Input type="tel" placeholder="e.g. 9876543210" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email<sup>*</sup></FormLabel><FormControl><Input type="email" placeholder="e.g. john@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="designation" control={form.control} render={({ field }) => (<FormItem><FormLabel>Designation</FormLabel><FormControl><Input placeholder="e.g. Manager" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField name="department" control={form.control} render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><FormControl><ReactSelect options={departmentOptions} value={departmentOptions.find(d => d.value === field.value)} onChange={opt => field.onChange(opt?.value)} placeholder="Select Department" menuPosition="auto" /></FormControl><FormMessage /></FormItem>)} />
                {watchedDepartment === "Others" && (
                  <FormField name="other_department" control={form.control} render={({ field }) => (<FormItem><FormLabel>Specify department</FormLabel><FormControl><Input placeholder="Enter department" {...field} /></FormControl><FormMessage /></FormItem>)} />
                )}
                <FormField name="linkedin_profile" control={form.control} render={({ field }) => (<FormItem><FormLabel>LinkedIn Profile URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                {role === "Nirmaan Admin User Profile" && (
                  <FormField name="assigned_sales" control={form.control} render={({ field }) => (<FormItem><FormLabel>Assigned Salesperson</FormLabel><FormControl><ReactSelect options={salesUserOptions} value={salesUserOptions.find(u => u.value === field.value)} onChange={val => field.onChange(val?.value)} placeholder="Select a salesperson..." isLoading={usersLoading} menuPosition="auto" /></FormControl><FormMessage /></FormItem>)} />
                )}
                <div className="flex gap-2 justify-end">
                  {hasExisting && (
                    <Button type="button" variant="ghost" className="mr-auto px-0 text-amber-900" onClick={() => setSubMode("select")}>
                      ← Select existing
                    </Button>
                  )}
                  <Button type="button" variant="outline" onClick={() => { setIsOpen(false); form.reset(); }} disabled={loading}>Cancel</Button>
                  <Button type="button" className="bg-destructive hover:bg-destructive/90" onClick={form.handleSubmit(onCreate)} disabled={loading}>
                    {loading ? "Saving…" : "Save Contact"}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </div>
      )}
    </div>
  );
};
