import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, ColumnFiltersState } from '@tanstack/react-table';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { ChevronRight } from 'lucide-react';
// TooltipProvider wraps the entire table (single context instead of per-cell)
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Core reusable DataTable components and hooks
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';

// Project-specific hooks and utilities
import { useStatusStyles } from '@/hooks/useStatusStyles';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types for API Response ---
interface CRMTask {
    name: string;
    type?: string;
    start_date: string;
    status: string;
    contact?: string;
    company?: string;
    boq?: string;
    task_profile: string;
    assigned_sales?: string;
    remarks?: string;
    creation: string;
    modified: string;
    owner: string;
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
}

interface BOQItem {
    name: string;
    boq_status: string;
}

interface FilterOption {
    value: string;
    label: string;
    id?: string;
}

interface SalesTasksResponse {
    tasks: CRMTask[];
    boq_data: Record<string, BOQItem[]>;
    filter_options: {
        companies: FilterOption[];
        statuses: FilterOption[];
        types: FilterOption[];
        profiles: FilterOption[];
        salespersons: FilterOption[];
    };
    salesperson_map: Record<string, string>;
}

interface TaskTableViewProps {
    taskProfiles?: string | string[] | 'all';
    isStandalonePage?: boolean;
    className?: string;
    tableContainerClassName?: string;
}

export const TaskTableView = ({
    taskProfiles = 'all',
    isStandalonePage = false,
    className,
    tableContainerClassName,
}: TaskTableViewProps) => {
    // --- Hooks ---
    const getTaskStatusClass = useStatusStyles("task");

    // PERFORMANCE: Single API call replaces 3 separate calls
    const { data: apiResponse, isLoading, error } = useFrappeGetCall<{ message: SalesTasksResponse }>(
        'nirmaan_crm.api.get_sales_tasks.get_sales_tasks',
        { task_profiles: taskProfiles },
        `sales-tasks-${taskProfiles}` // SWR cache key
    );

    // Extract pre-processed data from API response
    const responseData = apiResponse?.message;
    const tasks = useMemo(() => responseData?.tasks || [], [responseData?.tasks]);
    const boqsByCompany = useMemo(() => responseData?.boq_data || {}, [responseData?.boq_data]);
    const filterOptions = responseData?.filter_options;
    const salespersonMap = useMemo(() => responseData?.salesperson_map || {}, [responseData?.salesperson_map]);

    // PERFORMANCE: Column definitions with pre-computed data
    // No expensive lookups in cell renderers - all data comes pre-processed from server
    const columns = useMemo<DataTableColumnDef<CRMTask>[]>(() => [
        {
            accessorKey: "type",
            meta: {
                title: "Task Type",
                filterVariant: 'select',
                enableSorting: true,
                filterOptions: filterOptions?.types || []
            },
            cell: ({ row }) => (
                row.original.name
                    ? <Link to={`/tasks/task?id=${row.original.name}`} className="text-primary hover:underline">{row.original.type}</Link>
                    : '--'
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "task_profile",
            meta: {
                title: "Profile",
                filterVariant: 'select',
                enableSorting: true,
                filterOptions: filterOptions?.profiles || []
            },
            cell: ({ row }) => (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getTaskStatusClass(row.original.task_profile)}`}>
                    {row.original.task_profile}
                </span>
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "company",
            meta: {
                title: "Company",
                filterVariant: 'select',
                enableSorting: true,
                filterOptions: filterOptions?.companies || []
            },
            cell: ({ row }) => (
                row.original.company
                    ? <Link to={`/companies/company?id=${row.original.company}`} className="text-primary hover:underline">
                        {row.original["company.company_name"] || row.original.company}
                    </Link>
                    : '--'
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "assigned_sales",
            meta: {
                title: "Sales Person",
                filterVariant: 'select',
                enableSorting: true,
                filterOptions: filterOptions?.salespersons || []
            },
            // PERFORMANCE: O(1) Map lookup instead of function call
            cell: ({ row }) => (
                <span className="text-sm px-4 py-1">
                    {salespersonMap[row.original.assigned_sales || ''] || "--"}
                </span>
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "start_date",
            meta: { title: "Schedule Date", filterVariant: 'date', enableSorting: true },
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.start_date
                        ? formatDateWithOrdinal(new Date(row.original.start_date), 'dd-MMM-yyyy')
                        : '--'}
                </span>
            ),
            enableSorting: true,
            filterFn: 'dateRange',
        },
        {
            id: "active_boq_count",
            meta: { title: "Active BOQs", enableSorting: false },
            // PERFORMANCE: O(1) object property lookup instead of O(n) filter
            cell: ({ row }) => {
                const relevantBoqs = boqsByCompany[row.original.company || ''] || [];
                if (relevantBoqs.length === 0) {
                    return <span className='px-4'>--</span>;
                }
                return (
                    <div className="flex gap-1 px-4">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs cursor-pointer">
                                    {relevantBoqs.length}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px] text-wrap break-words">
                                {relevantBoqs.map((r, i) => (
                                    <ol key={i} className="p-1 m-1 rounded-md list-disc">
                                        <li>
                                            <Link to={`/boqs/boq?id=${r.name}`} className="block border-gray-300 font-semibold hover:underline">
                                                {r.name}
                                            </Link>
                                        </li>
                                    </ol>
                                ))}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            meta: {
                title: "Status",
                filterVariant: 'select',
                filterOptions: filterOptions?.statuses || []
            },
            cell: ({ row }) => (
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${getTaskStatusClass(row.original.status)}`}>
                    {row.original.status}
                </span>
            ),
            filterFn: 'faceted',
        },
        {
            accessorKey: "remarks",
            meta: { title: "Remarks", enableSorting: false },
            cell: ({ row }) => {
                const remarks = row.original.remarks;

                if (!remarks) {
                    return (
                        <div className="flex gap-1 justify-center">
                            <span className="text-sm">{"--"}</span>
                        </div>
                    );
                }

                if (remarks.length <= 30) {
                    return (
                        <div className="flex gap-1 justify-center">
                            <span className="text-xs">{remarks}</span>
                        </div>
                    );
                }

                const truncatedRemarks = `${remarks.substring(0, 20)}...`;

                return (
                    <div className="flex gap-1 justify-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-center h-auto min-h-[24px] w-auto px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs cursor-pointer text-center max-w-[220px] break-words">
                                    {truncatedRemarks}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px] text-wrap break-words">
                                <p>{remarks}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            },
            enableSorting: false,
        }
    ], [filterOptions, boqsByCompany, salespersonMap, getTaskStatusClass]);

    // Dynamic Filters & Visibility
    const initialColumnFilters: ColumnFiltersState = useMemo(() => [], []);

    const initialColumnVisibility = useMemo(() => ({
        task_profile: false,
    }), []);

    // Initialize table logic
    const tableLogic = useDataTableLogic<CRMTask>({
        data: tasks,
        columns: columns,
        initialSorting: [{ id: 'start_date', desc: true }],
        initialColumnFilters: initialColumnFilters,
        initialColumnVisibility: initialColumnVisibility,
        customGlobalFilterFn: [
            'company',
            'contact.first_name',
            'contact.last_name',
            'boq',
            'task_profile',
            'assigned_sales',
            'type',
            'status',
            'remarks',
            'owner'
        ],
    });

    // Effect for Dynamic Synchronization
    useEffect(() => {
        tableLogic.setGlobalFilter('');
        tableLogic.table.setColumnFilters(initialColumnFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskProfiles, isStandalonePage]);

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        );
    }

    // --- Error State ---
    if (error) {
        return <div className="text-red-500">Error loading tasks: {error?.message}</div>;
    }

    // --- Mobile Row Renderer ---
    const renderTaskMobileRow = (row: Row<CRMTask>) => (
        <div className="flex justify-between items-start p-3 border rounded-lg">
            <div className="flex flex-col text-left">
                <Link to={`/tasks/task?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
                    <span className="flex items-center gap-1">
                        <TaskStatusIcon status={row.original.status} className="flex-shrink-0" />
                        {row.original.type || 'Task'}
                    </span>
                </Link>
                <p className="text-sm text-muted-foreground">
                    {row.original["company.company_name"] || row.original.company || '--'} - {row.original["contact.first_name"] || '--'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Start Date: {row.original.start_date ? formatDateWithOrdinal(new Date(row.original.start_date), 'dd-MMM-yyyy') : '--'}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getTaskStatusClass(row.original.status)}`}>
                    {row.original.status}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
            </div>
        </div>
    );

    // PERFORMANCE: Single TooltipProvider for entire table
    return (
        <TooltipProvider delayDuration={300}>
            <DataTable
                tableLogic={tableLogic}
                isLoading={isLoading}
                renderMobileRow={renderTaskMobileRow}
                globalSearchPlaceholder="Search tasks..."
                shouldExpandHeight={true}
                className={className}
                containerClassName={tableContainerClassName}
                minWidth="1200px"
                gridColsClass="md:grid-cols-[1.5fr,1fr,1.5fr,1.5fr,1fr,1fr,1fr,auto]"
                headerTitle="Sales Task"
                noResultsMessage="No tasks found."
            />
        </TooltipProvider>
    );
};
