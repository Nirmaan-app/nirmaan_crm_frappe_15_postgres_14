// src/pages/MyTeam/OverviewTab.tsx
import { Button } from "@/components/ui/button";

import React, { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { FilterControls } from "@/components/ui/FilterControls";
import { useDialogStore } from "@/store/dialogStore";
import { StatCard } from "../Home/StatsGrid";
import { formatItems,boqNameFormatter,taskNameFormatter } from "../Home/StatsGrid";
import { formatRoleName } from "./MemberList";

export const OverviewTab = ({ member, tasks, contacts, boqs }) => {
    const { openStatsDetailDialog } = useDialogStore();
    const role=localStorage.getItem("role")

    
    // 1. Local state for the date range filter. This ONLY affects this component.
    const [dateRange, setDateRange] = useState({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
    });

    // 2. The complete stats calculation logic, moved from StatsGrid.
    const statsData = useMemo(() => {
        // This function filters the provided documents by the selected date range.
        const filterByCreationPeriod = (doc) => {
            if (!doc?.creation) return false;
            const docDate = new Date(doc.creation);
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);
            return docDate >= fromDate && docDate <= toDate;
        };

        const filterByStartDatePeriod = (doc) => {
            if (!doc?.start_date) return false;
            const docDate = new Date(doc.start_date);
            const fromDate = new Date(dateRange.from);
            const toDate = new Date(dateRange.to);
            return docDate >= fromDate && docDate <= toDate;
        };
        
        // Filter the raw data passed down from MemberDetails
        const allTasksInPeriod = tasks?.filter(filterByStartDatePeriod) || [];
        const allBoqsInPeriod = boqs?.filter(filterByCreationPeriod) || [];
        
        // --- ALL YOUR STATS LOGIC IS NOW HERE ---
        const pendingTasks = allTasksInPeriod.filter(t => t.status === "Scheduled");
        const boqReceived = allBoqsInPeriod;
        const boqSent = allBoqsInPeriod.filter(b => ["BOQ Submitted", "Revision Submitted"].includes(b.boq_status));
        const pendingBoq = allBoqsInPeriod.filter(b => ["New", "Revision Pending", "In-Progress"].includes(b.boq_status));
        const hotDeals = allBoqsInPeriod.filter(b => ["Revision Submitted", "Negotiation"].includes(b.boq_status));
        const allMeetings = allTasksInPeriod; // Assuming all tasks are meetings for this stat

        const uniqueMeetingIdentifiers = new Set();
        const uniqueMeetings = allMeetings.filter(t => {
            const identifier = `${t.company}`;
            if (!uniqueMeetingIdentifiers.has(identifier)) {
                uniqueMeetingIdentifiers.add(identifier);
                return true;
            }
            return false;
        });

      

        return {
            pendingTasks: { count: pendingTasks.length, items: formatItems(pendingTasks, taskNameFormatter, 'Task') },
            boqReceived: { count: boqReceived.length, items: formatItems(boqReceived, boqNameFormatter, 'BOQ') },
            boqSent: { count: boqSent.length, items: formatItems(boqSent, boqNameFormatter, 'BOQ') },
            pendingBoq: { count: pendingBoq.length, items: formatItems(pendingBoq, boqNameFormatter, 'BOQ') },
            hotDeals: { count: hotDeals.length, items: formatItems(hotDeals, boqNameFormatter, 'BOQ') },
            totalMeetings: { count: allMeetings.length, items: formatItems(allMeetings, taskNameFormatter, 'Task') },
            uniqueMeetings: { count: uniqueMeetings.length, items: formatItems(uniqueMeetings, taskNameFormatter, 'Task') },
        };
    }, [tasks, boqs, contacts, dateRange]); // Recalculates ONLY when data or local dateRange changes

     // Dynamically build the `statCards` array based on the VIEWED member's role.
    const statCards = useMemo(() => {
        const memberRole = member?.nirmaan_role_name;

        const allPossibleCards = {
            pendingTasks: { title: "Pending Tasks", data: statsData?.pendingTasks },
            boqReceived: { title: "BOQs Received", data: statsData?.boqReceived },
            boqSent: { title: "BOQs Sent", data: statsData?.boqSent },
            pendingBoq: { title: "Pending BOQs", data: statsData?.pendingBoq },
            hotDeals: { title: "Hot Deals", data: statsData?.hotDeals },
            totalMeetings: { title: "Total Meetings", data: statsData?.totalMeetings },
            uniqueMeetings: { title: "Unique Meetings", data: statsData?.uniqueMeetings },
        };
        
        switch (memberRole) {
            case 'Nirmaan Estimations User Profile':
                return [
                    allPossibleCards.boqReceived,
                    allPossibleCards.boqSent,
                    allPossibleCards.pendingBoq,
                    allPossibleCards.hotDeals,
                ];
            case 'Nirmaan Sales User Profile':
                return Object.values(allPossibleCards);
            default:
                return []; // Admins and others see no stat cards
        }
    }, [member, statsData]);
    
    
    return (
        <div className="space-y-6">
           <div className="bg-background p-6 rounded-lg border shadow-sm">
                 <div className="grid grid-cols-2 gap-y-6 items-center">
                     <div>
                         <p className="text-xs text-muted-foreground">User Name</p>
                         <p className="text-md font-bold text-destructive">{member?.full_name}</p>
                     </div>
                     <div className="text-right">
                         <p className="text-xs text-muted-foreground">Designation</p>
                         <p className="text-md font-semibold text-destructive">{formatRoleName(member?.nirmaan_role_name) || 'N/A'}</p>
                     </div>
                     <div>
                         <p className="text-xs text-muted-foreground">Email</p>
                         <p className="font-semibold">{member?.name}</p>
                     </div>
                     <div className="text-right">
                         <p className="text-xs text-muted-foreground">Phone Number</p>
                         <p className="font-semibold">{member?.mobile_no || 'N/A'}</p>
                     </div>
                 </div>
                 <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                     {role==="Nirmaan Admin User Profile"}
                     <Button variant="outline">Edit</Button>
                     {/* <Button variant="destructive">Delete</Button> */}
                 </div>
            </div>

            
            {/* Performance Stats Section */}
            {/* for admin user hide this  */}
            {member?.nirmaan_role_name!=="Nirmaan Admin User Profile" &&(
                <div className="bg-background p-4 rounded-lg border shadow-sm space-y-4">
                <h3 className="font-semibold text-lg">Performance </h3>
                
                {/* The FilterControls now update the LOCAL dateRange state */}
                <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange} />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statCards.map(card => (
                        <StatCard
                            key={card.title}
                            title={card.title}
                            value={card.data?.count ?? 0}
                            onClick={() => {
                                if (card.data?.items && card.data.items.length > 0) {
                                    openStatsDetailDialog({
                                        title: `${card.title} for ${card.full_name}`,
                                        items: card.data.items,
                                    });
                                }
                            }}
                        />
                    ))}
                </div>
            </div>
            )}
        </div>
    );
};



// ----- Before Stats Cards
// import { Button } from "@/components/ui/button";
// import { PerformanceChart } from "./PerformanceChart";
// import { formatRoleName } from "./MemberList";
// export const OverviewTab = ({ member, performanceData }) => {
//     const role=localStorage.getItem("role")
//     return (
//         <div className="space-y-6">
//             <div className="bg-background p-6 rounded-lg border shadow-sm">
//                 <div className="grid grid-cols-2 gap-y-6 items-center">
//                     <div>
//                         <p className="text-xs text-muted-foreground">User Name</p>
//                         <p className="text-md font-bold text-destructive">{member?.full_name}</p>
//                     </div>
//                     <div className="text-right">
//                         <p className="text-xs text-muted-foreground">Designation</p>
//                         <p className="text-md font-semibold text-destructive">{formatRoleName(member?.nirmaan_role_name) || 'N/A'}</p>
//                     </div>
//                     <div>
//                         <p className="text-xs text-muted-foreground">Email</p>
//                         <p className="font-semibold">{member?.name}</p>
//                     </div>
//                     <div className="text-right">
//                         <p className="text-xs text-muted-foreground">Phone Number</p>
//                         <p className="font-semibold">{member?.mobile_no || 'N/A'}</p>
//                     </div>
//                 </div>
//                 <div className="flex justify-end gap-2 mt-6 border-t pt-4">
//                     {role==="Nirmaan Admin User Profile"}
//                     <Button variant="outline">Edit</Button>
//                     {/* <Button variant="destructive">Delete</Button> */}
//                 </div>
//             </div>

//             <div className="bg-background p-4 rounded-lg border shadow-sm">
//                 <h3 className="font-semibold text-lg mb-4">Performance Overview</h3>
//                 <PerformanceChart data={performanceData} />
//             </div>
//         </div>
//     );
// };