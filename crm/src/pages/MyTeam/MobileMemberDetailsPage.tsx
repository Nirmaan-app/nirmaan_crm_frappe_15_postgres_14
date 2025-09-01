// src/pages/MyTeam/MobileMemberDetailsPage.tsx

import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { MemberDetails } from "./MemberDetails"; // We are reusing the smart component

/**
 * This component is a simple "container" or "wrapper" for the mobile route.
 * Its ONLY job is to get the `memberId` from the URL and pass it to the real `MemberDetails` component.
 * It does NOT fetch any data itself.
 */
export const MobileMemberDetailsPage = () => {
    
    // Get the memberId from the URL query string (e.g., /team/details?memberId=...).
    const [memberId] = useStateSyncedWithParams<string>("memberId", "");

    // Handle the edge case where no memberId is present in the URL.
    if (!memberId) {
        return (
            <div className="p-4">
                <p className="text-muted-foreground text-center">
                    No team member selected.
                </p>
            </div>
        );
    }
    
    // Render the smart MemberDetails component, passing the ID.
    // MemberDetails will now handle all of its own loading states and data fetching,
    // including all the role-based logic.
    return (
        <MemberDetails memberId={memberId} />
    );
};