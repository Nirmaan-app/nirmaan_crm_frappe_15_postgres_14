// src/components/dialogs/UserProfileDialog.tsx
// Nirmaan CRM - User Profile Dialog
// Brand Color: #d03b45 (--destructive / --primary)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User as UserIcon,
    Phone,
    Mail,
    Pencil,
    X,
    Check,
    Shield,
    Loader2
} from "lucide-react";
import { formatRoleName } from "@/pages/MyTeam/MemberList";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

interface ValidationErrors {
    firstName?: string;
    phone?: string;
}

interface TouchedFields {
    firstName: boolean;
    phone: boolean;
}

const validatePhone = (phone: string): string | undefined => {
    if (!phone) return undefined;
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        return "Enter valid Indian mobile (10 digits)";
    }
    return undefined;
};

const validateFirstName = (name: string): string | undefined => {
    if (!name || name.trim().length === 0) {
        return "First name is required";
    }
    if (name.trim().length < 2) {
        return "At least 2 characters required";
    }
    return undefined;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateFallback = (firstName: string = "", lastName: string = "") => {
    const first = firstName?.trim()?.[0] || "";
    const last = lastName?.trim()?.[0] || "";
    if (first && last) return `${first}${last}`.toUpperCase();
    if (first) return first.toUpperCase();
    return "U";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const UserProfileDialog = () => {
    const { closeUserProfileDialog } = useDialogStore();
    const { user, user_id, isLoading, mutate: updateMutateUser } = useCurrentUser();
    const { toast } = useToast();

    // Refs for keyboard navigation
    const firstInputRef = useRef<HTMLInputElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form fields
    const [editedFirstName, setEditedFirstName] = useState("");
    const [editedLastName, setEditedLastName] = useState("");
    const [editedMobileNo, setEditedMobileNo] = useState("");

    // Validation state
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<TouchedFields>({
        firstName: false,
        phone: false
    });

    // Frappe update hook
    const { updateDoc } = useFrappeUpdateDoc();

    // Sync form fields when user data loads
    useEffect(() => {
        if (user) {
            setEditedFirstName(user.first_name || "");
            setEditedLastName(user.last_name || "");
            setEditedMobileNo(user.mobile_no || "");
        }
    }, [user]);

    // Focus first input when entering edit mode
    useEffect(() => {
        if (isEditing && firstInputRef.current) {
            setTimeout(() => firstInputRef.current?.focus(), 100);
        }
    }, [isEditing]);

    // Clear state when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setErrors({});
            setTouched({ firstName: false, phone: false });
        }
    }, [isEditing]);

    // Derived values
    const userId = user?.name || user_id || '';
    const isAdministrator = user_id === "Administrator";
    const firstName = isAdministrator ? "Administrator" : (user?.first_name || '');
    const lastName = isAdministrator ? "" : (user?.last_name || '');
    const fullName = isAdministrator ? "Administrator" : (user?.full_name || '');
    const mobileNo = user?.mobile_no || '';
    const userImage = user?.user_image || '';
    const userRole = isAdministrator
        ? "Nirmaan Admin User Profile"
        : (user?.nirmaan_role_name || "No Role Assigned");

    const hasUserData = (user && userId && userId !== 'Guest') || isAdministrator;

    // ========================================================================
    // VALIDATION HANDLERS
    // ========================================================================

    const validateField = useCallback((field: 'firstName' | 'phone', value: string) => {
        if (field === 'firstName') {
            return validateFirstName(value);
        }
        if (field === 'phone') {
            return validatePhone(value);
        }
        return undefined;
    }, []);

    const handleBlur = useCallback((field: 'firstName' | 'phone') => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const value = field === 'firstName' ? editedFirstName : editedMobileNo;
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));
    }, [editedFirstName, editedMobileNo, validateField]);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        const firstNameError = validateFirstName(editedFirstName);
        if (firstNameError) newErrors.firstName = firstNameError;
        const phoneError = validatePhone(editedMobileNo);
        if (phoneError) newErrors.phone = phoneError;
        setErrors(newErrors);
        setTouched({ firstName: true, phone: true });
        return Object.keys(newErrors).length === 0;
    };

    // ========================================================================
    // ACTION HANDLERS
    // ========================================================================

    const handleSave = async () => {
        if (!user || !user.name) {
            toast({
                title: "Error",
                description: "User data not available for update.",
                variant: "destructive",
            });
            return;
        }

        if (!validateForm()) return;

        setIsSaving(true);

        try {
            await updateDoc('User', user.name, {
                first_name: editedFirstName.trim(),
                last_name: editedLastName.trim(),
                mobile_no: editedMobileNo.trim(),
            });

            const newFullName = [editedFirstName.trim(), editedLastName.trim()]
                .filter(Boolean)
                .join(' ');
            localStorage.setItem('fullName', newFullName);
            localStorage.setItem('mobileNO', editedMobileNo.trim());

            updateMutateUser();

            toast({
                title: "Profile Updated",
                description: "Your changes have been saved.",
            });

            setIsEditing(false);
            closeUserProfileDialog();

        } catch (error) {
            console.error('Failed to update user profile:', error);
            toast({
                title: "Update Failed",
                description: "Could not save your changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = useCallback(() => {
        setEditedFirstName(user?.first_name || "");
        setEditedLastName(user?.last_name || "");
        setEditedMobileNo(user?.mobile_no || "");
        setErrors({});
        setTouched({ firstName: false, phone: false });
        setIsEditing(false);
    }, [user]);

    const handleEnterEditMode = () => setIsEditing(true);

    // ========================================================================
    // KEYBOARD NAVIGATION
    // ========================================================================

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isEditing) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            // Don't submit if focus is on an input (allow normal Enter behavior)
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT') {
                e.preventDefault();
                handleSave();
            }
        }
    }, [isEditing, handleCancel]);

    // Handle Enter on last input to submit
    const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, isLastField: boolean) => {
        if (e.key === 'Enter' && isLastField) {
            e.preventDefault();
            handleSave();
        }
    }, []);

    // ========================================================================
    // RENDER
    // ========================================================================

    // Loading State
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4 pt-1">
                    <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="space-y-3 pt-3">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                </div>
            </div>
        );
    }

    // No User Data State
    if (!hasUserData) {
        return (
            <div className="py-6 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                    User data not available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Please ensure you are logged in correctly.
                </p>
            </div>
        );
    }

    // Main Content
    return (
        <div
            className="space-y-4"
            onKeyDown={handleKeyDown}
        >
            {/* ================================================================
                HEADER SECTION - Avatar & Identity
                Added pt-1 to prevent avatar ring cutoff
            ================================================================ */}
            <div className="flex items-center gap-3 pt-1">
                {/* Avatar - using smaller size to prevent cutoff */}
                <div className="relative shrink-0">
                    <Avatar className={cn(
                        "h-14 w-14",
                        "ring-2 ring-destructive/20 ring-offset-2 ring-offset-background",
                        "transition-all duration-200"
                    )}>
                        <AvatarImage src={userImage} alt={fullName} />
                        <AvatarFallback className={cn(
                            "text-base font-semibold",
                            "bg-destructive text-destructive-foreground"
                        )}>
                            {generateFallback(firstName, lastName)}
                        </AvatarFallback>
                    </Avatar>
                    {/* Online indicator - smaller, better positioned */}
                    <div className={cn(
                        "absolute bottom-0 right-0",
                        "h-3 w-3 rounded-full",
                        "bg-emerald-500 ring-2 ring-background"
                    )} />
                </div>

                {/* Name & Role */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">
                        {fullName || "User"}
                    </h3>
                    {/* Role Badge - Brand themed */}
                    <span className={cn(
                        "inline-flex items-center gap-1 mt-0.5",
                        "px-2 py-0.5 rounded text-xs font-medium",
                        "bg-destructive/10 text-destructive",
                        "border border-destructive/20"
                    )}>
                        <Shield className="h-3 w-3" />
                        {formatRoleName(userRole) || "No Role"}
                    </span>
                </div>

                {/* Edit Toggle - only for non-admin */}
                {!isAdministrator && !isEditing && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEnterEditMode}
                        className={cn(
                            "h-8 w-8 rounded-full shrink-0",
                            "text-muted-foreground hover:text-destructive",
                            "hover:bg-destructive/10",
                            "transition-colors duration-200"
                        )}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* ================================================================
                FORM FIELDS SECTION
            ================================================================ */}
            <div className={cn(
                "space-y-3 pt-3",
                "border-t border-border",
                "transition-all duration-200"
            )}>
                {/* First Name */}
                <div className={cn(
                    "space-y-1",
                    "transition-all duration-200",
                    isEditing && "space-y-1.5"
                )}>
                    <Label
                        htmlFor="firstName"
                        className={cn(
                            "text-xs font-medium uppercase tracking-wide",
                            "text-muted-foreground",
                            isEditing && "text-destructive"
                        )}
                    >
                        First Name {isEditing && <span className="text-destructive">*</span>}
                    </Label>
                    {isEditing ? (
                        <div>
                            <Input
                                ref={firstInputRef}
                                id="firstName"
                                value={editedFirstName}
                                onChange={(e) => {
                                    setEditedFirstName(e.target.value);
                                    if (touched.firstName) {
                                        setErrors(prev => ({
                                            ...prev,
                                            firstName: validateFirstName(e.target.value)
                                        }));
                                    }
                                }}
                                onBlur={() => handleBlur('firstName')}
                                onKeyDown={(e) => handleInputKeyDown(e, false)}
                                placeholder="Enter first name"
                                className={cn(
                                    "h-9 text-sm transition-all duration-200",
                                    "focus-visible:ring-destructive",
                                    errors.firstName && touched.firstName &&
                                    "border-red-500 focus-visible:ring-red-500"
                                )}
                            />
                            {errors.firstName && touched.firstName && (
                                <p className="text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {errors.firstName}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-foreground py-1">
                            {firstName || "—"}
                        </p>
                    )}
                </div>

                {/* Last Name */}
                <div className={cn(
                    "space-y-1",
                    "transition-all duration-200",
                    isEditing && "space-y-1.5"
                )}>
                    <Label
                        htmlFor="lastName"
                        className={cn(
                            "text-xs font-medium uppercase tracking-wide",
                            "text-muted-foreground",
                            isEditing && "text-destructive"
                        )}
                    >
                        Last Name
                    </Label>
                    {isEditing ? (
                        <Input
                            id="lastName"
                            value={editedLastName}
                            onChange={(e) => setEditedLastName(e.target.value)}
                            onKeyDown={(e) => handleInputKeyDown(e, false)}
                            placeholder="Enter last name"
                            className={cn(
                                "h-9 text-sm transition-all duration-200",
                                "focus-visible:ring-destructive"
                            )}
                        />
                    ) : (
                        <p className="text-sm text-foreground py-1">
                            {lastName || "—"}
                        </p>
                    )}
                </div>

                {/* Email - Always Read Only */}
                <div className="space-y-1">
                    <Label className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        "text-muted-foreground flex items-center gap-1"
                    )}>
                        <Mail className="h-3 w-3" />
                        Email
                    </Label>
                    <div className="flex items-center gap-2 py-1">
                        <span className="text-sm text-muted-foreground truncate">
                            {userId}
                        </span>
                        {isEditing && (
                            <span className="text-xs text-muted-foreground/60 shrink-0">
                                (read-only)
                            </span>
                        )}
                    </div>
                </div>

                {/* Phone */}
                <div className={cn(
                    "space-y-1",
                    "transition-all duration-200",
                    isEditing && "space-y-1.5"
                )}>
                    <Label
                        htmlFor="phone"
                        className={cn(
                            "text-xs font-medium uppercase tracking-wide",
                            "text-muted-foreground flex items-center gap-1",
                            isEditing && "text-destructive"
                        )}
                    >
                        <Phone className="h-3 w-3" />
                        Phone
                    </Label>
                    {isEditing ? (
                        <div>
                            <Input
                                id="phone"
                                value={editedMobileNo}
                                onChange={(e) => {
                                    setEditedMobileNo(e.target.value);
                                    if (touched.phone) {
                                        setErrors(prev => ({
                                            ...prev,
                                            phone: validatePhone(e.target.value)
                                        }));
                                    }
                                }}
                                onBlur={() => handleBlur('phone')}
                                onKeyDown={(e) => handleInputKeyDown(e, true)}
                                placeholder="+91 9876543210"
                                className={cn(
                                    "h-9 text-sm transition-all duration-200",
                                    "focus-visible:ring-destructive",
                                    errors.phone && touched.phone &&
                                    "border-red-500 focus-visible:ring-red-500"
                                )}
                            />
                            {errors.phone && touched.phone && (
                                <p className="text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-foreground py-1">
                            {mobileNo || "Not provided"}
                        </p>
                    )}
                </div>
            </div>

            {/* ================================================================
                ACTION BUTTONS
            ================================================================ */}
            <div className={cn(
                "flex items-center gap-2 pt-3",
                "border-t border-border",
                "transition-all duration-200"
            )}>
                {isEditing ? (
                    <>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSaving}
                            className={cn(
                                "flex-1 h-9 text-sm",
                                "transition-all duration-200"
                            )}
                        >
                            <X className="h-4 w-4 mr-1.5" />
                            Cancel
                        </Button>
                        <Button
                            ref={saveButtonRef}
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "flex-1 h-9 text-sm",
                                "bg-destructive hover:bg-destructive/90",
                                "transition-all duration-200"
                            )}
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 mr-1.5" />
                            )}
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="outline"
                        onClick={closeUserProfileDialog}
                        className={cn(
                            "w-full h-9 text-sm",
                            "transition-all duration-200"
                        )}
                    >
                        Close
                    </Button>
                )}
            </div>

            {/* Keyboard shortcut hint - hidden on mobile */}
            {isEditing && (
                <p className="hidden sm:block text-xs text-center text-muted-foreground/60 animate-in fade-in duration-300">
                    Press <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-mono">Esc</kbd> to cancel
                </p>
            )}
        </div>
    );
};
