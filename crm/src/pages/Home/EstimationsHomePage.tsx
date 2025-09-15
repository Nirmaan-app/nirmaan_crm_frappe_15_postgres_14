
// src/pages/Home/EstimationHomePage.tsx
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, Link } from "react-router-dom";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import React, { useMemo, useEffect } from 'react';
import { Plus, ChevronRight } from "lucide-react";
import { useDialogStore } from '@/store/dialogStore';
import { useUserRoleLists } from "@/hooks/useUserRoleLists"
import { formatDateWithOrdinal } from "@/utils/FormatDate";

// TanStack Table Imports (needed for Row type and ColumnFiltersState)
import { Row, ColumnFiltersState } from '@tanstack/react-table';

// Core reusable DataTable components and hooks from your project structure
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { DataTableExportButton } from '@/components/table/data-table-export-button';
import { cn } from '@/lib/utils'; // For combining Tailwind classes


// Interface for the BOQ data
// Ensure all fields that might be displayed, filtered, or exported are included here.
interface BOQ {
    name: string; // Frappe ID (unique identifier)
    boq_name: string;
    boq_status: string;
    boq_sub_status?: string;
    boq_submission_date: string;
    owner: string; // User email of the creator
    company: string;
    "company.company_name": string; // Frappe dot notation field, if available and needed
    salesperson?: string; // Could be a name or email directly
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
}

// =============================================================================
// Component for the "Pending BOQs" section
// =============================================================================
export const PendingBOQs = () => {
    const navigate = useNavigate();
    const { openEditBoqDialog } = useDialogStore();
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

    // For Pending BOQs in this context, the status column is always visible in the table header.
    // Therefore, `hideStatusColumn` is set to `false`.
    const hideStatusColumn = false;

    // --- Data Fetching for Pending BOQs ---
    const { data: pendingBoqs, isLoading: isPendingBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
        fields: ["*"], // Fetch all necessary fields for display, filtering, and export
        filters: [["boq_status", "in", ["New", "Revision Pending", "In-Progress"]]], // Specific filters for "Pending"
        limit: 0, // No pagination limit, fetch all
        orderBy: { field: 'modified', order: 'desc' } // Default sorting for data fetching
    }, "all-boqs-estimate-pending"); // Unique cache key for this specific data fetch


    // --- Memoized Filter Options (derived from the fetched `pendingBoqs` data) ---

    const pendingCompanyOptions = useMemo(() => {
        if (!pendingBoqs) return [];
        const companies = new Map<string, string>();
        pendingBoqs.forEach(boq => {
            if (boq.company) companies.set(boq.company, boq.company);
        });
        return Array.from(companies.entries()).map(([id, name]) => ({ id, label: name, value: id }));
    }, [pendingBoqs]);

    const pendingStatusOptions = useMemo(() => {
        // These are the possible statuses for the filter tabs/dropdowns for Pending BOQs
        return ['New', 'Revision Pending', 'In-Progress'].map(status => ({
            label: status,
            value: status
        }));
    }, []);

    const pendingSubStatusOptions = useMemo(() => {
        if (!pendingBoqs) return [];
        const subStatuses = new Set<string>();
        pendingBoqs.forEach(boq => boq.boq_sub_status && subStatuses.add(boq.boq_sub_status));
        return Array.from(subStatuses).sort().map(status => ({
            label: status,
            value: status
        }));
    }, [pendingBoqs]);

    const pendingProjectNamesOptions = useMemo(() => {
        if (!pendingBoqs) return [];
        const projectNames = new Set<string>();
        pendingBoqs.forEach(boq => boq.boq_name && projectNames.add(boq.boq_name));
        return Array.from(projectNames).sort().map(name => ({ label: name, value: name }));
    }, [pendingBoqs]);

    const pendingSalespersonOptions = useMemo(() => {
        if (!pendingBoqs || usersLoading) return [];
        const salespersons = new Map<string, string>();
        pendingBoqs.forEach(boq => {
            if (boq.assigned_sales) {
                const fullName = getUserFullNameByEmail(boq.assigned_sales);
                if (fullName) {
                    salespersons.set(boq.assigned_sales, fullName);
                }
            }
        });
        return Array.from(salespersons.entries()).map(([email, name]) => ({ id: email, label: name, value: email }));
    }, [pendingBoqs, usersLoading, getUserFullNameByEmail]);


    // --- Column Definitions for the Pending BOQs DataTable ---
    const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
        {
            accessorKey: "boq_name",
            meta: { title: "Project Name", filterVariant: 'select', enableSorting: true, filterOptions: pendingProjectNamesOptions },
            cell: ({ row }) => (
                <Link to={`/boqs/boq?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </Link>
            ),
            filterFn: 'faceted', // Uses the 'facetedFilterFn' registered in useDataTableLogic
            enableSorting: true,
        },
        {
            accessorKey: "company",
            meta: { title: "Company Name", filterVariant: 'select', enableSorting: true, filterOptions: pendingCompanyOptions },
            cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
            enableSorting: true,
            filterFn: 'faceted',
        },
        {
            accessorKey: "boq_status", // This column is visible and filterable
            meta: { title: "Current Status", filterVariant: 'select', enableSorting: true, filterOptions: pendingStatusOptions },
            cell: ({ row }) => (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
                    {row.original.boq_status}
                </span>
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "boq_sub_status",
            meta: { title: "Sub-Status", filterVariant: 'select', enableSorting: true, filterOptions: pendingSubStatusOptions },
            cell: ({ row }) => (
                row.original.boq_sub_status ? (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
                        {row.original.boq_sub_status}
                    </span>
                ) : '--'
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "assigned_sales",
            meta: { title: "Salesperson", filterVariant: 'select', enableSorting: true, filterOptions: pendingSalespersonOptions },
            cell: ({ row }) => <span className="px-2 text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
            enableSorting: true,
            filterFn: 'faceted',
        },
        {
            accessorKey: "boq_submission_date",
            meta: { title: "Submission Deadline", filterVariant: 'date', enableSorting: true },
            cell: ({ row }) => (
                <span className="text-sm px-2 text-muted-foreground">
                    {row.original.boq_submission_date ? formatDateWithOrdinal(new Date(row.original.boq_submission_date), 'dd-MMM-yyyy') : '--'}
                </span>
            ),
            enableSorting: true,
            filterFn: 'dateRange',
        },
        {
            id: 'actions',
            meta: { title: "Action", enableSorting: false, excludeFromExport: true }, // Not sortable/filterable, excluded from export
            cell: ({ row }) => (
                <div className="flex flex-col items-start gap-2 md:text-center">
                    <Button onClick={() => openEditBoqDialog({ boqData: row.original, mode: 'status' })} variant="destructive" size="sm" className="mt-2 md:mt-0">
                        Update BOQ Status
                    </Button>
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
    ], [pendingBoqs, pendingCompanyOptions, pendingStatusOptions, pendingSalespersonOptions, pendingSubStatusOptions, pendingProjectNamesOptions, getBoqStatusClass, openEditBoqDialog, getUserFullNameByEmail]);


    if (error) return <div className="text-red-500">Error loading pending BOQs.</div>;

    // --- Dynamic Filters & Visibility for useDataTableLogic (Pending BOQs) ---
    // No tab filter logic for initial setup here as `hideStatusColumn` is false.
    const initialTabFilter: ColumnFiltersState = useMemo(() => [], []);

    const initialColumnVisibility = useMemo(() => ({
        boq_status: !hideStatusColumn, // Will be true (visible)
        actions: true, // Actions column always visible in PendingBOQs
    }), [hideStatusColumn]);


    // --- Initialize `useDataTableLogic` Hook for Pending BOQs ---
    const tableLogic = useDataTableLogic<BOQ>({
        data: pendingBoqs || [],
        columns: columns,
        initialSorting: [{ id: 'boq_submission_date', desc: true }], // Default sort for Pending BOQs
        initialColumnFilters: initialTabFilter,
        initialColumnVisibility: initialColumnVisibility,
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
    });

    // --- Effect for Dynamic Synchronization (Pending BOQs) ---
    useEffect(() => {
        if (tableLogic.globalFilter !== '') {
            tableLogic.setGlobalFilter('');
        }
        tableLogic.table.setColumnFilters(initialTabFilter); // Ensure no tab-based filter is active
        tableLogic.setColumnVisibility(prev => ({
            ...prev,
            boq_status: !hideStatusColumn,
            actions: true, // Ensure actions column is always visible here
        }));
        // No activeTabStatus logic for PendingBOQs since tabs aren't used here.
    }, [tableLogic.globalFilter, tableLogic.setGlobalFilter, tableLogic.table, initialTabFilter, tableLogic.setColumnVisibility, hideStatusColumn]);


    // --- Mobile Row Renderer for Pending BOQs ---
    const renderPendingBoqMobileRow = (row: Row<BOQ>) => (
        <div className="flex justify-between items-start p-3 border rounded-lg">
            <div className="flex flex-col text-left">
                <Link to={`/boqs/boq?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </Link>
                <p className="text-sm text-muted-foreground">Created By: {row.original.owner}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Submission Date: {row.original.boq_submission_date ? formatDateWithOrdinal(new Date(row.original.boq_submission_date), 'dd-MMM-yyyy') : '--'}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
                    {row.original.boq_status}
                </span>
                {row.original.boq_sub_status && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
                        {row.original.boq_sub_status}
                    </span>
                )}
            </div>
        </div>
    );

    // --- Export Fields Definition for Pending BOQs ---
    const pendingBoqExportFields = useMemo<DataTableColumnDef<BOQ>[]>(() => ([
        { accessorKey: "name", meta: { exportHeaderName: "BOQ ID" } },
        { accessorKey: "boq_name", meta: { exportHeaderName: "BOQ Name" } },
        { accessorKey: "company", meta: { exportHeaderName: "Company" } },
        { accessorKey: "contact", meta: { exportHeaderName: "Contact Person", exportValue: (row) => row.contact ? (getUserFullNameByEmail(row.contact) || row.contact) : '' } },
        { accessorKey: "boq_size", meta: { exportHeaderName: "BOQ Size" } },
        { accessorKey: "boq_type", meta: { exportHeaderName: "BOQ Type" } },
        { accessorKey: "boq_value", meta: { exportHeaderName: "BOQ Value", isCurrency: true } },
        { accessorKey: "boq_submission_date", meta: { exportHeaderName: "Submission Date" } },
        { accessorKey: "boq_link", meta: { exportHeaderName: "BOQ Link" } },
        { accessorKey: "city", meta: { exportHeaderName: "City" } },
        { accessorKey: "remarks", meta: { exportHeaderName: "Remarks" } },
        { accessorKey: "boq_status", meta: { exportHeaderName: "Status" } },
        { accessorKey: "boq_sub_status", meta: { exportHeaderName: "Sub-Status" } },
        { accessorKey: "assigned_sales", meta: { exportHeaderName: "Assigned Salesperson", exportValue: (row) => getUserFullNameByEmail(row.assigned_sales) || '' } },
        { accessorKey: "assigned_estimations", meta: { exportHeaderName: "Assigned Estimations", exportValue: (row) => row.assigned_estimations ? (getUserFullNameByEmail(row.assigned_estimations) || row.assigned_estimations) : '' } },
        { accessorKey: "owner", meta: { exportHeaderName: "Created By" } },
        { accessorKey: "modified", meta: { exportHeaderName: "Last Modified" } },
    ]), [getUserFullNameByEmail]);


    return (
        <DataTable
            tableLogic={tableLogic}
            isLoading={isPendingBoqsLoading || usersLoading}
            // onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
            renderMobileRow={renderPendingBoqMobileRow}
            globalSearchPlaceholder="Search pending BOQs..."
            shouldExpandHeight={false} // Explicitly NOT expanding height (fixed 350px max-height)
            className="h-full" // Ensure DataTable's root div itself fills its parent container
            containerClassName="max-h-[300px]" // Apply fixed max-height to the scrollable table body
            // Grid columns for Pending BOQs (7 columns)
            gridColsClass="md:grid-cols-[1.8fr,1.2fr,1fr,1fr,1.2fr,1.3fr,1fr]"
            headerTitle="Pending BOQs"
            noResultsMessage="No pending BOQs found."
            // Render the export button in the toolbar actions slot
            renderToolbarActions={(filteredData) => (
                <DataTableExportButton
                    data={filteredData}
                    columns={pendingBoqExportFields}
                    fileName="Pending_BOQs_Export"
                    label="Export Pending BOQs"
                />
            )}
        />
    );
};

// =============================================================================
// Component for the "All BOQs" section
// =============================================================================
export const AllBOQs = () => {
    const navigate = useNavigate();
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

    // For AllBOQs, the status column is always visible in the table header.
    // Therefore, `hideStatusColumn` is set to `false`.
    const hideStatusColumn = false; // Status column always visible for AllBOQs
    // AllBOQs is always embedded in EstimationHomePage, so it's not a standalone page.
    const isStandalonePage = false;


    // --- Data Fetching for All BOQs ---
    const { data: allBoqs, isLoading: isBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
        fields: ["*"], // Fetch all fields for maximum flexibility
        limit: 0, // No pagination limit, fetch all
        orderBy: { field: 'modified', order: 'desc' }, // Default sorting for data fetching
    }, "all-boqs-estimate-all"); // Unique cache key for this specific data fetch

    // --- Memoized Filter Options (derived from the fetched `allBoqs` data) ---

    const statusOptions = useMemo(() => {
        return ['New', 'Revision Pending', 'In-Progress', 'Revision Submitted', 'Negotiation', 'Won', 'Lost', 'Hold'].map(status => ({
            label: status,
            value: status
        }));
    }, []);

    const subStatusOptions = useMemo(() => {
        if (!allBoqs) return [];
        const subStatuses = new Set<string>();
        allBoqs.forEach(boq => boq.boq_sub_status && subStatuses.add(boq.boq_sub_status));
        return Array.from(subStatuses).sort().map(status => ({
            label: status,
            value: status
        }));
    }, [allBoqs]);

    const companyOptions = useMemo(() => {
        if (!allBoqs) return [];
        const companies = new Map<string, string>();
        allBoqs.forEach(boq => {
            if (boq.company) companies.set(boq.company, boq.company);
        });
        return Array.from(companies.entries()).map(([id, name]) => ({ id, label: name, value: id }));
    }, [allBoqs]);

    const projectNamesOptions = useMemo(() => {
        if (!allBoqs) return [];
        const projectNames = new Set<string>();
        allBoqs.forEach(boq => boq.boq_name && projectNames.add(boq.boq_name));
        return Array.from(projectNames).sort().map(name => ({ label: name, value: name }));
    }, [allBoqs]);

    const salespersonOptions = useMemo(() => {
        if (!allBoqs || usersLoading) return [];
        const salespersons = new Map<string, string>();
        allBoqs.forEach(boq => {
            if (boq.assigned_sales) {
                const fullName = getUserFullNameByEmail(boq.assigned_sales);
                if (fullName) {
                    salespersons.set(boq.assigned_sales, fullName);
                }
            }
        });
        return Array.from(salespersons.entries()).map(([email, name]) => ({ id: email, label: name, value: email }));
    }, [allBoqs, usersLoading, getUserFullNameByEmail]);

    // --- Column Definitions for the All BOQs DataTable ---
    const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
        {
            accessorKey: "boq_name",
            meta: { title: "Project Name", filterVariant: 'select', enableSorting: true, filterOptions: projectNamesOptions },
            cell: ({ row }) => (
                <span className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </span>
            ),
           
        },
        {
            accessorKey: "company",
            meta: { title: "Company Name", filterVariant: 'select', filterOptions: companyOptions, enableSorting: true },
            cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
         
        },
        {
            accessorKey: "boq_status",
            meta: { title: "Status", filterVariant: 'select', filterOptions: statusOptions, enableSorting: true },
            cell: ({ row }) => (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
                    {row.original.boq_status}
                </span>
            ),
        
        },
        {
            accessorKey: "boq_sub_status",
            meta: { title: "Sub-Status", filterVariant: 'select', filterOptions: subStatusOptions, enableSorting: true },
            cell: ({ row }) => (
                row.original.boq_sub_status ? (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
                        {row.original.boq_sub_status}
                    </span>
                ) : '--'
            ),
          
        },
        {
            accessorKey: "modified",
            meta: { title: "Last Updated", filterVariant: 'date', enableSorting: true },
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MMM-yyyy')}
                </span>
            ),
       
        },
        {
            accessorKey: "assigned_sales",
            meta: { title: "Salesperson", filterVariant: 'select', filterOptions: salespersonOptions, enableSorting: true },
            cell: ({ row }) => <span className="text-center text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
         
        },
        // {
        //     id: 'actions',
        //     meta: { title: "", enableSorting: false, filterVariant: undefined, excludeFromExport: true },
        //     cell: () => (
        //         <div className="flex justify-end pt-2 md:pt-0">
        //             <ChevronRight className="h-5 w-5 text-muted-foreground" />
        //         </div>
        //     ),
        //     enableSorting: false,
        //     enableColumnFilter: false,
        // },
    ], [allBoqs, companyOptions, projectNamesOptions, statusOptions, subStatusOptions, salespersonOptions, getBoqStatusClass, getUserFullNameByEmail]);


    if (error) return <div className="text-red-500">Error loading BOQs.</div>;

    // --- Dynamic Filters & Visibility for useDataTableLogic (All BOQs) ---
    // No tab filter for AllBOQs, as the status column is always visible.
    const initialTabFilter: ColumnFiltersState = useMemo(() => [], []);

    const initialColumnVisibility = useMemo(() => ({
        boq_status: !hideStatusColumn, // Will be true (visible)
        actions: true, // Actions column always visible in AllBOQs
    }), [hideStatusColumn]);


    // --- Initialize `useDataTableLogic` Hook for All BOQs ---
    const tableLogic = useDataTableLogic<BOQ>({
        data: allBoqs || [],
        columns: columns,
        initialSorting: [{ id: 'modified', desc: true }],
        initialColumnFilters: initialTabFilter,
        initialColumnVisibility: initialColumnVisibility,
    });

    // --- Effect for Dynamic Synchronization (All BOQs) ---
    useEffect(() => {
        if (tableLogic.globalFilter !== '') {
            tableLogic.setGlobalFilter('');
        }
        tableLogic.table.setColumnFilters(initialTabFilter); // Ensure no tab-based filter is active
        tableLogic.setColumnVisibility(prev => ({
            ...prev,
            boq_status: !hideStatusColumn,
            actions: true, // Ensure actions column is always visible here
        }));
    }, [tableLogic.globalFilter, tableLogic.setGlobalFilter, tableLogic.table, initialTabFilter, tableLogic.setColumnVisibility, hideStatusColumn]);


    // --- Mobile Row Renderer for All BOQs ---
    const renderBoqMobileRow = (row: Row<BOQ>) => (
        <div className="flex justify-between items-start p-3 border rounded-lg">
            <div className="flex flex-col text-left">
                <p className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </p>
                <p className="text-sm text-muted-foreground">{row.original.company || '--'}</p>
                <p className="text-xs text-muted-foreground">Created By: {row.original.owner} </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Sales: {getUserFullNameByEmail(row.original.assigned_sales) || "--"}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
                    {row.original.boq_status}
                </span>
                {row.original.boq_sub_status && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
                        {row.original.boq_sub_status}
                    </span>
                )}
                <p className="text-xs text-muted-foreground">
                    {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MM-yyyy')}
                </p>
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
            </div>
        </div>
    );

    // --- Export Fields Definition for All BOQs ---
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
    ]), [getUserFullNameByEmail]);


    return (
        <DataTable
            tableLogic={tableLogic}
            isLoading={isBoqsLoading || usersLoading}
            onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
            renderMobileRow={renderBoqMobileRow}
            globalSearchPlaceholder="Search project name, company, salesperson..."
            shouldExpandHeight={false} // AllBOQs will have a fixed height (not flex-1)
            className="h-full" // The DataTable's root div itself should fill its parent
            containerClassName="max-h-[300px]" // Explicitly set max-height for the scrollable table body
            gridColsClass="md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto]" // 7 columns for AllBOQs
            headerTitle="All BOQs"
            renderToolbarActions={(filteredData) => (
                <DataTableExportButton
                    data={filteredData}
                    columns={boqExportFields}
                    fileName="All_BOQs_Export"
                    label="Export BOQs"
                />
            )}
        />
    );
};

// =============================================================================
// Main component that assembles the page
// =============================================================================
export const EstimationsHomePage = () => {
     const fullName = localStorage.getItem('fullName');

       const {
            
             openNewBoqDialog,
             
         } = useDialogStore();

    return (
        // <div className="space-y-2">
        //     <div className="flex flex-wrap gap-4 justify-between items-center">
        //         <h1 className="text-2xl font-bold">Welcome, {fullName}!</h1>
        //         <Button className="h-9 px-4 py-2" onClick={() => {/* navigate to create BOQ */ }}>
        //             <Plus className="mr-2 h-4 w-4" /> Create New BOQ
        //         </Button>
        //     </div>
        //     <PendingBOQs />
        //     <AllBOQs />
        // </div>
            <div className="flex flex-col h-full max-h-screen overflow-y-auto">
      {/* 
        This is the fixed/sticky header section.
        - sticky top-0: Makes it stick to the top of its scrolling parent.
        - z-20: Ensures it stays above other content.
        - bg-background: Gives it a solid background so content doesn't show through.
        - p-4: Adds padding.
        - border-b: Adds a subtle separator.
        - flex-shrink-0: Prevents it from shrinking if it's in a flex container.
      */}
      <div className="sticky top-0 z-20 bg-background px-4 py-2  flex-shrink-0">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <h1 className="text-2xl font-bold">Welcome, {fullName}!</h1>
          <Button className="h-9 px-4 py-2" onClick={openNewBoqDialog} >
            <Plus className="mr-2 h-4 w-4" /> Create New BOQ
          </Button>
        </div>
      </div>

      {/* 
        The content that scrolls underneath the fixed header.
        This div is now the main content area below the fixed header.
        No explicit overflow-y-auto here if its parent already handles it.
        We remove space-y-2 from the parent, and manage spacing internally or in child components.
      */}
      <div className="flex-1 p-4 pt-0"> {/* Added p-4 for general content padding, pt-0 to avoid double padding with header */}
        <div className="space-y-2"> {/* Manage internal spacing here */}
            <PendingBOQs />
            <AllBOQs />
        </div>
      </div>
    </div>

    );
};

// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useNavigate, Link } from "react-router-dom";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import React, { useMemo } from 'react';
// import { Plus, ChevronRight } from "lucide-react";
// import { useDialogStore } from '@/store/dialogStore';
// import { useUserRoleLists } from "@/hooks/useUserRoleLists"
// import { formatDateWithOrdinal } from "@/utils/FormatDate";

// // TanStack Table Imports (needed for Row type)
// import { Row } from '@tanstack/react-table';

// // Corrected imports for DataTable components and hook from your new structure
// import { DataTable } from '@/components/table/data-table';
// import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
// import { DataTableColumnDef } from '@/components/table/utils/table-filters';
// import { DataTableExportButton } from '@/components/table/data-table-export-button'; // NEW IMPORT


// // Interface for the BOQ data - IMPORTANT: Add all fields that might be exported!
// interface BOQ {
//     name: string;
//     boq_name: string;
//     boq_status: string;
//     boq_sub_status?: string;
//     boq_submission_date: string;
//     owner: string;
//     company: string;
//     "company.company_name": string; // Frappe dot notation field, often exported as 'Company Name'
//     salesperson?: string;
//     assigned_sales?: string;
//     modified: string;
//     // --- Additional fields for export as per your request ---
//     contact?: string; // Assuming 'contact' field might exist
//     boq_size?: number;
//     boq_type?: string;
//     boq_value?: number;
//     boq_link?: string;
//     city?: string;
//     remarks?: string;
//     assigned_estimations?: string; // Assuming 'assigned_estimations' field might exist
// }

// // Component for the "Pending BOQs" section - REFACTORED TO USE DataTable
// const PendingBOQs = () => {
//     const navigate = useNavigate();
//     const { openEditBoqDialog } = useDialogStore();
//     const getBoqStatusClass = useStatusStyles("boq");
//     const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists(); // Needed for assigned_sales/owner if displayed

//     // 1. Fetch pending BOQ data
//     const { data: pendingBoqs, isLoading: isPendingBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
//         fields: ["*"], // Fetch all necessary fields
//         filters: [["boq_status", "in", ["New", "Revision Pending", "In-Progress"]]],
//         limit: 0,
//         orderBy: { field: 'modified', order: 'desc' }
//     }, "all-boqs-estimate-pending");

//     // Memoized filter options for faceted filters specific to Pending BOQs
//     const pendingStatusOptions = useMemo(() => {
//         return ['New', 'Revision Pending', 'In-Progress'].map(status => ({
//             label: status,
//             value: status
//         }));
//     }, []);

//     const pendingcompanyOptions = useMemo(() => {
//         if (!pendingBoqs) return [];
//         const companies = new Map<string, string>();
//         pendingBoqs.forEach(boq => {
//             if (boq.company) companies.set(boq.company, boq.company);
//         });
//         return Array.from(companies.entries()).map(([id, name]) => ({ id, label: name, value: id }));
//     }, [pendingBoqs]);

//     const pendingSubStatusOptions = useMemo(() => {
//         if (!pendingBoqs) return [];
//         const subStatuses = new Set<string>();
//         pendingBoqs.forEach(boq => boq.boq_sub_status && subStatuses.add(boq.boq_sub_status));
//         return Array.from(subStatuses).sort().map(status => ({
//             label: status,
//             value: status
//         }));
//     }, [pendingBoqs]);

//     const pendingSalespersonOptions = useMemo(() => {
//         if (!pendingBoqs || usersLoading) return [];
//         const salespersons = new Map<string, string>();
//         pendingBoqs.forEach(boq => {
//             if (boq.assigned_sales) {
//                 const fullName = getUserFullNameByEmail(boq.assigned_sales);
//                 if (fullName) {
//                     salespersons.set(boq.assigned_sales, fullName);
//                 }
//             }
//         });
//         return Array.from(salespersons.entries()).map(([email, name]) => ({ id: email, label: name, value: email }));
//     }, [pendingBoqs, usersLoading, getUserFullNameByEmail]);


//     const pendingProjectNamesOptions = useMemo(() => {
//         if (!pendingBoqs) return [];
//         const projectNames = new Set<string>();
//         pendingBoqs.forEach(boq => boq.boq_name && projectNames.add(boq.boq_name));
//         return Array.from(projectNames).sort().map(name => ({ label: name, value: name }));
//     }, [pendingBoqs]);


//     // 2. Define the columns array for Pending BOQs
//     const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
//         {
//             accessorKey: "boq_name",
//             meta: { title: "Project Name", filterVariant: 'select', enableSorting: true }, //filterOptions: pendingProjectNamesOptions },
//             cell: ({ row }) => (
//                 <Link to={`/boqs/boq?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
//                     {row.original.boq_name}
//                 </Link>
//             ),
//             // filterFn: 'faceted',
//             enableSorting: true,
//         },
//         {
//             accessorKey: "company",
//             meta: { title: "Company Name", filterVariant: 'select', filterOptions: pendingcompanyOptions, enableSorting: true },
//             cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
//             enableSorting: true,
//             filterFn: 'faceted',
//         },
//         {
//             accessorKey: "boq_status",
//             meta: { title: "Current Status", filterVariant: 'select', enableSorting: true, filterOptions: pendingStatusOptions },
//             cell: ({ row }) => (
//                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
//                     {row.original.boq_status}
//                 </span>
//             ),
//             filterFn: 'faceted',
//             enableSorting: true,
//         },
//         {
//             accessorKey: "boq_sub_status",
//             meta: { title: "Sub-Status", filterVariant: 'select', enableSorting: true, filterOptions: pendingSubStatusOptions },
//             cell: ({ row }) => (
//                 row.original.boq_sub_status ? (
//                     <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
//                         {row.original.boq_sub_status}
//                     </span>
//                 ) : '--'
//             ),
//             filterFn: 'faceted',
//             enableSorting: true,
//         },
//         {
//             accessorKey: "assigned_sales",
//             meta: { title: "Salesperson", filterVariant: 'select', filterOptions: pendingSalespersonOptions, enableSorting: true },
//             cell: ({ row }) => <span className="px-2 text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
//             enableSorting: true,
//             filterFn: 'faceted',
//         },
//         {
//             accessorKey: "boq_submission_date",
//             meta: { title: "Submission Deadline", filterVariant: 'date', enableSorting: true },
//             cell: ({ row }) => (
//                 <span className="text-sm px-2  text-muted-foreground">
//                     {row.original.boq_submission_date ? formatDateWithOrdinal(new Date(row.original.boq_submission_date), 'dd-MMM-yyyy') : '--'}
//                 </span>
//             ),
//             enableSorting: true,
//             filterFn: 'dateRange',
//         },

//         {
//             id: 'actions',
//             meta: { title: "Action", enableSorting: false },
//             // Actions column for the button
//             cell: ({ row }) => (
//                 <div className="flex flex-col items-start gap-2 md:text-center">
//                     <Button onClick={() => openEditBoqDialog({ boqData: row.original, mode: 'status' })} variant="destructive" size="sm" className="mt-2 md:mt-0">
//                         Update BOQ Status
//                     </Button>
//                 </div>
//             ),
//             enableSorting: false,
//             enableColumnFilter: false,
//         },
//     ], [pendingBoqs, pendingStatusOptions, pendingcompanyOptions, pendingSalespersonOptions, pendingSubStatusOptions, pendingProjectNamesOptions, getBoqStatusClass, openEditBoqDialog]);


//     if (error) return <div className="text-red-500">Error loading pending BOQs.</div>;

//     // 3. Initialize the reusable data table logic hook
//     const tableLogic = useDataTableLogic<BOQ>({
//         data: pendingBoqs || [],
//         columns: columns,
//         initialSorting: [{ id: 'boq_submission_date', desc: true }],
//     });

//     // 4. Define a custom mobile row renderer for Pending BOQs
//     const renderPendingBoqMobileRow = (row: Row<BOQ>) => (
//         <div className="flex justify-between items-start p-3 border rounded-lg">
//             <div className="flex flex-col text-left">
//                 <Link to={`/boqs/boq?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
//                     {row.original.boq_name}
//                 </Link>
//                 <p className="text-xs text-muted-foreground">Created By: {row.original.owner}</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                     Submission Date: {row.original.boq_submission_date ? formatDateWithOrdinal(new Date(row.original.boq_submission_date), 'dd-MMM-yyyy') : '--'}
//                 </p>
//             </div>
//             <div className="flex flex-col items-end gap-1.5">
//                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
//                     {row.original.boq_status}
//                 </span>
//                 {row.original.boq_sub_status && (
//                     <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
//                         {row.original.boq_sub_status}
//                     </span>
//                 )}
//                 {/* The "Update BOQ Status" button should only be in desktop view as per previous designs,
//                     but if it needs to be on mobile, add it here directly */}
//             </div>
//         </div>
//     );

//     // 5. Define export fields for Pending BOQs (if you want an export button for this table too)
//     const pendingBoqExportFields = useMemo<DataTableColumnDef<BOQ>[]>(() => ([
//         { accessorKey: "name", meta: { exportHeaderName: "BOQ ID" } },
//         { accessorKey: "boq_name", meta: { exportHeaderName: "BOQ Name" } },
//         { accessorKey: "company", meta: { exportHeaderName: "Company" } },
//         { accessorKey: "contact", meta: { exportHeaderName: "Contact Person", exportValue: (row) => row.contact ? (getUserFullNameByEmail(row.contact) || row.contact) : '' } },
//         { accessorKey: "boq_size", meta: { exportHeaderName: "BOQ Size" } },
//         { accessorKey: "boq_type", meta: { exportHeaderName: "BOQ Type" } },
//         { accessorKey: "boq_value", meta: { exportHeaderName: "BOQ Value", isCurrency: true } },
//         { accessorKey: "boq_submission_date", meta: { exportHeaderName: "Submission Date" } },
//         { accessorKey: "boq_link", meta: { exportHeaderName: "BOQ Link" } },
//         { accessorKey: "city", meta: { exportHeaderName: "City" } },
//         { accessorKey: "remarks", meta: { exportHeaderName: "Remarks" } },
//         { accessorKey: "boq_status", meta: { exportHeaderName: "Status" } },
//         { accessorKey: "boq_sub_status", meta: { exportHeaderName: "Sub-Status" } },
//         { accessorKey: "assigned_sales", meta: { exportHeaderName: "Assigned Salesperson", exportValue: (row) => getUserFullNameByEmail(row.assigned_sales) || '' } },
//         { accessorKey: "assigned_estimations", meta: { exportHeaderName: "Assigned Estimations", exportValue: (row) => row.assigned_estimations ? (getUserFullNameByEmail(row.assigned_estimations) || row.assigned_estimations) : '' } },
//         { accessorKey: "owner", meta: { exportHeaderName: "Created By" } },
//         { accessorKey: "modified", meta: { exportHeaderName: "Last Modified" } },
//     ]), [getUserFullNameByEmail]);


//     return (
//         <DataTable
//             tableLogic={tableLogic}
//             isLoading={isPendingBoqsLoading || usersLoading}
//             onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
//             renderMobileRow={renderPendingBoqMobileRow}
//             globalSearchPlaceholder="Search pending BOQs..."
//             gridColsClass="md:grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr]" // Adjust grid columns for Pending BOQs table
//             noResultsMessage="No pending BOQs found."
//             headerTitle="Pending BOQs"
//         // Optional: Add an export button for Pending BOQs if needed
//         // renderToolbarActions={(filteredData) => (
//         //     <DataTableExportButton
//         //         data={filteredData}
//         //         columns={pendingBoqExportFields}
//         //         fileName="Pending_BOQs_Export"
//         //         label="Export Pending BOQs"
//         //     />
//         // )}
//         />
//     );
// };

// // Component for the "All BOQs" section
// const AllBOQs = () => {
//     const navigate = useNavigate();
//     const getBoqStatusClass = useStatusStyles("boq");
//     const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

//     const { data: allBoqs, isLoading: isBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
//         fields: ["*"], // Ensure all fields for export are fetched
//         limit: 0,
//         orderBy: { field: 'modified', order: 'desc' },
//     }, "all-boqs-estimate-all");

//     const statusOptions = useMemo(() => {
//         return ['New', 'Revision Pending', 'In-Progress', 'Revision Submitted', 'Negotiation', 'Won', 'Lost', 'Hold'].map(status => ({
//             label: status,
//             value: status
//         }));
//     }, []);

//     const subStatusOptions = useMemo(() => {
//         if (!allBoqs) return [];
//         const subStatuses = new Set<string>();
//         allBoqs.forEach(boq => boq.boq_sub_status && subStatuses.add(boq.boq_sub_status));
//         return Array.from(subStatuses).sort().map(status => ({
//             label: status,
//             value: status
//         }));
//     }, [allBoqs]);

//     const companyOptions = useMemo(() => {
//         if (!allBoqs) return [];
//         const companies = new Map<string, string>();
//         allBoqs.forEach(boq => {
//             if (boq.company) companies.set(boq.company, boq.company);
//         });
//         return Array.from(companies.entries()).map(([id, name]) => ({ id, label: name, value: id }));
//     }, [allBoqs]);

//     // Added filter options for boq_name
//     const projectNamesOptions = useMemo(() => {
//         if (!allBoqs) return [];
//         const projectNames = new Set<string>();
//         allBoqs.forEach(boq => boq.boq_name && projectNames.add(boq.boq_name));
//         return Array.from(projectNames).sort().map(name => ({ label: name, value: name }));
//     }, [allBoqs]);


//     const salespersonOptions = useMemo(() => {
//         if (!allBoqs || usersLoading) return [];
//         const salespersons = new Map<string, string>();
//         allBoqs.forEach(boq => {
//             if (boq.assigned_sales) {
//                 const fullName = getUserFullNameByEmail(boq.assigned_sales);
//                 if (fullName) {
//                     salespersons.set(boq.assigned_sales, fullName);
//                 }
//             }
//         });
//         return Array.from(salespersons.entries()).map(([email, name]) => ({ id: email, label: name, value: email }));
//     }, [allBoqs, usersLoading, getUserFullNameByEmail]);

//     const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
//         {
//             accessorKey: "boq_name",
//             meta: { title: "Project Name", filterVariant: 'select', enableSorting: true },// filterOptions: projectNamesOptions }, // Now uses projectNamesOptions
//             cell: ({ row }) => (
//                 <span className="text-primary font-semibold hover:underline text-left">
//                     {row.original.boq_name}
//                 </span>
//             ),
//             // filterFn: 'faceted',
//             enableSorting: true,
//         },
//         {
//             accessorKey: "company",
//             meta: { title: "Company Name", filterVariant: 'select', filterOptions: companyOptions, enableSorting: true },
//             cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
//             enableSorting: true,
//             filterFn: 'faceted',
//         },
//         {
//             accessorKey: "boq_status",
//             meta: { title: "Status", filterVariant: 'select', filterOptions: statusOptions, enableSorting: true },
//             cell: ({ row }) => (
//                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
//                     {row.original.boq_status}
//                 </span>
//             ),
//             enableSorting: true,
//             filterFn: 'faceted',
//         },
//         {
//             accessorKey: "boq_sub_status",
//             meta: { title: "Sub-Status", filterVariant: 'select', filterOptions: subStatusOptions, enableSorting: true },
//             cell: ({ row }) => (
//                 row.original.boq_sub_status ? (
//                     <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
//                         {row.original.boq_sub_status}
//                     </span>
//                 ) : '--'
//             ),
//             enableSorting: true,
//             filterFn: 'faceted',
//         },
//         {
//             accessorKey: "modified",
//             meta: { title: "Last Updated", filterVariant: 'date', enableSorting: true },
//             cell: ({ row }) => (
//                 <span className="text-sm text-muted-foreground">
//                     {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MMM-yyyy')}
//                 </span>
//             ),
//             enableSorting: true,
//             filterFn: 'dateRange',
//         },
//         {
//             accessorKey: "assigned_sales",
//             meta: { title: "Salesperson", filterVariant: 'select', filterOptions: salespersonOptions, enableSorting: true },
//             cell: ({ row }) => <span className="text-center text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
//             enableSorting: true,
//             filterFn: 'faceted',
//         },
//         // {
//         //     id: 'actions', // Re-added actions column for consistency with previous discussion and mobile view
//         //     meta: { title: "ac", enableSorting: false, filterVariant: undefined, excludeFromExport: true }, // Exclude actions from export
//         //     cell: () => (
//         //         <div className="flex justify-end pt-2 md:pt-0">
//         //             <ChevronRight className="h-5 w-5 text-muted-foreground" />
//         //         </div>
//         //     ),
//         //     enableSorting: false,
//         //     enableColumnFilter: false,
//         // },
//     ], [allBoqs, companyOptions, projectNamesOptions, statusOptions, subStatusOptions, salespersonOptions, getBoqStatusClass, getUserFullNameByEmail]);


//     if (error) return <div className="text-red-500">Error loading BOQs.</div>;

//     const tableLogic = useDataTableLogic<BOQ>({
//         data: allBoqs || [],
//         columns: columns,
//         initialSorting: [{ id: 'modified', desc: true }],
//     });

//     const renderBoqMobileRow = (row: Row<BOQ>) => (
//         <div className="flex justify-between items-start p-3 border rounded-lg">
//             <div className="flex flex-col text-left">
//                 <p className="text-primary font-semibold hover:underline text-left">
//                     {row.original.boq_name}
//                 </p>
//                 <p className="text-sm text-muted-foreground">{row.original.company || '--'}</p>
//                 <p className="text-xs text-muted-foreground">Created By: {row.original.owner} </p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                     Sales: {getUserFullNameByEmail(row.original.assigned_sales) || "--"}
//                 </p>
//             </div>
//             <div className="flex flex-col items-end gap-1.5">
//                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
//                     {row.original.boq_status}
//                 </span>
//                 {row.original.boq_sub_status && (
//                     <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(row.original.boq_sub_status)}`}>
//                         {row.original.boq_sub_status}
//                     </span>
//                 )}
//                 <p className="text-xs text-muted-foreground">
//                     {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MM-yyyy')}
//                 </p>
//                 <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
//             </div>
//         </div>
//     );

//     const boqExportFields = useMemo<DataTableColumnDef<BOQ>[]>(() => ([
//         // Using accessorKey to match the data properties, and meta.exportHeaderName for the CSV header
//         { accessorKey: "name", meta: { exportHeaderName: "BOQ ID" } },
//         { accessorKey: "boq_name", meta: { exportHeaderName: "BOQ Name" } },
//         { accessorKey: "company", meta: { exportHeaderName: "Company" } },
//         { accessorKey: "contact", meta: { exportHeaderName: "Contact" } },
//         { accessorKey: "boq_size", meta: { exportHeaderName: "BOQ Size" } },
//         { accessorKey: "boq_type", meta: { exportHeaderName: "BOQ Type" } },
//         // Example: Apply currency formatting for 'boq_value' on export
//         { accessorKey: "boq_value", meta: { exportHeaderName: "BOQ Value", isCurrency: true } },
//         { accessorKey: "boq_submission_date", meta: { exportHeaderName: "Submission Date" } },
//         { accessorKey: "boq_link", meta: { exportHeaderName: "BOQ Link" } },
//         { accessorKey: "city", meta: { exportHeaderName: "City" } },
//         { accessorKey: "remarks", meta: { exportHeaderName: "Remarks" } },
//         { accessorKey: "boq_status", meta: { exportHeaderName: "Status" } },
//         { accessorKey: "boq_sub_status", meta: { exportHeaderName: "Sub-Status" } },
//         {
//             accessorKey: "assigned_sales",
//             meta: {
//                 exportHeaderName: "Assigned Salesperson",
//                 exportValue: (row) => getUserFullNameByEmail(row.assigned_sales) || ''
//             }
//         },
//         // --- Custom export for 'assigned_estimations' field (assuming it also needs lookup) ---
//         {
//             accessorKey: "assigned_estimations",
//             meta: {
//                 exportHeaderName: "Assigned Estimations",
//                 // Assuming getUserFullNameByEmail can also resolve this if it's an email
//                 exportValue: (row) => row.assigned_estimations ? getUserFullNameByEmail(row.assigned_estimations) || row.assigned_estimations : ''
//             }
//         },
//         { accessorKey: "owner", meta: { exportHeaderName: "Created By" } },
//         { accessorKey: "modified", meta: { exportHeaderName: "Last Modified" } },
//         // Add more fields if needed, ensuring they match your BOQ interface
//     ]), [getUserFullNameByEmail]);


//     return (
//         <DataTable
//             tableLogic={tableLogic}
//             isLoading={isBoqsLoading || usersLoading}
//             onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
//             renderMobileRow={renderBoqMobileRow}
//             globalSearchPlaceholder="Search project name, company, salesperson..."
//             gridColsClass="md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto]" // Retain 'auto' for the actions column
//             noResultsMessage="No BOQs found matching your criteria."
//             headerTitle="All BOQs"
//             // NEW PROP: Render the Export Button in the toolbar actions slot
//             renderToolbarActions={(filteredData) => (
//                 <DataTableExportButton
//                     data={filteredData}
//                     columns={boqExportFields} // Pass the specific export columns definition
//                     fileName="All_BOQs_Export"
//                     label="Export BOQs"
//                 />
//             )}
//         />
//     );
// };

// // Main component that assembles the page
// export const EstimationsHomePage = () => {
//     const fullName = localStorage.getItem('fullName');

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-wrap gap-4 justify-between items-center">
//                 <h1 className="text-2xl font-bold">Welcome, {fullName}!</h1>
//                 <Button className="h-9 px-4 py-2" onClick={() => {/* navigate to create BOQ */ }}>
//                     <Plus className="mr-2 h-4 w-4" /> Create New BOQ
//                 </Button>
//             </div>
//             <PendingBOQs />
//             <AllBOQs />
//         </div>
//     );
// };