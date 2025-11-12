import React, { useState } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
// Assuming all these imports from your component library are correct
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateWithOrdinal } from "@/utils/FormatDate"; 

// --- Interfaces ---
interface CompanyReportRow {
    company_name: string;
    last_meeting_status: 'YES' | 'NO';
    last_meeting_date: string | null;
    next_meeting_status: 'YES' | 'NO';
    next_meeting_date: string | null;
}

interface UserReportGroup {
    user_full_name: string;
    companies: CompanyReportRow[];
}

interface ExceptionReportForCompaniesProps {
    className?: string;
}

/**
 * Renders an exception report for companies, grouped by user, with collapsible sections
 * and sticky headers.
 */
export const ExceptionReportForCompanies = ({ className }: ExceptionReportForCompaniesProps) => {
    
    // Call the custom API method
    const { 
        data, 
        isLoading, 
        error 
    } = useFrappeGetCall<UserReportGroup[]>(
        "nirmaan_crm.api.users.get__exception_data.get_company_exception_report",
        {}
    );

    // State to manage which user groups are open (store index)
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0])); // Start with the first group open

    const toggleGroup = (index: number) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // --- Loading, Error, and Empty State Handling ---

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <span className="text-muted-foreground ml-2">Loading Exception Report...</span>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500 border border-red-200 rounded-md bg-red-50">Error loading report: **{error.message}**</div>;
    }

    const reportGroups = data?.message || []; 

    if (reportGroups.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground border rounded-lg bg-white shadow-sm">
                No relevant **Company/Task** data found for Sales Users.
            </div>
        );
    }

    // Define the sticky top positions
    // User row sticks below the main table header
    const USER_STICKY_CLASS = "sticky top-[50px] z-10 shadow-sm"; 
    // Main header sticks to the very top
    const HEADER_STICKY_CLASS = "sticky top-[0px] z-20";

    // --- Main Component Render ---

    return (
        <TooltipProvider> 
            <div className={cn("overflow-x-auto border rounded-lg", className)}>
                {/* Fixed height and scrollable area */}
                <div className="max-h-[500px] overflow-y-auto"> 
                    <Table className="w-full">
                        
                        {/* 1. MAIN FIXED HEADER (Sticky at top: 0) */}
                        <TableHeader className={cn("bg-gray-100")}> 
                            <TableRow className="bg-gray-100">
                                <TableHead className="w-[150px] border-r border-b text-primary px-4 py-2 font-bold text-red-700">User</TableHead>
                                <TableHead className="w-[200px] border-r border-b text-primary px-4 py-2 font-bold text-red-700">Company</TableHead>
                                <TableHead className="text-center border-r border-b text-primary px-4 py-2 font-bold text-red-700">Meeting Done in Last Week</TableHead>
                                <TableHead className="text-center border-b text-primary px-4 py-2 font-bold text-red-700">Scheduled for Next 2 Weeks</TableHead>
                            </TableRow>
                        </TableHeader>

                        {/* 2. MULTIPLE TBODY FOR COLLAPSIBLE GROUPS */}
                        {reportGroups.map((group, groupIndex) => {
                            const isExpanded = expandedGroups.has(groupIndex);
                            const Icon = isExpanded ? ChevronDown : ChevronRight;

                            return (
                                <tbody key={`group-body-${groupIndex}`} className="border-t border-primary/20"> 
                                    
                                    {/* 2a. COLLAPSIBLE USER HEADER ROW (Sticky at top: 50px) */}
                                    <TableRow 
                                        onClick={() => toggleGroup(groupIndex)}
                                        className={cn(
                                            "bg-muted/70 border-b border-primary/20 font-bold hover:bg-muted/80 cursor-pointer transition-colors",
                                            USER_STICKY_CLASS // Apply the calculated sticky class
                                        )}
                                        // Ensure the key is on the outermost element of the map
                                    > 
                                        <TableCell colSpan={4} className="text-sm py-2 text-primary font-bold">
                                            <div className="flex items-center space-x-2">
                                                <Icon className="w-4 h-4 text-red-500" />
                                                <span className="text-red-600">{group.user_full_name}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* 2b. COMPANY ROWS (CONDITIONAL RENDERING) */}
                                    {isExpanded && group.companies.length > 0 ? (
                                        group.companies.map((row, rowIndex) => (
                                            <TableRow 
                                                key={`company-${groupIndex}-${rowIndex}`} 
                                                className="hover:bg-gray-50 border-b border-gray-100"
                                            >
                                                {/* Empty Cell for User Column - ensures column alignment */}
                                                <TableCell className="w-[150px] border-r"></TableCell> 
                                                
                                                {/* Company Name Cell */}
                                                <TableCell className="font-medium text-xs w-[200px] border-r">
                                                    {row.company_name}
                                                </TableCell>
                                                
                                                {/* --- LAST MEETING CELL --- */}
                                                <TableCell className="text-center text-xs border-r">
                                                    <MeetingStatusCell 
                                                        status={row.last_meeting_status} 
                                                        date={row.last_meeting_date}
                                                        tooltipTitle="Last Meeting Done"
                                                    />
                                                </TableCell>
                                                
                                                {/* --- NEXT MEETING CELL --- */}
                                                <TableCell className="text-center text-xs">
                                                    <MeetingStatusCell 
                                                        status={row.next_meeting_status} 
                                                        date={row.next_meeting_date}
                                                        tooltipTitle="Next Meeting Scheduled"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : isExpanded && group.companies.length === 0 ? (
                                        <TableRow key={`no-companies-${groupIndex}`}>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground italic text-xs py-3 bg-white">
                                                No company meeting data found for this user in the current window.
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </tbody>
                            );
                        })}
                    </Table>
                </div>
            </div>
        </TooltipProvider>
    );
};

// --- Helper Component for Status/Date Tooltip ---
interface MeetingStatusCellProps {
    status: 'YES' | 'NO';
    date: string | null;
    tooltipTitle: string;
}

const MeetingStatusCell: React.FC<MeetingStatusCellProps> = ({ status, date, tooltipTitle }) => {
    const isYes = status === 'YES';
    
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className={cn(
                    isYes 
                        ? 'text-green-600 font-bold cursor-pointer underline decoration-dotted'
                        : 'text-red-600 font-bold' 
                )}>
                    {status}
                </span>
            </TooltipTrigger>
            {isYes && date && (
                <TooltipContent className="bg-primary text-primary-foreground border-primary text-xs p-2 rounded-lg shadow-lg">
                    <p className="font-medium">{tooltipTitle}:</p>
                    <p>{formatDateWithOrdinal(date)}</p>
                </TooltipContent>
            )}
        </Tooltip>
    );
};

// import React, { useState } from "react";
// import { useFrappeGetCall } from "frappe-react-sdk";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Loader2, ChevronDown, ChevronRight } from "lucide-react"; // Import Chevron icons
// import { cn } from "@/lib/utils";
// // Removed CollapsibleSection import

// // Define the interface for a single company row
// interface CompanyReportRow {
//     company_name: string;
//     last_meeting_status: 'YES' | 'NO';
//     last_meeting_date: string | null;
//     next_meeting_status: 'YES' | 'NO';
//     next_meeting_date: string | null;
// }

// // Define the interface for the grouped user structure
// interface UserReportGroup {
//     user_full_name: string;
//     companies: CompanyReportRow[];
// }

// interface ExceptionReportForCompaniesProps {
//     className?: string;
// }

// export const ExceptionReportForCompanies = ({ className }: ExceptionReportForCompaniesProps) => {
//     // Call the custom API method
//     const { data, isLoading, error } = useFrappeGetCall<UserReportGroup[]>(
//         "nirmaan_crm.api.users.get__exception_data.get_company_exception_report",
//         {}
//     );

//     // State to manage which user groups are open (store user_full_name or index)
//     const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0])); // Start with the first group open

//     const toggleGroup = (index: number) => {
//         setExpandedGroups(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(index)) {
//                 newSet.delete(index);
//             } else {
//                 newSet.add(index);
//             }
//             return newSet;
//         });
//     };

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center p-8">
//                 <Loader2 className="mr-2 h-6 w-6 animate-spin" />
//                 <span className="text-muted-foreground">Loading Exception Report...</span>
//             </div>
//         );
//     }

//     if (error) {
//         return <div className="p-4 text-red-500 border border-red-200 rounded-md">Error loading report: {error.message}</div>;
//     }

//     const reportGroups = data?.message || []; 

//     if (reportGroups.length === 0) {
//         return (
//             <div className="p-4 text-center text-muted-foreground border rounded-lg">
//                 No relevant Company/Task data found for Sales Users.
//             </div>
//         );
//     }

//     return (
//         <div className={cn("overflow-x-auto border rounded-lg", className)}>
//             {/* Added max-height and overflow-y for scrollability */}
//             <div className="max-h-[350px] overflow-y-auto"> 
//                 <Table className="w-full">
//                     {/* FIXED HEADER */}
//                     <TableHeader className="bg-gray-100 sticky top-0 z-10"> 
//                         <TableRow className="bg-gray-100">
//                             <TableHead className="w-[150px] border-r border-b text-primary px-4 py-2 font-bold text-red-700">User</TableHead>
//                             <TableHead className="w-[200px] border-r border-b text-primary px-4 py-2 font-bold text-red-700">Company</TableHead>
//                             <TableHead className="text-center border-r border-b text-primary px-4 py-2 font-bold text-red-700">Meeting Done in Last Week</TableHead>
//                             <TableHead className="text-center border-b text-primary px-4 py-2 font-bold text-red-700">Scheduled for Next 2 Weeks</TableHead>
//                         </TableRow>
//                     </TableHeader>

//                     <TableBody>
//                         {reportGroups.map((group, groupIndex) => {
//                             const isExpanded = expandedGroups.has(groupIndex);
//                             const Icon = isExpanded ? ChevronDown : ChevronRight;

//                             return (
//                                 <React.Fragment key={`group-${groupIndex}`}>
//                                     {/* 1. COLLAPSIBLE USER HEADER ROW */}
//                                     <TableRow 
//                                         onClick={() => toggleGroup(groupIndex)}
//                                         className="bg-muted/50 border-t border-b border-primary/20 font-bold hover:bg-muted/70 cursor-pointer transition-colors"
//                                     > 
//                                         <TableCell colSpan={4} className="text-sm py-2 text-primary font-bold">
//                                             <div className="flex items-center space-x-2">
//                                                 <Icon className="w-4 h-4 text-red-700" />
//                                                 <span>{group.user_full_name}</span>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>

//                                     {/* 2. COMPANY ROWS (CONDITIONAL RENDERING) */}
//                                     {isExpanded && group.companies.length > 0 ? (
//                                         group.companies.map((row, rowIndex) => (
//                                             <TableRow key={`company-${groupIndex}-${rowIndex}`} className="hover:bg-gray-50">
//                                                 {/* Empty Cell for User Column */}
//                                                 <TableCell className="w-[150px] border-r"></TableCell> 
                                                
//                                                 {/* Company Name Cell */}
//                                                 <TableCell className="font-semibold text-xs w-[200px] border-r">
//                                                     {row.company_name}
//                                                 </TableCell>
                                                
//                                                 <TableCell className="text-center text-xs border-r">
//                                                     <span className={cn(
//                                                         row.last_meeting_status === 'NO' ? 'text-red-600 font-bold' : 'text-green-600'
//                                                     )}>
//                                                         {row.last_meeting_status}
//                                                     </span>
//                                                     {row.last_meeting_date && (
//                                                         <div className="text-muted-foreground text-[10px] whitespace-nowrap">({row.last_meeting_date})</div>
//                                                     )}
//                                                 </TableCell>
//                                                 <TableCell className="text-center text-xs">
//                                                     <span className={cn(
//                                                         row.next_meeting_status === 'NO' ? 'text-red-600 font-bold' : 'text-green-600'
//                                                     )}>
//                                                         {row.next_meeting_status}
//                                                     </span>
//                                                     {row.next_meeting_date && (
//                                                         <div className="text-muted-foreground text-[10px] whitespace-nowrap">({row.next_meeting_date})</div>
//                                                     )}
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))
//                                     ) : isExpanded && group.companies.length === 0 ? (
//                                         <TableRow>
//                                             <TableCell colSpan={4} className="text-center text-muted-foreground italic text-xs py-2">
//                                                 No company meeting data found for this user in the current window.
//                                             </TableCell>
//                                         </TableRow>
//                                     ) : null}
//                                 </React.Fragment>
//                             );
//                         })}
                        
//                         {/* Final check for no data if reportGroups is empty */}
//                         {reportGroups.length === 0 && (
//                             <TableRow>
//                                 <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
//                                     No relevant Company/Task data found for Sales Users.
//                                 </TableCell>
//                             </TableRow>
//                         )}
//                     </TableBody>
//                 </Table>
//             </div>
//         </div>
//     );
// };
