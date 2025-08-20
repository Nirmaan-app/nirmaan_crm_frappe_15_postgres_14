import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useDialogStore } from "@/store/dialogStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "../ui/skeleton";

const generateFallback = (fullName: string = "") => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : `${names[0][0]}`.toUpperCase();
};

export const UserProfileDialog = () => {
    const { isOpen } = useDialogStore((state) => state.userProfile);
    const { closeUserProfileDialog } = useDialogStore();
    const { user, isLoading, fullName, userImage } = useCurrentUser();

    return (
        <Dialog open={isOpen} onOpenChange={closeUserProfileDialog}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                    <DialogDescription>Your personal information on the CRM.</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : user ? (
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={userImage} alt={fullName} />
                                <AvatarFallback className="text-xl">
                                    {generateFallback(fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <p className="text-lg font-semibold leading-none">{user.full_name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-right text-sm font-medium">Phone</span>
                            <span className="col-span-2 text-sm text-muted-foreground">
                                {user.mobile_no || "Not provided"}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="text-right text-sm font-medium">Roles</span>
                            <div className="col-span-2 text-sm text-muted-foreground space-y-1">
                                {user.roles?.map(role => (
                                    <p key={role.role}>{role.role}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Could not load user data.</p>
                )}
            </DialogContent>
        </Dialog>
    );
};