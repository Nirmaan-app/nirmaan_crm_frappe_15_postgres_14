import { useFrappeGetDoc,useSWRConfig } from "frappe-react-sdk"; // Import the other hook
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

// --- NEW: Component for a single list item ---
const MemberListItem = ({ member, onMemberSelect, activeMemberId }) => {
    // This item now fetches its own complete document to get the user_image.
    // This is very fast because it's a direct key lookup and runs for each item.
    const { data: fullMemberDoc } = useFrappeGetDoc("CRM Users", member.name);

    return (
        <div
            role="button"
            onClick={() => onMemberSelect(member.name)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                activeMemberId === member.name ? "bg-muted" : "hover:bg-muted/50"
            }`}
        >
            <Avatar className="h-10 w-10">
                {/* Use the user_image from the full document */}
                <AvatarImage src={fullMemberDoc?.user_image} alt={member.full_name} />
                <AvatarFallback>{generateFallback(member.full_name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{member.full_name}</span>
        </div>
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
        <div className="flex-1 overflow-y-auto space-y-1">
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