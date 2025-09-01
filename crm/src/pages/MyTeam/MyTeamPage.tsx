// src/pages/MyTeam/MyTeamPage.tsx

import { useViewport } from "@/hooks/useViewPort";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { MemberList } from "./MemberList";
import { MemberDetails } from "./MemberDetails";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialogStore } from "@/store/dialogStore";

// A simple placeholder for the initial view before a member is selected.
const DesktopPlaceholder = () => (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
        <span className="text-muted-foreground">Select a team member to see their details</span>
    </div>
);

export const MyTeamPage = () => {
    const { isMobile } = useViewport();
    const navigate = useNavigate();
    const { openNewUserDialog } = useDialogStore();
    const [memberId, setMemberId] = useStateSyncedWithParams<string>("memberId", "");

    // The ONLY data this page fetches is the list of team members for the sidebar.
    const { data: members, isLoading: membersLoading } = useFrappeGetDocList("CRM Users", {
        fields: ["name", "email", "full_name", "nirmaan_role_name"],
        limit: 200
    }, "all-members-MyTeamPage");

    // The mobile view navigates to a separate page for details.
    if (isMobile) {
        return (
            <MemberList 
                members={members || []} 
                isLoading={membersLoading}
                onMemberSelect={(id) => navigate(`/team/details?memberId=${id}`)}
            />
        );
    }

    // The desktop view uses the master-detail layout.
    return (
        <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
            {/* Master Panel (Left Sidebar) */}
         <div className="bg-background rounded-lg border flex flex-col min-h-0">
        {/* Header - Fixed at top */}
            <div className="p-4 border-b flex-shrink-0">
                <h2 className="text-lg font-semibold mb-4">Team Members</h2>
            </div>
        <div className="flex-1 overflow-y-auto min-h-0 p-4">

                <MemberList
                    members={members || []}
                    isLoading={membersLoading}
                    onMemberSelect={setMemberId}
                    activeMemberId={memberId}
                />

                </div>

                <div className="p-4 border-t flex-shrink-0">
                    <button 
                        onClick={openNewUserDialog}
                        className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Add New CRM User
                    </button>
                </div>
            </div>

            {/* Detail Panel (Right Content Area) */}
           <div className="bg-background rounded-lg border min-h-0">
        <div className="h-full overflow-y-auto p-4">
                {/* 
                  - If a memberId is selected, we render the MemberDetails component.
                  - The `key={memberId}` is CRITICAL. It tells React to create a new instance
                    of MemberDetails whenever the ID changes, which correctly triggers the
                    on-demand data fetching inside it.
                */}
                {memberId ? (
                    <MemberDetails key={memberId} memberId={memberId} />
                ) : (
                    <DesktopPlaceholder />
                )}
                </div>
            </div>
        </div>
    );
};

// import { useViewport } from "@/hooks/useViewPort";
// import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
// import { MemberList } from "./MemberList";
// import { MemberDetails } from "./MemberDetails";
// import { useNavigate } from "react-router-dom";
// import { Plus } from "lucide-react";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo } from "react";
// import { Skeleton } from "@/components/ui/skeleton";

// const DesktopPlaceholder = () => (
//     <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
//         <span className="text-muted-foreground">Select a team member to see their details</span>
//     </div>
// );

// export const MyTeamPage = () => {
//     const { isMobile } = useViewport();
//     const navigate = useNavigate();
//     const [memberId, setMemberId] = useStateSyncedWithParams<string>("memberId", "");

//     // --- OPTIMIZED DATA FETCHING ---
//     // 1. Fetch the list of all team members (CRM Users).
//     const { data: members, isLoading: membersLoading } = useFrappeGetDocList("CRM Users", {
//         fields: ["*"],
//         limit: 200
//     },"all-members-MyTeamPage");



//     // 2. Get a list of all member emails to use in the next query.
//     const memberEmails = useMemo(() => members?.map(m => m.email) || [], [members]);

//     console.log("memberEmails",memberEmails)

//     // 3. Fetch all tasks, contacts, and BOQs for ALL team members in a single batch of requests.
//     // The `enabled` flag prevents this from running until we have the member emails.
//     const { data: allTasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
//         fields: ["*"],
//         filters: [['assigned_sales', 'in', memberEmails]],
//         limit: 0,
//         enabled: memberEmails.length > 0
//     },`all-tasks-membermails`);

//     const { data: allContacts, isLoading: contactsLoading } = useFrappeGetDocList("CRM Contacts", {
//         fields: ["*"],
//         filters: [['owner', 'in', memberEmails]],
//         limit: 0,
//         enabled: memberEmails.length > 0
//     },`all-contacts-membermails`);

//     const { data: allBoqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
//         fields: ["*"],
//         filters: [['assigned_sales', 'in', memberEmails]],
//         limit: 0,
//         enabled: memberEmails.length > 0
//     },`all-boqs-membermails`);

//     // 4. Group the fetched data by owner for quick lookup. This is extremely fast.
//     const dataByUser = useMemo(() => {
//         const groupedData = new Map();
//         if (!members) return groupedData;

//         for (const member of members) {
//             groupedData.set(member.name, {
//                 tasks: allTasks?.filter(t => t.owner === member.email) || [],
//                 contacts: allContacts?.filter(c => c.owner === member.email) || [],
//                 boqs: allBoqs?.filter(b => b.owner === member.email) || [],
//             });
//         }
//         return groupedData;
//     }, [members, allTasks, allContacts, allBoqs]);

//     const selectedMember = members?.find(m => m.name === memberId);
//     const selectedMemberData = dataByUser.get(memberId);

//     const isLoading = membersLoading || tasksLoading || contactsLoading || boqsLoading;

//     if (isMobile) {
//         // --- THIS IS THE CHANGE ---
//         // The onMemberSelect function now navigates to the new dedicated mobile route.
//         return (
//             <MemberList 
//                 members={members} 
//                 isLoading={isLoading}
//                 onMemberSelect={(id) => navigate(`/team/details?memberId=${id}`)} // Correct navigation
//             />
//         );
//     }

//     return (
//         <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
//             {/* Master Panel (Left) */}
//             <div className="bg-background rounded-lg border p-4 flex flex-col">
//                 <h2 className="text-lg font-semibold mb-4">Team Members</h2>
//                 <MemberList
//                     members={members}
//                     isLoading={membersLoading}
//                     onMemberSelect={setMemberId}
//                     activeMemberId={memberId}
//                 />
//                 <div className="mt-4 border-t pt-4">
//                     <button className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
//                         <Plus size={20} /> Add New CRM User
//                     </button>
//                 </div>
//             </div>

//             {/* Detail Panel (Right) */}
//             <div className="overflow-y-auto">
//                 {isLoading && memberId && <Skeleton className="h-full w-full" />}
//                 {!isLoading && selectedMember && selectedMemberData ? (
//                     <MemberDetails
//                         key={memberId} // IMPORTANT: Add a key to force re-mount on ID change
//                         member={selectedMember}
//                         tasks={selectedMemberData.tasks}
//                         contacts={selectedMemberData.contacts}
//                         boqs={selectedMemberData.boqs}
//                     />
//                 ) : (
//                     <DesktopPlaceholder />
//                 )}
//             </div>
//         </div>
//     );
// };

