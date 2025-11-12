// // src/pages/Home/HomeHeader.tsx
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Calendar, Search } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { GlobalSearchInput } from "@/components/common/GlobalSearchInput";
// import { PendingTasks } from "../Home/PendingTasks";
// import { StatsGrid } from "../Home/StatsGrid";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo } from "react";
// import { EnrichedCRMTask } from "../Tasks/Tasks"; // Reusing this type



// export const HomeHeader = () => {
//     const navigate = useNavigate();
//     const fullName = localStorage.getItem('fullName');
//      const role = localStorage.getItem('role');

//         const homePageTaskFilter: any = [["status", "in", ["Pending", "Scheduled"]]]
//         const homePageTaskSWR =  `all-tasks-${JSON.stringify(homePageTaskFilter)}`;
//         const { data: tasksData, isLoading: tasksLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
//             fields: ["name", "type", "start_date", "status", "contact", "company", "boq", "contact.first_name", "contact.last_name", "company.company_name","creation","modified"],
//             filters: homePageTaskFilter,
//             limit: 0, // Only show a few tasks on the dashboard
//             orderBy: {
//             field: "start_date",
//             order: "asc"
//         }
//         }, homePageTaskSWR);
//         // Process the fetched data to create computed names

//         const enrichedTasks = useMemo(() => {
//             return tasksData?.map(task => ({
//                 ...task,
//                 contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim() || 'N/A',
//                 company_name: task.company_name || 'N/A'
//             })) || [];
//         }, [tasksData]);

//     return (
//         <>

//         <div className="space-y-4">
//             <div className="flex justify-between items-center">
//                 <h1 className="text-xl md:text-2xl font-bold">Welcome, {fullName}!</h1>
//                 <Button 
//                     variant="outline" 
//                     className="border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive" 
//                     onClick={() => navigate('/calendar')}
//                 >
//                     <Calendar className="w-4 h-4 mr-2" />
//                     Calendar
//                 </Button>
//             </div>
//             <div className="relative">
//                  <GlobalSearchInput className="flex-1" /> 
//                 {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                 <Input placeholder="Search Names, Company, Project, etc..." className="pl-10 h-12" /> */}
//             </div>
//         </div>
//          <PendingTasks tasks={enrichedTasks} isLoading={tasksLoading} />
//          <StatsGrid />
//          </>
//     );
// };
// src/pages/Home/HomeHeader.tsx - FINALIST COMPONENTS WITH SHADCN TABS


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlobalSearchInput } from "@/components/common/GlobalSearchInput";
import { PendingTasks } from "./PendingTasks";
import { StatsGrid } from "./StatsGrid";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AllBOQs, PendingBOQs } from "./EstimationsHomePage"; // Assuming these are your Estimations Review components

// --- shadcn/ui Tabs Imports ---
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskTableView } from "../Tasks/components/TaskTableView";
import { SalesPerformanceTable } from "./components/SalesPerformanceTable";
import { ExceptionReportForCompanies } from "./components/ExceptionReportForCompanies";

// --- End shadcn/ui Tabs Imports ---

import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
// import { useUserRoleLists } from '@/hooks/useUserRoleLists'; // Removed as you're using localStorage for role/fullName
// --- NEW IMPORTS ---
import { CollapsibleSection } from "@/components/common/CollapsibleSection"; // Import the new component

// Define the interface for your EnrichedCRMTask
interface EnrichedCRMTask {
    name: string;
    type: string;
    start_date: string;
    status: string;
    contact?: string;
    company?: string;
    boq?: string;
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    creation: string;
    modified: string;
    contact_name: string;
    company_name_display: string;
}


export const HomeHeader = () => {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName'); // From your code
    const role = localStorage.getItem('role'); // From your code


    const initialDefaultTab = useMemo(() => {
        if (role === 'Nirmaan Estimates User Profile') { // Check for Estimates role
            return 'estimations_review';
        }
        return 'sales_review'; // Default for Admin, Sales, or any other role
    }, [role]); // Re-evaluate if role changes (though localStorage is usually static after login)

    // State for the active tab, synced with URL search parameters
    const [activeTab, setActiveTab] = useStateSyncedWithParams<string>('homeTab', "sales_review");

    // Determine if the current user is an Admin (using your exact logic)
    const isAdmin = role === 'Nirmaan Admin User Profile';

    // --- Data Fetching for Sales Review ---
    const homePageTaskFilter: any = [["status", "in", ["Pending", "Scheduled"]]];
    const homePageTaskSWR = `all-tasks-${JSON.stringify(homePageTaskFilter)}`;
    const { data: tasksData, isLoading: tasksLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
        fields: ["name", "type", "start_date", "status", "contact", "company", "boq", "contact.first_name", "contact.last_name", "company.company_name", "creation", "modified","task_profile"],
        filters: homePageTaskFilter,
        limit: 0,
        orderBy: {
            field: "start_date",
            order: "asc"
        }
    }, homePageTaskSWR);

    const enrichedTasks = useMemo(() => {
        return tasksData?.map(task => ({
            ...task,
            contact_name: `${task["contact.first_name"] || ''} ${task["contact.last_name"] || ''}`.trim() || 'N/A',
            company_name_display: task["company.company_name"] || 'N/A'
        })) || [];
    }, [tasksData]);

    return (
        <div className="flex flex-col h-full max-h-screen "> {/* Main scroll container for Home */}
            <div className="sticky top-0 z-20 bg-background px-4 mt-0 flex-shrink-0"> {/* Fixed header section */}
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-md md:text-2xl font-bold">Welcome, {fullName}!</h1>
                    <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => navigate('/calendar')}
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Calendar
                    </Button>
                </div>

                {/* --- REPLACED WITH SHADCN TABS --- */}
                {isAdmin && ( // Only show Tabs for Admins, based on your logic
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                            <TabsTrigger
                                value="sales_review"
                                className={cn(
                                    "data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground", // Red active theme
                                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-background hover:data-[state=inactive]:bg-accent" // White/gray inactive theme
                                )}
                            >
                                Sales Review
                            </TabsTrigger>
                            <TabsTrigger // This tab is always shown if isAdmin is true
                                value="estimations_review"
                                className={cn(
                                    "data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground", // Red active theme
                                    "data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-background hover:data-[state=inactive]:bg-accent" // White/gray inactive theme
                                )}
                            >
                                Estimations Review
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}
               

                {/* Global Search Input, fixed under tabs (or directly under greeting if tabs are hidden) */}
                {/* <div className="relative mt-4 mb-2 flex-shrink-0">
                    <GlobalSearchInput className="flex-1" />
                </div> */}
            </div>

            {/* Content area based on active tab, scrolls below fixed header */}
            <div className="flex-1 px-4"> {/* flex-1 allows this section to fill remaining space */}
                {activeTab === 'sales_review' && (
                    <div className="space-y-2"> {/* Use space-y- to manage spacing between components */}
                         <div className="relative mt-0 mb-0 flex-shrink-0">
                           <GlobalSearchInput className="flex-1" />
                       </div>
                       
                       {/* {isAdmin ? (
                        <>
                        <SalesPerformanceTable className="mt-8 border-t border-gray-200 pt-4"/>
                         <TaskTableView taskProfiles="Sales" tableContainerClassName="max-h-[280px]" />
                        </>
                            // If Admin, show TaskTableView (e.g., all tasks)
                           
                        ) : (
                            // If not Admin, show PendingTasks (original behavior)
                            <PendingTasks tasks={enrichedTasks} isLoading={tasksLoading} />
                        )} */}
                          {isAdmin ? (
                            <>
                            
                                {/* --- COLLAPSIBLE SALES PERFORMANCE TABLE --- */}
                                <CollapsibleSection title="Sales Performance" defaultOpen={true}>
                                    <SalesPerformanceTable className="border-none p-0 shadow-none" /> {/* Remove default styling from table here */}
                                </CollapsibleSection>
                                <CollapsibleSection title="Exception Report for Companies" defaultOpen={false}>
                                    <ExceptionReportForCompanies />
                                </CollapsibleSection>

                                {/* --- COLLAPSIBLE TASK TABLE VIEW --- */}
                                <CollapsibleSection title="Sales Tasks" defaultOpen={false}>
                                    <TaskTableView taskProfiles="Sales" tableContainerClassName="max-h-[280px]" className="border-none p-0 shadow-none" />
                                </CollapsibleSection>
                            </>
                        ) : (
                            // Non-Admin view retains PendingTasks
                            <PendingTasks tasks={enrichedTasks} isLoading={tasksLoading} />
                        )}
                        
                        <StatsGrid />
                    </div>
                )}


{activeTab === 'estimations_review' &&(
 <div className="space-y-2 mb-4">
     <CollapsibleSection title="Pending BOQs" defaultOpen={true}>
                            <PendingBOQs className="border-none p-0 shadow-none" /> {/* Pass dateRange if PendingBOQs needs it */}
                        </CollapsibleSection>
                        {/* --- COLLAPSIBLE ALL BOQs --- */}
                        <CollapsibleSection title="All BOQs" defaultOpen={false}>
                            <AllBOQs className="border-none p-0 shadow-none" /> {/* Pass dateRange if AllBOQs needs it */}
                        </CollapsibleSection>
                        {/* <PendingBOQs />
                        <AllBOQs /> */}
                    </div>
)}
                
            </div>
        </div>
    );
};