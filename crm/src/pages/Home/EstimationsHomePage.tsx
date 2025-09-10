// src/pages/Home/EstimationHomePage.tsx
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useNavigate,Link } from "react-router-dom";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronRight } from "lucide-react";
import { useDialogStore } from '@/store/dialogStore';
import {useUserRoleLists} from "@/hooks/useUserRoleLists"
import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";

// Interface for the BOQ data
interface BOQ {
    name: string;
    boq_name: string;
    boq_status: string;
    boq_sub_status?: string;
    boq_submission_date: string;
    owner: string;
    company: string;
    "company.company_name": string;
    salesperson?: string;
    assigned_sales?: string; // Added assigned_sales to interface
    modified: string;
}

// Component for the "Pending BOQs" section
const PendingBOQs = () => {
    const navigate = useNavigate();
    const { openEditBoqDialog } = useDialogStore();
    const getBoqStatusClass = useStatusStyles("boq");

    const { data, isLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
        fields: ["*"],
        filters: [["boq_status", "in", ["New", "Revision Pending", "In-Progress"]]],
        limit: 0,
        orderBy: { field: 'modified', order: 'desc' }
    }, "all-boqs-estimate-pending");

    if (error) return <div className="text-red-500">Error loading pending BOQs.</div>;

    return (
        <div className="bg-background p-4 rounded-xl border">
            <h2 className="font-semibold text-lg mb-4">Pending BOQs - {isLoading ? '...' : data?.length ?? 0}</h2>
            {/* Desktop Headers (Table Format) */}
            <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr] gap-4 font-medium text-sm text-muted-foreground px-2 py-2 border-b">
                <span>Project Name</span>
                <span>Current Status</span>
                <span>Sub-Status</span>
                <span>Submission Date</span>
                <span className="text-center">Action</span>
            </div>
            {/* REMOVED: hidden md:block from this div */}
            <div className="max-h-[300px] overflow-y-auto pr-2"> 
                <div className="space-y-4 md:space-y-0 pb-2">
                    {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    {!isLoading && data?.map(boq => (
                        // Mobile: Card with border | Desktop: Row with bottom border
                        <div key={boq.name} className="flex justify-between items-start p-3 border rounded-lg md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr] md:items-center md:p-0 md:py-3 md:px-2 md:border-none md:border-b md:rounded-none">
                            <div className="flex flex-col">
                                <Link to={`/boqs/boq?id=${boq.name}`} className="text-primary font-semibold hover:underline text-left">{boq.boq_name}</Link>
                                <p className="text-xs text-muted-foreground">Created By: {boq.owner}</p>
                                <p className="text-xs text-muted-foreground md:hidden mt-1">
                                    {boq.boq_submission_date ? formatDateWithOrdinal(new Date(boq.boq_submission_date), 'dd-MMM-yyyy') : '--'}
                                </p>
                            </div>
                            {/* Desktop-only status for this cell */}
                            <div className="hidden md:block">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
                            </div>
                            {/* Desktop-only sub-status for this cell */}
                            <div className="hidden md:block">
                            {boq.boq_sub_status ? (<span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(boq.boq_sub_status)}`}>{boq.boq_sub_status}</span>) : '--'}
                            </div>
                            {/* Desktop-only submission date for this cell */}
                            <span className="hidden md:block text-sm">
                                {boq.boq_submission_date ? formatDateWithOrdinal(new Date(boq.boq_submission_date), 'dd-MMM-yyyy') : '--'}
                            </span>
                            <div className="flex flex-col items-end gap-2 md:text-center">
                                {/* Mobile-only status for this cell */}
                                <div className="flex flex-col items-end gap-2 md:hidden">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
                                </div>
                                <Button onClick={() => openEditBoqDialog({ boqData: boq, mode: 'status' })} variant="destructive" size="sm" className="mt-2 md:mt-0">
                                    Update BOQ Status
                                </Button>
                            </div>
                        </div>
                    ))}
                    {!isLoading && data?.length === 0 && <p className="text-center text-muted-foreground py-4">No pending BOQs found.</p>}
                </div>
            </div>
        </div>
    );
};

// Component for the "All BOQs" section
const AllBOQs = () => {
    const navigate = useNavigate();
    const getBoqStatusClass = useStatusStyles("boq");
  const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();

    const [searchTerm, setSearchTerm] = useState('');
    const [companyFilter, setCompanyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: allBoqs, isLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
        fields: ["*"],
        limit: 0
    }, "all-boqs-estimate-all");

    const statusOptions = ['New', 'Revision Pending', 'In-Progress', 'Revision Submitted', 'Negotiation', 'Won', 'Lost', 'Hold'];

    const uniqueCompanies = useMemo(() => {
        if (!allBoqs) return [];
        const companies = new Map<string, string>();
        allBoqs.forEach(boq => {
            if (boq.company ) companies.set(boq.company, boq.company);
        });
        return Array.from(companies.entries()).map(([id, name]) => ({ id, name }));
    }, [allBoqs]);

    const filteredBoqs = useMemo(() => {
        if (!allBoqs) return [];
        const sortedBoqs = [...allBoqs].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
        return sortedBoqs.filter(boq => {
            const companyMatch = companyFilter === 'all' || boq.company === companyFilter;
            const statusMatch = statusFilter === 'all' || boq.boq_status === statusFilter;
            const searchMatch = searchTerm.toLowerCase() === '' ||
                boq.boq_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (boq.company && boq.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                boq.owner.toLowerCase().includes(searchTerm.toLowerCase());
            return companyMatch && searchMatch && statusMatch;
        });
    }, [allBoqs, searchTerm, companyFilter, statusFilter]);
    
    if (error) return <div className="text-red-500">Error loading BOQs.</div>;

    return (
        <div className="bg-background p-4 rounded-xl border">
             <h2 className="font-semibold text-lg mb-4">All BOQs - {isLoading ? '...' : filteredBoqs.length}</h2>
             <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-[180px] border border-input bg-background h-10 rounded-md px-3 text-sm">
                    <option value="all">All Statuses</option>
                    {statusOptions.map(status => (<option key={status} value={status}>{status}</option>))}
                </select>
                <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="w-full md:w-[200px] border border-input bg-background h-10 rounded-md px-3 text-sm">
                    <option value="all">All Companies</option>
                    {uniqueCompanies.map(company => (<option key={company.id} value={company.id}>{company.name}</option>))}
                </select>
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search name, company..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
             </div>
            <div>
                {/* REFINED DESKTOP TABLE HEADER */}
                <div className="hidden md:grid md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto] gap-4 font-medium text-sm text-muted-foreground px-2 py-2 border-b">
                    <span>Project Name</span>
                    <span>Company Name</span>
                    <span>Status</span>
                    <span>Sub-Status</span>
                    <span>Last Updated</span>
                    <span>Salesperson</span>
                    <span></span>
                </div>
                {/* REMOVED: hidden md:block from this div */}
                <div className="max-h-[300px] overflow-y-auto pr-2"> 
                    <div className="space-y-4 md:space-y-0 pb-2">
                        {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        {!isLoading && filteredBoqs.map(boq => (
                            <div key={boq.name} onClick={() => navigate(`/boqs/boq?id=${boq.name}`)} className="flex justify-between items-start p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors md:grid md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto] md:items-center md:p-0 md:py-3 md:px-2 md:border-none md:border-b md:rounded-none">
                                <div className="flex flex-col text-left">
                                    <p className="font-semibold text-primary">{boq.boq_name}</p>
                                    <p className="text-sm text-muted-foreground md:hidden">{boq.company || '--'}</p>
                                    <p className="text-xs text-muted-foreground md:hidden">By: {boq.owner} </p>
                                </div>
                                <span className="hidden md:block text-left">{boq.company || '--'}</span>
                                <div className="hidden md:block text-left">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
                                </div>
                                <div className="hidden md:block text-left">
                                    {boq.boq_sub_status ? <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(boq.boq_sub_status)}`}>{boq.boq_sub_status}</span> : '--'}
                                </div>
                            <span className="hidden md:block text-left text-sm text-muted-foreground">{formatDateWithOrdinal(new Date(boq.modified), 'dd-MMM-yyyy')}</span>
                                <span className="hidden md:block text-center text-sm">{getUserFullNameByEmail(boq.assigned_sales)||"--"}</span>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex flex-col items-end gap-1.5 md:hidden">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
                                        <p className="text-xs text-muted-foreground md:hidden"> {formatDateWithOrdinal(new Date(boq.modified), 'dd-MM-yyyy')}</p>
                                    </div>
                                    <div className="flex justify-end pt-2 md:pt-0">
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!isLoading && filteredBoqs.length === 0 && (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                <p>No BOQs found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main component that assembles the page
export const EstimationsHomePage = () => {
     const fullName = localStorage.getItem('fullName');
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <h1 className="text-2xl font-bold">Welcome, {fullName}!</h1>
            </div>
            <PendingBOQs />
            <AllBOQs />
        </div>
    );
};

// // src/pages/Home/EstimationHomePage.tsx
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatDateWithOrdinal } from 'date-fns';
// import { useNavigate,Link } from "react-router-dom";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import React, { useState, useMemo } from 'react';
// import { Plus, Search, ChevronRight } from "lucide-react";
// import { useDialogStore } from '@/store/dialogStore';

// // Interface for the BOQ data - no changes needed
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
//     modified: string;
// }

// // Component for the "Pending BOQs" section
// const PendingBOQs = () => {
//     const navigate = useNavigate();
//     const { openEditBoqDialog } = useDialogStore();
//     const getBoqStatusClass = useStatusStyles("boq");

//     // CRITICAL FIX: Re-added a unique cache key to prevent conflicts with AllBOQs
//     const { data, isLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
//         fields: ["name", "boq_name", "boq_status", "boq_sub_status", "boq_submission_date", "owner", "modified"],
//         filters: [["boq_status", "in", ["New", "Revision Pending", "In-Progress"]]],
//         limit: 0,
//         orderBy: { field: 'modified', order: 'desc' }
//     }, "all-boqs-estimate-pending"); // <-- UNIQUE KEY

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
//             <div className="hidden md:block max-h-[300px] overflow-y-auto pr-2">

//      <div className="space-y-4 md:space-y-0">
//                 {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
//                 {!isLoading && data?.map(boq => (
//                     // Mobile: Card with border | Desktop: Row with bottom border
//                     <div key={boq.name} className="flex justify-between items-start p-3 border rounded-lg md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr] md:items-center md:p-0 md:py-3 md:px-2 md:border-none md:border-b md:rounded-none">

//                         <div className="flex flex-col">
//                             <Link to={`/boqs/boq?id=${boq.name}`} className="text-primary font-semibold hover:underline text-left">{boq.boq_name}</Link>
//                             <p className="text-xs text-muted-foreground">Created By: {boq.owner}</p>
//                             <p className="text-xs text-muted-foreground md:hidden mt-1">
//                                 {boq.boq_submission_date ? format(new Date(boq.boq_submission_date), 'dd-MMM-yyyy') : '--'}
//                             </p>
//                         </div>
//                         <div className="hidden md:block">
//                             <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
//                         </div>
//                         <div className="hidden md:block">
//                            {boq.boq_sub_status ? (<span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(boq.boq_sub_status)}`}>{boq.boq_sub_status}</span>) : '--'}
//                         </div>
//                         <span className="hidden md:block text-sm">
//                             {boq.boq_submission_date ? format(new Date(boq.boq_submission_date), 'dd-MMM-yyyy') : '--'}
//                         </span>
//                         <div className="flex flex-col items-end gap-2 md:text-center">
//                             <div className="flex flex-col items-end gap-2 md:hidden">
//                                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
//                             </div>
//                              <Button onClick={() => openEditBoqDialog({ boqData: boq, mode: 'status' })} variant="destructive" size="sm" className="mt-2 md:mt-0">
//                                 Update BOQ Status
//                              </Button>
//                         </div>
//                     </div>
//                 ))}
//                 {!isLoading && data?.length === 0 && <p className="text-center text-muted-foreground py-4">No pending BOQs found.</p>}
//             </div>
//             </div>
       
//         </div>
//     );
// };

// // Component for the "All BOQs" section
// const AllBOQs = () => {
//     const navigate = useNavigate();
//     const getBoqStatusClass = useStatusStyles("boq");

//     // 1. ADD STATE for the new status filter
//     const [searchTerm, setSearchTerm] = useState('');
//     const [companyFilter, setCompanyFilter] = useState('all');
//     const [statusFilter, setStatusFilter] = useState('all'); // <-- NEW STATE

//     // CRITICAL FIX: Re-added a unique cache key to prevent conflicts with PendingBOQs
//     const { data: allBoqs, isLoading, error } = useFrappeGetDocList<BOQ>('CRM BOQ', {
//         fields: ["name", "boq_name", "company", "company.company_name", "boq_status", "boq_sub_status", "modified", "owner","assigned_sales"],
//         limit: 0
//     }, "all-boqs-estimate-all"); // <-- UNIQUE KEY

//     // Options for the new status filter
//     const statusOptions = ['New', 'Revision Pending', 'In-Progress', 'Revision Submitted', 'Negotiation', 'Won', 'Lost', 'Hold'];

//     const uniqueCompanies = useMemo(() => {
//         if (!allBoqs) return [];
//         const companies = new Map<string, string>();
//         allBoqs.forEach(boq => {
//             if (boq.company ) companies.set(boq.company, boq.company);
//         });
//         return Array.from(companies.entries()).map(([id, name]) => ({ id, name }));
//     }, [allBoqs]);

//     // 3. UPDATE FILTERING LOGIC to include the new status filter
//     const filteredBoqs = useMemo(() => {
//         if (!allBoqs) return [];
//         const sortedBoqs = [...allBoqs].sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
//         return sortedBoqs.filter(boq => {
//             const companyMatch = companyFilter === 'all' || boq.company === companyFilter;
//             const statusMatch = statusFilter === 'all' || boq.boq_status === statusFilter; // <-- NEW LOGIC
//             const searchMatch = searchTerm.toLowerCase() === '' ||
//                 boq.boq_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 boq.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 boq.owner.toLowerCase().includes(searchTerm.toLowerCase());
//             return companyMatch && searchMatch && statusMatch; // <-- ADDED statusMatch
//         });
//     }, [allBoqs, searchTerm, companyFilter, statusFilter]);
    
//     if (error) return <div className="text-red-500">Error loading BOQs.</div>;

//     return (
//         <div className="bg-background p-4 rounded-xl border">
//              <h2 className="font-semibold text-lg mb-4">All BOQs - {isLoading ? '...' : filteredBoqs.length}</h2>
//              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
//                 {/* 2. ADD UI for the Status Filter */}
//                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-[180px] border border-input bg-background h-10 rounded-md px-3 text-sm">
//                     <option value="all">All Statuses</option>
//                     {statusOptions.map(status => (<option key={status} value={status}>{status}</option>))}
//                 </select>
//                 <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="w-full md:w-[200px] border border-input bg-background h-10 rounded-md px-3 text-sm">
//                     <option value="all">All Companies</option>
//                     {uniqueCompanies.map(company => (<option key={company.id} value={company.id}>{company.name}</option>))}
//                 </select>
//                 <div className="relative w-full md:max-w-xs">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                     <Input placeholder="Search name, company..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//                 </div>
//              </div>
//             <div>
//                 {/* 4. REFINED DESKTOP TABLE HEADER */}
//                 <div className="hidden md:grid md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto] gap-4 font-medium text-sm text-muted-foreground px-2 py-2 border-b">
//                     <span>Project Name</span>
//                     <span>Company Name</span>
//                     <span>Status</span>
//                     <span>Sub-Status</span>
//                     <span>Last Updated</span>
//                     <span>Salesperson</span>
//                     <span></span>
//                 </div>
//                  <div className="hidden md:block max-h-[300px] overflow-y-auto pr-2">
//                 <div className="space-y-4 md:space-y-0">
//                     {isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
//                     {!isLoading && filteredBoqs.map(boq => (
//                         // 5. REFINED DESKTOP TABLE ROW
//                         <div key={boq.name} onClick={() => navigate(`/boqs/boq?id=${boq.name}`)} className="flex justify-between items-start p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors md:grid md:grid-cols-[2fr,1.5fr,1fr,1fr,1fr,1fr,auto] md:items-center md:p-0 md:py-3 md:px-2 md:border-none md:border-b md:rounded-none">
//                             <div className="flex flex-col text-left">
//                                 <p className="font-semibold text-primary">{boq.boq_name}</p>
//                                 <p className="text-sm text-muted-foreground md:hidden">{boq.company || '--'}</p>
//                                 <p className="text-xs text-muted-foreground md:hidden">By: {boq.owner} </p>
//                             </div>
//                             <span className="hidden md:block text-left">{boq.company || '--'}</span>
//                             <div className="hidden md:block text-left">
//                                 <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
//                             </div>
//                             <div className="hidden md:block text-left">
//                                 {boq.boq_sub_status ? <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBoqStatusClass(boq.boq_sub_status)}`}>{boq.boq_sub_status}</span> : '--'}
//                             </div>
//                            <span className="hidden md:block text-left text-sm text-muted-foreground">{format(new Date(boq.modified), 'dd-MMM-yyyy')}</span>
//                             <span className="hidden md:block text-center text-sm">{boq.assigned_sales||"--"}</span>
//                             <div className="flex flex-col items-end gap-2">
//                                 <div className="flex flex-col items-end gap-1.5 md:hidden">
//                                     <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>{boq.boq_status}</span>
//                                     <p className="text-xs text-muted-foreground">{format(new Date(boq.modified), 'dd-MM-yyyy')}</p>
//                                 </div>
//                                 <div className="flex justify-end pt-2 md:pt-0">
//                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                     {!isLoading && filteredBoqs.length === 0 && (
//                         <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
//                             <p>No BOQs found matching your criteria.</p>
//                         </div>
//                     )}
//                 </div>
//                  </div>

//             </div>
//         </div>
//     );
// };

// // Main component that assembles the page
// export const EstimationsHomePage = () => {
//      const fullName = localStorage.getItem('fullName');
    
  
//     return (
//         <div className="space-y-6">
//             <div className="flex flex-wrap gap-4 justify-between items-center">
//                 <h1 className="text-2xl font-bold">Welcome, {fullName}!</h1>
//                 {/* <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => openNewBoqDialog()}>
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add New BOQ
//                 </Button> */}
//             </div>
//             <PendingBOQs />
//             <AllBOQs />
//         </div>
//     );
// };
