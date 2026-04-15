import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactSelect from "react-select";
import { useFrappeCreateDoc, useFrappeUpdateDoc, useSWRConfig, useFrappeGetDocList } from "frappe-react-sdk";
import { toast } from "@/hooks/use-toast";

interface PackageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    pkg: any | null; // null means Add, otherwise Edit
}

export const PackageDialog = ({ isOpen, onClose, pkg }: PackageDialogProps) => {
    const isEdit = !!pkg;
    const [packageName, setPackageName] = useState("");
    const [assignedLead, setAssignedLead] = useState("");

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { mutate } = useSWRConfig();

    // Fetch ONLY users with the Estimation Lead Profile role
    const { data: leads, isLoading: usersLoading } = useFrappeGetDocList("CRM Users", {
        fields: ["name", "full_name"],
        filters: [["nirmaan_role_name", "=", "Nirmaan Estimations Lead Profile"]],
        limit: 0
    });

    useEffect(() => {
        if (pkg) {
            setPackageName(pkg.package_name || "");
            setAssignedLead(pkg.assigned_lead || "");
        } else {
            setPackageName("");
            setAssignedLead("");
        }
    }, [pkg]);

    const leadOptions = leads?.map((lead: any) => ({
        value: lead.name,
        label: lead.full_name
    })) || [];

    const handleSubmit = async () => {
        if (!packageName) {
            toast({ title: "Error", description: "Package Name is required.", variant: "destructive" });
            return;
        }

        try {
            if (isEdit) {
                await updateDoc("CRM BOQ Package", pkg.name, {
                    assigned_lead: assignedLead || null
                });
                toast({ title: "Updated", description: `Package "${packageName}" updated.` });
            } else {
                await createDoc("CRM BOQ Package", {
                    package_name: packageName,
                    assigned_lead: assignedLead || null
                });
                toast({ title: "Created", description: `Package "${packageName}" created.` });
            }
            mutate(key =>
                (typeof key === 'string' && key.includes('CRM BOQ Package')) ||
                (Array.isArray(key) && key[0] === 'CRM BOQ Package')
            );
            onClose();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Package Mapping" : "Add New Package"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the Estimation Lead assigned to this package."
                            : "Define a package and statically map it to an Estimation Lead."}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="package-name">Package Name <sup>*</sup></Label>
                        <Input
                            id="package-name"
                            value={packageName}
                            onChange={(e) => setPackageName(e.target.value)}
                            placeholder="e.g. Electrical Work"
                            disabled={isEdit} // Doctype autonames from package_name, changing it requires rename!
                            className={isEdit ? "bg-muted" : ""}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Assigned Estimation Lead</Label>
                        <ReactSelect
                            options={leadOptions}
                            value={leadOptions.find((opt: any) => opt.value === assignedLead) || null}
                            onChange={(val: any) => setAssignedLead(val?.value || "")}
                            isLoading={usersLoading}
                            isClearable
                            placeholder="Select a lead..."
                            className="text-sm"
                        // menuPosition="fixed"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={creating || updating}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={creating || updating} className="bg-destructive hover:bg-destructive/90 text-white">
                        {creating || updating ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
