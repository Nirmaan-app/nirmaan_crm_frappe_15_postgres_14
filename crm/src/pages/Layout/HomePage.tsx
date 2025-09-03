

// src/pages/Layout/HomePage.tsx
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";
import { EnrichedCRMTask } from "../Tasks/Tasks"; // Reusing this type
import { HomeHeader } from "../Home/HomeHeader";
import { PendingTasks } from "../Home/PendingTasks";
import { StatsGrid } from "../Home/StatsGrid";
import { EstimationsHomePage } from "../Home/EstimationsHomePage";
export const HomePage = () => {
    // Fetch pending tasks for the top card]
    const role = localStorage.getItem('role');

    const homePageTaskFilter: any = [["status", "in", ["Pending", "Scheduled"]]]
    const homePageTaskSWR =  `all-tasks-${JSON.stringify(homePageTaskFilter)}`;
    const { data: tasksData, isLoading: tasksLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
        fields: ["name", "type", "start_date", "time", "status", "contact", "company", "boq", "contact.first_name", "contact.last_name", "company.company_name","creation","modified"],
        filters: homePageTaskFilter,
        limit: 0, // Only show a few tasks on the dashboard
        orderBy: {
        field: "start_date DESC, time",
        order: "desc"
    }
    }, homePageTaskSWR);
    // Process the fetched data to create computed names
    
    const enrichedTasks = useMemo(() => {
        return tasksData?.map(task => ({
            ...task,
            contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim() || 'N/A',
            company_name: task.company_name || 'N/A'
        })) || [];
    }, [tasksData]);
    
    // console.log("enrichedTasks",enrichedTasks)
    return (

        role!=="Nirmaan Estimations User Profile" ?(
<div className="space-y-6">
            <HomeHeader />
            <PendingTasks tasks={enrichedTasks} isLoading={tasksLoading} />
            <StatsGrid />
        </div>
        ):(
<EstimationsHomePage/>
        )
        
    );
};


// import { HomePageTasksAndTabs } from "@/components/helpers/homePagetasks&tabs";
// import { AddNewButton } from "@/components/ui/AddNewButton";
// import { Input } from "@/components/ui/input";

// export const HomePage = () => {

// const options = [
//   {label : "New Contact", path : "/contacts/new-contact"},
//   {label : "New Company", path : "/companies/new-company"},
//   {label : "New Project", path : "/boqs/new"},
//   {label : "New Task", path : "/tasks/new"},
// ]

//   return (
//     <div className="flex flex-col gap-4 h-full relative pt-2">
//       <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
//       <h3 className="text-lg font-semibold text-center dark:text-white">Welcome, User!</h3>
//       <HomePageTasksAndTabs />
//       <div className="fixed bottom-24 z-30 right-6 flex flex-col items-end gap-4">
//         <AddNewButton options={options} />
//       </div>
//     </div>
//   );
// };
