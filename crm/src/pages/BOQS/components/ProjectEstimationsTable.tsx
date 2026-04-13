import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";
import { SquarePen } from "lucide-react";
import { useDialogStore } from "@/store/dialogStore";

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
    const { getUserFullNameByEmail } = useUserRoleLists();

    const isEstimationsLead =
        role === "Nirmaan Estimations Lead Profile" || role === "Nirmaan Admin User Profile";
    const isEstimationsTeam =
        role === "Nirmaan Estimations User Profile" ||
        role === "Nirmaan Estimates User Profile" ||
        isEstimationsLead;

    const { openEditProjectEstimationDialog } = useDialogStore();

    if (isLoading) return <div className="p-4 flex items-center justify-center text-sm text-muted-foreground animate-pulse">Loading Packages...</div>;
    if (!estimations || estimations.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm font-medium">No packages or estimations found for this project.</p>
            </div>
        );
    }

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
                                            onClick={() => openEditProjectEstimationDialog({ estimationData: est })}
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
