import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberDetails } from "./MemberDetails"; // We will reuse the actual UI component
import { useMemo } from "react";

// This is a "container" component specifically for the mobile route.
export const MobileMemberDetailsPage = () => {
    // 1. Get the memberId from the URL, e.g., /team/details?memberId=...
    const [memberId] = useStateSyncedWithParams<string>("memberId", "");

    // 2. Fetch the main CRM User document for this member.
    const { data: member, isLoading: memberLoading } = useFrappeGetDoc("CRM Users", memberId, {
        enabled: !!memberId
    });
    
    // The email is needed to fetch the related documents.
    const ownerEmail = member?.email;

    // 3. Fetch all related documents owned by this member.
    const { data: tasks, isLoading: tasksLoading } = useFrappeGetDocList("CRM Task", {
        fields: ["*"],
        filters: { owner: ownerEmail },
        limit: 0,
        enabled: !!ownerEmail
    },`all-tasks-ownerEmail`);

    const { data: contacts, isLoading: contactsLoading } = useFrappeGetDocList("CRM Contacts", {
        fields: ["*"],
        filters: { owner: ownerEmail },
        limit: 0,
        enabled: !!ownerEmail
    },`all-contacts-ownerEmail`);

    const { data: boqs, isLoading: boqsLoading } = useFrappeGetDocList("CRM BOQ", {
        fields: ["*"],
        filters: { owner: ownerEmail },
        limit: 0,
        enabled: !!ownerEmail
    },`all-boqs-ownerEmail`);

    // 4. Show a loading state while any of the data is being fetched.
    const isLoading = memberLoading || tasksLoading || contactsLoading || boqsLoading;
    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }
    
    // 5. Once all data is loaded, render the 'MemberDetails' UI component,
    // passing the fetched data down as props.
    return (
        <MemberDetails 
            member={member} 
            tasks={tasks} 
            contacts={contacts} 
            boqs={boqs} 
        />
    );
};