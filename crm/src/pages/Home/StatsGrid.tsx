// src/pages/Home/StatsGrid.tsx
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useState, useMemo } from "react";
import { subDays, format } from 'date-fns';
import { StatItem } from "@/store/dialogStore";
import { FilterControls } from "@/components/ui/FilterControls";


// StatCard component (no changes needed here)
interface StatCardProps {
    title: string;
    value: number | string;
    isLoading?: boolean;
    onClick: () => void;
}

export const StatCard = ({ title, value, isLoading = false, onClick }: StatCardProps) => {
    return (
        <div
            onClick={onClick}
            className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer transition-transform hover:scale-105"
        >
            <p className="text-2xl font-bold">
                {isLoading ? "..." : String(value).padStart(2, '0')}
            </p>
            <p className="text-sm">{title}</p>
        </div>
    );
};

export const StatsGrid = () => {
    const { openDateRangePickerDialog, openStatsDetailDialog } = useDialogStore();
    const [dateRange, setDateRange] = useState({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
    });

    const { data: allTasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
        fields: ["name", "type", "start_date", "status", "contact", "company", "contact.first_name", "contact.last_name", "company.company_name", "modified"],
        filters: [
            ["start_date", "between", [dateRange.from, dateRange.to]]
        ],
        limit: 1000
    });

    const { data: allBoqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
        fields: ["name", "boq_status", "company", "creation", "modified"],
        filters: [
            ["creation", "between", [dateRange.from, dateRange.to]]
        ],
        limit: 1000
    });

    const statsData = useMemo(() => {
        if (!allTasks || !allBoqs) return null;

        // UPDATED: formatItems now accepts a `type` and adds it to the returned object
        const formatItems = (data: any[], nameFormatter: (item: any) => string, type: 'Task' | 'BOQ'): StatItem[] => {
            return data.map(item => ({
                name: nameFormatter(item), // The display name for the list
                id: item.name,             // The unique document ID for navigation
                type: type,                // The document type ('Task' or 'BOQ')
                data: item                 // The full original object
            }));
        };

        const pendingTasks = allTasks.filter(t => t.status === "Scheduled")     
        const boqReceived = allBoqs.filter(b => b.boq_status === "New");
        const boqSent = allBoqs.filter(b => ["Submitted", "Revision Submitted"].includes(b.boq_status));
        const pendingBoq = allBoqs.filter(b => ["New", "Revision Pending", "In Progress"].includes(b.boq_status));
        const hotDeals = allBoqs.filter(b => ["Revision Submitted", "Negotiation"].includes(b.boq_status));
        const allMeetings = allTasks.filter(t => ["Follow-Up", "In-Person", "Call", "Virtual"].includes(t.type));

        // CORRECTED: Use the unique link fields `contact` and `company` for a reliable identifier
        const uniqueMeetingIdentifiers = new Set();
        const uniqueMeetings = allMeetings.filter(t => {
            const identifier = `${t.contact}-${t.company}`; // e.g., "CNT-0001-CMP-0002"
            if (!uniqueMeetingIdentifiers.has(identifier)) {
                uniqueMeetingIdentifiers.add(identifier);
                return true;
            }
            return false;
        });
        
        // CORRECTED: Access linked fields using bracket notation, e.g., item['contact.first_name']
        const taskNameFormatter = (item) => `Meeting with ${item.first_name || ''} from ${item.company_name || ''} on ${format(new Date(item.start_date), 'dd-MMM-yyyy')}`;
        const boqNameFormatter = (item) => `Project Name - ${item.name || item.name}`;

        return {
            pendingTasks: {
                count: pendingTasks.length,
                items: formatItems(pendingTasks, taskNameFormatter, 'Task')
            },
            boqReceived: {
                count: boqReceived.length,
                items: formatItems(boqReceived, boqNameFormatter, 'BOQ')
            },
            boqSent: {
                count: boqSent.length,
                items: formatItems(boqSent, boqNameFormatter, 'BOQ')
            },
            pendingBoq: {
                count: pendingBoq.length,
                items: formatItems(pendingBoq, boqNameFormatter, 'BOQ')
            },
            hotDeals: {
                count: hotDeals.length,
                items: formatItems(hotDeals, boqNameFormatter, 'BOQ')
            },
            totalMeetings: {
                count: allMeetings.length,
                items: formatItems(allMeetings, taskNameFormatter, 'Task')
            },
            uniqueMeetings: {
                count: uniqueMeetings.length,
                items: formatItems(uniqueMeetings, taskNameFormatter, 'Task')
            }
        };

    }, [allTasks, allBoqs]);

    const isLoading = tasksLoading || boqsLoading;

    const statCards = [
        { title: "Pending Task", data: statsData?.pendingTasks },
        { title: "BOQ Received", data: statsData?.boqReceived },
        { title: "BOQ Sent", data: statsData?.boqSent },
        { title: "Unique Meetings", data: statsData?.uniqueMeetings },
        { title: "Total Meetings", data: statsData?.totalMeetings },
        { title: "Pending BOQ", data: statsData?.pendingBoq },
        { title: "Hot Deals", data: statsData?.hotDeals },
    ];

    return (
        <div className="space-y-3">
               <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange}/>
            {/* <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Date filter:</p>
                <div className="flex items-center border rounded-md overflow-hidden">
                    <Button variant="ghost" className="bg-gray-800 text-white rounded-none h-8 text-xs">
                        Last 30 days
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-muted-foreground rounded-none h-8 border-l text-xs"
                        onClick={handleSelectRange}
                    >
                        Select range
                    </Button>
                </div>
            </div> */}
            <div className="grid grid-cols-2 gap-3">
                {statCards.map(card => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.data?.count ?? 0}
                        isLoading={isLoading}
                        onClick={() => {
                            if (card.data) {
                                openStatsDetailDialog({
                                    title: card.title,
                                    items: card.data.items,
                                });
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};


// import { Button } from "@/components/ui/button";
// import { useDialogStore } from "@/store/dialogStore";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import React, { useState, useMemo } from "react";
// import { subDays, format } from 'date-fns';
// import { StatItem } from "@/store/dialogStore"; // Import the type

// // StatCard component remains the same, but we will no longer use the `path` prop.
// // Make sure it's defined in this file or imported correctly.
// interface StatCardProps {
//     title: string;
//     value: number | string;
//     isLoading?: boolean;
//     onClick: () => void; // We'll use a direct onClick handler
// }

// export const StatCard = ({ title, value, isLoading = false, onClick }: StatCardProps) => {
//     return (
//         <div
//             onClick={onClick}
//             className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer transition-transform hover:scale-105"
//         >
//             <p className="text-2xl font-bold">
//                 {isLoading ? "..." : String(value).padStart(2, '0')}
//             </p>
//             <p className="text-sm">{title}</p>
//         </div>
//     );
// };


// export const StatsGrid = () => {
//     const { openDateRangePickerDialog, openStatsDetailDialog } = useDialogStore();
//     const [dateRange, setDateRange] = useState({
//         from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
//         to: format(new Date(), 'yyyy-MM-dd'),
//     });

//     // --- 1. CENTRALIZED DATA FETCHING ---
//     // Fetch all tasks in the date range. Get all fields needed for filtering and display.
//     const { data: allTasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
//          fields: ["name", "type", "start_date", "time", "status", "contact", "company", "boq", "contact.first_name", "contact.last_name", "company.company_name","creation"],
//         filters: [
//             ["start_date", "between", [dateRange.from, dateRange.to]]
//         ],
//         limit: 1000
//     });

//     // Fetch all BOQs in the date range. Get all fields needed for filtering and display.
//     const { data: allBoqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
//         fields: ["name", "boq_status","company", "creation", "modified"],
//         filters: [
//             ["creation", "between", [dateRange.from, dateRange.to]]
//         ],
//         limit: 1000
//     });


//     // --- 2. CLIENT-SIDE FILTERING WITH useMemo for PERFORMANCE ---
//     const statsData = useMemo(() => {
//         if (!allTasks || !allBoqs) return null;

//         // Helper to format items for the dialog
//         const formatItems = (data: any[], nameFormatter: (item: any) => string): StatItem[] => {
//             return data.map(item => ({ name: nameFormatter(item), data: item }));
//         };
        
//         // --- Filter Logic ---
//         const pendingTasks = allTasks.filter(t => t.status === "Scheduled")
//                                     .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
//                                     .slice(0, 5);
                                    
//         const boqReceived = allBoqs.filter(b => b.boq_status === "New");
        
//         const boqSent = allBoqs.filter(b => ["Submitted", "Revision Submitted"].includes(b.boq_status));

//         const pendingBoq = allBoqs.filter(b => ["New", "Revision Pending", "In Progress"].includes(b.boq_status));

//         const hotDeals = allBoqs.filter(b => ["Revision Submitted", "Negotiation"].includes(b.boq_status));

//         const allMeetings = allTasks.filter(t => ["Follow-Up", "In-Person", "Call", "Virtual"].includes(t.type));
        
//         // For unique meetings, we create a Set of a unique identifier (e.g., contact + company)
//         const uniqueMeetingIdentifiers = new Set();
//         const uniqueMeetings = allMeetings.filter(t => {
//             const identifier = `${t.contact_name}-${t.company_name}`;
//             if (!uniqueMeetingIdentifiers.has(identifier)) {
//                 uniqueMeetingIdentifiers.add(identifier);
//                 return true;
//             }
//             return false;
//         });

//         return {
//             pendingTasks: {
//                 count: pendingTasks.length,
//                 items: formatItems(pendingTasks, item => `Meeting with ${item.first_name} from ${item.company_name} on ${format(new Date(item.start_date), 'dd-MMM-yyyy')}`)
//             },
//             boqReceived: {
//                 count: boqReceived.length,
//                 items: formatItems(boqReceived, item => `Project Name - ${item.name}`)
//             },
//             boqSent: {
//                 count: boqSent.length,
//                 items: formatItems(boqSent, item => `Project Name - ${item.name}`)
//             },
//             pendingBoq: {
//                 count: pendingBoq.length,
//                 items: formatItems(pendingBoq, item => `BOQ Name - ${item.name}`)
//             },
//             hotDeals: {
//                 count: hotDeals.length,
//                 items: formatItems(hotDeals, item => `Project Name - ${item.name}`)
//             },
//             totalMeetings: {
//                 count: allMeetings.length,
//                 items: formatItems(allMeetings, item => `Meeting done with ${item.first_name} from ${item.company_name} on ${format(new Date(item.start_date), 'dd-MMM-yyyy')}`)
//             },
//             uniqueMeetings: {
//                 count: uniqueMeetings.length,
//                 items: formatItems(uniqueMeetings, item => `Meeting done with ${item.first_name} from ${item.company_name} on ${format(new Date(item.start_date), 'dd-MMM-yyyy')}`)
//             }
//         };

//     }, [allTasks, allBoqs]);

//     const handleSelectRange = () => {
//         openDateRangePickerDialog({
//             onConfirm: (range) => {
//                 setDateRange({
//                     from: format(range.from, 'yyyy-MM-dd'),
//                     to: format(range.to, 'yyyy-MM-dd'),
//                 });
//             }
//         });
//     };

//     // --- 3. RENDER THE GRID ---
//     const isLoading = tasksLoading || boqsLoading;

//     // We create an array for easier mapping
//     const statCards = [
//         { title: "Pending Task", data: statsData?.pendingTasks },
//         { title: "BOQ Received", data: statsData?.boqReceived },
//         { title: "BOQ Sent", data: statsData?.boqSent },
//         { title: "Unique Meetings", data: statsData?.uniqueMeetings },
//         { title: "Total Meetings", data: statsData?.totalMeetings },
//         { title: "Pending BOQ", data: statsData?.pendingBoq },
//         { title: "Hot Deals", data: statsData?.hotDeals },
//     ];

//     return (
//         <div className="space-y-3">
//             <div className="flex items-center justify-between">
//                 <p className="text-sm text-muted-foreground">Date filter:</p>
//                 <div className="flex items-center border rounded-md overflow-hidden">
//                     <Button variant="ghost" className="bg-gray-800 text-white rounded-none h-8 text-xs">
//                         Last 30 days
//                     </Button>
//                     <Button
//                         variant="ghost"
//                         className="text-muted-foreground rounded-none h-8 border-l text-xs"
//                         onClick={handleSelectRange}
//                     >
//                         Select range
//                     </Button>
//                 </div>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//                 {statCards.map(card => (
//                     <StatCard
//                         key={card.title}
//                         title={card.title}
//                         value={card.data?.count ?? 0}
//                         isLoading={isLoading}
//                         onClick={() => {
//                             if (card.data) {
//                                 openStatsDetailDialog({
//                                     title: card.title,
//                                     items: card.data.items,
//                                 });
//                             }
//                         }}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };