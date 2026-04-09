import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { exportToCsv } from "@/utils/export-to-csv";
import { CRMProjectEstimation } from "./ProjectEstimationsTable";
import { toast } from "@/hooks/use-toast";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface BoqBcsTaskExportProps {
    projectId?: string;
    companyId?: string;
    projectIds?: string[];
    data?: CRMProjectEstimation[];
    customFileName?: string;
    className?: string;
}

export const BoqBcsTaskExport = ({ projectId, companyId, projectIds, data, customFileName, className }: BoqBcsTaskExportProps) => {
    const { getUserFullNameByEmail } = useUserRoleLists();

    // If companyId is provided, we first need to get all projects for that company
    const { data: companyBoqs, isLoading: isBoqsLoading } = useFrappeGetDocList("CRM BOQ", {
        filters: (companyId && !data) ? [['company', '=', companyId]] : [],
        fields: ["name"],
        limit: 0
    }, (companyId && !data) ? `boqs-for-export-${companyId}` : null);

    const projectIdsForCompany = companyBoqs?.map(boq => boq.name) || [];

    // Construct the filter for CRM Project Estimation
    let estimationFilters: any[] = [];
    let skipFetch = !!data;

    if (!data) {
        if (projectIds && projectIds.length > 0) {
            estimationFilters = [['parent_project', 'in', projectIds]];
        } else if (projectId) {
            estimationFilters = [['parent_project', '=', projectId]];
        } else if (companyId) {
            if (isBoqsLoading) {
                skipFetch = true;
            } else if (projectIdsForCompany.length > 0) {
                estimationFilters = [['parent_project', 'in', projectIdsForCompany]];
            } else {
                // Company has no projects, so no estimations to fetch
                skipFetch = true;
            }
        }
    }

    // Determine a unique cache key for the estimations fetch
    let cacheKey = null;
    if (!skipFetch && !data) {
        if (projectIds && projectIds.length > 0) {
            // Use count and a small hash or just a count for the key to avoid URL length issues
            cacheKey = `boq-bcs-export-filtered-${projectIds.length}-${projectIds[0]}`;
        } else {
            cacheKey = `boq-bcs-export-${projectId || (companyId ? `company-${companyId}` : 'all')}`;
        }
    }

    const { data: fetchedEstimationsData, isLoading: isEstimationsLoading } = useFrappeGetDocList<CRMProjectEstimation>("CRM Project Estimation", {
        filters: estimationFilters,
        fields: ["parent_project", "title", "package_name", "document_type", "value", "link", "status", "sub_status", "deadline", "remarks", "assigned_to", "creation"],
        orderBy: { field: "parent_project", order: "asc" },
        limit: 0
    }, cacheKey);

    const isLoading = (!data && isBoqsLoading) || (!data && isEstimationsLoading);

    // Apply sorting based on projectIds order if available
    const estimations = useMemo(() => {
        const base = data || fetchedEstimationsData;
        if (!base || !projectIds || projectIds.length === 0) return base;

        const projectIndexMap = new Map();
        projectIds.forEach((id, index) => projectIndexMap.set(id, index));

        return [...base].sort((a, b) => {
            const indexA = projectIndexMap.get(a.parent_project) ?? 999999;
            const indexB = projectIndexMap.get(b.parent_project) ?? 999999;
            if (indexA !== indexB) return indexA - indexB;
            // Secondary sort by creation date within the same project
            return (a.creation || "").localeCompare(b.creation || "");
        });
    }, [data, fetchedEstimationsData, projectIds]);

    const handleExport = () => {
        if (!estimations || estimations.length === 0) {
            toast({
                title: "No data found",
                description: "There are no BOQ/BCS tasks to export.",
                variant: "destructive"
            });
            return;
        }

        const columns = [
            { accessorKey: 'parent_project', header: 'Project ID', meta: { title: 'Project ID' } },
            {
                accessorKey: 'title',
                header: 'Title',
                meta: {
                    title: 'Title',
                    exportValue: (row: CRMProjectEstimation) => {
                        const prefix = `${row.parent_project} - `;
                        return row.title?.startsWith(prefix) ? row.title.replace(prefix, '') : row.title;
                    }
                }
            },
            { accessorKey: 'document_type', header: 'Type', meta: { title: 'Type' } },
            { accessorKey: 'package_name', header: 'Package', meta: { title: 'Package' } },
            { accessorKey: 'value', header: 'Value (L)', meta: { title: 'Value (L)' } },
            { accessorKey: 'status', header: 'Status', meta: { title: 'Status' } },
            { accessorKey: 'sub_status', header: 'Sub-Status', meta: { title: 'Sub-Status' } },
            {
                accessorKey: 'assigned_to',
                header: 'Assigned To',
                meta: {
                    title: 'Assigned To',
                    exportValue: (row: CRMProjectEstimation) => getUserFullNameByEmail(row.assigned_to) || row.assigned_to || ''
                }
            },
            { accessorKey: 'deadline', header: 'Deadline', meta: { title: 'Deadline' } },
            { accessorKey: 'creation', header: 'Created On', meta: { title: 'Created On' } },
            { accessorKey: 'remarks', header: 'Remarks', meta: { title: 'Remarks' } },
            { accessorKey: 'link', header: 'Link', meta: { title: 'Link' } },
        ];

        const fileName = customFileName || (projectId
            ? `BOQ_BCS_Tasks_${projectId}`
            : companyId
                ? `BOQ_BCS_Tasks_Company_${companyId}`
                : "All_BOQ_BCS_Tasks");

        // Use the exportToCsv utility
        exportToCsv(fileName, estimations, columns as any);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading}
            className={cn("flex items-center gap-2 h-9", className)}
        >
            <Download className="w-4 h-4" />
            {isLoading ? "Loading..." : "BOQ/BCS"}
        </Button>
    );
};
