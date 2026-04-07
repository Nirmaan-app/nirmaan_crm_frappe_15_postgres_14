import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFrappeGetDocList, useFrappeUpdateDoc, useSWRConfig } from "frappe-react-sdk";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";
import { SquarePen, PenLine, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface CRMProjectEstimation {
    name: string;
    parent_project: string;
    title: string;
    package_name: string;
    document_type: string;
    value: number;
    link: string;
    status: string;
    sub_status: string;
    deadline: string;
    remarks: string;
    assigned_to: string;
    creation: string;
}

export const ProjectEstimationsTable = ({ 
    projectId, 
    estimations, 
    isLoading 
}: { 
    projectId: string; 
    estimations: CRMProjectEstimation[] | undefined; 
    isLoading: boolean; 
}) => {
    const role = localStorage.getItem("role");
    const { mutate } = useSWRConfig();
    const { updateDoc } = useFrappeUpdateDoc();

    const { estimationUserOptions, getUserFullNameByEmail } = useUserRoleLists();

    const isEstimationsLead =
        role === "Nirmaan Estimations lead Profile" ||
        role === "Nirmaan Estimations Lead Profile" ||
        role === "Nirmaan Admin User Profile";
    const isEstimationsTeam =
        role === "Nirmaan Estimations User Profile" ||
        role === "Nirmaan Estimates User Profile" ||
        isEstimationsLead;

    // Edit State
    const [editingEst, setEditingEst] = useState<CRMProjectEstimation | null>(null);

    if (isLoading) return <div className="p-4 flex items-center justify-center text-sm text-muted-foreground animate-pulse">Loading Packages...</div>;
    if (!estimations || estimations.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm font-medium">No packages or estimations found for this project.</p>
            </div>
        );
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingEst) return;
        const formData = new FormData(e.currentTarget);
        const dataToSave: any = {
            value: Number(formData.get("value")) || 0,
            link: (formData.get("link") as string)?.trim() || null,
            status: (formData.get("status") as string) || editingEst.status,
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
            await Promise.all([
                mutate(`project-estimations-${projectId}`),
                mutate(`project-estimations-edit-${projectId}`),
                mutate(`BOQ/${projectId}`),
                mutate("all-project-estimation-values"),
                mutate("all-boqs-all-view"),
                mutate("home-estimation-review-estimations"),
                mutate("home-estimation-review-projects"),
                mutate((key) => typeof key === 'string' && key.startsWith('all-boqs-')),
            ]);
            setEditingEst(null);
        } catch (error: any) {
             toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="bg-background max-h-[400px] overflow-y-auto w-full p-4  rounded-lg border shadow-sm shrink-0">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold">BOQ/BCS</h2>
                <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {estimations?.length || 0}
                </div>
            </div>
            
            <div className="overflow-x-auto border border-border/60 rounded-lg max-h-[400px]">
                <Table>
                    <TableHeader className="bg-muted/30 z-10 sticky top-0">
                        <TableRow>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">TITLE</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider text-center">TYPE</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider text-center">PACKAGE</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">VALUE</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider text-center">LINK</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider text-center">STATUS</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider text-center">SUB-STATUS</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">RECEIVED ON</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">DEADLINE</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">ASSIGNED TO</TableHead>
                            <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">REMARKS</TableHead>
                            {isEstimationsTeam && <TableHead className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider w-[80px]">ACTIONS</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {estimations.map((est) => (
                            <TableRow key={est.name} className="hover:bg-muted/10 transition-colors">
                                <TableCell className="font-medium text-sm text-foreground">
                                    {est.title?.startsWith(`${projectId} - `) 
                                        ? est.title.replace(`${projectId} - `, '') 
                                        : est.title}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={est.document_type === 'BOQ' ? 'bg-blue-100 text-blue-600 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider' : 'bg-purple-100 text-purple-600 px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider'}>
                                        {est.document_type}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="border border-gray-200 px-3 py-1 text-xs rounded bg-white whitespace-nowrap text-gray-600">
                                        {est.package_name || '--'}
                                    </span>
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                    {est.value ? `₹${Number(est.value).toFixed(2)} L` : '--'}
                                </TableCell>
                                <TableCell className="text-center">
                                    {est.link ? (
                                        <a href={est.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors inline-flex">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                        </a>
                                    ) : '--'}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded text-blue-600 bg-blue-50`}>
                                        {est.status || 'New'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={`text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded`}>
                                        {est.sub_status || '--'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                                    {est.creation ? new Date(est.creation).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : '--'}
                                </TableCell>
                                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                                    {est.deadline ? new Date(est.deadline).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : '--'}
                                </TableCell>
                                <TableCell className="text-sm text-gray-700 whitespace-nowrap">
                                    {getUserFullNameByEmail(est.assigned_to) || ""}
                                </TableCell>
                                <TableCell className="text-xs text-gray-600 truncate max-w-[150px]">
                                    {est.remarks || 'No remarks'}
                                </TableCell>
                                {isEstimationsTeam && (
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditingEst(est)}
                                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                            <SquarePen className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!editingEst} onOpenChange={(open) => !open && setEditingEst(null)}>
                <DialogContent className="max-w-md p-6">
                    {editingEst && (
                        <>
                            <DialogHeader className="mb-4">
                                <DialogTitle className="flex items-center gap-2 text-xl">
                                    <PenLine className="w-5 h-5" />
                                    Edit {editingEst.document_type} Details
                                </DialogTitle>
                                <p className="text-destructive text-xs font-semibold mt-1 tracking-wide">
                                    {projectId}
                                </p>
                            </DialogHeader>

                            <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 styled-scrollbar">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Package</label>
                                    <Input value={editingEst.package_name} disabled className="h-9 bg-muted/30" />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{editingEst.document_type} Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">₹</span>
                                        <Input name="value" type="number" step="0.01" className="pl-7 pr-8 h-9 hover:border-primary/50 focus-visible:ring-1" defaultValue={editingEst.value} />
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
                                        <select name="sub_status" required className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" defaultValue={editingEst.sub_status}>
                                            <option value="">Select Sub-Status</option>
                                            <option value="WIP">WIP</option>
                                            <option value="Awaiting clarification from Client">Awaiting clarification from Client</option>
                                            <option value="Awaiting quotation from Vendor">Awaiting quotation from Vendor</option>
                                            <option value="Review pending from Divyansh">Review pending from Divyansh</option>
                                        </select>
                                    </div>
                                )}

                                {(
                                    (editingEst.document_type === 'BOQ' && ["BOQ Submitted", "Partial BOQ Submitted", "Revision Submitted"].includes(editingEst.status)) ||
                                    (editingEst.document_type === 'BCS' && editingEst.status === 'Done')
                                ) && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">{editingEst.document_type} Value<sup>*</sup></label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">₹</span>
                                            <Input name="value" type="number" step="0.01" required className="pl-7 pr-8 h-9 hover:border-primary/50 focus-visible:ring-1" defaultValue={editingEst.value} />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-foreground font-medium">L</span>
                                        </div>
                                    </div>
                                )}

                                {((editingEst.document_type === 'BOQ' && ["New", "In-Progress", "Revision Pending", "Partial BOQ Submitted", "Revision Submitted"].includes(editingEst.status)) || 
                                  (editingEst.document_type === 'BCS' && ["New", "In-Progress"].includes(editingEst.status))) && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Submission Deadline<sup>*</sup></label>
                                        <Input name="deadline" type="date" required className="h-9 hover:border-primary/50 focus-visible:ring-1" defaultValue={editingEst.deadline} />
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{editingEst.document_type} Link{(
                                        (editingEst.document_type === 'BOQ' && ["BOQ Submitted", "Partial BOQ Submitted", "Revision Submitted"].includes(editingEst.status)) ||
                                        (editingEst.document_type === 'BCS' && editingEst.status === 'Done')
                                    ) && <sup>*</sup>}</label>
                                    <Input name="link" required={(
                                        (editingEst.document_type === 'BOQ' && ["BOQ Submitted", "Partial BOQ Submitted", "Revision Submitted"].includes(editingEst.status)) ||
                                        (editingEst.document_type === 'BCS' && editingEst.status === 'Done')
                                    )} defaultValue={editingEst.link} placeholder="https://..." className="h-9 hover:border-primary/50 focus-visible:ring-1" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Latest Remarks{(
                                        (editingEst.document_type === 'BOQ' && ["Partial BOQ Submitted"].includes(editingEst.status)) ||
                                        (editingEst.document_type === 'BCS' && editingEst.status === 'Hold')
                                    ) && <sup>*</sup>}</label>
                                    <Textarea name="remarks" required={(
                                        (editingEst.document_type === 'BOQ' && ["Partial BOQ Submitted"].includes(editingEst.status)) ||
                                        (editingEst.document_type === 'BCS' && editingEst.status === 'Hold')
                                    )} className="resize-none h-20 hover:border-primary/50 focus-visible:ring-1" defaultValue={editingEst.remarks} placeholder="Enter remarks..." />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t mt-4 bg-muted/10 -mx-6 px-6 -mb-6 pb-6 pt-6 rounded-b-lg">
                                    <Button type="button" variant="outline" className="w-24 border-gray-300" onClick={() => setEditingEst(null)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="w-36 bg-destructive hover:bg-destructive/90 text-white gap-2">
                                        Save Changes <Send className="w-3 h-3" />
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// A wrapper component for views that just want to render the table and need it to fetch its own data.
export const ConnectedProjectEstimationsTable = ({ projectId, enableCompactMode = false }: { projectId: string, enableCompactMode?: boolean }) => {
    const { data: estimations, isLoading } = useFrappeGetDocList<CRMProjectEstimation>("CRM Project Estimation", {
        filters: [['parent_project', '=', projectId]],
        fields: ["name", "title", "package_name", "document_type", "value", "link", "status", "sub_status", "deadline", "remarks", "assigned_to", "creation"],
        limit: 0
    }, `project-estimations-${projectId}`);

    // Pass the enableCompactMode logic loosely down or handle custom UI wrapper here:
    if (isLoading) return <div className="p-4 flex items-center justify-center text-sm text-muted-foreground animate-pulse">Loading Packages...</div>;
    if (!estimations || estimations.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm font-medium">No packages or estimations found for this project.</p>
            </div>
        );
    }

    return (
        <div className={enableCompactMode ? "py-2 px-2" : ""}>
            {/* {enableCompactMode && <h3 className="font-bold text-sm mb-4">BOQ/BCS ({estimations.filter(e => e.document_type === 'BOQ').length})</h3>} */}
            <ProjectEstimationsTable projectId={projectId} estimations={estimations} isLoading={isLoading} />
        </div>
    );
};
