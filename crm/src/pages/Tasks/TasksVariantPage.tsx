// src/pages/Tasks/TasksVariantPage.tsx
import { useViewport } from "@/hooks/useViewPort";
import { format, subDays } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Search } from "lucide-react";

import { TaskListHeader } from "./TaskListHeader"; // 1. IMPORT THE NEW HEADER
import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon'; // Import the status icon
import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { useStatesSyncedWithParams } from "@/hooks/useSearchParamsManager";
type EnrichedCRMTask = CRMTask & { 
    contact_name?: string; 
    company_name?: string; 
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
};

type TaskVariant = 'all' | 'pending' | 'completed';

interface TasksVariantPageProps {
    variant: TaskVariant;
    from: string;
    to: string;
}

export const StatusPill = ({ status }: { status: string }) => {
    const getStatusClass = useStatusStyles("task");
    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border w-fit ${getStatusClass(status)}`}>
            {status}
        </span>
    );
};


// --- NEW HELPER COMPONENT FOR DISPLAYING THE DATE RANGE ---
const DateRangeDisplay = ({ from, to }: { from: string, to: string }) => {
    // Check for valid dates before formatting
    const formattedFrom = from ? format(new Date(from), 'MMM dd, yyyy') : '...';
    const formattedTo = to ? format(new Date(to), 'MMM dd, yyyy') : '...';
    return (
        <p className="text-sm text-muted-foreground whitespace-nowrap">
            {formattedFrom} - {formattedTo}
        </p>
    );
};

// --- NEW HELPER COMPONENT FOR DISPLAYING THE ASSIGNED USERS ---
const AssignedUsersDisplay = ({ assignedUsersString }: { assignedUsersString: string }) => {
    // If the string is empty or null, don't render anything.
    if (!assignedUsersString) {
        return null;
    }
    const users = assignedUsersString.split(',');
    return (
        <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-sm font-medium text-muted-foreground">Filtered By:</span>
            {users.map(user => (
                <span key={user} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {user}
                </span>
            ))}
        </div>
    );
};


export const TasksVariantPage = ({ variant, from: fromProp, to: toProp }: TasksVariantPageProps) => {
    const navigate = useNavigate();
    
    const { isMobile } = useViewport();

    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("By Contact"); // Default filter type
    
 // This hook will read `from` and `to` from the URL query string.
       const [params, setParams] = useStatesSyncedWithParams([
        { key: 'from', defaultValue: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
        { key: 'to', defaultValue: format(new Date(), 'yyyy-MM-dd') },
        { key: 'assigned_to', defaultValue: '' },
    ]);

     const finalFrom = fromProp || params.from;
    const finalTo = toProp || params.to;
const assignedToFilter = params.assigned_to; // The string 'user1@email.com,user2@email.com'

    // const filters = useMemo(() => {
    //     const today = new Date().toISOString().slice(0, 10);
    //     let statusFilter;
    //     switch (variant) {
    //         case 'pending': statusFilter = ['!=', 'Completed']; break;
    //         case 'upcoming': statusFilter = ['=', 'Scheduled']; break;
    //         default: statusFilter = ['!=', '']; break;
    //     }
    //     return [['status', statusFilter[0], statusFilter[1]], ['start_date', 'between', [finalFrom, finalTo]]];
    // }, [variant, finalFrom, finalTo]);
    // 2. UPDATE THE FILTERS useMemo hook to include the assignment filter.

    const handleDateRangeChange = (range: { from: string, to: string }) => {
        setParams({ from: range.from, to: range.to });
    };

    const filters = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        let statusFilter;
        switch (variant) {
            case 'pending': statusFilter = ['=', 'Scheduled']; break;
            case 'completed': statusFilter = ['=', 'Completed']; break;
            default: statusFilter = ['!=', '']; break;
        }

        // Start with the mandatory filters (status and date)
        const mandatoryFilters = [
            ['status', statusFilter[0], statusFilter[1]], 
            ['start_date', 'between', [finalFrom, finalTo]]
        ];

        // Check if the assignedToFilter from the URL has a value
        if (assignedToFilter) {
            // Split the comma-separated string back into an array of user IDs
            const assignedUsers = assignedToFilter.split(',');
            // Add the assignment filter to our list of filters
            return [
                ...mandatoryFilters,
                ['assigned_sales', 'in', assignedUsers]
            ];
        }

        // If no assignment filter is present in the URL, return only the mandatory filters
        return mandatoryFilters;

    }, [variant, finalFrom, finalTo, assignedToFilter]); // Add the new dependency


    const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
        fields: ["name", "status","start_date", "type", "modified", "company", "contact.first_name", "contact.last_name", "company.company_name","creation","time"],
        filters: filters,
        limit: 1000,
        orderBy: { field: "modified", order: "desc" }
    });

    const filteredTasks = useMemo(() => {
        const enriched = tasksData?.map(task => ({
            ...task,
            contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim() || 'N/A',
            company_name: task["company.company_name"] || task.company || 'N/A'
        })) || [];
        
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return enriched;

        // This switch statement makes the search targeted
        switch (filterType) {
            case "By Contact":
                return enriched.filter(task => task.contact_name.toLowerCase().includes(lowercasedQuery));
            case "By Company":
                return enriched.filter(task => task.company_name.toLowerCase().includes(lowercasedQuery));
            case "By Type":
                return enriched.filter(task => task.type.toLowerCase().includes(lowercasedQuery));
            default:
                return enriched;
        }
    }, [tasksData, searchQuery, filterType]); // Add filterType as a dependency
    
    const title = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Tasks - ${filteredTasks.length}`;

    if (isLoading) { return <div>Loading tasks...</div>; }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                {/* Top Row: Title on left, Date Range on right */}
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">{title}</h1>
                    <DateRangeDisplay from={finalFrom} to={finalTo} />
                </div>
                {/* Bottom Row: Assigned users list (only shows if filters are active) */}
                <AssignedUsersDisplay assignedUsersString={assignedToFilter} />
            </div>
            
            <TaskListHeader 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterType={filterType}
                setFilterType={setFilterType}
                onDateRangeChange={handleDateRangeChange}
                dateRange={{ from: finalFrom, to: finalTo }}
            />
            
            {/* 5. RESPONSIVE TABLE DESIGN */}
            <Card className="mt-4 p-0">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/* This column is visible on all screen sizes */}
                                <TableHead>Task Details</TableHead>
                                
                                {/* These columns will ONLY appear on desktop (md screens and up) */}
                                <TableHead className="hidden md:table-cell">Company</TableHead>
                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                 <TableHead className="hidden md:table-cell text-right">Task Date</TableHead>
                                <TableHead className="hidden md:table-cell text-right">Last Updated</TableHead>
                                
                                {/* Chevron column */}
                                <TableHead className="w-[5%]"><span className="sr-only">View</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <TableRow key={task.name} onClick={() => isMobile?navigate(`/tasks/task?id=${task.name}`):navigate(`/tasks?id=${task.name}`)} className="cursor-pointer">
                                        
                                        {/* --- MOBILE & DESKTOP: Combined Cell --- */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{`${task.type} with ${task.contact_name} from ${task.company_name}`} <span className="text-xs text-muted-foreground p-0 m-0">
                                                        {formatCasualDate(task.start_date)} at {formatTime12Hour(task?.time)}
                                                    </span></span>
                                                    {/* On mobile, show the date here. Hide it on larger screens. */}
                                                    {/* ADDED: inline-block, px-1.5, py-0.5, rounded-md, and a subtle border color */}
                                                    <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
                                                        Updated: {formatDate(task.modified)}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* --- DESKTOP ONLY Cells --- */}
                                        <TableCell className="hidden md:table-cell">{task.company_name}</TableCell>
                                        <TableCell className="hidden md:table-cell"><StatusPill status={task.status} /></TableCell>
                                         <TableCell className="hidden md:table-cell text-right">{formatDate(task.start_date)}</TableCell>
                                        <TableCell className="hidden md:table-cell text-right">{formatDate(task.modified)}</TableCell>

                                        <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No tasks found in this category.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { EnrichedCRMTask } from "./Tasks";
// import { formatDate } from "@/utils/FormatDate";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { ChevronRight, Search } from "lucide-react";
// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { format, subDays } from "date-fns";
// import { FilterControls } from "@/components/ui/FilterControls";
// import { useStatusStyles } from "@/hooks/useStatusStyles";

// type TaskVariant = 'all' | 'pending' | 'upcoming' | 'history';

// const StatusPill = ({ status }: { status: string }) => {
//     const getStatusClass = useStatusStyles("task");
//     return (
//         <span className={`text-xs font-semibold px-2 py-1 rounded-full border w-fit ${getStatusClass(status)}`}>
//             {status}
//         </span>
//     );
// };

// export const TasksVariantPage = ({ variant }: { variant: TaskVariant }) => {
//     const navigate = useNavigate();
//     const [searchQuery, setSearchQuery] = useState("");
//     const [dateRange, setDateRange] = useState({
//         from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
//         to: format(new Date(), 'yyyy-MM-dd'),
//     });

//     // --- DYNAMIC FILTERS FOR DATA FETCHING ---
//     const filters = useMemo(() => {
//         const today = new Date().toISOString().slice(0, 10);
//         let statusFilter;

//         switch (variant) {
//             // --- THE FIX IS HERE ---
//             // The logic for 'pending' is now much simpler and more accurate.
//             case 'pending':
//                 statusFilter = ['!=', 'Completed'];
//                 break;
//             case 'upcoming':
//                 return [
//                     ['status', '=', 'Scheduled'],
//                     ['start_date', '>=', today]
//                 ];
//             case 'history':
//                 return [
//                     ['start_date', '<', today]
//                 ];
//             case 'all':
//             default:
//                 statusFilter = ['!=', '']; // A way to get all statuses
//                 break;
//         }
        
//         return [
//             ['status', statusFilter[0], statusFilter[1]],
//             ['modified', 'between', [dateRange.from, dateRange.to]]
//         ];

//     }, [variant, dateRange]);

//     const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
//         fields: ["name", "status", "type", "modified","company", "contact.first_name", "contact.last_name", "company.company_name"],
//         filters: filters,
//         limit: 1000,
//         orderBy: { field: "modified", order: "desc" }
//     });

//     // --- CLIENT-SIDE SEARCH FILTERING ---
//     const filteredTasks = useMemo(() => {
//         const enriched = tasksData?.map(task => ({
//             ...task,
//             contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim() || 'N/A',
//             company_name: task.company || 'N/A'
//         })) || [];
        
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return enriched;

//         return enriched.filter(task => 
//             task.contact_name.toLowerCase().includes(lowercasedQuery) ||
//             task.company_name.toLowerCase().includes(lowercasedQuery) ||
//             task.type.toLowerCase().includes(lowercasedQuery)
//         );
//     }, [tasksData, searchQuery]);
    
//     const title = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Tasks - ${filteredTasks.length}`;

//     if (isLoading) { return <div>Loading tasks...</div>; }

//     return (
//         <div className="space-y-4">
//             <h1 className="text-xl font-bold">{title}</h1>
            
//             {/* <div className="flex gap-2">
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input placeholder="Search Contact, Company or Type..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
//                 </div>
//             </div> */}
//             {/* <FilterControls onDateRangeChange={setDateRange} /> */}

//             <Card className="mt-4 p-0">
//                 <CardContent className="p-0">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Contact</TableHead>
//                                 <TableHead>Company</TableHead>
//                                 <TableHead>Task Type</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead className="text-right">Update Date</TableHead>
//                                 <TableHead className="w-[5%]"></TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {filteredTasks.length > 0 ? (
//                                 filteredTasks.map((task) => (
//                                     <TableRow key={task.name} onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="cursor-pointer">
//                                         <TableCell className="font-medium">{task.contact_name}</TableCell>
//                                         <TableCell>{task.company_name}</TableCell>
//                                         <TableCell>{task.type}</TableCell>
//                                         <TableCell><StatusPill status={task.status} /></TableCell>
//                                         <TableCell className="text-right">{formatDate(task.modified)}</TableCell>
//                                         <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell colSpan={6} className="text-center h-24">No tasks found.</TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };
