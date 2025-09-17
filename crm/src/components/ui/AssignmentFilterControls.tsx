// src/components/ui/AssignmentFilterControls.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ReactSelect from 'react-select';
import { CRMUsers } from '@/types/NirmaanCRM/CRMUsers';
import { formatRoleName } from '@/pages/MyTeam/MemberList';

type FrappeFilter = [string, string, string | string[]];

// MODIFIED: Added 'task' to the filter types
interface AssignmentFilterControlsProps {
    onFilterChange: (filters: FrappeFilter[]) => void;
    filterType: 'boq' | 'company' | 'contact' | 'task';
}

const UNASSIGNED_OPTION = { label: "Unassigned", value: "__UNASSIGNED__" };

export const AssignmentFilterControls = ({ onFilterChange, filterType }: AssignmentFilterControlsProps) => {
    // const { role, user_id, isLoading: user_id } = useCurrentUser();
    const role = localStorage.getItem("role")
    const user_id = localStorage.getItem("userId")


    const lastFiltersRef = useRef<string | null>(null);

    const [activeTab, setActiveTab] = useState<'me' | 'all'>('me');
    const [selectedSalesUsers, setSelectedSalesUsers] = useState<{ label: string; value: string }[]>([]);
    const [selectedEstimationUsers, setSelectedEstimationUsers] = useState<{ label: string; value: string }[]>([]);

    const { data: salesUsers, isLoading: salesLoading } = useFrappeGetDocList<CRMUsers>("CRM Users", {
        fields: ["name", "full_name","nirmaan_role_name"],
        filters: {
            "nirmaan_role_name": ["in", [
                "Nirmaan Sales User Profile",
                "Nirmaan Admin User Profile",
                "Nirmaan Estimations User Profile"
            ]]
        },
        limit: 0,
    }, "sales-users-list");

    const { data: estimationUsers, isLoading: estimationLoading } = useFrappeGetDocList<CRMUsers>("CRM Users", {
        fields: ["name", "full_name"],
        filters: { nirmaan_role_name: "Nirmaan Estimations User Profile" },
        limit: 0,
    }, "estimation-users-list");

    const salesUserOptions = useMemo(() => {
        const users = salesUsers?.map(user => ({ label: ( // Change label to return JSX
                <>
                    {user.full_name}
                    (
                    <span className="text-red-500"> {/* Apply Tailwind CSS class for red color */}
                        {formatRoleName(user.nirmaan_role_name)}
                    </span>
                    )
                </>
            ), value: user.name })) || [];
        return [UNASSIGNED_OPTION, ...users];
    }, [salesUsers]);

    const estimationUserOptions = useMemo(() => {
        const users = estimationUsers?.map(user => ({ label: user.full_name, value: user.name })) || [];
        return [UNASSIGNED_OPTION, ...users];
    }, [estimationUsers]);




    
    useEffect(() => {
        if (!user_id) return;

        let newFilters: FrappeFilter[] = [];

        const buildFilterBlock = (selected: { label: string; value: string }[], fieldName: string): FrappeFilter[] => {
            const isUnassigned = selected.some(u => u.value === UNASSIGNED_OPTION.value);
            const userIds = selected.filter(u => u.value !== UNASSIGNED_OPTION.value).map(u => u.value);
            if (isUnassigned && userIds.length > 0) return [[fieldName, 'is', 'not set'], [fieldName, 'in', userIds]];
            if (isUnassigned) return [[fieldName, 'is', 'not set']];
            if (userIds.length > 0) return [[fieldName, 'in', userIds]];
            return [];
        };

        if (role === 'Nirmaan Sales User Profile') {
            if (filterType === 'company' || filterType === 'contact') {
                if (activeTab === 'me') newFilters.push(['assigned_sales', '=', user_id]);
            }
        } else if (role === 'Nirmaan Estimations User Profile') {
            // if (filterType === 'boq' && activeTab === 'me') {
            //     newFilters.push(['assigned_estimations', '=', user_id]);
            // }
            const salesFilters = buildFilterBlock(selectedSalesUsers, 'assigned_sales');
            newFilters.push(...salesFilters);
        } else if (role === 'Nirmaan Admin User Profile') {
            const salesFilters = buildFilterBlock(selectedSalesUsers, 'assigned_sales');
            newFilters.push(...salesFilters);
            if (filterType === 'boq') {
                const estimationFilters = buildFilterBlock(selectedEstimationUsers, 'assigned_estimations');
                newFilters.push(...estimationFilters);
            }
        }

        const newFiltersString = JSON.stringify(newFilters);
        if (newFiltersString !== lastFiltersRef.current) {
            onFilterChange(newFilters);
            lastFiltersRef.current = newFiltersString;
        }
    }, [role, activeTab, selectedSalesUsers, selectedEstimationUsers, user_id, onFilterChange, user_id, filterType]);

    if (!user_id) {
        return <Skeleton className="h-10 w-full" />;
    }

    // --- Role-Based UI Rendering ---

    if (role === 'Nirmaan Sales User Profile') {
        // Show tabs for Company/Contact list, but hide for BOQ and Task lists.
        if (filterType === 'company' || filterType === 'contact') {
            return (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'me' | 'all')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="me">Assigned to Me</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>
                </Tabs>
            );
        }
        return null;
    }

    // if (role === 'Nirmaan Estimations User Profile') {
    //     // Show tabs ONLY for the BOQ list.
    //     if (filterType === 'boq') {
    //         return (
    //             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'me' | 'all')}>
    //                 <TabsList className="grid w-full grid-cols-2">
    //                     <TabsTrigger value="me">Assigned to Me</TabsTrigger>
    //                     <TabsTrigger value="all">All</TabsTrigger>
    //                 </TabsList>
    //             </Tabs>
    //         );
    //     }
    //     return null;
    // }

    if (role === 'Nirmaan Estimations User Profile') {
        // Show tabs ONLY for the BOQ list.
        if (filterType === 'boq') {
            return (
                <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Filter by Sales User</label>
                    <ReactSelect isMulti options={salesUserOptions} isLoading={salesLoading} value={selectedSalesUsers} onChange={setSelectedSalesUsers} placeholder="All Sales Users" className="text-sm" menuPosition={'auto'} />
                </div>
            );
        }
        return null;
    }


    if (role === 'Nirmaan Admin User Profile') {
        const salesFilterDropdown = (
            <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Filter by Sales User</label>
                <ReactSelect isMulti options={salesUserOptions} isLoading={salesLoading} value={selectedSalesUsers} onChange={setSelectedSalesUsers} placeholder="All Sales Users" className="text-sm" menuPosition={'auto'} />
            </div>
        );
        // For BOQs, show both dropdowns.
        // if (filterType === 'boq') {
        //     return (
        //         <div className="space-y-4">
        //             {salesFilterDropdown}
        //             <div className="space-y-1">
        //                 <label className="text-sm font-medium text-muted-foreground">Filter by Estimation User</label>
        //                 <ReactSelect isMulti options={estimationUserOptions} isLoading={estimationLoading} value={selectedEstimationUsers} onChange={setSelectedEstimationUsers} placeholder="All Estimation Users" className="text-sm" menuPosition={'auto'} />
        //             </div>
        //         </div>
        //     );
        // }
        // For Company, Contact, AND Task lists, show only the Sales dropdown.
        return salesFilterDropdown;
    }

    return null;
};