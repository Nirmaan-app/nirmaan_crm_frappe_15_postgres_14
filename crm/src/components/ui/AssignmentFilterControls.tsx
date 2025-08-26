// src/components/ui/AssignmentFilterControls.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ReactSelect from 'react-select';
import { CRMUsers } from '@/types/NirmaanCRM/CRMUsers';

type FrappeFilter = [string, string, string | string[]];

interface AssignmentFilterControlsProps {
    onFilterChange: (filters: FrappeFilter[]) => void;
}

// NEW: Define a constant for our special "Unassigned" option.
// The value is a unique string that won't conflict with a real user ID.
const UNASSIGNED_OPTION = { label: "Unassigned", value: "__UNASSIGNED__" };

export const AssignmentFilterControls = ({ onFilterChange }: AssignmentFilterControlsProps) => {
    const { role, user_id, isLoading: isUserLoading } = useCurrentUser();

    // State for the Sales User's active tab
    const [activeTab, setActiveTab] = useState<'me' | 'all'>('me');

    // State for the Admin/Estimations selected users
    const [selectedUsers, setSelectedUsers] = useState<{ label: string; value: string }[]>([]);

    // NEW: Ref to store the stringified version of the last applied filters
    const lastFiltersRef = useRef<string | null>(null);

    // Fetch all users with the "Sales User" profile for the multi-select dropdown
    const { data: salesUsers, isLoading: areSalesUsersLoading } = useFrappeGetDocList<CRMUsers>(
        "CRM Users",
        {
            fields: ["name", "full_name"],
            filters: { nirmaan_role_name: "Nirmaan Sales User Profile" },
            limit: 0,
        },
        "sales-users-list" // Unique SWR key
    );

    // MODIFIED: Prepend our special "Unassigned" option to the list of real users.
    const salesUserOptions = useMemo(() => {
        const users = salesUsers?.map(user => ({ label: user.full_name, value: user.name })) || [];
        return [UNASSIGNED_OPTION, ...users];
    }, [salesUsers]);

    // This effect listens to changes in the filter controls and calls the parent component
    useEffect(() => {
        if (isUserLoading) return;

        let newFilters: FrappeFilter[] = [];

        if (role === 'Nirmaan Sales User Profile') {
            if (activeTab === 'me') {
                newFilters.push(['assigned_sales', '=', user_id]);
            }
        } else {
            const isUnassignedSelected = selectedUsers.some(u => u.value === UNASSIGNED_OPTION.value);
            const regularUserIds = selectedUsers
                .filter(u => u.value !== UNASSIGNED_OPTION.value)
                .map(u => u.value);

            // Case 1: Both "Unassigned" and regular users are selected.
            // We build an array of filter arrays, which Frappe interprets as an OR condition.
            if (isUnassignedSelected && regularUserIds.length > 0) {
                newFilters = [
                    ['assigned_sales', 'is', 'not set'], // Frappe ORM for NULL/empty
                    ['assigned_sales', 'in', regularUserIds]
                ];
            }
            // Case 2: Only "Unassigned" is selected.
            else if (isUnassignedSelected) {
                newFilters.push(['assigned_sales', 'is', 'not set']);
            }
            // Case 3: Only regular users are selected.
            else if (regularUserIds.length > 0) {
                newFilters.push(['assigned_sales', 'in', regularUserIds]);
            }
            // Case 4: Nothing is selected (show all). newFilters remains empty.

        }

        // --- CORE FIX: Compare current filters with the last applied ones ---
        const newFiltersString = JSON.stringify(newFilters);
        if (newFiltersString !== lastFiltersRef.current) {
            onFilterChange(newFilters);
            // Update the ref to the new filters
            lastFiltersRef.current = newFiltersString;
        }
    }, [role, activeTab, selectedUsers, user_id, onFilterChange, isUserLoading]);

    if (isUserLoading) {
        return <Skeleton className="h-10 w-full" />;
    }

    // --- Conditional UI Rendering ---

    if (role === 'Nirmaan Sales User Profile') {
        return (
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'me' | 'all')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="me">Assigned to Me</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
            </Tabs>
        );
    }

    if (role === 'Nirmaan Admin User Profile' || role === 'Nirmaan Estimations User Profile') {
        return (
            <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Filter by Sales User</label>
                <ReactSelect
                    isMulti
                    options={salesUserOptions}
                    isLoading={areSalesUsersLoading}
                    value={selectedUsers}
                    onChange={setSelectedUsers}
                    placeholder="All Sales Users"
                    className="text-sm"
                    menuPosition={'auto'}
                />
            </div>
        );
    }

    // Render nothing if the role doesn't match any of the above
    return null;
};