// src/pages/Companies/DynamicCompanyStats.tsx

import { StatCard } from "@/pages/Home/StatsGrid"; // Reuse the StatCard component
import { FilterControls } from "@/components/ui/FilterControls";
import { useDialogStore } from "@/store/dialogStore";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { StatItem } from "@/store/dialogStore";

// The component expects the ID of the company to show stats for
interface DynamicCompanyStatsProps {
    companyId: string;
}

export const DynamicCompanyStats = ({ companyId }: DynamicCompanyStatsProps) => {
    const { openStatsDetailDialog } = useDialogStore();
    const [dateRange, setDateRange] = useState({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
    });

    // --- DATA FETCHING (FILTERED BY COMPANY ID) ---
    const { data: allTasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
        fields: ["name", "type", "start_date", "status", "contact", "company", "contact.first_name", "contact.last_name", "company.company_name", "modified"],
        filters: [
            ['company', '=', companyId], // The crucial filter
            ["start_date", "between", [dateRange.from, dateRange.to]]
        ],
        limit: 0
    },"all-tasks-dynamicstats-company-id");

    const { data: allBoqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
        fields: ["name", "boq_name", "boq_status", "company", "creation", "modified"],
        filters: [
            ['company', '=', companyId], // The crucial filter
            ["creation", "between", [dateRange.from, dateRange.to]]
        ],
        limit: 0
    },"all-boqs-dynamicstats-company-id");

    // --- STATS CALCULATION (Same logic as StatsGrid) ---
    const statsData = useMemo(() => {
        if (!allTasks || !allBoqs) return null;

        const formatItems = (data: any[], nameFormatter: (item: any) => string, type: 'Task' | 'BOQ'): StatItem[] => {
            return data.map(item => ({ name: nameFormatter(item), id: item.name, type: type, data: item }));
        };
        
         const taskNameFormatter = (item) => {
            const datePart = item.start_date ? ` on ${format(new Date(item.start_date), 'dd-MMM-yyyy')}` : ' (date not set)';
            return `Meeting with ${item.first_name || ''}${datePart}`;
        };
        
        const boqNameFormatter = (item) => `${item.boq_name || item.name}`;

        // const pendingTasks = allTasks.filter(t => t.status === "Scheduled");
        const boqReceived = allBoqs.filter(b => b.boq_status === "New");
        const boqSent = allBoqs.filter(b => ["BOQ Submitted", "Revision Submitted"].includes(b.boq_status));
        const pendingBoq = allBoqs.filter(b => ["New", "Revision Pending", "In-Progress"].includes(b.boq_status));
        const hotDeals = allBoqs.filter(b => ["Revision Submitted", "Negotiation"].includes(b.boq_status));
        const wonDeals = allBoqs.filter(b => ["Won"].includes(b.boq_status));
        const allMeetings = allTasks
         const followUpMeetings = allTasks.filter(t => t.type==="Follow-up");
        
        

        return {
          hotDeals: { count: hotDeals.length, items: formatItems(hotDeals, boqNameFormatter, 'BOQ') },
          wonDeals: { count: wonDeals.length, items: formatItems(wonDeals, boqNameFormatter, 'BOQ') },
          pendingBoq: { count: pendingBoq.length, items: formatItems(pendingBoq, taskNameFormatter, 'BOQ') },
          totalMeetings: { count: allMeetings.length, items: formatItems(allMeetings, taskNameFormatter, 'Task') },

          followUpMeetings: { count: followUpMeetings.length, items: formatItems(followUpMeetings, taskNameFormatter, 'Task') },

          boqReceived: { count: boqReceived.length, items: formatItems(boqReceived, boqNameFormatter, 'BOQ') },

          boqSent: { count: boqSent.length, items: formatItems(boqSent, boqNameFormatter, 'BOQ') },
          
            
          
        };
    }, [allTasks, allBoqs]);

    const isLoading = tasksLoading || boqsLoading;

    const statCards = [
        { title: "Hot Deals", data: statsData?.hotDeals },
        { title: "Deals Won", data: statsData?.wonDeals },
        { title: "Pending Deals", data: statsData?.pendingBoq },
        { title: "Total Meetings Done", data: statsData?.totalMeetings },
        { title: "Follow Up Meetings", data: statsData?.followUpMeetings },

        // { title: "Pending Tasks", data: statsData?.pendingTasks },
        { title: "BOQ Received", data: statsData?.boqReceived },
        { title: "BOQ Sent", data: statsData?.boqSent },
    ];

    return (
        <div className="space-y-3">
            <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange} />
            <div className="grid grid-cols-2 gap-3">
                {statCards.map(card => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.data?.count ?? 0}
                        isLoading={isLoading}
                        onClick={() => {
                            if (card.data && card.data.items.length > 0) {
                                openStatsDetailDialog({ title: card.title, items: card.data.items });
                            }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};


// // src/pages/Companies/CompanyStats.tsx

// import { Button } from "@/components/ui/button";

// const stats = [
//     { label: 'Hot Deals', value: '02' },
//     { label: 'Deals Won', value: '03' },
//     { label: 'Pending Deals', value: '03' },
//     { label: 'Total meetings done', value: '25' },
//     { label: 'Follow up meetings done', value: '10' },
//     { label: 'BOQ Recieved', value: '15' },
//     { label: 'BOQ Sent', value: '15' }, // Assuming this was the missing card
// ];

// export const CompanyStats = () => {
//     return (
//         <div className="space-y-3">
//             <div className="flex items-center justify-between">
//                 <p className="text-sm text-muted-foreground">Filter by:</p>
//                 <div className="flex items-center border rounded-md">
//                     <Button variant="ghost" className="bg-slate-700 text-white rounded-r-none h-8">Last 30 days</Button>
//                     <Button variant="ghost" className="text-muted-foreground rounded-l-none h-8">Custom range</Button>
//                 </div>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//                 {stats.map(stat => (
//                     <div key={stat.label} className="bg-destructive text-white p-3 rounded-lg text-center">
//                         <p className="text-sm">{stat.label}</p>
//                         <p className="text-2xl font-bold">{stat.value}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };