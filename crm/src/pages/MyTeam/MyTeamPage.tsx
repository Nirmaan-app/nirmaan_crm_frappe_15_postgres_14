import { useViewport } from "@/hooks/useViewPort";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { MemberList } from "./MemberList";
import { MemberDetails } from "./MemberDetails";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const DesktopPlaceholder = () => (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
        <span className="text-muted-foreground">Select a team member to see their details</span>
    </div>
);

export const MyTeamPage = () => {
    const { isMobile } = useViewport();
    const navigate = useNavigate();
    const [memberId, setMemberId] = useStateSyncedWithParams<string>("memberId", "");

    // --- OPTIMIZED DATA FETCHING ---
    // 1. Fetch the list of all team members (CRM Users).
    const { data: members, isLoading: membersLoading } = useFrappeGetDocList("CRM Users", {
        fields: ["*"],
        limit: 200
    },"all-members-MyTeamPage");

    // 2. Get a list of all member emails to use in the next query.
    const memberEmails = useMemo(() => members?.map(m => m.email) || [], [members]);

    // 3. Fetch all tasks, contacts, and BOQs for ALL team members in a single batch of requests.
    // The `enabled` flag prevents this from running until we have the member emails.
    const { data: allTasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
        fields: ["*"],
        filters: [['owner', 'in', memberEmails]],
        limit: 0,
        enabled: memberEmails.length > 0
    },`all-tasks-membermails`);

    const { data: allContacts, isLoading: contactsLoading } = useFrappeGetDocList("CRM Contacts", {
        fields: ["*"],
        filters: [['owner', 'in', memberEmails]],
        limit: 0,
        enabled: memberEmails.length > 0
    },`all-contacts-membermails`);

    const { data: allBoqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
        fields: ["*"],
        filters: [['owner', 'in', memberEmails]],
        limit: 0,
        enabled: memberEmails.length > 0
    },`all-boqs-membermails`);

    // 4. Group the fetched data by owner for quick lookup. This is extremely fast.
    const dataByUser = useMemo(() => {
        const groupedData = new Map();
        if (!members) return groupedData;

        for (const member of members) {
            groupedData.set(member.name, {
                tasks: allTasks?.filter(t => t.owner === member.email) || [],
                contacts: allContacts?.filter(c => c.owner === member.email) || [],
                boqs: allBoqs?.filter(b => b.owner === member.email) || [],
            });
        }
        return groupedData;
    }, [members, allTasks, allContacts, allBoqs]);

    const selectedMember = members?.find(m => m.name === memberId);
    const selectedMemberData = dataByUser.get(memberId);

    const isLoading = membersLoading || tasksLoading || contactsLoading || boqsLoading;

    if (isMobile) {
        // --- THIS IS THE CHANGE ---
        // The onMemberSelect function now navigates to the new dedicated mobile route.
        return (
            <MemberList 
                members={members} 
                isLoading={isLoading}
                onMemberSelect={(id) => navigate(`/team/details?memberId=${id}`)} // Correct navigation
            />
        );
    }

    return (
        <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
            {/* Master Panel (Left) */}
            <div className="bg-background rounded-lg border p-4 flex flex-col">
                <h2 className="text-lg font-semibold mb-4">Team Members</h2>
                <MemberList
                    members={members}
                    isLoading={membersLoading}
                    onMemberSelect={setMemberId}
                    activeMemberId={memberId}
                />
                <div className="mt-4 border-t pt-4">
                    <button className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
                        <Plus size={20} /> Add New CRM User
                    </button>
                </div>
            </div>

            {/* Detail Panel (Right) */}
            <div className="overflow-y-auto">
                {isLoading && memberId && <Skeleton className="h-full w-full" />}
                {!isLoading && selectedMember && selectedMemberData ? (
                    <MemberDetails
                        key={memberId} // IMPORTANT: Add a key to force re-mount on ID change
                        member={selectedMember}
                        tasks={selectedMemberData.tasks}
                        contacts={selectedMemberData.contacts}
                        boqs={selectedMemberData.boqs}
                    />
                ) : (
                    <DesktopPlaceholder />
                )}
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

// const DesktopPlaceholder = () => (
//     <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
//         <span className="text-muted-foreground">Select a team member to see their details</span>
//     </div>
// );

// export const MyTeamPage = () => {
//     const { isMobile } = useViewport();
//     const navigate = useNavigate();

//     // 'memberId' will be stored in the URL (e.g., /team?memberId=user@example.com)
//     const [memberId, setMemberId] = useStateSyncedWithParams<string>("memberId", "");

//     // Mobile view will likely be just the list, which navigates to a detail page.
//     // For now, we focus on the desktop master-detail layout.
//     if (isMobile) {
//         // You could have a separate mobile-optimized flow here
//         return <MemberList onMemberSelect={(id) => navigate(`/team/details?memberId=${id}`)} />;
//     }

//     return (
//         <div className="grid grid-cols-[350px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
//             {/* Master Panel (Left) */}
//             <div className="bg-background rounded-lg border p-4 flex flex-col">
//                 <h2 className="text-lg font-semibold mb-4">Team Members</h2>
//                 <MemberList
//                     onMemberSelect={setMemberId}
//                     activeMemberId={memberId}
//                 />
//                 <div className="mt-4">
//           <button
//             // onClick={openNewCompanyDialog}
//             className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
//           >
//             <Plus size={20} /> Add New CRM User
//           </button>
//         </div>
//             </div>

//             {/* Detail Panel (Right) */}
//             <div className="overflow-y-auto">
//                 {memberId ? <MemberDetails memberId={memberId} /> : <DesktopPlaceholder />}
//             </div>
//         </div>
//     );
// };
