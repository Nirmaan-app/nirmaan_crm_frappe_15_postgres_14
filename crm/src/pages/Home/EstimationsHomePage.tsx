// // // src/pages/Home/EstimationHomePage.tsx
// // import { useFrappeGetDocList } from "frappe-react-sdk";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Skeleton } from "@/components/ui/skeleton";
// // import { format } from 'date-fns';
// // import { useNavigate,Link } from "react-router-dom";
// // import { useStatusStyles } from "@/hooks/useStatusStyles";
// // import React, { useState, useMemo } from 'react';
// // import { Plus, Search, ChevronRight } from "lucide-react";
// // import { useDialogStore } from '@/store/dialogStore';
// // import {useUserRoleLists} from "@/hooks/useUserRoleLists"
// // import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";

// // src/pages/Home/EstimationHomePage.tsx
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { Button } from "@/components/ui/button";
// // Input component is no longer needed in AllBOQs as global search moves into DataTable
// import { Skeleton } from "@/components/ui/skeleton";
// // format from date-fns is no longer needed here, formatDateWithOrdinal from utils/FormatDate is used
// import { useNavigate,Link } from "react-router-dom";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import React, { useMemo } from 'react'; // useState and useEffect are now managed by useDataTableLogic
// import { Plus, ChevronRight } from "lucide-react"; // Search and ArrowUpDown are now managed by DataTable
// import { useDialogStore } from '@/store/dialogStore';
// import {useUserRoleLists} from "@/hooks/useUserRoleLists"
// import { formatDateWithOrdinal } from "@/utils/FormatDate"; // Using specific format function

// // TanStack Table Imports (needed for Row type)
// import { Row } from '@tanstack/react-table';

// // --- NEW IMPORTS from GlobalComponents/table and hooks ---
// import { DataTable } from '@/components/table/table/data-table';
// import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
// import { DataTableColumnDef } from '@/components/table/utils/table-filters'; 

// // Interface for the BOQ data
// interface BOQ {
//     name: string;
//     boq_name: string;
//     boq_status: string;
//     boq_sub_status?: string;
//     boq_submission_date: string;
//     owner: string;
//     company: string;
//     "company.company_name": string;
//     salesperson?: string;
//     assigned_sales?: string; // Added assigned_sales to interface
//     modified: string;
// }

// // Component for the "Pending BOQs" section
// const PendingBOQs = () => {
//     const navigate = useNavigate();
//     const { openEditBoqDialog } = useDialogStore();
//     const getBoqStatusClass = useStatusStyles("boq");

//     const { data, isLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
//         fields: ["*"],
//         filters: [["boq_status", "in", ["New", "Revision Pending", "In-Progress"]]],
//         limit: 0,
//         orderBy: { field: 'modified', order: 'desc' }
//     }, "all-boqs-estimate-pending");

//     if (error) return <div className="text-red-500">Error loading pending BOQs.</div>;

//     return (
//         <div className="bg-background p-4 rounded-xl border">
//             <h2 className="font-semibold text-lg mb-4">Pending BOQs - {isLoading ? '...' : data?.length ?? 0}</h2>
//             {/* Desktop Headers (Table Format) */}
//             <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 font-medium text-sm text-muted-foreground px-2 py-2 border-b">
//                 <span>Project Name</span>
//                 <span>Current Status</span>
//                 <span>Sub-Status</span>
//                 <span>Submission Date</span>
//                 <span className="text-center">Action</span>
//             </div>
//             {/* REMOVED: hidden md:block from this div */}
//             <div className="max-h-[300px] overflow-y-auto pr-2"> 
//                 <div className="space-y-4 md:space-y-0 pb-2">
//                     {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
//                     {!isLoading && data?.map(boq => (
//                         // Mobile: Card with border | Desktop: Row with bottom border
//                         <div key={boq.name} className="flex justify-between items-start p-3 border rounded-lg md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr] md:items-center md:p-0 md:py-3 md:px-2 md:border-none md:border-b md:rounded-none">
//                             <div className="flex flex-col">
//                                 <Link to={`/boqs/boq?id=${boq.name}`} className="text-primary font-semibold hover:underline text-left">{boq.boq_name}</Link>
//                                 <p className="text-xs text-muted-foreground">Created By: {boq.owner}</p>
//                                 <p className="text-xs text-muted-foreground md:hidden mt-1">
//                                     {boq.boq_submission_date ? formatDateWithOrdinal(new Date(boq.boq_submission_date), 'dd-MMM-yyyy') : '--'}
//                                 </p>
//                             </div>
//                             {/* Desktop-only status for this cell */}
//                             <div className="hidden md:block">
//                                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
//                             </div>
//                             {/* Desktop-only sub-status for this cell */}
//                             <div className="hidden md:block">
//                             {boq.boq_sub_status ? (<span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(boq.boq_sub_status)}`}>{boq.boq_sub_status}</span>) : '--'}
//                             </div>
//                             {/* Desktop-only submission date for this cell */}
//                             <span className="hidden md:block text-sm">
//                                 {boq.boq_submission_date ? formatDateWithOrdinal(new Date(boq.boq_submission_date), 'dd-MMM-yyyy') : '--'}
//                             </span>
//                             <div className="flex flex-col items-end gap-2 md:text-center">
//                                 {/* Mobile-only status for this cell */}
//                                 <div className="flex flex-col items-end gap-2 md:hidden">
//                                     <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
//                                 </div>
//                                 <Button onClick={() => openEditBoqDialog({ boqData: boq, mode: 'status' })} variant="destructive" size="sm" className="mt-2 md:mt-0">
//                                     Update BOQ Status
//                                 </Button>
//                             </div>
//                         </div>
//                     ))}
//                     {!isLoading && data?.length === 0 && <p className="text-center text-muted-foreground py-4">No pending BOQs found.</p>}
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Component for the "All BOQs" section
// // const AllBOQs = () => {
// //     const navigate = useNavigate();
// //     const getBoqStatusClass = useStatusStyles("boq");
// //   const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

// //     const [searchTerm, setSearchTerm] = useState('');
// //     const [companyFilter, setCompanyFilter] = useState('all');
// //     const [statusFilter, setStatusFilter] = useState('all');

// //     const { data: allBoqs, isLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
// //         fields: ["*"],
// //         limit: 0,
// //          orderBy: { field: 'modified', order: 'desc' },
// //     }, "all-boqs-estimate-all");

// //     const statusOptions = ['New', 'Revision Pending', 'In-Progress', 'Revision Submitted', 'Negotiation', 'Won', 'Lost', 'Hold'];

// //     const uniqueCompanies = useMemo(() => {
// //         if (!allBoqs) return [];
// //         const companies = new Map<string, string>();
// //         allBoqs.forEach(boq => {
// //             if (boq.company ) companies.set(boq.company, boq.company);
// //         });
// //         return Array.from(companies.entries()).map(([id, name]) => ({ id, name }));
// //     }, [allBoqs]);

// //     const filteredBoqs = useMemo(() => {
// //         if (!allBoqs) return [];
// //         const sortedBoqs = [...allBoqs].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
// //         return sortedBoqs.filter(boq => {
// //             const companyMatch = companyFilter === 'all' || boq.company === companyFilter;
// //             const statusMatch = statusFilter === 'all' || boq.boq_status === statusFilter;
// //             const searchMatch = searchTerm.toLowerCase() === '' ||
// //                 boq.boq_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                 (boq.company && boq.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
// //                 boq.owner.toLowerCase().includes(searchTerm.toLowerCase());
// //             return companyMatch && searchMatch && statusMatch;
// //         });
// //     }, [allBoqs, searchTerm, companyFilter, statusFilter]);
    
// //     if (error) return <div className="text-red-500">Error loading BOQs.</div>;

// //     return (
// //         <div className="bg-background p-4 rounded-xl border">
// //              <h2 className="font-semibold text-lg mb-4">All BOQs - {isLoading ? '...' : filteredBoqs.length}</h2>
// //              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
// //                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-[180px] border border-input bg-background h-10 rounded-md px-3 text-sm">
// //                     <option value="all">All Statuses</option>
// //                     {statusOptions.map(status => (<option key={status} value={status}>{status}</option>))}
// //                 </select>
// //                 <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="w-full md:w-[200px] border border-input bg-background h-10 rounded-md px-3 text-sm">
// //                     <option value="all">All Companies</option>
// //                     {uniqueCompanies.map(company => (<option key={company.id} value={company.id}>{company.name}</option>))}
// //                 </select>
// //                 <div className="relative w-full md:max-w-xs">
// //                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
// //                     <Input placeholder="Search name, company..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
// //                 </div>
// //              </div>
// //             <div>
// //                 {/* REFINED DESKTOP TABLE HEADER */}
// //                 <div className="hidden md:grid md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto] gap-4 font-medium text-sm text-muted-foreground px-2 py-2 border-b">
// //                     <span>Project Name</span>
// //                     <span>Company Name</span>
// //                     <span>Status</span>
// //                     <span>Sub-Status</span>
// //                     <span>Last Updated</span>
// //                     <span>Salesperson</span>
// //                     <span></span>
// //                 </div>
// //                 {/* REMOVED: hidden md:block from this div */}
// //                 <div className="max-h-[300px] overflow-y-auto pr-2"> 
// //                     <div className="space-y-4 md:space-y-0 pb-2">
// //                         {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
// //                         {!isLoading && filteredBoqs.map(boq => (
// //                             <div key={boq.name} onClick={() => navigate(`/boqs/boq?id=${boq.name}`)} className="flex justify-between items-start p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors md:grid md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto] md:items-center md:p-0 md:py-3 md:px-2 md:border-none md:border-b md:rounded-none">
// //                                 <div className="flex flex-col text-left">
// //                                     <p className="font-semibold text-primary">{boq.boq_name}</p>
// //                                     <p className="text-sm text-muted-foreground md:hidden">{boq.company || '--'}</p>
// //                                     <p className="text-xs text-muted-foreground md:hidden">By: {boq.owner} </p>
// //                                 </div>
// //                                 <span className="hidden md:block text-left">{boq.company || '--'}</span>
// //                                 <div className="hidden md:block text-left">
// //                                     <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
// //                                 </div>
// //                                 <div className="hidden md:block text-left">
// //                                     {boq.boq_sub_status ? <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(boq.boq_sub_status)}`}>{boq.boq_sub_status}</span> : '--'}
// //                                 </div>
// //                             <span className="hidden md:block text-left text-sm text-muted-foreground">{formatDateWithOrdinal(new Date(boq.modified), 'dd-MMM-yyyy')}</span>
// //                                 <span className="hidden md:block text-center text-sm">{getUserFullNameByEmail(boq.assigned_sales)||"--"}</span>
// //                                 <div className="flex flex-col items-end gap-2">
// //                                     <div className="flex flex-col items-end gap-1.5 md:hidden">
// //                                         <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
// //                                         <p className="text-xs text-muted-foreground md:hidden"> {formatDateWithOrdinal(new Date(boq.modified), 'dd-MM-yyyy')}</p>
// //                                     </div>
// //                                     <div className="flex justify-end pt-2 md:pt-0">
// //                                     <ChevronRight className="h-5 w-5 text-muted-foreground" />
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                         {!isLoading && filteredBoqs.length === 0 && (
// //                             <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
// //                                 <p>No BOQs found matching your criteria.</p>
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // Component for the "All BOQs" section - REFACTORED
// const AllBOQs = () => {
//     const navigate = useNavigate();
//     const getBoqStatusClass = useStatusStyles("boq");
//     const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

//     // 1. Fetch BOQ data
//     const { data: allBoqs, isLoading: isBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
//         fields: ["*"], // Fetch all fields for flexibility
//         limit: 0,
//         orderBy: { field: 'modified', order: 'desc' },
//     }, "all-boqs-estimate-all");

//     // 2. Prepare filter options (these are specific to your BOQ data)
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

//     const salespersonOptions = useMemo(() => {
//         if (!allBoqs || usersLoading) return [];
//         const salespersons = new Map<string, string>(); // email -> full name
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

//     // 3. Define the columns array using DataTableColumnDef
//     // This is where you declare the type of filter and sortability for each column.
//     const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
//         {
//             accessorKey: "boq_name",
//             meta: { title: "Project Name", enableSorting: true }, // Simple sortable column, title for display
//             cell: ({ row }) => (
//                 // The actual Link/navigation is handled by DataTable's onRowClick.
//                 // This is just for visual styling of the text within the cell.
//                 <span className="text-primary font-semibold hover:underline text-left">
//                     {row.original.boq_name}
//                 </span>
//             ),
//             enableSorting: true, // TanStack Table's internal sorting flag
//             enableColumnFilter: false, // No specific column filter, global search can cover this
//         },
//         {
//             accessorKey: "company",
//             meta: { title: "Company Name", filterVariant: 'select', filterOptions: companyOptions, enableSorting: true },
//             cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
//             enableSorting: true,
//             filterFn: 'faceted', // Tells TanStack Table to use the 'facetedFilterFn' registered in useDataTableLogic
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
//             meta: { title: "Last Updated", filterVariant: 'date', enableSorting: true }, // Declare this as a date filter
//             cell: ({ row }) => (
//                 <span className="text-sm text-muted-foreground">
//                     {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MMM-yyyy')}
//                 </span>
//             ),
//             enableSorting: true,
//             filterFn: 'dateRange', // Use the 'dateRangeFilterFn' registered in useDataTableLogic
//         },
//         {
//             accessorKey: "assigned_sales",
//             meta: { title: "Salesperson", filterVariant: 'select', filterOptions: salespersonOptions, enableSorting: true },
//             cell: ({ row }) => <span className="text-center text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
//             enableSorting: true,
//             filterFn: 'faceted',
//         },
//         {
//             id: 'actions', // Unique ID for columns without an accessorKey
//             meta: { title: "", enableSorting: false }, // No title, not sortable
//             cell: () => (
//                 <div className="flex justify-end pt-2 md:pt-0">
//                     <ChevronRight className="h-5 w-5 text-muted-foreground" />
//                 </div>
//             ),
//             enableSorting: false,
//             enableColumnFilter: false,
//         },
//     ], [companyOptions, statusOptions, subStatusOptions, salespersonOptions, getBoqStatusClass, getUserFullNameByEmail]);


//     if (error) return <div className="text-red-500">Error loading BOQs.</div>;

//     // 4. Initialize the reusable data table logic hook
//     const tableLogic = useDataTableLogic<BOQ>({
//         data: allBoqs || [],
//         columns: columns,
//         initialSorting: [{ id: 'modified', desc: true }], // Default sort by modified date descending
//     });

//     // 5. Define a custom mobile row renderer for BOQs
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

//     // 6. Render the DataTable component
//     return (
//         <DataTable
//             tableLogic={tableLogic} // Pass the result of the hook
//             isLoading={isBoqsLoading || usersLoading} // Combine all relevant loading states
//             onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
//             renderMobileRow={renderBoqMobileRow}
//             globalSearchPlaceholder="Search project name, company, salesperson..."
//             gridColsClass="md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto]" // Defines the desktop layout
//             noResultsMessage="No BOQs found matching your criteria."
//             headerTitle="All BOQs" // Title for the DataTable component
//         />
//     );
// };


// // Main component that assembles the page
// export const EstimationsHomePage = () => {
//      const fullName = localStorage.getItem('fullName');
    
//     return (
//         <div className="space-y-6">
//             <div className="flex flex-wrap gap-4 justify-between items-center">
//                 <h1 className="text-2xl font-bold">Welcome, {fullName}!</h1>
//             </div>
//             <PendingBOQs />
//             <AllBOQs />
//         </div>
//     );
// };
// src/pages/Home/EstimationHomePage.tsx


import { useFrappeGetDocList } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, Link } from "react-router-dom";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import React, { useMemo } from 'react';
import { Plus, ChevronRight } from "lucide-react";
import { useDialogStore } from '@/store/dialogStore';
import {useUserRoleLists} from "@/hooks/useUserRoleLists"
import { formatDateWithOrdinal } from "@/utils/FormatDate";

// TanStack Table Imports (needed for Row type)
import { Row } from '@tanstack/react-table';

// Corrected imports for DataTable components and hook from your new structure
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { DataTableExportButton } from '@/components/table/data-table-export-button'; // NEW IMPORT


// Interface for the BOQ data - IMPORTANT: Add all fields that might be exported!
interface BOQ {
    name: string;
    boq_name: string;
    boq_status: string;
    boq_sub_status?: string;
    boq_submission_date: string;
    owner: string;
    company: string;
    "company.company_name": string; // Frappe dot notation field, often exported as 'Company Name'
    salesperson?: string;
    assigned_sales?: string;
    modified: string;
    // --- Additional fields for export as per your request ---
    contact?: string; // Assuming 'contact' field might exist
    boq_size?: number;
    boq_type?: string;
    boq_value?: number;
    boq_link?: string;
    city?: string;
    remarks?: string;
    assigned_estimations?: string; // Assuming 'assigned_estimations' field might exist
}

// Component for the "Pending BOQs" section - REFACTORED TO USE DataTable
const PendingBOQs = () => {
    const navigate = useNavigate();
    const { openEditBoqDialog } = useDialogStore();
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists(); // Needed for assigned_sales/owner if displayed

    // 1. Fetch pending BOQ data
    const { data: pendingBoqs, isLoading: isPendingBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
        fields: ["*"], // Fetch all necessary fields
        filters: [["boq_status", "in", ["New", "Revision Pending", "In-Progress"]]],
        limit: 0,
        orderBy: { field: 'modified', order: 'desc' }
    }, "all-boqs-estimate-pending");

    // Memoized filter options for faceted filters specific to Pending BOQs
    const pendingStatusOptions = useMemo(() => {
        return ['New', 'Revision Pending', 'In-Progress'].map(status => ({
            label: status,
            value: status
        }));
    }, []);

      const pendingcompanyOptions = useMemo(() => {
        if (!pendingBoqs) return [];
        const companies = new Map<string, string>();
        pendingBoqs.forEach(boq => {
            if (boq.company) companies.set(boq.company, boq.company);
        });
        return Array.from(companies.entries()).map(([id, name]) => ({ id, label: name, value: id }));
    }, [pendingBoqs]);

    const pendingSubStatusOptions = useMemo(() => {
        if (!pendingBoqs) return [];
        const subStatuses = new Set<string>();
        pendingBoqs.forEach(boq => boq.boq_sub_status && subStatuses.add(boq.boq_sub_status));
        return Array.from(subStatuses).sort().map(status => ({
            label: status,
            value: status
        }));
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


    const pendingProjectNamesOptions = useMemo(() => {
        if (!pendingBoqs) return [];
        const projectNames = new Set<string>();
        pendingBoqs.forEach(boq => boq.boq_name && projectNames.add(boq.boq_name));
        return Array.from(projectNames).sort().map(name => ({ label: name, value: name }));
    }, [pendingBoqs]);


    // 2. Define the columns array for Pending BOQs
    const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
        {
            accessorKey: "boq_name",
            meta: { title: "Project Name", filterVariant: 'select', enableSorting: true, filterOptions: pendingProjectNamesOptions },
            cell: ({ row }) => (
                <Link to={`/boqs/boq?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </Link>
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
         {
            accessorKey: "company",
            meta: { title: "Company Name", filterVariant: 'select', filterOptions: pendingcompanyOptions, enableSorting: true },
            cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
            enableSorting: true,
            filterFn: 'faceted',
        },
        {
            accessorKey: "boq_status",
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
            meta: { title: "Salesperson", filterVariant: 'select', filterOptions: pendingSalespersonOptions, enableSorting: true },
            cell: ({ row }) => <span className="px-2 text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
            enableSorting: true,
            filterFn: 'faceted',
        },
        {
            accessorKey: "boq_submission_date",
            meta: { title: "Submission Deadline", filterVariant: 'date', enableSorting: true },
            cell: ({ row }) => (
                <span className="text-sm px-2  text-muted-foreground">
                    {row.original.boq_submission_date ? formatDateWithOrdinal(new Date(row.original.boq_submission_date), 'dd-MMM-yyyy') : '--'}
                </span>
            ),
            enableSorting: true,
            filterFn: 'dateRange',
        },
         
        {
            id: 'actions',
            meta: { title: "Action", enableSorting: false }, 
            // Actions column for the button
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
    ], [pendingBoqs, pendingStatusOptions,pendingcompanyOptions,pendingSalespersonOptions, pendingSubStatusOptions, pendingProjectNamesOptions, getBoqStatusClass, openEditBoqDialog]);


    if (error) return <div className="text-red-500">Error loading pending BOQs.</div>;

    // 3. Initialize the reusable data table logic hook
    const tableLogic = useDataTableLogic<BOQ>({
        data: pendingBoqs || [],
        columns: columns,
        initialSorting: [{ id: 'boq_submission_date', desc: true }],
    });

    // 4. Define a custom mobile row renderer for Pending BOQs
    const renderPendingBoqMobileRow = (row: Row<BOQ>) => (
        <div className="flex justify-between items-start p-3 border rounded-lg">
            <div className="flex flex-col text-left">
                <Link to={`/boqs/boq?id=${row.original.name}`} className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </Link>
                <p className="text-xs text-muted-foreground">Created By: {row.original.owner}</p>
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
                {/* The "Update BOQ Status" button should only be in desktop view as per previous designs,
                    but if it needs to be on mobile, add it here directly */}
            </div>
        </div>
    );

    // 5. Define export fields for Pending BOQs (if you want an export button for this table too)
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
            onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
            renderMobileRow={renderPendingBoqMobileRow}
            globalSearchPlaceholder="Search pending BOQs..."
            gridColsClass="md:grid-cols-[1fr,1fr,1fr,1fr,1fr,1fr,1fr]" // Adjust grid columns for Pending BOQs table
            noResultsMessage="No pending BOQs found."
            headerTitle="Pending BOQs"
            // Optional: Add an export button for Pending BOQs if needed
            // renderToolbarActions={(filteredData) => (
            //     <DataTableExportButton
            //         data={filteredData}
            //         columns={pendingBoqExportFields}
            //         fileName="Pending_BOQs_Export"
            //         label="Export Pending BOQs"
            //     />
            // )}
        />
    );
};

// Component for the "All BOQs" section
const AllBOQs = () => {
    const navigate = useNavigate();
    const getBoqStatusClass = useStatusStyles("boq");
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

    const { data: allBoqs, isLoading: isBoqsLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
        fields: ["*"], // Ensure all fields for export are fetched
        limit: 0,
        orderBy: { field: 'modified', order: 'desc' },
    }, "all-boqs-estimate-all");

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

    // Added filter options for boq_name
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

    const columns = useMemo<DataTableColumnDef<BOQ>[]>(() => [
        {
            accessorKey: "boq_name",
            meta: { title: "Project Name", filterVariant: 'select', enableSorting: true, filterOptions: projectNamesOptions }, // Now uses projectNamesOptions
            cell: ({ row }) => (
                <span className="text-primary font-semibold hover:underline text-left">
                    {row.original.boq_name}
                </span>
            ),
            filterFn: 'faceted',
            enableSorting: true,
        },
        {
            accessorKey: "company",
            meta: { title: "Company Name", filterVariant: 'select', filterOptions: companyOptions, enableSorting: true },
            cell: ({ row }) => <span className="text-left">{row.original.company || '--'}</span>,
            enableSorting: true,
            filterFn: 'faceted',
        },
        {
            accessorKey: "boq_status",
            meta: { title: "Status", filterVariant: 'select', filterOptions: statusOptions, enableSorting: true },
            cell: ({ row }) => (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
                    {row.original.boq_status}
                </span>
            ),
            enableSorting: true,
            filterFn: 'faceted',
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
            enableSorting: true,
            filterFn: 'faceted',
        },
        {
            accessorKey: "modified",
            meta: { title: "Last Updated", filterVariant: 'date', enableSorting: true },
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {formatDateWithOrdinal(new Date(row.original.modified), 'dd-MMM-yyyy')}
                </span>
            ),
            enableSorting: true,
            filterFn: 'dateRange',
        },
        {
            accessorKey: "assigned_sales",
            meta: { title: "Salesperson", filterVariant: 'select', filterOptions: salespersonOptions, enableSorting: true },
            cell: ({ row }) => <span className="text-center text-sm">{getUserFullNameByEmail(row.original.assigned_sales) || "--"}</span>,
            enableSorting: true,
            filterFn: 'faceted',
        },
        // {
        //     id: 'actions', // Re-added actions column for consistency with previous discussion and mobile view
        //     meta: { title: "ac", enableSorting: false, filterVariant: undefined, excludeFromExport: true }, // Exclude actions from export
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

    const tableLogic = useDataTableLogic<BOQ>({
        data: allBoqs || [],
        columns: columns,
        initialSorting: [{ id: 'modified', desc: true }],
    });

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

   const boqExportFields = useMemo<DataTableColumnDef<BOQ>[]>(() => ([
        // Using accessorKey to match the data properties, and meta.exportHeaderName for the CSV header
        { accessorKey: "name", meta: { exportHeaderName: "BOQ ID" } },
        { accessorKey: "boq_name", meta: { exportHeaderName: "BOQ Name" } },
        { accessorKey: "company", meta: { exportHeaderName: "Company" } },
        { accessorKey: "contact", meta: { exportHeaderName: "Contact" } },
        { accessorKey: "boq_size", meta: { exportHeaderName: "BOQ Size" } },
        { accessorKey: "boq_type", meta: { exportHeaderName: "BOQ Type" } },
        // Example: Apply currency formatting for 'boq_value' on export
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
        // --- Custom export for 'assigned_estimations' field (assuming it also needs lookup) ---
        {
            accessorKey: "assigned_estimations",
            meta: {
                exportHeaderName: "Assigned Estimations",
                // Assuming getUserFullNameByEmail can also resolve this if it's an email
                exportValue: (row) => row.assigned_estimations ? getUserFullNameByEmail(row.assigned_estimations) || row.assigned_estimations : ''
            }
        },
        { accessorKey: "owner", meta: { exportHeaderName: "Created By" } },
        { accessorKey: "modified", meta: { exportHeaderName: "Last Modified" } },
        // Add more fields if needed, ensuring they match your BOQ interface
    ]), [getUserFullNameByEmail]);


    return (
        <DataTable
            tableLogic={tableLogic}
            isLoading={isBoqsLoading || usersLoading}
            onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
            renderMobileRow={renderBoqMobileRow}
            globalSearchPlaceholder="Search project name, company, salesperson..."
            gridColsClass="md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto]" // Retain 'auto' for the actions column
            noResultsMessage="No BOQs found matching your criteria."
            headerTitle="All BOQs"
            // NEW PROP: Render the Export Button in the toolbar actions slot
            renderToolbarActions={(filteredData) => (
                <DataTableExportButton
                    data={filteredData}
                    columns={boqExportFields} // Pass the specific export columns definition
                    fileName="All_BOQs_Export"
                    label="Export BOQs"
                />
            )}
        />
    );
};

// Main component that assembles the page
export const EstimationsHomePage = () => {
     const fullName = localStorage.getItem('fullName');

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <h1 className="text-2xl font-bold">Welcome, {fullName}!</h1>
                <Button className="h-9 px-4 py-2" onClick={() => {/* navigate to create BOQ */}}>
                    <Plus className="mr-2 h-4 w-4" /> Create New BOQ
                </Button>
            </div>
            <PendingBOQs />
            <AllBOQs />
        </div>
    );
};