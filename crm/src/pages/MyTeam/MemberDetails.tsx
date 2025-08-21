import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import { OverviewTab } from "./OverviewTab";
import { ContactsTab } from "./ContactsTab";
import { TasksTab } from "./TasksTab";
import { ProjectsTab } from "./ProjectTab";

// The component now receives all data as props. No more hooks!
export const MemberDetails = ({ member, tasks, contacts, boqs }) => {

    // The performance data calculation remains the same, but it's now much faster
    // because it's working with data that is already in memory.
    const performanceData = useMemo(() => {
        const now = new Date();
        const periods = [
            { name: "January", start: new Date(now.getFullYear(), 0, 1) },
            { name: "Previous", start: startOfMonth(subMonths(now, 1)) },
            { name: "Current Month", start: startOfMonth(now) },
        ].map(p => ({ ...p, end: endOfMonth(p.start) }));

        return periods.map(period => {
            const filterByPeriod = (doc) => {
                const docDate = new Date(doc.creation);
                return docDate >= period.start && docDate <= period.end;
            };
            return {
                name: period.name,
                "Tasks Completed": tasks?.filter(filterByPeriod).length,
                "Prospects Added": contacts?.filter(filterByPeriod).length,
                "Projects Started": boqs?.filter(filterByPeriod).length,
            };
        });
    }, [member, tasks, contacts, boqs]); // Depends on the props now

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 border-b">
                <TabsTrigger value="overview" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
                    Overview
                </TabsTrigger>
                <TabsTrigger value="contacts" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
                    Contacts
                </TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
                    Tasks
                </TabsTrigger>
                <TabsTrigger value="projects" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-destructive data-[state=active]:text-destructive">
                    Projects
                </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
                <OverviewTab member={member} performanceData={performanceData} />
            </TabsContent>
            <TabsContent value="contacts" className="mt-4">
                <ContactsTab contacts={contacts || []} />
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
                <TasksTab tasks={tasks || []} />
            </TabsContent>
            <TabsContent value="projects" className="mt-4">
                <ProjectsTab boqs={boqs || []} />
            </TabsContent>
        </Tabs>
    );
};

// import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useMemo } from "react";
// import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
// import { OverviewTab } from "./OverviewTab";
// import { ContactsTab } from "./ContactsTab";
// import {TasksTab} from "./TasksTab"
// import { ProjectsTab } from "./ProjectTab";
// import { useCurrentUser } from "@/hooks/useCurrentUser";

// // Define the types for the data we'll be fetching
// type Task = { name: string; owner: string; creation: string; [key: string]: any; };
// type Contact = { name: string; owner: string; creation: string; [key: string]: any; };
// type Boq = { name: string; owner: string; creation: string; [key: string]: any; };

// interface MemberDetailsProps {
//     memberId: string;
// }

// export const MemberDetails = ({ memberId }: MemberDetailsProps) => {

 
//     // 1. Fetch the member's user document
    
//     console.log("member_id",memberId)
//     const { data: member, isLoading: memberLoading } = useFrappeGetDoc("CRM Users", memberId, {
//         fields: ["name",
// "first_name",
// "last_name",
// "full_name",
// "has_company",

// "mobile_no",
// "email",
// "nirmaan_role_name",
// "fcm_token"
// ],
//         // This is the key for conditional fetching:
//         // The API call will ONLY be triggered if `memberId` has a "truthy" value.
//         enabled: !!memberId
    
//     });

//     // console.log("member",member)
//     // 2. Fetch all related documents where the owner matches the member's email (user_id)
//     const ownerEmail = member?.email;
//     console.log("ownerEmail",ownerEmail)

//     const { data: tasks, isLoading: tasksLoading } = useFrappeGetDocList<Task>("CRM Task", {
//        fields: ["name", "type", "start_date", "time", "status", "contact", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation","owner"],
//         filters: { owner: ownerEmail },
//         limit: 0,
//         enabled: !!ownerEmail // Only fetch when we have the member's email
//     });

//     const { data: contacts, isLoading: contactsLoading } = useFrappeGetDocList<Contact>("CRM Contacts", {
//         fields: ["name", "first_name", "last_name", "company","mobile","modified","creation"],
//         filters: { owner: ownerEmail },
//         limit: 0,
//         enabled: !!ownerEmail
//     });

//     const { data: boqs, isLoading: boqsLoading } = useFrappeGetDocList<Boq>("CRM BOQ", {
//        fields: ["name", "boq_name", "boq_status", "boq_type", "company", "contact", "company.company_name", "contact.first_name", "contact.last_name", "modified"],
//         filters: { owner: ownerEmail },
//         limit: 0,
//         enabled: !!ownerEmail
//     });

//     // 3. Memoize the performance chart data calculation
//     const performanceData = useMemo(() => {
//         if (!ownerEmail || !tasks || !contacts || !boqs) return [];

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
//                 "Tasks Completed": tasks.filter(filterByPeriod).length,
//                 "Prospects Added": contacts.filter(filterByPeriod).length,
//                 "Projects Started": boqs.filter(filterByPeriod).length,
//             };
//         });
//     }, [ownerEmail, tasks, contacts, boqs]);

//     const isLoading = memberLoading || tasksLoading || contactsLoading || boqsLoading;

//     if (isLoading) {
//         return (
//             <div className="space-y-4">
//                 <Skeleton className="h-48 w-full" />
//                 <Skeleton className="h-10 w-1/2" />
//                 <Skeleton className="h-96 w-full" />
//             </div>
//         );
//     }

//     return (
//                <Tabs defaultValue="overview" className="w-full">
//             {/* --- START: MODIFIED CODE --- */}
//             <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 border-b">
//                 <TabsTrigger 
//                     value="overview" 
//                     className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive"
//                 >
//                     Overview
//                 </TabsTrigger>
//                 <TabsTrigger 
//                     value="contacts"
//                     className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive"
//                 >
//                     Contacts
//                 </TabsTrigger>
//                 <TabsTrigger 
//                     value="tasks"
//                     className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive"
//                 >
//                     Tasks
//                 </TabsTrigger>
//                 <TabsTrigger 
//                     value="projects"
//                     className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-2 data-[state=active]:border-destructive data-[state=active]:text-destructive"
//                 >
//                     Projects
//                 </TabsTrigger>
//             </TabsList>
//             {/* --- END: MODIFIED CODE --- */}

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
