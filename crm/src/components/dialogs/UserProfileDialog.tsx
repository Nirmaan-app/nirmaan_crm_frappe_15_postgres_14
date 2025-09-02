
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { User as UserIcon, Phone, Tag, MailIcon} from "lucide-react";
import { formatRoleName } from "@/pages/MyTeam/MemberList";

// Helper to generate initials for the avatar fallback
const generateFallback = (full_name: string = "") => {
    if (!full_name) return "U";
    const names = full_name.split(" ");
    return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : `${names[0][0]}`.toUpperCase();
};

export const UserProfileDialog = () => {
 
    const { 
        user,
        user_id,
        full_name,
        user_image,
        role,
        isLoading 
    } = useCurrentUser();

    const hasUserData = user_id && user_id !== 'Guest' && (user || user_id === 'Administrator');
    const isAdministrator = user_id === 'Administrator';

    return (
        <div className="p-0"> {/* Use a div or React.Fragment for this component's top-level container */}
            {/* The header is now part of ReusableFormDialog's layout,
                so we only style the content within the main dialog area */}
            
            {isLoading ? (
                // --- Loading State Skeleton ---
                <div className="space-y-6 py-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            ) : hasUserData ? (
                // --- User Data Display ---
                <div className="grid gap-6 py-4">
                    {/* User Avatar and Name */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-destructive">
                            <AvatarImage src={user_image} alt={full_name} />
                            <AvatarFallback className="text-2xl bg-destructive text-destructive-foreground">
                                {generateFallback(full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-xl font-bold leading-none text-foreground">{full_name}</p>
                            {/* <p className="text-sm text-muted-foreground">{user_id}</p> */}
                        <p>{formatRoleName(role) || (isAdministrator ? "Nirmaan Admin User Profile" : "No Role Assigned")}</p>

                        </div>
                    </div>

                    <Separator />

                     <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-right text-sm font-semibold text-foreground flex items-center justify-end gap-2">
                            <MailIcon className="h-4 w-4 text-destructive"/>
                            Email
                        </span>
                        <div className="col-span-2 text-base text-muted-foreground space-y-1">
                            <p>{user_id || (isAdministrator ? "Nirmaan Admin User Profile" : "No Role Assigned")}</p>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-right text-sm font-semibold text-foreground flex items-center justify-end gap-2">
                            <Phone className="h-4 w-4 text-destructive"/>
                            Phone
                        </span>
                        <span className="col-span-2 text-base text-muted-foreground">
                            {user?.mobile_no || "Not provided"}
                        </span>
                    </div>

                    {/* Roles */}
                   
                </div>
            ) : (
                // --- No User Data State ---
                <div className="py-8 text-center text-muted-foreground">
                    <UserIcon className="h-10 w-10 mx-auto mb-4 text-destructive"/>
                    <p className="text-lg font-semibold">User data not available.</p>
                    <p className="text-sm mt-1">Please ensure you are logged in correctly.</p>
                </div>
            )}
        </div>
    );
};

// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
// } from "@/components/ui/dialog";
// import { useDialogStore } from "@/store/dialogStore";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Skeleton } from "../ui/skeleton";

// const generateFallback = (full_name: string = "") => {
//     if (!full_name) return "U";
//     const names = full_name.split(" ");
//     return names.length > 1
//         ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
//         : `${names[0][0]}`.toUpperCase();
// };

// export const UserProfileDialog = () => {
//     const { isOpen } = useDialogStore((state) => state.userProfile);
//     const { closeUserProfileDialog } = useDialogStore();
//     const { user,user_id,full_name,
//             user_image,
//             role,
//             has_company, isLoading } = useCurrentUser();

//     return (
//         <Dialog open={isOpen} onOpenChange={closeUserProfileDialog}>
//             <DialogContent className="sm:max-w-[425px]">
//                 <DialogHeader>
//                     <DialogTitle>User Profile</DialogTitle>
//                     <DialogDescription>Your personal information on the CRM.</DialogDescription>
//                 </DialogHeader>
//                 {isLoading ? (
//                     <div className="space-y-4 py-4">
//                         <div className="flex items-center space-x-4">
//                             <Skeleton className="h-16 w-16 rounded-full" />
//                             <div className="space-y-2">
//                                 <Skeleton className="h-4 w-[250px]" />
//                                 <Skeleton className="h-4 w-[200px]" />
//                             </div>
//                         </div>
//                         <Skeleton className="h-4 w-full" />
//                         <Skeleton className="h-4 w-full" />
//                     </div>
//                 ) : user_id=="Administrator"||user  ? (
//                     <div className="grid gap-4 py-4">
//                         <div className="flex items-center gap-4">
//                             <Avatar className="h-16 w-16">
//                                 <AvatarImage src={user_image} alt={full_name} />
//                                 <AvatarFallback className="text-xl">
//                                     {generateFallback(full_name)}
//                                 </AvatarFallback>
//                             </Avatar>
//                             <div className="grid gap-1">
//                                 <p className="text-lg font-semibold leading-none">{full_name}</p>
//                                 <p className="text-sm text-muted-foreground">{user_id}</p>
//                             </div>
//                         </div>
//                         <div className="grid grid-cols-3 items-center gap-4">
//                             <span className="text-right text-sm font-medium">Phone</span>
//                             <span className="col-span-2 text-sm text-muted-foreground">
//                                 {user?.mobile_no||"Not provided"}
//                             </span>
//                         </div>
//                         <div className="grid grid-cols-3 items-center gap-4">
//                             <span className="text-right text-sm font-medium">Roles</span>
//                             <div className="col-span-2 text-sm text-muted-foreground space-y-1">
//                                 {/* {user.roles?.map(role => (
//                                     <p key={role.role}>{role.role}</p>
//                                 ))} */}
//                                 {role}
                               
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     <p>Could not load user data.</p>
//                 )}
//             </DialogContent>
//         </Dialog>
//     );
// };