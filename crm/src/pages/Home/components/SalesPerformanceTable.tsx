
// src/pages/Home/SalesPerformanceTable.tsx
import React from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ChevronRight } from "lucide-react"; // Import ChevronRight
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, Navigate, useNavigate } from 'react-router-dom';

// --- Imports from StatsGrid.tsx for dialog functionality ---
import { useDialogStore, StatItem } from "@/store/dialogStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // For BOQ dialog item
import { useStatusStyles } from "@/hooks/useStatusStyles"; // For BOQ status styling
import { formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate"; // For date formatting
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon"; // For task status icon
// --- End Imports from StatsGrid.tsx ---


// Define the interface for your API response data
interface FrappeDoc {
    name: string;
    // Common fields for tasks
    type?: string;
    start_date?: string;
    status?: string;
    task_profile?: string;
    remarks?: string;
    // Common fields for BOQs
    boq_status?: string;
    creation?: string;
    boq?: string;
    // Fields for taskNameFormatter for linked docs
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
    company?: string;
    [key: string]: any; // Allows for additional dynamic properties
}

interface SalesPerformanceMetric {
    user_name: string;
    full_name: string;
    IPM_this_week: FrappeDoc[];
    IPM_last_week: FrappeDoc[];
    IPM_last_30_days: FrappeDoc[];
    BOQR_this_week: FrappeDoc[];
    BOQR_last_week: FrappeDoc[];
    BOQR_last_30_days: FrappeDoc[];
}

interface SalesPerformanceTableProps {
    className?: string;
}

// --- Re-usable formatters from StatsGrid.tsx ---
const getBoqStatusClass = useStatusStyles("boq"); // Instantiate outside render for performance
const getTaskStatusClass = useStatusStyles("task"); // Instantiate outside render for performance

const boqNameFormatter = (item: FrappeDoc) => (
    <Card className="w-full">
        <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base font-bold text-primary truncate" title={item.name}>
                {item.name}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0 flex justify-between items-center text-xs">
            <div>
                <span className={`font-semibold px-2 py-1 rounded-full border ${getBoqStatusClass(item.boq_status || '')}`}>
                    {item.boq_status || 'N/A'}
                </span>
            </div>
            <div className="text-muted-foreground font-medium border p-2">
                <span>Received on</span><br></br>
                {formatDateWithOrdinal(item.creation || '')}
            </div>
        </CardContent>
    </Card>
);

const taskNameFormatter = (item: FrappeDoc) => (
    <div className="flex p-1 items-start space-x-2">
        <TaskStatusIcon status={item.status || 'Open'} className="flex-shrink-0 mt-1" /> {/* Adjusted margin-top */}
                <div className="flex flex-col flex-grow"> {/* Use flex-col for stacked content */}
                    {item.task_profile === "Sales" ? (
                        // Sales Profile rendering
                        <span>
                            <span className="font-semibold">{item?.type || 'Task'}</span> with <span className="font-semibold">{item.first_name || '--'}</span>{" "}from  {item.company || '--'} {" "}<span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
                                                                                        Scheduled for: {formatDateWithOrdinal(item.start_date)}
                                                                                    </span>
                        </span>
                    ) : (
                        // Non-Sales Profile rendering
                        <span>
                            <span className="font-semibold">{item?.type || 'Task'}</span> for  <span className="font-semibold">{item?.boq || '--'}</span> {" "}<span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
                                                                                        Scheduled for: {formatDateWithOrdinal(item.start_date)}
                                                                                    </span>
                        </span>
                    )}
                    
                </div>
            {/* {item.remarks && (
                <span className="inline-block text-xs text-muted-foreground rounded-md py-0.5 mt-1 self-start">
                    Remarks: {item.remarks}
                </span>
            )}
            {item.start_date && (
                <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 self-start">
                    Scheduled for: {formatDateWithOrdinal(item.start_date)}
                </span>
            )} */}
        {/* </div> */}
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 mt-1" />
    </div>
);


const formatItemsForDialog = (data: FrappeDoc[], nameFormatter: (item: FrappeDoc) => React.ReactNode, type: 'Task' | 'BOQ'): StatItem[] => {
    return data.map(item => ({
        name: nameFormatter(item), // The display name for the list
        id: item.name,             // The unique document ID for navigation
        type: type,                // The document type ('Task' or 'BOQ')
        data: item                 // The full original object
    }));
};
// --- End Re-usable formatters ---


export const SalesPerformanceTable: React.FC<SalesPerformanceTableProps> = ({ className }) => {
    const { openStatsDetailDialog } = useDialogStore(); // Get the dialog store function

    const { data, isLoading, error } = useFrappeGetCall<SalesPerformanceMetric[]>(
        "nirmaan_crm.api.users.get_sales_performance.get_sales_performance_metrics",
        []
    );

    const navigate=useNavigate()

    const performanceData = data?.message || [];

    // const renderTooltipContent = (items: FrappeDoc[], isBOQ = false) => {
    //     if (!items || items.length === 0) {
    //         return <span className="text-gray-500 dark:text-gray-400">No items to display.</span>;
    //     }
    //     return ( // Simplified as both paths were the same
    //         <div className="max-w-[220px] text-wrap break-words">
    //             <ol className="p-1 m-1  rounded-md list-disc">
    //                 {items.map((item, i) => (
    //                     <li key={i}>
    //                         <Link to={`/${isBOQ ? 'boqs/boq' : 'tasks/task'}?id=${item.name}`} className="block border-gray-300 font-semibold hover:underline">
    //                             {item.name}
    //                         </Link>
    //                     </li>
    //                 ))}
    //             </ol>
    //         </div>
    //     );
    // };
    const renderMetricCell = (items: FrappeDoc[], isBOQ: boolean, title: string) => {
        const count = items.length;

        // Extract date_from and date_to from the first item if available
       
        if (count === 0) {
            return <div
                className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-sm font-semibold cursor-pointer mx-auto shadow-sm hover:bg-red-700 transition-colors duration-200"
               
            >
                {count}
            </div>
        }

       
       
        const handleCellClick = () => {
            if (count > 0) {
                  const date_range=`${items?.[0]?.date_to
} to ${items?.[0]?.date_from} `
                const formattedItems = formatItemsForDialog(
                    items,
                    isBOQ ? boqNameFormatter : taskNameFormatter, // Use appropriate formatter
                    isBOQ ? 'BOQ' : 'Task' // Use appropriate type
                );
                openStatsDetailDialog({
                    // title: `${title} (${date_range ||"--"})`,
                    title: (
    <div className="flex flex-col">
      <span>{title}</span>
      <span className="text-xs text-muted-foreground font-normal">
        ({date_range || "--"})
      </span>
    </div>
  ),

                    items: formattedItems,
                });
            }
        };

        const countElement = (
            <div
                className="flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-sm font-semibold cursor-pointer mx-auto shadow-sm hover:bg-red-700 transition-colors duration-200"
                onClick={handleCellClick}
            >
                {count}
            </div>
        );

        
            // If it's NOT a BOQ, render just the clickable count element
        return countElement;
        
    };

    if (isLoading) {
        return (
            <div className={cn("sales-performance-container p-4 rounded-lg bg-card text-card-foreground shadow-sm", className)}>
                <h2 className="text-lg font-semibold  mb-4">Sales Performance</h2>
                <div className="rounded-lg border bg-background dark:bg-gray-900">
                    <div className="overflow-hidden">
                        <table className="min-w-full table-fixed">
                            <thead>
                                <tr className="bg-gray-100 text-gray-800 text-sm">
                                    <th rowSpan={2} className="px-4 py-2 text-left w-[150px]">Sales User</th>
                                    <th colSpan={3} className="px-4 py-2 text-center border-b border-red-600">In Person Meetings</th>
                                    <th colSpan={3} className="px-4 py-2 text-center border-b border-red-600">BOQ Received</th>
                                </tr>
                                <tr className="bg-gray-100 text-gray-700 text-xs">
                                    <th className="px-3 py-2 text-center border-r border-gray-300">This Week</th>
                                    <th className="px-3 py-2 text-center border-r border-gray-300">Last Week</th>
                                    <th className="px-3 py-2 text-center">Last 30 Days</th>
                                    <th className="px-3 py-2 text-center border-r border-gray-300">This Week</th>
                                    <th className="px-3 py-2 text-center border-r border-gray-300">Last Week</th>
                                    <th className="px-3 py-2 text-center">Last 30 Days</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                    <div className="max-h-[270px] overflow-y-auto">
                        <table className="min-w-full table-fixed">
                            <tbody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                        <td className="px-4 py-3 w-[150px]"><Skeleton className="h-4 w-[120px]" /></td>
                                        <td className="px-3 py-3 text-center"><Skeleton className="h-4 w-[40px] mx-auto" /></td>
                                        <td className="px-3 py-3 text-center"><Skeleton className="h-4 w-[40px] mx-auto" /></td>
                                        <td className="px-3 py-3 text-center"><Skeleton className="h-4 w-[40px] mx-auto" /></td>
                                        <td className="px-3 py-3 text-center"><Skeleton className="h-4 w-[40px] mx-auto" /></td>
                                        <td className="px-3 py-3 text-center"><Skeleton className="h-4 w-[40px] mx-auto" /></td>
                                        <td className="px-3 py-3 text-center"><Skeleton className="h-4 w-[40px] mx-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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
        <div className={cn("sales-performance-container p-4 rounded-lg bg-card text-card-foreground border-2 shadow-sm", className)}>
            <h2 className="text-lg font-semibold mb-4 text-destructive">Sales Performance</h2>
            <div className="rounded-lg border bg-background dark:bg-gray-900 max-h-[270px] overflow-y-auto">
                <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 rounded-t-lg"> {/* To contain the rounded corners */}
                    <table className="min-w-full table-fixed">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800 text-sm">
                                <th rowSpan={2} className="px-4 py-2 text-left border-r w-[150px]">Sales User</th>
                                <th colSpan={3} className="px-4 py-2 border-b border-r text-center   border-red-600 dark:border-red-500">In Person Meetings</th>
                                <th colSpan={3} className="px-4 py-2 text-center  border-b  border-red-600 dark:border-red-500">BOQ Received</th>
                            </tr>
                            <tr className="bg-gray-100 text-gray-700 text-xs">
                                <th className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">This Week</th>
                                <th className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">Last Week</th>
                                <th className="px-3 py-2 text-center border-r">Last 30 Days</th>
                                <th className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">This Week</th>
                                <th className="px-3 py-2 text-center border-r border-gray-300 dark:border-gray-600">Last Week</th>
                                <th className="px-3 py-2 text-center">Last 30 Days</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                    <table className="min-w-full table-fixed">
                        <tbody>
                            {performanceData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No sales performance data found.</td>
                                </tr>
                            ) : (
                                performanceData?.map((user) => (
                                    <tr key={user.user_name} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-150" >
                                        <td className="px-4 py-3 text-left font-medium border-r text-primary hover:underline dark:text-red-100 w-[150px] font-semibold hover:underline" data-label="Sales User" onClick={()=>navigate(`/team?memberId=${user.email}`)}>
                                            {/* {user.full_name}
                                             */}
                                             <Link to={`/team?memberId=${user.email}`} className="text-primary hover:underline">{user.full_name}</Link>
                                            </td>
                                        <td className="px-3 py-3 text-center" data-label="IPM This Week">{renderMetricCell(user.IPM_this_week, false, `${user.full_name} - IPM This Week`)}</td>
                                        <td className="px-3 py-3 text-center" data-label="IPM Last Week">{renderMetricCell(user.IPM_last_week, false, `${user.full_name} - IPM Last Week`)}</td>
                                        <td className="px-3 py-3 text-center border-r" data-label="IPM Last 30 Days">{renderMetricCell(user.IPM_last_30_days, false, `${user.full_name} - IPM Last 30 Days`)}</td>
                                        <td className="px-3 py-3 text-center" data-label="BOQR This Week">{renderMetricCell(user.BOQR_this_week, true, `${user.full_name} - BOQ Received This Week`)}</td>
                                        <td className="px-3 py-3 text-center" data-label="BOQR Last Week">{renderMetricCell(user.BOQR_last_week, true, `${user.full_name} - BOQ Received Last Week`)}</td>
                                        <td className="px-3 py-3 text-center" data-label="BOQR Last 30 Days">{renderMetricCell(user.BOQR_last_30_days, true, `${user.full_name} - BOQ Received Last 30 Days`)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View - Simplified Card Layout (Unchanged from previous version for consistency) */}
            {/* <div className="md:hidden mt-6 space-y-4">
                <h2 className="text-xl font-semibold text-destructive mb-4">Sales Performance Overview</h2>
                {performanceData.length === 0 ? (
                    <p className="p-4 text-center text-gray-500 dark:text-gray-400">No sales performance data found.</p>
                ) : (
                    performanceData.map((user, index) => (
                        <div key={user.user_name} className="bg-card dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 border-b pb-2 border-red-400">
                                {user.full_name}
                            </h3>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                <div className="font-medium text-gray-700 dark:text-gray-300">IPM (This Week):</div>
                                <div className="text-right">{renderMetricCell(user.IPM_this_week, false, `${user.full_name} - IPM This Week`)}</div>

                                <div className="font-medium text-gray-700 dark:text-gray-300">IPM (Last Week):</div>
                                <div className="text-right">{renderMetricCell(user.IPM_last_week, false, `${user.full_name} - IPM Last Week`)}</div>

                                <div className="font-medium text-gray-700 dark:text-gray-300">IPM (Last 30 Days):</div>
                                <div className="text-right">{renderMetricCell(user.IPM_last_30_days, false, `${user.full_name} - IPM Last 30 Days`)}</div>

                                <div className="font-medium text-gray-700 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">BOQR (This Week):</div>
                                <div className="text-right pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">{renderMetricCell(user.BOQR_this_week, true, `${user.full_name} - BOQ Received This Week`)}</div>

                                <div className="font-medium text-gray-700 dark:text-gray-300">BOQR (Last Week):</div>
                                <div className="text-right">{renderMetricCell(user.BOQR_last_week, true, `${user.full_name} - BOQ Received Last Week`)}</div>

                                <div className="font-medium text-gray-700 dark:text-gray-300">BOQR (Last 30 Days):</div>
                                <div className="text-right">{renderMetricCell(user.BOQR_last_30_days, true, `${user.full_name} - BOQ Received Last 30 Days`)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div> */}
        </div>
    );
};