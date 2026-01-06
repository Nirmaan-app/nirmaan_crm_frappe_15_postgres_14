

// src/pages/BOQS/BoqTableView.tsx
import React, { useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Row, ColumnFiltersState } from '@tanstack/react-table';
import { useFrappeGetDocList } from 'frappe-react-sdk';

// Core reusable DataTable components and hooks
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { DataTableExportButton } from '@/components/table/data-table-export-button';

// Project-specific hooks and utilities
import { useStatusStyles } from '@/hooks/useStatusStyles';
import { useUserRoleLists } from '@/hooks/useUserRoleLists';
import { formatDateWithOrdinal } from '@/utils/FormatDate'; // Your date formatting utility
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // For combining Tailwind classes
import { ChevronRight } from 'lucide-react';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";


// Interface for the BOQ data
interface BOQ {
    name: string; // Frappe ID (unique identifier)
    boq_name: string;
    boq_status: string;
    boq_sub_status?: string; // Ensured this is defined
    boq_submission_date: string;
    owner: string; // User email of the creator
    company: string;
    "company.company_name": string; // Frappe dot notation field, if available and needed
    salesperson?: string;
    assigned_sales?: string; // Typically user email, needs lookup for display name
    modified: string; // Last modification timestamp
    // --- Additional fields for display/filtering/export, as per your requests ---
    contact?: string; // Contact's email/ID, needs lookup for display name
    boq_size?: number;
    boq_type?: string;
    boq_value?: number;
    boq_link?: string;
    city?: string;
    remarks?: string;
    assigned_estimations?: string; // Estimator's email/ID, needs lookup for display name
    // deal_status?: string; // Assuming this might be a new field if you truly meant it
}

interface BoqTableViewProps {
    onBoqSelect?: (id: string) => void;
    activeBoqId?: string;
    // hideStatusColumn prop is removed as status column will always be visible in BoqTableView
    isStandalonePage?: boolean;
    className?: string;
    tableContainerClassName?: string;
}

export const BoqTableView = ({
    onBoqSelect,
    activeBoqId,
    isStandalonePage = false,
    className,
    tableContainerClassName,
}: BoqTableViewProps) => {
    const navigate = useNavigate();
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();
      const role = localStorage.getItem('role');

      const showAssignedSalesColumn = role !== "Nirmaan Sales User Profile"


    // Use useStateSyncedWithParams for activeTabStatus to persist in URL
    const [activeTabStatus, setActiveTabStatus] = useStateSyncedWithParams<string>('statusTab', 'All');
    // In BoqTableView, hideStatusColumn is effectively false, as the column is always defined and visible.
    const hideStatusColumn = false; // For clarity within this component


    // --- Data Fetching for all BOQs ---
    const { data: boqs, isLoading: isBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
        fields: ["*"],
        limit: 0,
        orderBy: { field: 'modified', order: 'desc' },
    }, "all-boqs-all-view");


    // --- Memoized Filter Options (derived from the fetched `boqs` data) ---

    const companyOptions = useMemo(() => {
        if (!boqs) return [];
        const companies = new Map<string, string>();
        boqs.forEach(boq => {
            if (boq.company) companies.set(boq.company, boq.company);
        });
        return Array.from(companies.entries()).map(([id, name]) => ({ id, label: name, value: id }));
    }, [boqs]);

    const statusOptions = useMemo(() => {
        if (!boqs) return [];
        const Statuses = new Set<string>();
        boqs.forEach(boq => boq.boq_status && Statuses.add(boq.boq_status));
        return Array.from(Statuses).sort().map(status => ({
            label: status,
            value: status
        }));
    }, [boqs]);

    // NEW: Options for Sub-Status Faceted Filter
    const subStatusOptions = useMemo(() => {
        if (!boqs) return [];
        const subStatuses = new Set<string>();
        boqs.forEach(boq => boq.boq_sub_status && subStatuses.add(boq.boq_sub_status));
        return Array.from(subStatuses).sort().map(status => ({
            label: status,
            value: status
        }));
    }, [boqs]);


    const projectNamesOptions = useMemo(() => {
        if (!boqs) return [];
        const projectNames = new Set<string>();
        boqs.forEach(boq => boq.boq_name && projectNames.add(boq.boq_name));
        return Array.from(projectNames).sort().map(name => ({ label: name, value: name }));
    }, [boqs]);

      // NEW: Options for Deal Status Faceted Filter
    const dealStatusOptions = useMemo(() => {
        if (!boqs) return [];
        const dealStatuses = new Set<string>();
        boqs.forEach(boq => boq.deal_status && dealStatuses.add(boq.deal_status));
        return Array.from(dealStatuses).sort().map(status => ({
            label: status,
            value: status
        }));
    }, [boqs]);
     const salespersonOptions = useMemo(() => {
            if (!boqs ) return [];
            const salespersons = new Map<string, string>();
            boqs.forEach(boq => {
                if (boq.assigned_sales) {
                    const fullName = getUserFullNameByEmail(boq.assigned_sales);
                    if (fullName) {
                        salespersons.set(boq.assigned_sales, fullName);
                    }
                }
            });
            return Array.from(salespersons.entries()).map(([email, name]) => ({ id: email, label: name, value: email }));
        }, [boqs, usersLoading, getUserFullNameByEmail]);
    

      const boqSubmissionDateColumn: DataTableColumnDef<BOQ> = {
            accessorKey: "boq_submission_date",
            meta: { title: "Submission Deadline", filterVariant: 'date', enableSorting: true },
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.boq_submission_date ? formatDateWithOrdinal(new Date(row.original.boq_submission_date), 'dd-MMM-yyyy') : '--'}
                </span>
            ),
            enableSorting: true,
            filterFn: 'dateRange',
        };
    

    // // --- Column Definitions for the DataTable ---
    // const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
    //     {
    //         accessorKey: "boq_name",
    //         meta: { title: "Project Name",enableSorting: true },
    //         cell: ({ row }) => (
    //             <Link to={`/boqs/boq?id=${row.original.name}&statusTab=${activeTabStatus}`} className="text-primary font-semibold hover:underline text-left">
    //                 {row.original.boq_name}
    //             </Link>
    //         ),
           
    //     },
    //     {
    //         accessorKey: "company",
    //         meta: { title: "Company Name", filterVariant: 'select', enableSorting: true, filterOptions: companyOptions },
    //         cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
    //         filterFn: 'faceted', // Uses the 'facetedFilterFn' registered in useDataTableLogic
    //         enableSorting: true,
            
    //     },
    //     {
    //         accessorKey: "boq_status", // This column is ALWAYS defined and visible
    //         meta: { title: "Status", filterVariant: 'select', enableSorting: true, filterOptions: statusOptions },
    //         cell: ({ row }) => (
    //             <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
    //                 {row.original.boq_status}
    //             </span>
    //         ),
    //         filterFn: 'faceted', // Uses the 'facetedFilterFn' registered in useDataTableLogic
    //         enableSorting: true,
            
    //     },
    //     {
    //         accessorKey: "boq_sub_status", // Filter for sub_status
    //         meta: { title: "Sub-Status", filterVariant: 'select', enableSorting: true, filterOptions: subStatusOptions }, // Using NEW subStatusOptions
    //         cell: ({ row }) => (
    //             row.original.boq_sub_status ? (
    //                 <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
    //                     {row.original.boq_sub_status}
    //                 </span>
    //             ) : '--'
    //         ),
    //         filterFn: 'faceted', // Uses the 'facetedFilterFn' registered in useDataTableLogic
    //         enableSorting: true,
            
    //     },
    //     // If 'deal_status' is a real field, add it here:
    //     // {
    //     //     accessorKey: "deal_status",
    //     //     meta: { title: "Deal Status", filterVariant: 'select', enableSorting: true, filterOptions: dealStatusOptions },
    //     //     cell: ({ row }) => <span className="text-left">{row.original.deal_status || '--'}</span>,
    //     //     enableSorting: true,
    //     //     filterFn: 'faceted',
    //     // },
    //     {
    //         accessorKey: "modified",
    //         meta: { title: "Last Updated", filterVariant: 'date', enableSorting: true },
    //         cell: ({ row }) => (
    //             <span className="text-sm text-muted-foreground">
    //                 {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MMM-yyyy')}
    //             </span>
    //         ),
    //         enableSorting: true,
    //         filterFn: 'dateRange', // Uses the 'dateRangeFilterFn' registered in useDataTableLogic
    //     },
    //     {
    //         accessorKey: "deal_status", // Filter for sub_status
    //         meta: { title: "Deal Status", filterVariant: 'select', enableSorting: true, filterOptions: dealStatusOptions }, // Using NEW subStatusOptions
    //         cell: ({ row }) => (
    //             row.original.deal_status ? (
    //                 <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.deal_status)}`}>
    //                     {row.original.deal_status}
    //                 </span>
    //             ) : '--'
    //         ),
    //         filterFn: 'faceted', // Uses the 'facetedFilterFn' registered in useDataTableLogic
    //         enableSorting: true,
            
    //     },
       
    // ], [boqs, companyOptions, projectNamesOptions, statusOptions,dealStatusOptions, subStatusOptions, getBoqStatusClass]); // Added subStatusOptions to dependencies

        // --- Column Definitions for the DataTable ---
    const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => {
        const baseColumns: DataTableColumnDef<BOQ>[] = [
            {
                accessorKey: "boq_name",
                meta: { title: "Project Name", enableSorting: true },
                cell: ({ row }) => (
                    <Link to={`/boqs/boq?id=${row.original.name}&statusTab=${activeTabStatus}`} className="text-primary font-semibold hover:underline text-left">
                        {row.original.boq_name}
                    </Link>
                ),
            },
            {
                accessorKey: "company",
                meta: { title: "Company Name", filterVariant: 'select', enableSorting: true, filterOptions: companyOptions },
                cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
                filterFn: 'faceted',
                enableSorting: true,
            },
        //      {
        //     accessorKey: "assigned_sales",
        //     meta: { title: "Salesperson", filterVariant: 'select', filterOptions: salespersonOptions, enableSorting: true },
        //     cell: ({ row }) => <span className="text-center text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
         
        // },
        
            {
                accessorKey: "boq_status",
                meta: { title: "Status", filterVariant: 'select', enableSorting: true, filterOptions: statusOptions },
                cell: ({ row }) => (
                    <span className={`text-xs font-semibold p-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
                        {row.original.boq_status}
                    </span>
                ),
                filterFn: 'faceted',
                enableSorting: true,
            },
            {
                accessorKey: "boq_sub_status",
                meta: { title: "Sub-Status", filterVariant: 'select', enableSorting: true, filterOptions: subStatusOptions },
                cell: ({ row }) => (
                    row.original.boq_sub_status ? (
                        <span className={`text-[10px] font-semibold p-1 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
                            {row.original.boq_sub_status}
                        </span>
                    ) : (<span className='px-4 py-0.5'>{'--'}</span>)
                ),
                filterFn: 'faceted',
                enableSorting: true,
            },
            {
                accessorKey: "creation",
                meta: { title: "Added Date", filterVariant: 'date', enableSorting: true },
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {formatDateWithOrdinal(new Date(row.original.creation), 'dd-MMM-yyyy')}
                    </span>
                ),
                enableSorting: true,
                filterFn: 'dateRange',
            },
            {
                accessorKey: "modified",
                meta: { title: "Last Updated", filterVariant: 'date', enableSorting: true },
                cell: ({ row }) => (
                    <span className="text-sm  text-muted-foreground">
                        {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MMM-yyyy')}
                    </span>
                ),
                enableSorting: true,
                filterFn: 'dateRange',
            },
            {
                accessorKey: "deal_status",
                meta: { title: "Deal Status", filterVariant: 'select', enableSorting: true, filterOptions: dealStatusOptions },
                cell: ({ row }) => (
                    row.original.deal_status ? (
                        <span className={`text-xs  font-semibold px-4 py-0.5 rounded-full ${getBoqStatusClass(row.original.deal_status)}`}>
                            {row.original.deal_status}
                        </span>
                    ) :(<span className='px-4 py-0.5'>{'--'}</span>) 
                ),
                filterFn: 'faceted',
                enableSorting: true,
            },
        ];

         // Conditionally insert the 'assigned_sales' column based on user roles
        if (showAssignedSalesColumn) {
            // Insert after 'company' column (which is at index 1)
            baseColumns.splice(2, 0, {
                accessorKey: "assigned_sales",
                meta: { title: "Sales", filterVariant: 'select', filterOptions: salespersonOptions, enableSorting: true },
                cell: ({ row }) => (
                    <span className="text-sm">
                        {row.original.assigned_sales
                            ? getUserFullNameByEmail(row.original.assigned_sales)?.split(' ')[0] || row.original.assigned_sales
                            : '—'}
                    </span>
                ),
            });
        }


        // Conditionally add the boq_submission_date column
        const statusesWithSubmissionDate = ['New', 'In-Progress', 'Revision Pending'];
        if (statusesWithSubmissionDate.includes(activeTabStatus)) {
            // Insert it before the "Deal Status" column for a logical flow
            baseColumns.splice(5, 0, boqSubmissionDateColumn); // Insert at index 5
        }

        // Add Actions Column
        baseColumns.push({
            id: 'actions',
            meta: { title: "Action", enableSorting: false, excludeFromExport: true },
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button variant="ghost" size="icon" onClick={() => {
                         if (isStandalonePage) {
                            navigate(`/boqs/boq?id=${row.original.name}`);
                        } else {
                            onBoqSelect?.(row.original.name);
                        }
                    }}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: false,
        });

        return baseColumns;

    }, [boqs, companyOptions,showAssignedSalesColumn, projectNamesOptions, statusOptions, dealStatusOptions, subStatusOptions, getBoqStatusClass, activeTabStatus, isStandalonePage, navigate, onBoqSelect]);


    if (error) return <div className="text-red-500">Error loading BOQs.</div>;


    // --- Dynamic Filters & Visibility passed to useDataTableLogic ---

    // `initialColumnFilters`: Based on the active tab status
    const initialColumnFilters: ColumnFiltersState = useMemo(() => {
        if (activeTabStatus !== 'All') { // Only apply filter if a specific tab is selected
            return [{ id: 'boq_status', value: [activeTabStatus] }];
        }
        return [];
    }, [activeTabStatus]); // Dependency only on activeTabStatus

    // `initialColumnVisibility`: `boq_status` is always visible now. `actions` depends on `isStandalonePage`.
    const initialColumnVisibility = useMemo(() => ({
        boq_status: true, // Status column is always visible visually
        actions: !isStandalonePage // Hide 'actions' column if it's a standalone page
    }), [isStandalonePage]); // Dependency only on isStandalonePage


    // --- Initialize `useDataTableLogic` Hook ---
    const tableLogic = useDataTableLogic<BOQ>({
        data: boqs || [], // The data to display
        columns: columns, // ALL column definitions (visibility handled separately)
        initialSorting: [{ id: 'modified', desc: true }], // Default sort order
        initialColumnFilters: initialColumnFilters, // Pass initial filter state
        initialColumnVisibility: initialColumnVisibility, // Pass 
        customGlobalFilterFn : [
    'boq_name',
    'company',
    'boq_status',
    'boq_sub_status',
    'owner',
    'salesperson',
    'assigned_sales',
    'contact',
    'city',
    'remarks'
],

        // initial column visibility
        // globalFilterFn will be `defaultGlobalFilterFn` from useDataTableLogic itself,
        // which should now be robust enough.
    });

    // --- Effect for Dynamic Synchronization ---
    // Note: Using minimal dependencies to prevent excessive re-runs
    // tableLogic.table creates new references on each render, so we access it directly
    useEffect(() => {
        // Clear global search when a tab filter is applied/changed.
        tableLogic.setGlobalFilter('');

        // Apply the tab-based status filter based on activeTabStatus
        const newFilters = activeTabStatus !== 'All'
            ? [{ id: 'boq_status', value: [activeTabStatus] }]
            : [];
        tableLogic.table.setColumnFilters(newFilters);

        // Dynamically set 'actions' column visibility
        tableLogic.setColumnVisibility(prev => ({
            ...prev,
            actions: !isStandalonePage
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTabStatus, isStandalonePage]);


    // --- Mobile Row Renderer ---
    const renderBoqMobileRow = (row: Row<BOQ>) => (
        <div className="flex justify-between items-start p-3 border rounded-lg">
            <div className="flex flex-col text-left">
                <Link to={`/boqs/boq?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </Link>
                <p className="text-sm text-muted-foreground">{row.original.company || '--'}</p>
                <p className="text-xs text-muted-foreground">Created By: {row.original.owner} </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
                    {row.original.boq_status}
                </span>
                <p className="text-xs text-muted-foreground">
                    {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MM-yyyy')}
                </p>
            </div>
        </div>
    );

    // --- Export Fields Definition ---
    const boqExportFields = useMemo<DataTableColumnDef<BOQ>[]>(() => ([
        { accessorKey: "name", meta: { exportHeaderName: "BOQ ID" } },
        { accessorKey: "boq_name", meta: { exportHeaderName: "BOQ Name" } },
        { accessorKey: "company", meta: { exportHeaderName: "Company" } },
        {
            accessorKey: "contact",
            meta: {
                exportHeaderName: "Contact Person",
                exportValue: (row) => row.contact ? (getUserFullNameByEmail(row.contact) || row.contact) : ''
            }
        },
        { accessorKey: "boq_size", meta: { exportHeaderName: "BOQ Size" } },
        { accessorKey: "boq_type", meta: { exportHeaderName: "BOQ Type" } },
        { accessorKey: "boq_value", meta: { exportHeaderName: "BOQ Value", isCurrency: true } },
        { accessorKey: "boq_submission_date", meta: { exportHeaderName: "Submission Date" } },
        { accessorKey: "boq_link", meta: { exportHeaderName: "BOQ Link" } },
        { accessorKey: "city", meta: { exportHeaderName: "City" } },
        { accessorKey: "remarks", meta: { exportHeaderName: "Remarks" } },
        { accessorKey: "boq_status", meta: { exportHeaderName: "Status" } },
        { accessorKey: "boq_sub_status", meta: { exportHeaderName: "Sub-Status" } },
        {
            accessorKey: "assigned_sales",
            meta: {
                exportHeaderName: "Assigned Salesperson",
                exportValue: (row) => getUserFullNameByEmail(row.assigned_sales) || ''
            }
        },
        {
            accessorKey: "assigned_estimations",
            meta: {
                exportHeaderName: "Assigned Estimations",
                exportValue: (row) => row.assigned_estimations ? (getUserFullNameByEmail(row.assigned_estimations) || row.assigned_estimations) : ''
            }
        },
        { accessorKey: "owner", meta: { exportHeaderName: "Created By" } },
        { accessorKey: "modified", meta: { exportHeaderName: "Last Modified" } },
        { accessorKey: "deal_status", meta: { exportHeaderName: "Deal Status" } },
    ]), [getUserFullNameByEmail]);


    // ... (after tableLogic declaration)

// NEW: Calculate gridColsClass dynamically based on visible columns
const calculatedGridColsClass = useMemo(() => {
    const statusesWithSubmissionDate = ['New', 'In-Progress', 'Revision Pending'];
    const isSubmissionDateColumnVisible = statusesWithSubmissionDate.includes(activeTabStatus);
    const isActionsColumnVisible = tableLogic.columnVisibility.actions;

    let gridTemplate: string;

    if (isSubmissionDateColumnVisible && isActionsColumnVisible) {
        // 7 data columns + Actions
        // (boq_name, company, boq_status, boq_sub_status, boq_submission_date, modified, deal_status, actions)
        gridTemplate = "md:grid-cols-[1fr,1.2fr,1fr,1fr,1fr,1.5fr,1fr,1fr,1fr,60px]";
    } else if (isSubmissionDateColumnVisible && !isActionsColumnVisible) {
        // 7 data columns, no Actions
        // (boq_name, company, boq_status, boq_sub_status, boq_submission_date, modified, deal_status)
        gridTemplate = "md:grid-cols-[1fr,1.2fr,1fr,1fr,1fr,1.5fr,1fr,1fr,1fr]";
    } else if (!isSubmissionDateColumnVisible && isActionsColumnVisible) {
        // 6 data columns + Actions
        // (boq_name, company, boq_status, boq_sub_status, modified, deal_status, actions)
        gridTemplate = "md:grid-cols-[1fr,1.2fr,1fr,1fr,1fr,1fr,1fr,60px,1fr]";
    } else { // !isSubmissionDateColumnVisible && !isActionsColumnVisible
        // 6 data columns, no Actions
        // (boq_name, company, boq_status, boq_sub_status, modified, deal_status)
        gridTemplate = "md:grid-cols-[1fr,1.2fr,1fr,1fr,1fr,1fr,1fr,1fr]";
    }

    return gridTemplate;
}, [activeTabStatus, tableLogic.columnVisibility.actions,showAssignedSalesColumn]); // Dependencies for this memo
    // NEW: Calculate gridColsClass dynamically based on visible columns
  

    return (
        <DataTable
            tableLogic={tableLogic}
            isLoading={isBoqsLoading || usersLoading}
            // onRowClick={(row) => {
            //     if (isStandalonePage) {
            //         navigate(`/boqs/boq?id=${row.original.name}`); // Direct navigation for standalone page
            //     } else {
            //         onBoqSelect?.(row.original.name); // Callback for embedded use
            //     }
            // }}
            renderMobileRow={renderBoqMobileRow}
            globalSearchPlaceholder="Search BOQs..."
            shouldExpandHeight={true} // BoqTableView always tells DataTable to expand to fill its parent's height
            className={className} // Pass parent's className to DataTable's root div
            minWidth="1200px"
             gridColsClass={calculatedGridColsClass}

            headerTitle={<span className="tracking-tight">BOQs</span>}
            noResultsMessage="No BOQs found."
            // Minimalist animated tabs with sliding indicator
            renderTopToolbarActions={
                <SlidingTabs
                    tabs={[
                        { label: 'All', value: 'All' },
                        ...statusOptions.map(opt => ({ label: opt.label, value: opt.value }))
                    ]}
                    activeTab={activeTabStatus}
                    onTabChange={setActiveTabStatus}
                />
            }
            renderToolbarActions={(filteredData) => (
                <DataTableExportButton
                    data={filteredData}
                    columns={boqExportFields}
                    fileName="BOQs_List_Export"
                    label="Export BOQs List"
                />
            )}
        />
    );
};