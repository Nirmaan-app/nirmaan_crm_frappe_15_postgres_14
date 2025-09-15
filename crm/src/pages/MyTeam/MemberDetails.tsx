// src/pages/MyTeam/MemberDetails.tsx

import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { OverviewTab } from "./OverviewTab";
import { ContactsTab } from "./ContactsTab";
import { TasksTab } from "./TasksTab";
import { ProjectsTab } from "./ProjectTab"; // The file is named ProjectsTab

export const MemberDetails = ({ memberId }) => {
    // --- STEP 1: ON-DEMAND DATA FETCHING ---

    // Fetch the full member document to get their role and email.
    const { data: member, isLoading: memberLoading } = useFrappeGetDoc("CRM Users", memberId);
    
    // console.log("data member",member.email)
    
    const memberEmail = member?.email;
    const memberRole = member?.nirmaan_role_name;

    // Fetch TASKS assigned to this member.
    const { data: tasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
       fields: ["name", "type", "start_date","status", "contact", "company", "boq", "contact.first_name", "contact.last_name", "company.company_name","creation","modified"], // TODO: Specify fields like ["name", "status", "type", ...] in production
        filters: [['assigned_sales', '=', memberEmail]],
        limit: 0,
        // Only fetch tasks if the user is a Sales user.
        orderBy: { field: "start_date", order: "desc" },
        // enabled: !!memberEmail && memberRole === 'Nirmaan Sales User Profile'
    }, `all-tasks-for-member-${memberEmail}`);

    // Fetch CONTACTS assigned to this member.
    const { data: contacts, isLoading: contactsLoading } = useFrappeGetDocList("CRM Contacts", {
        fields: ["*"], // TODO: Specify fields in production
        filters: [['assigned_sales', '=', memberEmail]],
        limit: 0,
        // Only fetch contacts if the user is a Sales user.
        orderBy: { field: "first_name", order: "asc"},
        // enabled: !!memberEmail && memberRole === 'Nirmaan Sales User Profile'
    }, `all-contacts-for-member-${memberEmail}`);

    // Fetch BOQs based on the user's role.
    const { data: boqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
        fields: ["*"], // TODO: Specify fields in production
        filters: memberRole === 'Nirmaan Estimations User Profile'
            ? [['assigned_estimations', '=', memberEmail]] // Filter for Estimation users
            : [['assigned_sales', '=', memberEmail]],      // Filter for Sales users
        limit: 0,
       orderBy: { field: "creation", order: "asc"},
        // This hook should run as long as we have an email and the user is NOT an Admin.
    }, `all-boqs-for-member-${memberEmail}`);

    const isLoading = memberLoading || tasksLoading || contactsLoading || boqsLoading;
    
    if (isLoading) {
        return <Skeleton className="h-full w-full rounded-lg" />;
    }
    
    if (!member) {
        return <h2 className="p-4">Error: Could not load member details.</h2>;
    }

    // --- STEP 2: ROLE-AWARE TAB LOGIC ---

    const getVisibleTabs = () => {
        switch (memberRole) {
            case 'Nirmaan Admin User Profile':
                return ['overview'];
            case 'Nirmaan Estimations User Profile':
                return ['overview', 'boqs'];
            case 'Nirmaan Sales User Profile':
                return ['overview', 'contacts', 'tasks', 'boqs'];
            default:
                return ['overview']; // Default to only showing overview for any other roles
        }
    };
    const visibleTabs = getVisibleTabs();
     const gridColsClass = visibleTabs.length === 1 ? 'grid-cols-1' : `grid-cols-${visibleTabs.length}`;


    const tabstyle="rounded-md data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive"
    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className={`grid w-full ${gridColsClass} bg-transparent p-0 border`}>
                {visibleTabs.includes('overview') && <TabsTrigger value="overview" className={tabstyle}>Overview</TabsTrigger>}
                {visibleTabs.includes('contacts') && <TabsTrigger value="contacts" className={tabstyle}>Contacts</TabsTrigger>}
                {visibleTabs.includes('tasks') && <TabsTrigger value="tasks" className={tabstyle}>Tasks</TabsTrigger>}
                {visibleTabs.includes('boqs') && <TabsTrigger value="boqs" className={tabstyle}>BOQs</TabsTrigger>}
            </TabsList>

            
            <TabsContent value="overview" className="mt-4">
                <OverviewTab member={member} tasks={tasks} contacts={contacts} boqs={boqs} />
            </TabsContent>
            {/* //Dynamic State Card Overview  */}
            
            {visibleTabs.includes('contacts') && (
                <TabsContent value="contacts" className="mt-4">
                    <ContactsTab contacts={contacts || []} />
                </TabsContent>
            )}

            {visibleTabs.includes('tasks') && (
                <TabsContent value="tasks" className="mt-4">
                    <TasksTab tasks={tasks || []} />
                </TabsContent>
            )}

            {visibleTabs.includes('boqs') && (
                <TabsContent value="boqs" className="mt-4">
                    <ProjectsTab boqs={boqs || []} />
                </TabsContent>
            )}
        </Tabs>
    );
};

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useMemo } from "react";
// import { subMonths, startOfMonth, endOfMonth } from "date-fns";
// import { OverviewTab } from "./OverviewTab";
// import { ContactsTab } from "./ContactsTab";
// import { TasksTab } from "./TasksTab";
// import { ProjectsTab } from "./ProjectTab";

// // The component now receives all data as props. No more hooks!
// export const MemberDetails = ({ member, tasks, contacts, boqs }) => {

//     // The performance data calculation remains the same, but it's now much faster
//     // because it's working with data that is already in memory.
//     const performanceData = useMemo(() => {
//         const now = new Date();
//         const periods = [
//             { name: "January", start: new Date(now.getFullYear(), 0, 1) },
//             { name: "Previous", start: startOfMonth(subMonths(now, 1)) },
//             { name: "Current Month", start: startOfMonth(now) },
//         ].map(p => ({ ...p, end: endOfMonth(p.start) }));

//         return periods.map(period => {
//             const filterByPeriod = (doc) => {
//                 const docDate = new Date(doc.creation);
//                 return docDate >= period.start && docDate <= period.end;
//             };
//             return {
//                 name: period.name,
//                 "Tasks Completed": tasks?.filter(filterByPeriod).length,
//                 "Prospects Added": contacts?.filter(filterByPeriod).length,
//                 "Projects Started": boqs?.filter(filterByPeriod).length,
//             };
//         });
//     }, [member, tasks, contacts, boqs]); // Depends on the props now

//     return (
//         <Tabs defaultValue="overview" className="w-full">
//             <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 border">
//                 <TabsTrigger value="overview" className="rounded-md data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
//                     Overview
//                 </TabsTrigger>
//                 <TabsTrigger value="contacts" className="rounded-md data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
//                     Contacts
//                 </TabsTrigger>
//                 <TabsTrigger value="tasks" className="rounded-md data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
//                     Tasks
//                 </TabsTrigger>
//                 <TabsTrigger value="projects" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
//                     BOQs
//                 </TabsTrigger>
//             </TabsList>

//             <TabsContent value="overview" className="mt-4">
//                 <OverviewTab member={member} performanceData={performanceData} />
//             </TabsContent>
//             <TabsContent value="contacts" className="mt-4">
//                 <ContactsTab contacts={contacts || []} />
//             </TabsContent>
//             <TabsContent value="tasks" className="mt-4">
//                 <TasksTab tasks={tasks || []} />
//             </TabsContent>
//             <TabsContent value="projects" className="mt-4">
//                 <ProjectsTab boqs={boqs || []} />
//             </TabsContent>
//         </Tabs>
//     );
// };

