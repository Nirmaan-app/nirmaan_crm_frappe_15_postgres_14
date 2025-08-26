// src/hooks/useTaskData.ts

import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";

type EnrichedTask = CRMTask & {
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
    contact_name?: string;
    company_name?: string;
};

// Define a type for the hook's return value for better type safety
interface UseTaskDataReturn {
    isLoading: boolean;
    error: Error | null;
    todayTasks: EnrichedTask[];
    tomorrowTasks: EnrichedTask[];
    createdTodayTasks: EnrichedTask[];
}

/**
 * Custom hook to fetch all CRM Tasks and categorize them
 * for daily dashboard views.
 * @returns An object with isLoading, error, and the categorized task lists.
 */
export const useTaskData = (): UseTaskDataReturn => {
    // 1. Destructure isLoading and error from the fetch hook
    const { data: tasks, isLoading, error } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
        fields: [
            "name", "type", "start_date", "time", "status", "contact", "company",
            "contact.first_name", "contact.last_name", "company.company_name", "creation"
        ],
        limit: 0,
        orderBy: { field: "creation", order: "asc" }
    },"All Tasks");

    // 2. Memoize the task calculations
    const dailyCategorizedTasks = useMemo(() => {
        if (!tasks) {
            // Return a default object with empty arrays while loading or on error
            return {
                todayTasks: [],
                tomorrowTasks: [],
                createdTodayTasks: [],
            };
        }

        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

        const enriched = tasks.map(task => ({
            ...task,
            contact_name: `${task["contact.first_name"] || ''} ${task["contact.last_name"] || ''}`.trim(),
            company_name: task["company.company_name"] || 'N/A'
        }));

        // Return the calculated lists in an object
        return {
            todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) === today),
            tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) === tomorrow),
            createdTodayTasks: enriched.filter(t => t.creation?.slice(0, 10) === today),
        };
    }, [tasks]);

    // 3. Return the final object, combining loading/error states with the processed data
    return {
        isLoading,
        error: error || null, // Ensure error is null if undefined
        ...dailyCategorizedTasks
    };
};