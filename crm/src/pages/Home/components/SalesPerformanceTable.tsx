// src/pages/Home/SalesPerformanceTable.tsx
import React from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useNavigate } from 'react-router-dom';

// --- Imports from StatsGrid.tsx for dialog functionality ---
import { useDialogStore, StatItem } from "@/store/dialogStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { formatDateWithOrdinal } from "@/utils/FormatDate";
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";
// --- End Imports from StatsGrid.tsx ---


// Define the interface for your API response data
interface FrappeDoc {
    name: string;
    type?: string;
    start_date?: string;
    status?: string;
    task_profile?: string;
    remarks?: string;
    boq_status?: string;
    creation?: string; // Used for TAC/BOQ
    boq?: string;
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
    company?: string;
    priority?: string; 
    last_meeting?: string; 
    date_from?: string; // Will be missing for TAC
    date_to?: string;
    [key: string]: any;
}

interface SalesPerformanceMetric {
    user_name: string;
    full_name: string;
    email?: string;
    
    // Time-based metrics
    IPM_this_week: FrappeDoc[];
    IPM_last_week: FrappeDoc[];
    IPM_last_30_days: FrappeDoc[];
    UMC_this_week: FrappeDoc[];
    UMC_last_week: FrappeDoc[];
    UMC_last_30_days: FrappeDoc[];
    BOQR_this_week: FrappeDoc[];
    BOQR_last_week: FrappeDoc[];
    BOQR_last_30_days: FrappeDoc[];

    // --- TIME-BASED TAC METRICS (Cumulative Active Assigned Companies) ---
    TAC_this_week: FrappeDoc[];
    TAC_last_week: FrappeDoc[];
    TAC_last_30_days: FrappeDoc[];
    // --- END NEW TAC METRICS ---
}

interface SalesPerformanceTableProps {
    className?: string;
}

// --- Re-usable formatters (unchanged) ---
const getBoqStatusClass = useStatusStyles("boq");
const getTaskStatusClass = useStatusStyles("task");

const boqNameFormatter = (item: FrappeDoc) => (
    <Card className="w-full shadow-none border hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base font-bold text-primary truncate" title={item.name}>
                {item.name}<span className=" block text-sm text-gray-400 font-light">{item.company}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-0 flex justify-between items-center text-xs">
            <div>
                <span className={`font-semibold px-2 py-1 rounded-full text-xs border ${getBoqStatusClass(item.boq_status || '')}`}>
                    {item.boq_status || 'N/A'}
                </span>
            </div>
            <div className="text-muted-foreground font-medium border p-2">
                         <span>Received on</span><br></br>
                          {formatDateWithOrdinal(item.creation)}
                        </div>
        </CardContent>
    </Card>
);

const taskNameFormatter = (item: FrappeDoc) => (
    <div className="flex p-1 items-center space-x-2 w-full">
        <TaskStatusIcon status={item.status || 'Open'} className="flex-shrink-0" />
                <div className="flex flex-col flex-grow min-w-0">
                    {item.task_profile === "Sales" ? (
                        <span className='truncate text-sm'>
                            <span className="font-semibold">{item?.type || 'Task'}</span> with <span className="font-semibold">{item.first_name || '--'}</span>{" "}
                            from <span className='font-medium'>{item["company.company_name"] || item.company || '--'}</span>
                        </span>
                    ) : (
                        <span className='truncate text-sm'>
                            <span className="font-semibold">{item?.type || 'Task'}</span> for  <span className="font-semibold">{item?.boq || '--'}</span>
                        </span>
                    )}

                    {item.start_date && (
                        <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 self-start">
                               On: {formatDateWithOrdinal(item.start_date)}
                        </span>
                    )}

                </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
    </div>
);


// --- FORMATTER for Assigned Companies (for the dialog list) ---
const companyNameFormatter = (item: FrappeDoc) => (
    <div className="flex p-3 items-start space-x-3 w-full border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex flex-col flex-grow min-w-0">
            {/* Row 1: Company Name (Name is the ID/Link target) */}
            <Link to={`/companies/company?id=${item.name}`} className="font-bold text-base text-blue-600 dark:text-blue-400 hover:underline">
                {item.company_name || item.name || 'N/A'}
            </Link>
            
            {/* Row 2: Priority Status */}
            {item.priority && (
                <div className="flex items-center mt-1 text-xs text-gray-700 dark:text-gray-300 space-x-2">
                    <span className='font-medium'>
                        Priority: 
                        <span className={`ml-1 font-bold px-2 py-0.5 rounded-full text-xs border ${item.priority === 'Hold' ? 'bg-yellow-100 text-yellow-800 border-yellow-800' : 'bg-green-100 text-green-800 border-green-800'}`}>
                            {item.priority}
                        </span>
                    </span>
                </div>
            )}
            
            {/* Row 3: Creation Date (New for TAC) */}
            {item.last_meeting && (
                <span className="inline-block text-xs text-muted-foreground mt-1 self-start">
                    Last Meeting On: {formatDateWithOrdinal(item.last_meeting)}
                </span>
            )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 mt-1" />
    </div>
);
// --- End Company Formatter ---


const formatItemsForDialog = (data: FrappeDoc[], nameFormatter: (item: FrappeDoc) => React.ReactNode, type: 'Task' | 'BOQ'|'Company'): StatItem[] => {
    return data.map(item => ({
        name: nameFormatter(item),
        id: item.name,
        type: type, 
        data: item
    }));
};
// --- End Re-usable formatters ---


export const SalesPerformanceTable: React.FC<SalesPerformanceTableProps> = ({ className }) => {
    const { openStatsDetailDialog } = useDialogStore();

    // NOTE: Changed app path to match the new structure in the Python file
        // NOTE: Changed app path to match the new structure in the Python file
    const { data, isLoading, error } = useFrappeGetCall<SalesPerformanceMetric[]>(
        "nirmaan_crm.api.users.get_sales_performance.get_sales_performance_metrics",
        []
    );

    const navigate=useNavigate()

    const performanceData = data?.message || []; // The response is the array of metrics, no `.message` is needed here anymore


     const createDialogHandler = (
        user: SalesPerformanceMetric,
        metricType: 'IPM' | 'UMC' | 'BOQ'|'TAC', // TAC added
        period?: 'this_week' | 'last_week' | 'last_30_days', 
        data?: FrappeDoc[], 
        count?: number 
    ) => () => {
        
        let titlePrefix = "";
        let itemsToDisplay: FrappeDoc[] = data || []; 
        let formatterToUse: (item: FrappeDoc) => React.ReactNode = taskNameFormatter;
        let dialogItemType: 'Task' | 'BOQ' | 'Company' = 'Task'; 
        let currentCount = count !== undefined ? count : itemsToDisplay.length;

        // Determine metrics and data source
        if (metricType === 'TAC') { // --- NEW TAC LOGIC ---
            titlePrefix = "Active Companies"; 
            itemsToDisplay = user[`TAC_${period!}`] as FrappeDoc[]; // Use period to get the correct list
            currentCount = itemsToDisplay.length;
            formatterToUse = companyNameFormatter; 
            dialogItemType = 'Company';
        } else if (metricType === 'IPM') {
            titlePrefix = "Total Meetings";
            dialogItemType = 'Task';
        } else if (metricType === 'UMC') {
            titlePrefix = "Unique Meetings (by Company)"; 
            dialogItemType = 'Task';
        } else if (metricType === 'BOQ') {
            titlePrefix = "BOQ Received";
            formatterToUse = boqNameFormatter;
            dialogItemType = 'BOQ';
        }

        if (currentCount > 0) {
            const spacedPeriod = period ? period.replace(/_/g, ' ') : '';
            const capitalizedPeriod = spacedPeriod.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '); 
            
            // const title = `${user.full_name} - ${titlePrefix} ${capitalizedPeriod} (${currentCount})`;
            // const title = `${user.full_name} - ${titlePrefix} ${capitalizedPeriod}`;

           
            // Date Range logic for all time-based metrics
            const dateSourceKey = 
                metricType === 'BOQ' ? `BOQR_${period}` : 
                (metricType === 'TAC' ? `TAC_${period}` : `IPM_${period}`);

            const title = (dateSourceKey.startsWith('TAC')) ? `${user.full_name} - ${titlePrefix}` : `${user.full_name} - ${titlePrefix} ${capitalizedPeriod}`;
                
            const dateItemsForDialog = user[dateSourceKey as keyof SalesPerformanceMetric] as FrappeDoc[] || [];
            
            // Special handling for TAC date range since date_from is intentionally missing
            const dateRange = (dateSourceKey.startsWith('TAC'))
                ? `Up to ${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_to)} `
                : (dateItemsForDialog?.length > 0) 
                    ? `${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_from)} to ${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_to)} `
                    : "--";

            const formattedItems = formatItemsForDialog(
                itemsToDisplay, 
                formatterToUse, 
                dialogItemType
            );

            openStatsDetailDialog({
                title: (
                    <div className="flex flex-col">
                        <span>{title}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                            ({dateRange})
                        </span>
                    </div>
                ),
                items: formattedItems,
            });
        }
    };


const MeetingsCellContent: React.FC<{
    user: SalesPerformanceMetric;
    period: 'this_week' | 'last_week' | 'last_30_days';
    createDialogHandler: ReturnType<typeof createDialogHandler>; // Added handler prop
}> = ({ user, period, createDialogHandler }) => { // Destructure handler
    // Determine the data keys dynamically
    const ipmKey = `IPM_${period}` as keyof SalesPerformanceMetric;
    const umcKey = `UMC_${period}` as keyof SalesPerformanceMetric;
    const tacKey = `TAC_${period}` as keyof SalesPerformanceMetric; // TAC Key

    // Safely get the items, assuming they are arrays
    const ipmItems = (user[ipmKey] as unknown as FrappeDoc[]) || [];
    const umcItems = (user[umcKey] as unknown as FrappeDoc[]) || [];
    const tacItems = (user[tacKey] as unknown as FrappeDoc[]) || []; // TAC Items

    const ipmCount = ipmItems.length;
    const umcCount = umcItems.length;
    const tacCount = tacItems.length; // TAC Count
    
    // Base styles for the card-like containers
    const baseCardClass = "flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-md p-1";

    // Styles for the COUNT when it is > 0 (The RED CIRCLE/BUTTON)
    const activeCountClass = "min-w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-red-600 transition-colors shadow-red-500/70 shadow-sm p-1.5";
    
    // Styles for the COUNT when it is > 0 for TAC (The BLUE CIRCLE/BUTTON)
    const tacCountClass = "min-w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-red-600 transition-colors shadow-red-500/70 shadow-sm p-1.5";
    // Styles for the COUNT when it is 0 (The standard gray text)
    const inactiveCountClass = "text-sm text-gray-700 font-semibold dark:text-gray-300";

const renderCount = (count: number, items: FrappeDoc[], type: 'IPM' | 'UMC' | 'TAC') => { 
        const isActive = count > 0;
        let countClass = inactiveCountClass;

        if (isActive) {
            countClass = type === 'TAC' ? tacCountClass : activeCountClass;
        }
        
        return (
            <span
                className={countClass}
                // Call createDialogHandler for the respective metric
                onClick={isActive ? createDialogHandler(user, type, period, items, count) : undefined} 
            >
                {count}
            </span>
        );
    };
    
    return (
        <div className="flex flex-col items-stretch justify-center h-full text-sm space-y-1">
            {/* IPM Card (Total) */}
            <div className={baseCardClass}>
                <span className="text-gray-700 font-medium dark:text-gray-300">Total:</span>
                {renderCount(ipmCount, ipmItems, 'IPM')}
            </div>

            {/* UMC Card (Unique Company) */}
            <div className={baseCardClass}>
                <span className="text-gray-700 font-medium dark:text-gray-300">Unique:</span>
                {renderCount(umcCount, umcItems, 'UMC')}
            </div>

            {/* --- TAC Card (Cumulative Active Assigned) --- */}
            <div className={baseCardClass}>
                <span className="text-gray-700 font-medium dark:text-gray-300">Active Companies:</span>
                {renderCount(tacCount, tacItems, 'TAC')} 
            </div>
             {/* ------------------------------------------- */}
        </div>
    );
};
    
const BoqCellContent: React.FC<{
    user: SalesPerformanceMetric;
    period: 'this_week' | 'last_week' | 'last_30_days';
    createDialogHandler: ReturnType<typeof createDialogHandler>; // Added handler prop
}> = ({ user, period, createDialogHandler }) => { // Destructure handler
    const boqItems = user[`BOQR_${period}`] || [];
    const boqCount = boqItems.length;

    return (
        <div className="flex items-center justify-center h-full text-sm">
            {boqCount > 0 ? (
                <div
                    className="min-w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-red-600 transition-colors shadow-red-500/70 shadow-sm p-1.5"
                    onClick={createDialogHandler(user, 'BOQ', period, boqItems, boqCount)}
                >
                    {boqCount} 
                </div>
            ) : (
                <span className="text-gray-700 font-semibold">
                    {boqCount}
                </span>
            )}
        </div>
    );
};

// TACCellContent component is no longer needed as the logic is in MeetingsCellContent

    if (isLoading) {
        // --- UPDATED LOADING STATE: REVERTED TO 7 COLUMNS ---
        return (
            <div className={cn("sales-performance-container overflow-x-auto p-4", className)}>
                <table className="table-auto border-collapse border border-red-500 w-full text-center">
                    <thead className="bg-white">
                        <tr>
                            <th rowSpan={2} className="border border-red-500 px-4 py-2 text-red-700">User</th>
                            <th colSpan={3} className="border border-red-500 px-4 py-2 text-red-700">In Person Meetings</th> {/* Re-styled Header */}
                            <th colSpan={3} className="border border-red-500 px-4 py-2 text-red-700">BOQ</th>
                        </tr>
                        <tr>
                            <th className="border border-red-500 px-4 py-2 text-red-700">This Week</th>
                            <th className="border border-red-500 px-4 py-2 text-red-700">Last Week</th>
                            <th className="border border-red-500 px-4 py-2 text-red-700">30 Days</th>
                            <th className="border border-red-500 px-4 py-2 text-red-700">This Week</th>
                            <th className="border border-red-500 px-4 py-2 text-red-700">Last Week</th>
                            <th className="border border-red-500 px-4 py-2 text-red-700">30 Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i}>
                                <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-24 mx-auto" /></td>
                                <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-[75px] w-24 mx-auto" /></td> {/* Increased height for 3 cards */}
                                <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-[75px] w-24 mx-auto" /></td>
                                <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-[75px] w-24 mx-auto" /></td>
                                <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-12 mx-auto" /></td>
                                <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-12 mx-auto" /></td>
                                <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-12 mx-auto" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className={cn("mt-4", className)}>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error fetching Sales Performance</AlertTitle>
                <AlertDescription>
                    {error.message || "An unexpected error occurred while loading sales data."}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className={cn("sales-performance-container overflow-x-auto p-4", className)}>
            <div className="max-h-[300px] overflow-y-auto">
                <table className="table-auto border-collapse border rounded-md border-gray-500 w-full text-center">
                    <thead className="bg-gray-100">
                        <tr>
                            <th rowSpan={2} className="border text-primary px-4 py-2 text-red-700">User</th>
                            <th colSpan={3} className="border text-primary px-4 py-2 text-red-700">In Person Meetings</th> {/* Re-styled Header */}
                            <th colSpan={3} className="border text-primary px-4 py-2 text-red-700">BOQ</th>
                        </tr>
                        <tr>
                            <th className="border  px-4 py-2 text-primary">This Week</th>
                            <th className="border  px-4 py-2 text-primary">Last Week</th>
                            <th className="border  px-4 py-2 text-primary">30 Days</th>
                            <th className="border  px-4 py-2 text-primary">This Week</th>
                            <th className="border  px-4 py-2 text-primary">Last Week</th>
                            <th className="border  px-4 py-2 text-primary">30 Days</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceData.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-4 text-center text-gray-500">No sales performance data found.</td> {/* Reverted colspan to 7 */}
                            </tr>
                        ) : (
                            performanceData.map((user) => (
                                <tr key={user.user_name} className="hover:bg-gray-50">
                                    <td className="border px-4 py-2 align-middle text-left bg-gray-100 font-semibold text-primary"> 
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link to={`/team?memberId=${user.email}`} className="text-primary hover:underline font-semibold">
                                                        {user.full_name}
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{user.email}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </td>
                                    
                                    {/* Meetings & TAC Columns (Combined) */}
                                    <td className="border px-4 py-2 align-middle">
                                        <MeetingsCellContent user={user} period="this_week" createDialogHandler={createDialogHandler} />
                                    </td>
                                    <td className="border px-4 py-2 align-middle">
                                        <MeetingsCellContent user={user} period="last_week" createDialogHandler={createDialogHandler} />
                                    </td>
                                    <td className="border px-4 py-2 align-middle">
                                        <MeetingsCellContent user={user} period="last_30_days" createDialogHandler={createDialogHandler} />
                                    </td>

                                    {/* BOQ Columns */}
                                    <td className="border px-4 py-2 align-middle">
                                        <BoqCellContent user={user} period="this_week" createDialogHandler={createDialogHandler} />
                                    </td>
                                    <td className="border px-4 py-2 align-middle">
                                        <BoqCellContent user={user} period="last_week" createDialogHandler={createDialogHandler} />
                                    </td>
                                    <td className="border px-4 py-2 align-middle">
                                        <BoqCellContent user={user} period="last_30_days" createDialogHandler={createDialogHandler} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesPerformanceTable;


// // src/pages/Home/SalesPerformanceTable.tsx
// import React from 'react';
// import { useFrappeGetCall } from 'frappe-react-sdk';
// import { cn } from "@/lib/utils";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Terminal, ChevronRight } from "lucide-react";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Link, useNavigate } from 'react-router-dom';

// // --- Imports from StatsGrid.tsx for dialog functionality ---
// import { useDialogStore, StatItem } from "@/store/dialogStore";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import { formatDateWithOrdinal } from "@/utils/FormatDate";
// import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";
// // --- End Imports from StatsGrid.tsx ---


// // Define the interface for your API response data
// interface FrappeDoc {
//     name: string;
//     type?: string;
//     start_date?: string;
//     status?: string;
//     task_profile?: string;
//     remarks?: string;
//     boq_status?: string;
//     creation?: string;
//     boq?: string;
//     "contact.first_name"?: string;
//     "contact.last_name"?: string;
//     "company.company_name"?: string;
//     company?: string;
//     date_from?: string;
//     date_to?: string;
//     [key: string]: any;
// }

// interface SalesPerformanceMetric {
//     user_name: string;
//     full_name: string;
//     IPM_this_week: FrappeDoc[];
//     IPM_last_week: FrappeDoc[];
//     IPM_last_30_days: FrappeDoc[];
//     UMC_this_week: FrappeDoc[];
//     UMC_last_week: FrappeDoc[];
//     UMC_last_30_days: FrappeDoc[];
//     BOQR_this_week: FrappeDoc[];
//     BOQR_last_week: FrappeDoc[];
//     BOQR_last_30_days: FrappeDoc[];
//     email?: string;
// }

// interface SalesPerformanceTableProps {
//     className?: string;
// }

// // --- Re-usable formatters (unchanged) ---
// const getBoqStatusClass = useStatusStyles("boq");
// const getTaskStatusClass = useStatusStyles("task");

// const boqNameFormatter = (item: FrappeDoc) => (
//     <Card className="w-full shadow-none border hover:shadow-md transition-shadow">
//         <CardHeader className="p-3 pb-2">
//             <CardTitle className="text-base font-bold text-primary truncate" title={item.name}>
//                 {item.name}<span className=" block text-sm text-gray-400 font-light">{item.company}</span>
//             </CardTitle>
//         </CardHeader>
//         <CardContent className="px-2 pt-0 flex justify-between items-center text-xs">
//             <div>
//                 <span className={`font-semibold px-2 py-1 rounded-full text-xs border ${getBoqStatusClass(item.boq_status || '')}`}>
//                     {item.boq_status || 'N/A'}
//                 </span>
//             </div>
//             <div className="text-muted-foreground font-medium border p-2">
//                          <span>Received on</span><br></br>
//                           {formatDateWithOrdinal(item.creation)}
//                         </div>
//         </CardContent>
//     </Card>
// );

// const taskNameFormatter = (item: FrappeDoc) => (
//     <div className="flex p-1 items-center space-x-2 w-full">
//         <TaskStatusIcon status={item.status || 'Open'} className="flex-shrink-0" />
//                 <div className="flex flex-col flex-grow min-w-0">
//                     {item.task_profile === "Sales" ? (
//                         <span className='truncate text-sm'>
//                             <span className="font-semibold">{item?.type || 'Task'}</span> with <span className="font-semibold">{item.first_name || '--'}</span>{" "}
//                             from <span className='font-medium'>{item.company || '--'}</span>
//                         </span>
//                     ) : (
//                         <span className='truncate text-sm'>
//                             <span className="font-semibold">{item?.type || 'Task'}</span> for  <span className="font-semibold">{item?.boq || '--'}</span>
//                         </span>
//                     )}

//                     {item.start_date && (
//                         <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 self-start">
//                                On: {formatDateWithOrdinal(item.start_date)}
//                         </span>
//                     )}

//                 </div>
//         <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
//     </div>
// );


// const formatItemsForDialog = (data: FrappeDoc[], nameFormatter: (item: FrappeDoc) => React.ReactNode, type: 'Task' | 'BOQ'): StatItem[] => {
//     return data.map(item => ({
//         name: nameFormatter(item),
//         id: item.name,
//         type: type,
//         data: item
//     }));
// };
// // --- End Re-usable formatters ---

//     // --- CORRECTED HELPER FUNCTION: Get count of unique companies NOT on hold (using priority) ---
//     const getUniqueActiveCompanyCount = (items: FrappeDoc[]): number => {
//         const COMPANY_HOLD_STATUS = "Hold"; // Must match the value used in the backend's UMC logic
//         const uniqueActiveCompanies = new Set<string>();
        
//         for (const item of items) {
//             // Check if company ID is present AND priority is NOT 'Hold'
//             // The priority field is fetched by the backend using dot-notation: "company.priority" 
//             // and should be available as item.priority on the flattened FrappeDoc.
//             if (item.company && item.priority !== COMPANY_HOLD_STATUS) { 
//                 uniqueActiveCompanies.add(item.company);
//             }
//         }
//         return uniqueActiveCompanies.size;
//     };
//     // -----------------------------------------------------------------------------------------

//     // --- NEW HELPER FUNCTION: Get a list of the unique active companies for the tooltip ---
//     const getUniqueActiveCompanyNames = (items: FrappeDoc[]): string[] => {
//         const COMPANY_HOLD_STATUS = "Hold";
//         const uniqueActiveCompanies = new Map<string, string>(); // Map<company_id, company_name>
        
//         for (const item of items) {
//             if (item.company && item.priority !== COMPANY_HOLD_STATUS) { 
//                 const companyName = item["company.company_name"] || item.company || 'N/A';
//                 uniqueActiveCompanies.set(item.company, companyName);
//             }
//         }
//         return Array.from(uniqueActiveCompanies.values());
//     };
//     // --------------------------------------------------------------------------------------

//     const uacNameFormatter = (item: FrappeDoc) => (
//     <div className="flex p-3 items-start space-x-3 w-full border rounded-lg hover:shadow-md transition-shadow">
//         <div className="flex flex-col flex-grow min-w-0">
//             {/* Row 2: Highlight Active Company Details */}
//             {item.company && (
//                 <div className="flex items-center mt-1 text-xs text-gray-700 dark:text-gray-300 space-x-2">
//                     {/* Company Name (using the company_name or ID) */}
//                     <span className='font-medium'>
//                         Company: <span className='font-semibold text-blue-600 dark:text-blue-400'>{item["company.company_name"] || item.company || 'N/A'}</span>
//                     </span>
                    
//                     {/* Company Priority Status */}
//                     {item.priority && (
//                         <>
//                             <span className="text-gray-400">|</span>
//                             <span className='font-medium'>
//                                 Priority: 
//                                 <span className={`ml-1 font-bold px-2 py-0.5 rounded-full text-xs border ${item.priority === 'Hold' ? 'bg-yellow-100 text-yellow-800 border-yellow-800' : 'bg-green-100 text-green-800 border-green-800'}`}>
//                                     {item.priority}
//                                 </span>
//                             </span>
//                         </>
//                     )}
//                 </div>
//             )}
            
//             {/* Row 3: Date */}
//             {item.last_meeting && (
//                 <span className="inline-block text-xs text-muted-foreground mt-1 self-start">
//                     Last Meeting On: {formatDateWithOrdinal(item.last_meeting)}
//                 </span>
//             )}

//         </div>
//         <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 mt-1" />
//     </div>
// );
// // --- End New Formatter ---


// // ... (existing formatItemsForDialog, getUniqueActiveCompanyCount) ...

// // --- NEW HELPER FUNCTION: Filter tasks to only include the *first* task per unique, active company ---
//     const filterTasksByUniqueActiveCompany = (items: FrappeDoc[]): FrappeDoc[] => {
//         const COMPANY_HOLD_STATUS = "Hold";
//         const uniqueCompanyTasks: FrappeDoc[] = [];
//         const uniqueCompanyIds = new Set<string>();

//         for (const item of items) {
//             // Check if the company is considered "Active" (not Hold)
//             if (item.company && item.priority !== COMPANY_HOLD_STATUS) {
//                 // Check if we haven't seen this active company ID yet
//                 if (!uniqueCompanyIds.has(item.company)) {
//                     uniqueCompanyIds.add(item.company);
//                     // We only add a *single* representative task for the unique company dialog
//                     uniqueCompanyTasks.push(item);
//                 }
//             }
//         }
//         return uniqueCompanyTasks;
//     };
    


// export const SalesPerformanceTable: React.FC<SalesPerformanceTableProps> = ({ className }) => {
//     const { openStatsDetailDialog } = useDialogStore();

//     const { data, isLoading, error } = useFrappeGetCall<SalesPerformanceMetric[]>(
//         "nirmaan_crm.api.users.get_sales_performance.get_sales_performance_metrics",
//         []
//     );

//     const navigate=useNavigate()

//     const performanceData = data?.message || [];

//      const createDialogHandler = (
//         user: SalesPerformanceMetric,
//         metricType: 'IPM' | 'UMC' | 'BOQ'|'UAC',
//         period: 'this_week' | 'last_week' | 'last_30_days',
//         data: FrappeDoc[], // This is the raw data (IPM or BOQ list)
//         count: number
//     ) => () => {
//         console.log("createDialogHandler invoked with:", { user, metricType, period, data, count });
//         if (count > 0) {
//             let titlePrefix = "";
//             let itemsToDisplay: FrappeDoc[] = data; // Default to raw data
//             let formatterToUse = taskNameFormatter; // Default formatter

//             if (metricType === 'IPM') {
//                 titlePrefix = "Total Meetings";
//             } else if (metricType === 'UMC') {
//                 titlePrefix = "Unique Meetings";
//             } else if (metricType === 'BOQ') {
//                 titlePrefix = "BOQ Received";
//                 formatterToUse = boqNameFormatter;
//             } else if (metricType === 'UAC') {
//                 // --- NEW LOGIC: Filter data and use new formatter for UAC ---
//                 titlePrefix = "Unique Active Companies";
//                 const rawIPMData = user[`IPM_${period}`] as FrappeDoc[];
//                 itemsToDisplay = filterTasksByUniqueActiveCompany(rawIPMData);
//                 formatterToUse = uacNameFormatter; // <-- USE NEW FORMATTER
//                 // The count in the dialog title will still be the original 'count' (UAC count)
//             }
            
//             const spacedPeriod = period.replace(/_/g, ' ');

//             // 2. Capitalize the first letter of each word
//             const capitalizedPeriod = spacedPeriod.split(' ')
//             .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//             .join(' '); 
            
//             const title = `${user.full_name} - ${titlePrefix} ${capitalizedPeriod} (${count})`;
            
//             // Determine date range data source
//             const dateItemsForDialog = metricType === 'BOQ' ? user[`BOQR_${period}`] : user[`IPM_${period}`];
             
//             const dialogItemType = 
//                 metricType === 'BOQ' ? 'BOQ' : 
//                 metricType === 'UAC' ? 'UAC' : // <-- NEW: Use 'UAC' as the item type
//                 'Task';
//             const formattedItems = formatItemsForDialog(
//                 itemsToDisplay, // <-- Use the filtered data (itemsToDisplay)
//                 formatterToUse, // <-- Use the determined formatter
//                 dialogItemType
//             );
//             console.log("formattedItems",formattedItems)

//             const dateRange = dateItemsForDialog.length
//                 ? `${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_from)} to ${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_to)} `
//                 : "--";

//             openStatsDetailDialog({
//                 title: (
//                     <div className="flex flex-col">
//                         <span>{title}</span>
//                         <span className="text-xs text-muted-foreground font-normal">
//                             ({dateRange})
//                         </span>
//                     </div>
//                 ),
//                 items: formattedItems,
//             });
//         }
//     };



// //     // Helper to create the dialog handler for a specific metric (remains the same logic)
// //     const createDialogHandler = (
// //         user: SalesPerformanceMetric,
// //         metricType: 'IPM' | 'UMC' | 'BOQ'|'UAC',
// //         period: 'this_week' | 'last_week' | 'last_30_days',
// //         data: FrappeDoc[],
// //         count: number
// //     ) => () => {
// //         console.log("createDialogHandler invoked with:", { user, metricType, period, data, count });
// //         if (count > 0) {
// //             let titlePrefix = "";
// //             if (metricType === 'IPM') titlePrefix = "Total Meetings";
// //             else if (metricType === 'UMC') titlePrefix = "Unique Meetings";
// //             else if (metricType === 'UAC') titlePrefix = "Unique Active Companies";
// //             else if (metricType === 'BOQ') titlePrefix = "BOQ Received";
// //             const spacedPeriod = period.replace(/_/g, ' ');

// // // 2. Capitalize the first letter of each word
// //     const capitalizedPeriod = spacedPeriod.split(' ')
// //     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// //     .join(' '); 
// //     // Result: 'Last 30 Days'
// //             const title = `${user.full_name} - ${titlePrefix} ${capitalizedPeriod}`;
// //             // console.log("Dialog Title:", title);
// //             const formattedItems = formatItemsForDialog(
// //                 data,
// //                 metricType === 'BOQ' ? boqNameFormatter : taskNameFormatter,
// //                 metricType === 'BOQ' ? 'BOQ' : 'Task'
// //             );
// //             const dateItemsForDialog = metricType === 'BOQ' ? user[`BOQR_${period}`] : (user[`IPM_${period}`].length ? user[`IPM_${period}`] : user[`UMC_${period}`]);

// //             const dateRange = dateItemsForDialog.length
// //                 ? `${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_from)} to ${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_to)} `
// //                 : "--";

// //             openStatsDetailDialog({
// //                 title: (
// //                     <div className="flex flex-col">
// //                         <span>{title}</span>
// //                         <span className="text-xs text-muted-foreground font-normal">
// //                             ({dateRange})
// //                         </span>
// //                     </div>
// //                 ),
// //                 items: formattedItems,
// //             });
// //         }
// //     };


//     /**
//      * Component to render the stacked "Total: X" and "Unique: Y" for Meetings columns.
//      * Styled to match the text-based format of UserReportTable.jsx, but with clickability.
//      */


// const MeetingsCellContent: React.FC<{
//     user: SalesPerformanceMetric;
//     period: 'this_week' | 'last_week' | 'last_30_days';
// }> = ({ user, period }) => {
//     // Determine the data keys dynamically
//     const ipmKey = `IPM_${period}` as keyof SalesPerformanceMetric;
//     const umcKey = `UMC_${period}` as keyof SalesPerformanceMetric;

//     // Safely get the items, assuming they are arrays
//     const ipmItems = (user[ipmKey] as unknown as any[]) || [];
//     const umcItems = (user[umcKey] as unknown as any[]) || [];

//     const ipmCount = ipmItems.length;
//     const umcCount = umcItems.length;

//      // *** NEW: Calculate Unique Active Company Count (UAC) ***
//     const uacCount = getUniqueActiveCompanyCount(ipmItems);
//     // ********************* Unique Active Company Names **********************************
//     const uacCompanyNames = getUniqueActiveCompanyNames(ipmItems);
//     // *********************

//     // Base styles for the card-like containers
//     const baseCardClass = "flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-md p-1";

//     // Styles for the COUNT when it is > 0 (The RED CIRCLE/BUTTON)
//     const activeCountClass = "min-w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-red-600 transition-colors shadow-red-500/70 shadow-sm p-1.5";
    
//     // Styles for the COUNT when it is 0 (The standard gray text)
//     const inactiveCountClass = "text-sm text-gray-700 font-semibold dark:text-gray-300";

// const renderCount = (count: number, items: any[], type: 'IPM' | 'UMC'|'UAC') => { // <-- RENDERCOUNT NOW ACCEPTS UAC
//         const isActive = count > 0;
//         console.log("ipmItems", type === 'UAC')
//         return (
//             <span
//                 className={isActive ? activeCountClass : inactiveCountClass}
//                 // Call createDialogHandler for all three metric types now
//                 onClick={isActive ? createDialogHandler(user, type as 'IPM'|'UMC'|'UAC', period, type === 'UAC' ? ipmItems : items, count) : undefined} 
//             >
//                 {/* The content is just the count itself */}
//                 {count}
//             </span>
//         );
//     };
    
//     return (
//         <div className="flex flex-col items-stretch justify-center h-full text-sm space-y-1">
//             {/* IPM Card (Total) */}
//             <div className={baseCardClass}>
//                 <span className="text-gray-700 font-medium dark:text-gray-300">Total:</span>
//                 {renderCount(ipmCount, ipmItems, 'IPM')}
//             </div>

//             {/* UMC Card (Unique) */}
//             <div className={baseCardClass}>
//                 <span className="text-gray-700 font-medium dark:text-gray-300">Unique:</span>
//                 {renderCount(umcCount, umcItems, 'UMC')}
//             </div>
//               {/* *** UAC Card (Unique Active Company) - BACK TO DIALOG *** */}
//             <div className={baseCardClass}>
//                 <span className="text-gray-700 font-medium dark:text-gray-300">Active Company:</span>
//                 {renderCount(uacCount, ipmItems, 'UAC')} 
//             </div>
//             {/* ********************************************************* */}


            
//         </div>
//     );
// };
    
//     const BoqCellContent: React.FC<{
//         user: SalesPerformanceMetric;
//         period: 'this_week' | 'last_week' | 'last_30_days';
//     }> = ({ user, period }) => {
//         const boqItems = user[`BOQR_${period}`] || [];
//         const boqCount = boqItems.length;
// console.log("period",period)
//         return (
//             <div className="flex items-center justify-center h-full text-sm">
//                 {boqCount > 0 ? (
//                     <div
//                         className="min-w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-red-600 transition-colors shadow-red-500/70 shadow-sm p-1.5"
//                         onClick={createDialogHandler(user, 'BOQ', period, boqItems, boqCount)}
//                     >
//                         {boqCount} 
//                     </div>
//                 ) : (
//                     <span className="text-gray-700 font-semibold">
//                         {boqCount}
//                     </span>
//                 )}
//             </div>
//         );
//     };


//     if (isLoading) {
//         return (
//             <div className={cn("sales-performance-container overflow-x-auto p-4", className)}>
//                 {/* <h2 className="text-lg font-semibold text-primary mb-4">Sales Performance</h2> */}

//                 <table className="table-auto border-collapse border border-red-500 w-full text-center">
//                     <thead className="bg-white">
//                         <tr>
//                             <th rowSpan={2} className="border border-red-500 px-4 py-2 text-red-700">User</th>
//                             <th colSpan={3} className="border border-red-500 px-4 py-2 text-red-700">In Person Meetings</th>
//                             <th colSpan={3} className="border border-red-500 px-4 py-2 text-red-700">BOQ</th>
//                         </tr>
//                         <tr>
//                             <th className="border border-red-500 px-4 py-2 text-red-700">This Week</th>
//                             <th className="border border-red-500 px-4 py-2 text-red-700">Last Week</th>
//                             <th className="border border-red-500 px-4 py-2 text-red-700">30 Days</th>
//                             <th className="border border-red-500 px-4 py-2 text-red-700">This Week</th>
//                             <th className="border border-red-500 px-4 py-2 text-red-700">Last Week</th>
//                             <th className="border border-red-500 px-4 py-2 text-red-700">30 Days</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {Array.from({ length: 3 }).map((_, i) => (
//                             <tr key={i}>
//                                 <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-24 mx-auto" /></td>
//                                 <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-10 w-24 mx-auto" /></td>
//                                 <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-10 w-24 mx-auto" /></td>
//                                 <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-10 w-24 mx-auto" /></td>
//                                 <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-12 mx-auto" /></td>
//                                 <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-12 mx-auto" /></td>
//                                 <td className="border border-gray-400 px-4 py-2"><Skeleton className="h-4 w-12 mx-auto" /></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <Alert variant="destructive" className={cn("mt-4", className)}>
//                 <Terminal className="h-4 w-4" />
//                 <AlertTitle>Error fetching Sales Performance</AlertTitle>
//                 <AlertDescription>
//                     {error.message || "An unexpected error occurred while loading sales data."}
//                 </AlertDescription>
//             </Alert>
//         );
//     }

//     return (
//         <div className={cn("sales-performance-container overflow-x-auto p-4", className)}>
//             {/* The h2 element for "Sales Performance" is commented out, uncomment and style if needed */}
//             {/* <h2 className="text-lg font-semibold text-red-700 mb-4">Sales Performance</h2> */}
//                         <div className="max-h-[300px] overflow-y-auto">


//             <table className="table-auto border-collapse border rounded-md border-gray-500 w-full text-center">
//                 <thead className="bg-gray-100"> {/* Changed background to white */}
//                     <tr>
//                         <th rowSpan={2} className="border text-primary px-4 py-2 text-red-700">User</th>
//                         <th colSpan={3} className="border text-primary px-4 py-2 text-red-700">In Person Meetings</th>
//                         <th colSpan={3} className="border text-primary px-4 py-2 text-red-700">BOQ</th>
//                     </tr>
//                     <tr>
//                         <th className="border  px-4 py-2 text-primary">This Week</th>
//                         <th className="border  px-4 py-2 text-primary">Last Week</th>
//                         <th className="border  px-4 py-2 text-primary">30 Days</th>
//                         <th className="border  px-4 py-2 text-primary">This Week</th>
//                         <th className="border  px-4 py-2 text-primary">Last Week</th>
//                         <th className="border  px-4 py-2 text-primary">30 Days</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {performanceData.length === 0 ? (
//                         <tr>
//                             <td colSpan={7} className="px-4 py-4 text-center text-gray-500">No sales performance data found.</td>
//                         </tr>
//                     ) : (
//                         performanceData.map((user) => (
//                             <tr key={user.user_name} className="hover:bg-gray-50">
//                                 <td className="border  px-4 py-2 align-middle text-left"> {/* Left align user name */}
//                                     <TooltipProvider>
//                                         <Tooltip>
//                                             <TooltipTrigger asChild>
//                                                 <Link to={`/team?memberId=${user.email}`} className="text-primary hover:underline font-semibold">
//                                                     {user.full_name}
//                                                 </Link>
//                                             </TooltipTrigger>
//                                             <TooltipContent>
//                                                 <p>{user.email}</p>
//                                             </TooltipContent>
//                                         </Tooltip>
//                                     </TooltipProvider>
//                                 </td>

//                                 {/* Meetings Columns */}
//                                 <td className="border  px-4 py-2 align-middle">
//                                     <MeetingsCellContent user={user} period="this_week" />
//                                 </td>
//                                 <td className="border  px-4 py-2 align-middle">
//                                     <MeetingsCellContent user={user} period="last_week" />
//                                 </td>
//                                 <td className="border  px-4 py-2 align-middle">
//                                     <MeetingsCellContent user={user} period="last_30_days" />
//                                 </td>

//                                 {/* BOQ Columns */}
//                                 <td className="border  px-4 py-2 align-middle">
//                                     <BoqCellContent user={user} period="this_week" />
//                                 </td>
//                                 <td className="border  px-4 py-2 align-middle">
//                                     <BoqCellContent user={user} period="last_week" />
//                                 </td>
//                                 <td className="border  px-4 py-2 align-middle">
//                                     <BoqCellContent user={user} period="last_30_days" />
//                                 </td>
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//             </table>
//             </div>
//         </div>
//     );
// };

// export default SalesPerformanceTable;


