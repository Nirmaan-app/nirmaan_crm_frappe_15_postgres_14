import { useFrappeGetDoc,useSWRConfig } from "frappe-react-sdk"; // Import the other hook
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";

type CrmUserStub = {
    name: string;
    full_name: string;
};

interface MemberListProps {
    members: CrmUserStub[] | undefined;
    isLoading: boolean;
    onMemberSelect: (id: string) => void;
    activeMemberId: string | null;
}

const generateFallback = (fullName: string = "") => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : `${names[0][0]}`.toUpperCase();
};

  export const formatRoleName = (fullRoleName: string | null | undefined): string => {
    if (!fullRoleName) {
        return 'No Role'; // A fallback for missing roles
    }

    if (fullRoleName.includes('Sales')) {
        return 'Sales User';
    }
    if (fullRoleName.includes('Estimations')) {
        return 'Estimate User';
    }
    if (fullRoleName.includes('Admin')) {
        return 'Admin User';
    }

    // A default fallback if none of the keywords match
    return 'User';
};

// --- NEW: Component for a single list item ---
const MemberListItem = ({ member, onMemberSelect, activeMemberId }) => {
    // This item now fetches its own complete document to get the user_image.
    // This is very fast because it's a direct key lookup and runs for each item.
 const isActive = activeMemberId === member.name;

    return (
        <Card
            role="button"
            onClick={() => onMemberSelect(member.name)}
           className={`mb-2 p-3 cursor-pointer transition-colors ${
                isActive
                    ? "bg-destructive text-destructive-foreground ring-2 ring-destructive ring-offset-1" // Corrected Tailwind classes
                    : "hover:bg-muted/50"
            }`}
        >
            <div className="flex items-center justify-between">
                
                {/* Left Group */}
                <div className="flex items-center text-black gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user_image} alt={member.full_name} />
                        <AvatarFallback>{generateFallback(member.full_name)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                        <p className="font-semibold">{member.full_name}</p>
                        <p className="text-xs text-black-foreground"> {formatRoleName(member.nirmaan_role_name)}</p>
                    </div>
                </div>

                {/* Right Group (Chevron) */}
                <div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
            </div>
        </Card>
    );
};


// --- The main list component is now much simpler ---
export const MemberList = ({ members, isLoading, onMemberSelect, activeMemberId }: MemberListProps) => {
    if (isLoading) {
        // Skeleton logic remains the same
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        // <div className="flex-1 overflow-y-auto space-y-1">
        <div>
            {members?.map(member => (
                <MemberListItem
                    key={member.name}
                    member={member}
                    onMemberSelect={onMemberSelect}
                    activeMemberId={activeMemberId}
                />
            ))}
        </div>
    );
};

// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// // Assuming your CRM Users doctype has these fields
// type CrmUser = {
//     name: string;
//     full_name: string;
//     user_image?: string;
// };

// interface MemberListProps {
//     onMemberSelect: (id: string) => void;
//     activeMemberId: string | null;
// }

// const generateFallback = (fullName: string = "") => {
//     if (!fullName) return "U";
//     const names = fullName.split(" ");
//     return names.length > 1
//         ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
//         : `${names[0][0]}`.toUpperCase();
// };

// export const MemberList = ({ onMemberSelect, activeMemberId }: MemberListProps) => {
//     const { data: members, isLoading } = useFrappeGetDocList<CrmUser>("CRM Users", {
//         fields: ["*"],
//         limit: 200 // Adjust as needed
//     });

//     if (isLoading) {
//         return (
//             <div className="space-y-2">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                     <div key={i} className="flex items-center space-x-4 p-2">
//                         <Skeleton className="h-10 w-10 rounded-full" />
//                         <div className="space-y-2">
//                             <Skeleton className="h-4 w-[150px]" />
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         );
//     }

//     return (
//         <div className="flex-1 overflow-y-auto space-y-1">
//             {members?.map(member => (
//                 <div
//                     key={member.name}
//                     role="button"
//                     onClick={() => onMemberSelect(member.name)}
//                     className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
//                         activeMemberId === member.name ? "bg-muted" : "hover:bg-muted/50"
//                     }`}
//                 >
//                     <Avatar className="h-10 w-10">
//                         <AvatarImage src={member.user_image} alt={member.full_name} />
//                         <AvatarFallback>{generateFallback(member.full_name)}</AvatarFallback>
//                     </Avatar>
//                     <span className="font-medium">{member.full_name}</span>
//                 </div>
//             ))}
//         </div>
//     );
// };