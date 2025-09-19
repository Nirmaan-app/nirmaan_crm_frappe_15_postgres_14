// src/pages/MyTeam/UserProfileDialog.tsx
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Phone, MailIcon } from "lucide-react";
import { formatRoleName } from "@/pages/MyTeam/MemberList";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { Input } from "@/components/ui/input"; // Import Input for editing

// Import Frappe hooks for updating and SWR configuration
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { useSWRConfig } from "swr";

// Assuming useCurrentUser exists and fetches the current user's Frappe User document.
// Placeholder if your actual useCurrentUser is different or not fully defined:
// Make sure this hook provides `user`, `isLoading`, and `swrKey` for proper SWR integration.
import { useCurrentUser } from "@/hooks/useCurrentUser"; // Your actual hook


// Helper to generate initials for the avatar fallback
const generateFallback = (full_name: string = "") => {
    if (!full_name) return "U";
    const names = full_name.split(" ");
    return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : `${names[0][0]}`.toUpperCase();
};

export const UserProfileDialog = () => {
    const { closeUserProfileDialog } = useDialogStore();

    // Use the actual current user hook to fetch data from Frappe
    const { user,user_id, isLoading,mutate:updateMutateUser } = useCurrentUser(); // Assuming useCurrentUser returns user and swrKey

    // State for edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State for edited values, initialized from user data
    const [editedFullName, setEditedFullName] = useState("");
    const [editedMobileNo, setEditedMobileNo] = useState("");

    // Frappe update hook
    const { updateDoc } = useFrappeUpdateDoc();
    // SWR mutate function for revalidation
    const { mutate } = useSWRConfig();

    // Effect to sync edited fields when 'user' data changes (e.g., on initial load or after another update)
    useEffect(() => {
        if (user) {
            setEditedFullName(user.full_name || "");
            setEditedMobileNo(user.mobile_no || "");
        }
    }, [user]);

    // Derived values for cleaner rendering

    console.log("Administrator",user_id)
    const userId = user?.name ||user_id|| ''; // Frappe document name (often email for User doctype)
 const fullName = user_id === "Administrator" ? "Administrator" : (user?.full_name || '');
    const mobileNo = user?.mobile_no || '';
    const userImage = user?.user_image || '';
   const userRole = (user_id === "Administrator" || user?.is_administrator)
        ? "Nirmaan Admin User Profile"
        : (user?.nirmaan_role_name || "No Role Assigned"); // Fallback if no specific role is assigned


    const hasUserData = user && userId && userId !== 'Guest'||user_id=="Administrator"; // is_administrator is a boolean on User doctype

    const isCurrentUserAdmin = userRole === "Nirmaan Admin User Profile";


    const handleSave = async () => {
        if (!user || !user.name) {
            console.error("User data not available for update.");
            return;
        }

        try {
            await updateDoc('User', user.name, {
                first_name: editedFullName,
                mobile_no: editedMobileNo,
            });

            console.log('User profile updated successfully!');
            // Also update localStorage for consistency with the existing code's pattern
            // This is generally less ideal than relying solely on SWR, but maintains original behavior.
            //   mutate(key => typeof key === 'string' && key.startsWith('all-members'));
            //  mutate(key => typeof key === 'string' && key.startsWith(`loginuser-${user.name}`));
            updateMutateUser()
            localStorage.setItem('fullName', editedFullName);
            localStorage.setItem('mobileNO', editedMobileNo);
            setIsEditing(false); // Exit edit mode]
            closeUserProfileDialog()

             
            // If nirmaan_role_name or other fields could change, update them too.
            // For now, only fullName and mobileNO are editable.

        } catch (error) {
            console.error('Failed to update user profile:', error);
            // TODO: Add error notification/toast
        }
    };

    const handleCancel = () => {
        // Revert changes and exit edit mode
        setEditedFullName(user?.full_name || "");
        setEditedMobileNo(user?.mobile_no || "");
        setIsEditing(false);
    };

    return (
        <div className="p-0">
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
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            ) : hasUserData ? (
                // --- User Data Display (if not loading and has data) ---
                <div className="grid gap-6 py-4">
                    {/* User Avatar and Name */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-destructive">
                            <AvatarImage src={userImage} alt={fullName} />
                            <AvatarFallback className="text-2xl bg-destructive text-destructive-foreground">
                                {generateFallback(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                            {isEditing ? (
                                <Input
                                    value={editedFullName}
                                    onChange={(e) => setEditedFullName(e.target.value)}
                                    className="text-xl font-bold leading-none text-foreground"
                                />
                            ) : (
                                <p className="text-xl font-bold leading-none text-foreground">{fullName}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {formatRoleName(userRole) || "No Role Assigned"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Email */}
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-right text-sm font-semibold text-foreground flex items-center justify-end gap-2">
                            <MailIcon className="h-4 w-4 text-destructive" />
                            Email
                        </span>
                        <div className="col-span-2 text-base text-muted-foreground space-y-1">
                            <p>{userId}</p>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="grid grid-cols-3 items-center gap-4">
                        <span className="text-right text-sm font-semibold text-foreground flex items-center justify-end gap-2">
                            <Phone className="h-4 w-4 text-destructive" />
                            Phone
                        </span>
                        <div className="col-span-2">
                            {isEditing ? (
                                <Input
                                    value={editedMobileNo}
                                    onChange={(e) => setEditedMobileNo(e.target.value)}
                                    className="text-base text-muted-foreground"
                                />
                            ) : (
                                <p className="text-base text-muted-foreground">
                                    {mobileNo || "Not provided"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                        {
                            isEditing ? (
                                <>
                                    <Button variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleSave}>
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <>
                                {user_id !=="Administrator"&&(
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    Edit
                                </Button>
                                )}
                                </>
                            )
            }
                       
                        <Button variant="outline" onClick={closeUserProfileDialog}>
                            Close
                        </Button>
                    </div>
                </div>
            ) : (
                // --- No User Data State (if not loading and no data) ---
                <div className="py-8 text-center text-muted-foreground">
                    <UserIcon className="h-10 w-10 mx-auto mb-4 text-destructive" />
                    <p className="text-lg font-semibold">User data not available.</p>
                    <p className="text-sm mt-1">Please ensure you are logged in correctly.</p>
                </div>
            )}
        </div>
    );
};
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Skeleton } from "../ui/skeleton";
// import { Separator } from "../ui/separator";
// import { User as UserIcon, Phone, Tag, MailIcon} from "lucide-react";
// import { formatRoleName } from "@/pages/MyTeam/MemberList";
// import { Button } from "@/components/ui/button";
// import { useDialogStore } from "@/store/dialogStore";



// // Helper to generate initials for the avatar fallback
// const generateFallback = (full_name: string = "") => {
//     if (!full_name) return "U";
//     const names = full_name.split(" ");
//     return names.length > 1
//         ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
//         : `${names[0][0]}`.toUpperCase();
// };

// export const UserProfileDialog = () => {

//         const { userProfile, closeUserProfileDialog } = useDialogStore();
    
 
//     // const { 
//     //     user,
//     //     user_id,
//     //     full_name,
//     //     user_image,
//     //     isLoading 
//     // } = useCurrentUser();

//     const role = localStorage.getItem('role');
//     const full_name = localStorage.getItem('fullName');

//     const user_id = localStorage.getItem('userId');
//     const user_image=""
//     const mobile_no=localStorage.getItem('mobileNO');



//     const hasUserData = user_id && user_id !== 'Guest' && (user_id || user_id === 'Administrator');
//     const isAdministrator = user_id === 'Administrator';

//     return (
//         <div className="p-0"> {/* Use a div or React.Fragment for this component's top-level container */}
//             {/* The header is now part of ReusableFormDialog's layout,
//                 so we only style the content within the main dialog area */}
            
//             {!user_id ? (
//                 // --- Loading State Skeleton ---
//                 <div className="space-y-6 py-4">
//                     <div className="flex items-center space-x-4">
//                         <Skeleton className="h-20 w-20 rounded-full" />
//                         <div className="space-y-2">
//                             <Skeleton className="h-5 w-48" />
//                             <Skeleton className="h-4 w-36" />
//                         </div>
//                     </div>
//                     <Separator />
//                     <div className="space-y-3">
//                         <Skeleton className="h-4 w-full" />
//                         <Skeleton className="h-4 w-full" />
//                     </div>
//                 </div>
//             ) : hasUserData ? (
//                 // --- User Data Display ---
//                 <div className="grid gap-6 py-4">
//                     {/* User Avatar and Name */}
//                     <div className="flex items-center gap-4">
//                         <Avatar className="h-20 w-20 border-2 border-destructive">
//                             <AvatarImage src={user_image||""} alt={full_name} />
//                             <AvatarFallback className="text-2xl bg-destructive text-destructive-foreground">
//                                 {generateFallback(full_name)}
//                             </AvatarFallback>
//                         </Avatar>
//                         <div className="grid gap-1">
//                             <p className="text-xl font-bold leading-none text-foreground">{full_name}</p>
//                             {/* <p className="text-sm text-muted-foreground">{user_id}</p> */}
//                         <p>{formatRoleName(role) || (isAdministrator ? "Nirmaan Admin User Profile" : "No Role Assigned")}</p>

//                         </div>
//                     </div>

//                     <Separator />

//                      <div className="grid grid-cols-3 items-center gap-4">
//                         <span className="text-right text-sm font-semibold text-foreground flex items-center justify-end gap-2">
//                             <MailIcon className="h-4 w-4 text-destructive"/>
//                             Email
//                         </span>
//                         <div className="col-span-2 text-base text-muted-foreground space-y-1">
//                             <p>{user_id || (isAdministrator ? "Nirmaan Admin User Profile" : "No Role Assigned")}</p>
//                         </div>
//                     </div>

//                     {/* Phone Number */}
//                     <div className="grid grid-cols-3 items-center gap-4">
//                         <span className="text-right text-sm font-semibold text-foreground flex items-center justify-end gap-2">
//                             <Phone className="h-4 w-4 text-destructive"/>
//                             Phone
//                         </span>
//                         <span className="col-span-2 text-base text-muted-foreground">
//                             {mobile_no || "Not provided"}
//                         </span>
//                     </div>

//                     {/* Roles */}
//                     <Button variant="outline" className="w-full" onClick={closeUserProfileDialog}>
//                                     Close
//                                 </Button>
                   
//                 </div>
//             ) : (
//                 // --- No User Data State ---
//                 <div className="py-8 text-center text-muted-foreground">
//                     <UserIcon className="h-10 w-10 mx-auto mb-4 text-destructive"/>
//                     <p className="text-lg font-semibold">User data not available.</p>
//                     <p className="text-sm mt-1">Please ensure you are logged in correctly.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

