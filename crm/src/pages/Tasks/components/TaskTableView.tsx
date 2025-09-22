import React, { useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, ColumnFiltersState } from '@tanstack/react-table';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Core reusable DataTable components and hooks
import { DataTable } from '@/components/table/data-table'; // Ensure this path is correct
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { DataTableExportButton } from '@/components/table/data-table-export-button';

// Project-specific hooks and utilities
import { useStatusStyles } from '@/hooks/useStatusStyles';
import { useUserRoleLists } from '@/hooks/useUserRoleLists';
import { formatDateWithOrdinal } from '@/utils/FormatDate';
import { cn } from '@/lib/utils';
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";
import { Skeleton } from "@/components/ui/skeleton";

// --- Main Task interface ---
interface CRMTask {
    name: string;
    type?: string;
    start_date: string;
    status: string;
    contact?: string;
    company?: string;
    boq?: string;
    // task_details_section?: string; // Kept in interface just in case, but not used in fetching/columns
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
    // --- START: ALL HOOKS MUST BE DECLARED HERE, AT THE TOP LEVEL, UNCONDITIONALLY ---
    const navigate = useNavigate();
    const getTaskStatusClass = useStatusStyles("task");
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

   const { data: taskData, isLoading: isTasksLoading, error: tasksError } = useFrappeGetDocList<CRMTask>('CRM Task', {
    fields: [
        "name", "type", "start_date", "status", "contact", "company", "boq",
        "task_profile", "assigned_sales", "remarks",
        "creation", "modified", "owner",
        "contact.first_name", "contact.last_name", "company.company_name"
    ],
    limit: 0,
    // THE FIX IS HERE: Wrap the entire conditional result in an array
    filters: [
        taskProfiles === 'all'
            ? ["task_profile", "in", ["Sales", "Estimates"]]
            : taskProfiles === 'Sales'
                ? ["task_profile", "in", ["Sales"]]
                : ["task_profile", "in", ["Estimates"]]
    ],
    orderBy: { field: 'start_date', order: 'desc' },
}, "all-tasks-view");

const INACTIVE_STATUSES = ['Won', 'Lost', 'Dropped'];

const { data: activeBoqs, isLoading: boqsLoading, error: boqsError } = useFrappeGetDocList<CRMBOQ>('CRM BOQ', {
  fields: ["name", "company", "boq_status"],
  filters: [
    ["boq_status", "not in", INACTIVE_STATUSES]
  ],
  limit: 0,
}, "active-boqs-data");

    // Initialize tasks from tasksData. This is a regular variable, not a hook.
    // It must be derived after tasksData is available from useFrappeGetDocList.
    const tasks=taskData||[]


    // Memoized Filter Options (depend on 'tasks' array, which is always defined after its hook)
    const companyOptions = useMemo(() => {
        if (!tasks) return []; // Defensive check, though 'tasks' should be [] if tasksData is null/undefined
        const companies = new Map<string, string>();
        tasks.forEach(task => {
            if (task.company) companies.set(task.company, task.company_name);
        });
        return Array.from(companies.entries()).map(([id, name]) => ({ id, label: name, value: id }));
    }, [tasks]);

    const contactOptions = useMemo(() => {
        if (!tasks) return [];
        const contacts = new Map<string, string>();
        tasks.forEach(task => {
            const fullName = `${task.first_name || ''} ${task.last_name || ''}`.trim();
            if (fullName) contacts.set(task.contact, fullName);
        });
        return Array.from(contacts.entries()).map(([id, name]) => ({ id, label: name, value: id }));
    }, [tasks]);

    const taskProfileOptions = useMemo(() => {
        if (!tasks) return [];
        const profiles = new Set<string>();
        tasks.forEach(task => task.task_profile && profiles.add(task.task_profile));
        return Array.from(profiles).sort().map(profile => ({ label: profile, value: profile }));
    }, [tasks]);

    const taskStatusOptions = useMemo(() => {
        if (!tasks) return [];
        const statuses = new Set<string>();
        tasks.forEach(task => task.status && statuses.add(task.status));
        return Array.from(statuses).sort().map(status => ({ label: status, value: status }));
    }, [tasks]);

    const taskTypeOptions = useMemo(() => {
        if (!tasks) return [];
        const types = new Set<string>();
        tasks.forEach(task => task.type && types.add(task.type));
        return Array.from(types).sort().map(type => ({ label: type, value: type }));
    }, [tasks]);

      const BoqOptions = useMemo(() => {
        if (!tasks) return [];
        const boq = new Set<string>();
        tasks.forEach(task => task.boq && boq.add(task.boq));
        return Array.from(boq).sort().map(boq => ({ label: boq, value: boq }));
    }, [tasks]);

    const assignedSalesOptions = useMemo(() => {
        if (!tasks || usersLoading) return [];
        const salespersons = new Map<string, string>();
        tasks.forEach(task => {
            if (task.assigned_sales) {
                const fullName = getUserFullNameByEmail(task.assigned_sales);
                if (fullName) {
                    salespersons.set(task.assigned_sales, fullName);
                }
            }
        });
        return Array.from(salespersons.entries()).map(([email, name]) => ({ id: email, label: name, value: email }));
    }, [tasks, usersLoading, getUserFullNameByEmail]);


    // Column Definitions
    const columns = useMemo<DataTableColumnDef<CRMTask>[]>(() => [
        {
            accessorKey: "type",
            meta: { title: "Task Type", filterVariant: 'select', enableSorting: true, filterOptions: taskTypeOptions },
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
            meta: { title: "Profile", filterVariant: 'select', enableSorting: true, filterOptions: taskProfileOptions },
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
            meta: { title: "Company", filterVariant: 'select', enableSorting: true, filterOptions: companyOptions },
            cell: ({ row }) => (
                row.original.company
                    ? <Link to={`/companies/company?id=${row.original.company}`} className="text-primary hover:underline">{row.original["company.company_name"] || row.original.company}</Link>
                    : '--'
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        // {
        //     id: "contact",
        //     meta: { title: "Contact", filterVariant: 'select', enableSorting: true, filterOptions: contactOptions },
        //     cell: ({ row }) => {
        //         const fullName = `${row.original.first_name || ''}`.trim();
        //         return row.original.contact
        //             ? <Link to={`/contacts/contact?id=${row.original.contact}`} className="text-primary hover:underline">{fullName || row.original.contact}</Link>
        //             : '--';
        //     },
        //     filterFn: 'faceted',
        //     enableSorting: true,
        // },
        // {
        //     accessorKey: "boq",
        //     meta: { title: "BOQ", enableSorting: true , filterVariant: 'select',filterOptions:BoqOptions},
        //     cell: ({ row }) => (
        //         row.original.boq
        //             ? <Link to={`/boqs/boq?id=${row.original.boq}`} className="text-primary hover:underline">{row.original.boq}</Link>
        //             : '--'
        //     ),
        //     filterFn:'faceted',
        //     enableSorting: true,
        // },
        {
            accessorKey: "assigned_sales",
            meta: { title: "Sales Person", filterVariant: 'select', enableSorting: true, filterOptions: assignedSalesOptions },
            cell: ({ row }) => <span className="text-sm px-4 py-1">{getUserFullNameByEmail(row.original.assigned_sales) ||"--"}</span>,
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "start_date",
            meta: { title: "Schedule Date", filterVariant: 'date', enableSorting: true },
            cell: ({ row }) =>(
                <span className="text-sm text-muted-foreground">{row.original.start_date
                     ? formatDateWithOrdinal(new Date(row.original.start_date), 'dd-MMM-yyyy')
                     : '--'}</span>
            ),
                   
                     
            enableSorting: true,
            filterFn: 'dateRange',
        },
        {
              id: "active_boq_count",
              meta: { title: "Active BOQs", enableSorting: false },
              cell: ({ row }) => {
               const taskCompanyName = row.original.company;
    
    // Find BOQs associated with the current task's company
              const relevantBoqs = activeBoqs?.filter(boq => boq.company === taskCompanyName) || [];
                if (relevantBoqs.length === 0) {
                  return <span className='px-4'>--</span>;
                }
                return (
                  <div className="flex gap-1 px-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white  text-xs cursor-pointer">
                        {relevantBoqs.length}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px] text-wrap break-words ">
                      {relevantBoqs.map((r, i) => (
                        <ol key={i} className="p-1 m-1  rounded-md list-disc">
        <li>
                         <Link to={`/boqs/boq?id=${r.name}`} className="block border-gray-300 font-semibold hover:underline">
          {r.name}
        </Link></li>
                          {/* <p className="text-[8px] mt-0 pt-0 ">
                            Created: {formatDateWithOrdinal(r.creation)}
                          </p> */}
                        </ol>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
        
                );
              },
            },
        {
            accessorKey: "status",
            meta: { title: "Status", filterVariant: 'select',filterOptions: taskStatusOptions },
            cell: ({ row }) => (
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${getTaskStatusClass(row.original.status)}`}>
                    {row.original.status}
                </span>
            ),
            filterFn: 'faceted',
            // enableSorting: true,
        },
                   {
             accessorKey: "remarks",
             meta: { title: "Remarks" , enableSorting: false},
             cell: ({ row }) => {
               const remarks = row.original.remarks;

               if (!remarks) {
                 return  ( <div className="flex gap-1 justify-center">
                          <span className="text-sm ">{"--"}</span>
                 </div>)
               }

               // If remarks are 30 characters or less, display directly
               if (remarks.length <= 30) {
                 return ( <div className="flex gap-1 justify-center">
                          <span className="text-xs ">{remarks}</span>
                 </div>)
               }

               // If remarks are longer than 30 characters, truncate and show with tooltip
               const truncatedRemarks = `${remarks.substring(0, 20)}...`;

               return (
                 <div className="flex gap-1 justify-center">
                   <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           {/* Display truncated remarks with a destructive background */}
                           <div className="flex items-center justify-center h-auto min-h-[24px] w-auto px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs cursor-pointer text-center max-w-[220px] break-words">
                             {truncatedRemarks}
                           </div>
                         </TooltipTrigger>
                         <TooltipContent className="max-w-[220px] text-wrap break-words">
                           <p>{remarks}</p> {/* Tooltip shows full original remarks */}
                         </TooltipContent>
                       </Tooltip>
                   </TooltipProvider>
                 </div>
               );
             },
             enableSorting: false,
           }

    ], [tasks, companyOptions, contactOptions, taskProfileOptions, taskStatusOptions, taskTypeOptions, assignedSalesOptions,BoqOptions, getTaskStatusClass, getUserFullNameByEmail]);


    // Dynamic Filters & Visibility for useDataTableLogic
    const initialColumnFilters: ColumnFiltersState = useMemo(() => {
        const filters: ColumnFiltersState = [];
       
        return filters;
    }, [taskProfiles]);

    const initialColumnVisibility = useMemo(() => ({
        // actions: !isStandalonePage // If you had an actions column
          task_profile: false,
    }), [isStandalonePage]);


    // Initialize `useDataTableLogic` Hook
    const tableLogic = useDataTableLogic<CRMTask>({
        data: tasks,
        columns: columns,
        initialSorting: [{ id: 'start_date', desc: true }],
        initialColumnFilters: initialColumnFilters,
        initialColumnVisibility: initialColumnVisibility,
        customGlobalFilterFn: [
            'company',
            'first_name',
            'last_name',
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
    }, [taskProfiles, isStandalonePage, tableLogic.setGlobalFilter, tableLogic.table, initialColumnFilters,initialColumnVisibility]);

    // --- END: ALL HOOKS DECLARATIONS ---


    // --- Conditional Loading/Error Rendering (AFTER all hooks) ---
    const isOverallLoading = isTasksLoading || usersLoading; // Combined loading state

    if (isOverallLoading) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                {Array.from({ length: 5 })?.map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        );
    }

    if (tasksError) {
        return <div className="text-red-500">Error loading tasks: {tasksError?.message}</div>;
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
                    {row.original.company || '--'} - {`${row.original.first_name || ''} `.trim() || '--'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Start Date: {formatDateWithOrdinal(new Date(row.original.start_date), 'dd-MMM-yyyy')}
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

    // // --- Export Fields Definition ---
    // const taskExportFields = useMemo<DataTableColumnDef<CRMTask>[]>(() => ([
    //     { accessorKey: "name", meta: { exportHeaderName: "Task ID" } },
    //     { accessorKey: "type", meta: { exportHeaderName: "Type" } },
    //     { accessorKey: "task_profile", meta: { exportHeaderName: "Profile" } },
    //     { accessorKey: "company.company_name", meta: { exportHeaderName: "Company" } },
    //     {
    //         accessorKey: "contact",
    //         meta: {
    //             exportHeaderName: "Contact",
    //             exportValue: (row) => `${row["contact.first_name"] || ''} ${row["contact.last_name"] || ''}`.trim() || row.contact || ''
    //         }
    //     },
    //     { accessorKey: "boq", meta: { exportHeaderName: "BOQ" } },
    //     {
    //         accessorKey: "assigned_sales",
    //         meta: {
    //             exportHeaderName: "Assigned To",
    //             exportValue: (row) => getUserFullNameByEmail(row.assigned_sales) || ''
    //         }
    //     },
    //     {
    //         accessorKey: "start_date",
    //         meta: {
    //             exportHeaderName: "Start Date",
    //             exportValue: (row) => row.start_date ? formatDateWithOrdinal(new Date(row.start_date), 'dd-MMM-yyyy') : ''
    //         }
    //     },
    //     { accessorKey: "status", meta: { exportHeaderName: "Status" } },
    //     { accessorKey: "remarks", meta: { exportHeaderName: "Remarks" } },
    //     { accessorKey: "owner", meta: { exportHeaderName: "Created By" } },
    //     { accessorKey: "creation", meta: { exportHeaderName: "Created On" } },
    //     { accessorKey: "modified", meta: { exportHeaderName: "Last Modified" } },
    // ]), [tableLogic]);


    return (
        <DataTable
            tableLogic={tableLogic}
            isLoading={isOverallLoading}
            // onRowClick={(row) => navigate(`/tasks/task?id=${row.original.name}`)}
            renderMobileRow={renderTaskMobileRow}
            globalSearchPlaceholder="Search tasks..."
            shouldExpandHeight={true}
            className={className}
            containerClassName={tableContainerClassName}
            // Adjusted gridColsClass for 9 data columns
            gridColsClass="md:grid-cols-[1.5fr,1fr,1.5fr,1.5fr,1fr,1fr,1fr,auto]"
            headerTitle="Sales Task"
            noResultsMessage="No tasks found."
            // renderToolbarActions={(filteredData) => (
            //     <DataTableExportButton
            //         data={filteredData}
            //         columns={taskExportFields}
            //         fileName="CRM_Tasks_List_Export"
            //         label="Export Tasks List"
            //     />
            // )}
        />
    );
};