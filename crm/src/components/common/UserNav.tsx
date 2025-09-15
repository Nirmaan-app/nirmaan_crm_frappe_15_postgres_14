// src/components/ui/UserNav.tsx (Corrected)

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/auth/AuthProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDialogStore } from "@/store/dialogStore";
import { LogOut, User as UserIcon } from "lucide-react";
import React, { useState } from "react"; // <--- Import useState

const generateFallback = (fullName: string = "") => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : `${names[0][0]}`.toUpperCase();
};

export function UserNav() {
    const { logout } = useAuth();
    const { openUserProfileDialog } = useDialogStore(); // No need for userProfile state directly here
    const { user,role,user_id,  full_name,
            user_image, isLoading,has_company } = useCurrentUser();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // <--- Add state to control dropdown open/close

    if (isLoading) {
        return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    // This function will close the dropdown and then open the user profile dialog.
    const handleProfileClick = () => {
        setIsDropdownOpen(false); // <--- First, close the dropdown
        // Use a small timeout to allow the dropdown to fully close and release focus,
        // before the new dialog tries to grab it. This can prevent race conditions.
        setTimeout(() => {
            openUserProfileDialog(); // <--- Then, open the dialog
        }, 100); // 100ms is usually sufficient; adjust if needed.
    };


    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}> {/* <--- Control open state */}
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user_image} alt={full_name} />
                        <AvatarFallback>{generateFallback(full_name)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user_id||""}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}> {/* <--- Use the new handler */}
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuGroup,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useAuth } from "@/auth/AuthProvider";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { useDialogStore } from "@/store/dialogStore";
// import { LogOut, User as UserIcon } from "lucide-react";

// const generateFallback = (fullName: string = "") => {
//     if (!fullName) return "U";
//     const names = fullName.split(" ");
//     return names.length > 1
//         ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
//         : `${names[0][0]}`.toUpperCase();
// };

// export function UserNav() {
//     const { logout } = useAuth();
//     const { userProfile,openUserProfileDialog } = useDialogStore();
//     const { user,role,user_id,  full_name,
//             user_image, isLoading,has_company } = useCurrentUser();

//     // console.log("useCurrentUser ",user)

//     if (isLoading) {
//         return <Skeleton className="h-8 w-8 rounded-full" />;
//     }

//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                     <Avatar className="h-8 w-8">
//                         <AvatarImage src={user_image} alt={full_name} />
//                         <AvatarFallback>{generateFallback(full_name)}</AvatarFallback>
//                     </Avatar>
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-56" align="end" forceMount>
//                 <DropdownMenuLabel className="font-normal">
//                     <div className="flex flex-col space-y-1">
//                         <p className="text-sm font-medium leading-none">{full_name}</p>
//                         <p className="text-xs leading-none text-muted-foreground">
//                             {user_id||""}
//                         </p>
//                     </div>
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuGroup>
//                     <DropdownMenuItem className="cursor-pointer" onClick={()=>openUserProfileDialog()}>
//                         <UserIcon className="mr-2 h-4 w-4" />
//                         <span>Profile</span>
//                     </DropdownMenuItem>
//                 </DropdownMenuGroup>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>Log out</span>
//                 </DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// }