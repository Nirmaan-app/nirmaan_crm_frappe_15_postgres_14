import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CRMProjectEstimation } from "../components/ProjectEstimationsTable";
import { getStatusPillClass } from "@/pages/Home/components/EstimationsReviewTable";

interface EditProjectEstimationFormProps {
    estimationData: CRMProjectEstimation;
    onSuccess: () => void;
}

const normalizeStatus = (status?: string) =>
    (status || "")
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const requiresValueByStatus = (documentType?: string, status?: string) => {
    const docType = (documentType || "").toUpperCase();
    const normalizedStatus = normalizeStatus(status);
    return (
        (docType === "BOQ" &&
            ["boq submitted", "partial boq submitted", "revision submitted", "done"].includes(normalizedStatus)) ||
        (docType === "BCS" && normalizedStatus === "done")
    );
};

export const EditProjectEstimationForm = ({ estimationData, onSuccess }: EditProjectEstimationFormProps) => {
    const role = localStorage.getItem("role");
    const { mutate } = useSWRConfig();
    const { updateDoc } = useFrappeUpdateDoc();
    const { estimationUserOptions } = useUserRoleLists();

    const isEstimationsLead = role === "Nirmaan Estimations Lead Profile" || role === "Nirmaan Estimations User Profile" || role === "Nirmaan Admin User Profile";

    const [editingEst, setEditingEst] = useState<CRMProjectEstimation>(estimationData);

    useEffect(() => {
        setEditingEst(estimationData);
    }, [estimationData]);

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingEst) return;
        const formData = new FormData(e.currentTarget);
        const statusFromForm = (formData.get("status") as string) || editingEst.status;
        const valueRaw = String(formData.get("value") ?? "").trim();
        const parsedValue = valueRaw === "" ? null : Number(valueRaw);
        const shouldRequireValue = requiresValueByStatus(editingEst.document_type, statusFromForm);

        if (shouldRequireValue && (parsedValue === null || Number.isNaN(parsedValue) || parsedValue <= 0)) {
            toast({
                title: "Validation Error",
                description: `${editingEst.document_type} Value is required and must be greater than 0 for "${statusFromForm}" status.`,
                variant: "destructive",
            });
            return;
        }

        const dataToSave: any = {
            value: parsedValue,
            link: (formData.get("link") as string)?.trim() || null,
            status: statusFromForm,
            sub_status: (formData.get("sub_status") as string) || null,
            deadline: (formData.get("deadline") as string) || null,
            remarks: (formData.get("remarks") as string)?.trim() || null,
            assigned_to: (formData.get("assigned_to") as string) || editingEst.assigned_to,
        };

        // Format link
        if (dataToSave.link) {
            let formattedLink = dataToSave.link;
            if (!formattedLink.startsWith("http://") && !formattedLink.startsWith("https://") && !formattedLink.startsWith("www.")) {
                formattedLink = `https://${formattedLink}`;
            } else if (formattedLink.startsWith("www.")) {
                formattedLink = `https://${formattedLink}`;
            }
            dataToSave.link = formattedLink;
        }

        try {
            await updateDoc("CRM Project Estimation", editingEst.name, dataToSave);
            toast({ title: "Success", description: "Estimation updated successfully." });
            // Trigger comprehensive mutation for all related caches
            await Promise.all([
                mutate(`project-estimations-${editingEst.parent_project}`),
                mutate(`project-estimations-edit-${editingEst.parent_project}`),
                mutate(`BOQ/${editingEst.parent_project}`, undefined, { revalidate: true }),
                mutate("all-project-estimation-values"),
                mutate("all-boqs-all-view"),
                mutate("home-estimation-review-estimations"),
                mutate("home-estimation-review-projects"),
                mutate("home-boqbcs-review-estimations"),
                mutate((key) => typeof key === 'string' && key.startsWith('all-boqs-')),
                mutate((key) => typeof key === 'string' && key.startsWith('project-estimations-')),

                // Robust matching for project-specific caches, handling both string and array keys

            ]);
            onSuccess();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    if (!editingEst) return null;

    const documentType = (editingEst.document_type || "").toUpperCase();
    const isBcs = documentType === "BCS";
    const displayTitle =
        editingEst.package_name ||
        (editingEst.title?.startsWith(`${editingEst.parent_project} - `)
            ? editingEst.title.replace(`${editingEst.parent_project} - `, "")
            : editingEst.title) ||
        "Estimation";

    return (
        <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto overflow-x-hidden -mr-6 pr-6 styled-scrollbar">
            <div className="relative -mx-6 pl-7 pr-6 pt-2 pb-3.5 mb-5 border-b border-border">
                <span
                    aria-hidden
                    className={cn(
                        "absolute left-0 top-0 bottom-0 w-[3px]",
                        isBcs ? "bg-violet-500" : "bg-blue-500"
                    )}
                />
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70 mb-1">
                    Edit task
                </div>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <h2
                                className="text-[15px] font-semibold text-foreground leading-tight tracking-tight truncate"
                                title={displayTitle}
                            >
                                {displayTitle}
                            </h2>
                            <span
                                className={cn(
                                    "shrink-0 inline-flex items-center px-1.5 py-[1px] rounded-sm text-[10px] font-bold tracking-wider",
                                    isBcs
                                        ? "bg-violet-100 text-violet-700"
                                        : "bg-blue-100 text-blue-700"
                                )}
                            >
                                {documentType || "BOQ"}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                            in{" "}
                            <span
                                className="font-medium text-foreground/80"
                                title={editingEst.parent_project}
                            >
                                {editingEst.parent_project}
                            </span>
                        </p>
                    </div>
                    <span
                        className={cn(
                            "shrink-0 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap mt-1",
                            getStatusPillClass(editingEst.status)
                        )}
                    >
                        {editingEst.status || "New"}
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Package</label>
                <Input value={editingEst.package_name || ''} disabled className="h-9 bg-muted/30" />
            </div>

            {/* Value Field - Single location with conditional required status */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                    {editingEst.document_type} Value
                    {requiresValueByStatus(editingEst.document_type, editingEst.status) && <sup>*</sup>}
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">₹</span>
                    <Input
                        name="value"
                        type="number"
                        step="0.01"
                        min={requiresValueByStatus(editingEst.document_type, editingEst.status) ? "0.01" : "0"}
                        required={requiresValueByStatus(editingEst.document_type, editingEst.status)}
                        className="pl-7 pr-8 h-9 hover:border-primary/50 focus-visible:ring-1"
                        defaultValue={editingEst.value}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">L</span>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Assigned to</label>
                <select name="assigned_to" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" defaultValue={editingEst.assigned_to} disabled={!isEstimationsLead}>
                    <option value="">Select User</option>
                    {estimationUserOptions.map(u => (
                        <option key={u.value.toString()} value={u.value.toString()}>{u.label}</option>
                    ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <select name="status" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={editingEst.status || "New"}
                    onChange={(e) => setEditingEst({ ...editingEst, status: e.target.value })}>
                    <option value="New">New</option>
                    <option value="In-Progress">In-Progress</option>
                    {editingEst.document_type === 'BOQ' ? (
                        <>
                            <option value="BOQ Submitted">BOQ Submitted</option>
                            <option value="Partial BOQ Submitted">Partial BOQ Submitted</option>
                            <option value="Revision Submitted">Revision Submitted</option>
                            <option value="Revision Pending">Revision Pending</option>
                            <option value="Done">Done</option>
                        </>
                    ) : (
                        <>
                            <option value="Done">Done</option>
                            <option value="Hold">Hold</option>
                            <option value="Not Applicable">Not Applicable</option>
                        </>
                    )}
                </select>
            </div>

            {editingEst.document_type === 'BOQ' && ["In-Progress", "Revision Pending"].includes(editingEst.status) && (
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Sub-Status<sup>*</sup></label>
                    <select name="sub_status" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" defaultValue={editingEst.sub_status || ""}>
                        <option value="">Select Sub-Status</option>
                        <option value="WIP">WIP</option>
                        <option value="Awaiting clarification from Client">Awaiting clarification from Client</option>
                        <option value="Awaiting quotation from Vendor">Awaiting quotation from Vendor</option>
                        <option value="Review pending from Divyansh">Review pending from Divyansh</option>
                    </select>
                </div>
            )}

            {/* Condition removed here, moved to the top field */}

            {((editingEst.document_type === 'BOQ' && ["New", "In-Progress", "Revision Pending", "Partial BOQ Submitted", "Revision Submitted"].includes(editingEst.status)) ||
                (editingEst.document_type === 'BCS' && ["New", "In-Progress"].includes(editingEst.status))) && (
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Submission Deadline<sup>*</sup></label>
                        <Input name="deadline" type="date" required className="h-9 hover:border-primary/50 focus-visible:ring-1" defaultValue={editingEst.deadline || ""} />
                    </div>
                )}

            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{editingEst.document_type} Link</label>
                <Input name="link" defaultValue={editingEst.link || ""} placeholder="https://..." className="h-9 hover:border-primary/50 focus-visible:ring-1" />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Latest Remarks{(
                    (editingEst.document_type === 'BOQ' && ["Partial BOQ Submitted"].includes(editingEst.status)) ||
                    (editingEst.document_type === 'BCS' && editingEst.status === 'Hold')
                ) && <sup>*</sup>}</label>
                <Textarea name="remarks" required={(
                    (editingEst.document_type === 'BOQ' && ["Partial BOQ Submitted"].includes(editingEst.status)) ||
                    (editingEst.document_type === 'BCS' && editingEst.status === 'Hold')
                )} className="resize-none h-20 hover:border-primary/50 focus-visible:ring-1" defaultValue={editingEst.remarks || ""} placeholder="Enter remarks..." />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button type="button" variant="outline" className="w-24 border-gray-300" onClick={onSuccess}>
                    Cancel
                </Button>
                <Button type="submit" className="w-36 bg-destructive hover:bg-destructive/90 text-white gap-2">
                    Save Changes <Send className="w-3 h-3" />
                </Button>
            </div>
        </form>
    );
};
