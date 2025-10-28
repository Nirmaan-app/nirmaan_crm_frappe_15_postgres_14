// src/pages/Home/StatsGrid.tsx
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useState, useMemo } from "react";
import { subDays, format } from 'date-fns';
import { StatItem } from "@/store/dialogStore";
import { FilterControls } from "@/components/ui/FilterControls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { formatDate, formatTime12Hour,formatDateWithOrdinal,formatCasualDate } from "@/utils/FormatDate";
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";
import { ChevronRight } from "lucide-react";
// StatCard component (no changes needed here)
interface StatCardProps {
    title: string;
    value: number | string;
    isLoading?: boolean;
    onClick: () => void;
}

 const getBoqStatusClass = useStatusStyles("boq");
 const getTaskStatusClass=useStatusStyles("task")
        
export const StatCard = ({ title, value, isLoading = false, onClick }: StatCardProps) => {
    return (
        <div
            onClick={onClick}
            className="bg-destructive text-white p-2 rounded-lg text-center cursor-pointer transition-transform hover:scale-105"
        >
            <p className="text-xl md:text-2xl font-bold">
                {isLoading ? "..." : String(value).padStart(2, '0')}
            </p>
            <p className="text-xs md:text-base">{title}</p>
        </div>
    );
};
   //BOQ Dialog Card 
           export const boqNameFormatter = (item) => (
        <Card className="w-full"> {/* Removed hover effects as it will be in a dialog */}
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base font-bold text-primary truncate" title={item.name}>
              {item.name} <span className=" block text-sm text-gray-400 font-light">{item.company}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 flex justify-between items-center text-xs">
            <div>
                
              <span className={`font-semibold px-2 py-1 rounded-full border ${getBoqStatusClass(item.boq_status)}`}>
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

          export   const taskNameFormatter = (item) =>    <div className="flex p-1 items-center space-x-2 w-full">
            {/* <TaskStatusIcon status={item.status} className="mr-1 flex-shrink-0" /> 
          <div><span className="font-semibold">{item?.type}</span> with <span className="font-semibold">{item?.first_name}</span>{" "} from {item?.company_name} {" "}
          <p className="text-xs inline-block text-muted-foreground p-0 m-0">
                                         {formatCasualDate(item.start_date)} 
                                      </p></div> */}
                                              <TaskStatusIcon status={item.status || 'Open'} className="flex-shrink-0 mt-1" /> {/* Adjusted margin-top */}
        <div className="flex flex-col flex-grow"> {/* Use flex-col for stacked content */}
            {item.task_profile === "Sales" ? (
                // Sales Profile rendering
                <span>
                    <span className="font-semibold">{item?.type || 'Task'}</span> with <span className="font-semibold">{item.first_name || '--'}</span>{" "}from  {item.company || '--'} {" "}<span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 self-start">
                                                                               {item.status=="Scheduled"?"Scheduled for":"On"}:  {formatDateWithOrdinal(item.start_date)}
                                                                            </span>
                </span>
            ) : (
                // Non-Sales Profile rendering
                <span>
                    <span className="font-semibold">{item?.type || 'Task'}</span> for  <span className="font-semibold">{item?.boq || '--'}</span> {" "}<span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 self-start">
                                                                               {item.status=="Scheduled"?"Scheduled for":"On"}: {formatDateWithOrdinal(item.start_date)}
                                                                            </span>
                </span>
            )}
            
        </div>

                                       <ChevronRight className="w-4 h-4 text-muted-foreground" /></div>;

          export  const formatItems = (data: any[], nameFormatter: (item: any) => string, type: 'Task' | 'BOQ'): StatItem[] => {
            return data.map(item => ({
                name: nameFormatter(item), // The display name for the list
                id: item.name,             // The unique document ID for navigation
                type: type,                // The document type ('Task' or 'BOQ')
                data: item                 // The full original object
            }));
        };


export const StatsGrid = () => {
        const getBoqStatusClass = useStatusStyles("boq");
        const getTaskStatusClass=useStatusStyles("task")
    
    const { openDateRangePickerDialog, openStatsDetailDialog } = useDialogStore();
    const [dateRange, setDateRange] = useState({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
    });
    const homeStatsGridFilterTasks= [
            ["start_date", "between", [dateRange.from, dateRange.to]]
        ]
    const homeStatsGridFilterBOQS= [
            ["creation", "between", [dateRange.from, dateRange.to]]
        ]
    const homeStatsGridTask=`all-tasks-hsgf${JSON.stringify(homeStatsGridFilterTasks)}`
    const homeStatsGridBOQ=`all-boqs-hsgf${JSON.stringify(homeStatsGridFilterBOQS)}`

    const { data: allTasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
        fields: ["name", "type", "start_date", "time" ,"status", "contact", "company","boq", "contact.first_name", "contact.last_name", "company.company_name", "modified","task_profile"],
        filters: homeStatsGridFilterTasks,
        orderBy: { field: "start_date", order: "desc"},
        limit: 0
    },homeStatsGridTask);

    const { data: allBoqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
        fields: ["name", "boq_status", "company", "creation", "modified"],
        filters: homeStatsGridFilterBOQS,
        orderBy :{field: "modified", order: "desc"},
        limit: 0
    },homeStatsGridBOQ);

    const statsData = useMemo(() => {
        if (!allTasks || !allBoqs) return null;

        // UPDATED: formatItems now accepts a `type` and adds it to the returned object
      
        const pendingTasks = allTasks.filter(t => t.status === "Scheduled")     
        const boqReceived = allBoqs
        const boqSent = allBoqs.filter(b => ["BOQ Submitted", "Revision Submitted"].includes(b.boq_status));
        const pendingBoq = allBoqs.filter(b => ["New", "Revision Pending", "In-Progress","Partial BOQ Submitted"].includes(b.boq_status));
        const hotDeals = allBoqs.filter(b => ["Revision Submitted", "Negotiation"].includes(b.boq_status));
        const allMeetings = allTasks
        // CORRECTED: Use the unique link fields `contact` and `company` for a reliable identifier
        const uniqueMeetingIdentifiers = new Set();
        const uniqueMeetings = allMeetings.filter(t => {
            const identifier = `${t.company}`; // e.g., "CNT-0001-CMP-0002"
            if (!uniqueMeetingIdentifiers.has(identifier)) {
                uniqueMeetingIdentifiers.add(identifier);
                return true;
            }
            return false;
        });
        
        // console.log("uniqueMeetingIdentifiers",uniqueMeetingIdentifiers)

        // CORRECTED: Access linked fields using bracket notation, e.g., item['contact.first_name']

    //       const taskNameFormatter = (item) => (
    //     <Card className="w-full"> {/* Removed hover effects as it will be in a dialog */}
    //       <CardHeader className="p-3 pb-2">
    //         <CardTitle className="text-base font-bold text-primary truncate" title={item.first_name}>
    //           {item.first_name}
    //         </CardTitle>
    //       </CardHeader>
    //       <CardContent className="p-2 pt-0 flex justify-between items-center text-xs">
    //         <div>
    //           <span className={`font-semibold px-2 py-1 rounded-full border ${getBoqStatusClass(item.type)}`}>
    //             {item.type || 'No Status'}
    //           </span>
    //         </div>
    //         {/* <div className="text-muted-foreground font-medium">
    //           {`${formatDate(item.start_date)} - ${formatTime12Hour(item.time)}`}
    //         </div> */}
    //       </CardContent>
    //     </Card>
    // );

        

         
     
        
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
        { title: "Total Meetings", data: statsData?.totalMeetings },
        { title: "Unique Meetings", data: statsData?.uniqueMeetings },
        { title: "Pending Task", data: statsData?.pendingTasks },
        { title: "Pending BOQ", data: statsData?.pendingBoq },
        { title: "BOQ Received", data: statsData?.boqReceived },
        { title: "BOQ Sent", data: statsData?.boqSent },
        { title: "Hot Deals", data: statsData?.hotDeals },
    ];

    return (
        <div className="space-y-3 pb-8">
               <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange}/>         
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

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




// // src/pages/Home/StatsGrid.tsx
// import { Button } from "@/components/ui/button";
// import { useDialogStore } from "@/store/dialogStore";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import React, { useState, useMemo } from "react";
// import { subDays, format } from 'date-fns';
// import { StatItem } from "@/store/dialogStore";
// import { FilterControls } from "@/components/ui/FilterControls";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import { formatDate, formatTime12Hour } from "@/utils/FormatDate";

// // StatCard component (no changes needed here)
// interface StatCardProps {
//     title: string;
//     value: number | string;
//     isLoading?: boolean;
//     onClick: () => void;
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
//         const getBoqStatusClass = useStatusStyles("boq");
    
//     const { openDateRangePickerDialog, openStatsDetailDialog } = useDialogStore();
//     const [dateRange, setDateRange] = useState({
//         from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
//         to: format(new Date(), 'yyyy-MM-dd'),
//     });
//     const homeStatsGridFilterTasks= [
//             ["start_date", "between", [dateRange.from, dateRange.to]]
//         ]
//     const homeStatsGridFilterBOQS= [
//             ["creation", "between", [dateRange.from, dateRange.to]]
//         ]
//     const homeStatsGridTask=`all-tasks-hsgf${JSON.stringify(homeStatsGridFilterTasks)}`
//     const homeStatsGridBOQ=`all-boqs-hsgf${JSON.stringify(homeStatsGridFilterBOQS)}`

//     const { data: allTasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
//         fields: ["name", "type", "start_date", "status", "contact", "company","boq", "contact.first_name", "contact.last_name", "company.company_name", "modified"],
//         filters: homeStatsGridFilterTasks,
//         limit: 0
//     },homeStatsGridTask);

//     const { data: allBoqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
//         fields: ["name", "boq_status", "company", "creation", "modified"],
//         filters: homeStatsGridFilterBOQS,
//         limit: 0
//     },homeStatsGridBOQ);

//     const statsData = useMemo(() => {
//         if (!allTasks || !allBoqs) return null;

//         // UPDATED: formatItems now accepts a `type` and adds it to the returned object
//         const formatItems = (data: any[], nameFormatter: (item: any) => string, type: 'Task' | 'BOQ'): StatItem[] => {
//             return data.map(item => ({
//                 name: nameFormatter(item), // The display name for the list
//                 id: item.name,             // The unique document ID for navigation
//                 type: type,                // The document type ('Task' or 'BOQ')
//                 data: item                 // The full original object
//             }));
//         };

//         const pendingTasks = allTasks.filter(t => t.status === "Scheduled")     
//         const boqReceived = allBoqs
//         const boqSent = allBoqs.filter(b => ["BOQ Submitted", "Revision Submitted"].includes(b.boq_status));
//         const pendingBoq = allBoqs.filter(b => ["New", "Revision Pending", "In-Progress"].includes(b.boq_status));
//         const hotDeals = allBoqs.filter(b => ["Revision Submitted", "Negotiation"].includes(b.boq_status));
//         const allMeetings = allTasks
//         // CORRECTED: Use the unique link fields `contact` and `company` for a reliable identifier
//         const uniqueMeetingIdentifiers = new Set();
//         const uniqueMeetings = allMeetings.filter(t => {
//             const identifier = `${t.company}`; // e.g., "CNT-0001-CMP-0002"
//             if (!uniqueMeetingIdentifiers.has(identifier)) {
//                 uniqueMeetingIdentifiers.add(identifier);
//                 return true;
//             }
//             return false;
//         });
        
//         console.log("uniqueMeetingIdentifiers",uniqueMeetingIdentifiers)
//         // CORRECTED: Access linked fields using bracket notation, e.g., item['contact.first_name']
//         const taskNameFormatter = (item) => `Meeting with ${item.first_name || ''} from ${item.company_name || ''} on ${format(new Date(item.start_date), 'dd-MMM-yyyy')}`;
//         // const boqNameFormatter = (item) => `Project Name - ${item.name || item.name}`;
//         const boqNameFormatter=(item)=> (
// <Card 
//     className="w-full cursor-pointer hover:bg-muted/50 transition-colors"
//     >
//       {/* CARD TITLE: The title is now boq.name */}
//       <CardHeader className="p-4 pb-2">
//         <CardTitle 
//           className="text-base font-bold text-primary truncate" 
//           title={item.name} // The full name appears on hover if truncated
//         >
//           {item.name}
//         </CardTitle>
//       </CardHeader>

//       {/* CARD CONTENT: With left/right alignment */}
//       <CardContent className="pt-0 flex justify-between items-center text-xs">
        
//         {/* Left Side: Current Status */}
//         <div>
//           <span 
//             className={` text-xs px-1 py-1 rounded-full border ${getBoqStatusClass(item.boq_status)}`}
//           >
//             {item.boq_status || 'No Status'}
//           </span>
//         </div>

//         {/* Right Side: Creation Date */}
//         <div className="text-muted-foreground text-xs font-medium">
//           {formatDate(item.creation)}
//         </div>

//       </CardContent>
//     </Card>
//         )
        

        
//         return {
//             pendingTasks: {
//                 count: pendingTasks.length,
//                 items: formatItems(pendingTasks, taskNameFormatter, 'Task')
//             },
//             boqReceived: {
//                 count: boqReceived.length,
//                 items: formatItems(boqReceived, boqNameFormatter, 'BOQ')
//             },
//             boqSent: {
//                 count: boqSent.length,
//                 items: formatItems(boqSent, boqNameFormatter, 'BOQ')
//             },
//             pendingBoq: {
//                 count: pendingBoq.length,
//                 items: formatItems(pendingBoq, boqNameFormatter, 'BOQ')
//             },
//             hotDeals: {
//                 count: hotDeals.length,
//                 items: formatItems(hotDeals, boqNameFormatter, 'BOQ')
//             },
//             totalMeetings: {
//                 count: allMeetings.length,
//                 items: formatItems(allMeetings, taskNameFormatter, 'Task')
//             },
//             uniqueMeetings: {
//                 count: uniqueMeetings.length,
//                 items: formatItems(uniqueMeetings, taskNameFormatter, 'Task')
//             }
//         };

//     }, [allTasks, allBoqs]);

//     const isLoading = tasksLoading || boqsLoading;

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
//                <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange}/>         
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

