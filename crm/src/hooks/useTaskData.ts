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

interface UseTaskDataReturn {
    isLoading: boolean;
    error: Error | null;
    todayTasks: EnrichedTask[];
    tomorrowTasks: EnrichedTask[];
    createdTodayTasks: EnrichedTask[];
}

// A type for the filters we will pass into the hook
type AssignmentFilter = ['assigned_sales', 'in' | 'is', any];

/**
 * Custom hook to fetch and categorize CRM Tasks for daily dashboards.
 * It now accepts an optional array of assignment filters to apply to the main data fetch.
 * @param assignmentFilters - An optional array of Frappe filters for 'assigned_sales'.
 */
export const useTaskData = (assignmentFilters?: AssignmentFilter[]): UseTaskDataReturn => {
    // 1. DYNAMIC FILTERS: Combine the assignment filters with a base filter
    // This ensures we only fetch tasks that are not completed, making the query more efficient.
    const allFilters = useMemo(() => {
        const baseFilters = [['status', '!=', 'Completed']];
        if (assignmentFilters && assignmentFilters.length > 0) {
            return [...baseFilters, ...assignmentFilters];
        }
        return baseFilters;
    }, [assignmentFilters]);
    
    // 2. DYNAMIC KEY: Create a dynamic SWR key. This is CRITICAL.
    // It ensures that if the filters change, the hook will re-fetch the data.
    const swrKey = `all-tasks-${JSON.stringify(allFilters)}`;

    const { data: tasks, isLoading, error } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
        fields: [
            "name", "type", "start_date", "time", "status", "contact", "company",
            "contact.first_name", "contact.last_name", "company.company_name", "creation", "assigned_sales"
        ],
        filters: allFilters, // Use the combined filters
        orderBy: { field: "start_date DESC, time", order: "ASC" },
        limit: 0,
      
    }, swrKey); // Use the dynamic key

    // 3. The categorization logic remains the same.
    const dailyCategorizedTasks = useMemo(() => {
        if (!tasks) {
            return { todayTasks: [], tomorrowTasks: [], createdTodayTasks: [] };
        }
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

        const enriched = tasks.map(task => ({
            ...task,
            contact_name: `${task["contact.first_name"] || ''} ${task["contact.last_name"] || ''}`.trim(),
            company_name: task["company.company_name"] || 'N/A'
        }));
        
        return {
            todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) === today),
            tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) === tomorrow),
            createdTodayTasks: enriched.filter(t => t.creation?.slice(0, 10) === today),
        };
    }, [tasks]);

    return {
        isLoading,
        error: error || null,
        ...dailyCategorizedTasks
    };
};

// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo } from "react";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";

// type EnrichedTask = CRMTask & {
//     "contact.first_name"?: string;
//     "contact.last_name"?: string;
//     "company.company_name"?: string;
//     contact_name?: string;
//     company_name?: string;
// };

// // Define a type for the hook's return value for better type safety
// interface UseTaskDataReturn {
//     isLoading: boolean;
//     error: Error | null;
//     todayTasks: EnrichedTask[];
//     tomorrowTasks: EnrichedTask[];
//     createdTodayTasks: EnrichedTask[];
// }

// /**
//  * Custom hook to fetch all CRM Tasks and categorize them
//  * for daily dashboard views.
//  * @returns An object with isLoading, error, and the categorized task lists.
//  */
// export const useTaskData = (): UseTaskDataReturn => {
//     // 1. Destructure isLoading and error from the fetch hook
//     const { data: tasks, isLoading, error } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
//         fields: [
//             "name", "type", "start_date", "time", "status", "contact", "company",
//             "contact.first_name", "contact.last_name", "company.company_name", "creation","assigned_sales"
//         ],
//         limit: 0,
//         orderBy: { field: "start_date DESC, time", order: "ASC" }
//     },"all-tasks-hook");

//     // 2. Memoize the task calculations
//     const dailyCategorizedTasks = useMemo(() => {
//         if (!tasks) {
//             // Return a default object with empty arrays while loading or on error
//             return {
//                 todayTasks: [],
//                 tomorrowTasks: [],
//                 createdTodayTasks: [],
//             };
//         }

//         const today = new Date().toISOString().slice(0, 10);
//         const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

//         const enriched = tasks.map(task => ({
//             ...task,
//             contact_name: `${task["contact.first_name"] || ''} ${task["contact.last_name"] || ''}`.trim(),
//             company_name: task["company.company_name"] || 'N/A'
//         }));

//         // Return the calculated lists in an object
//         return {
//             todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) === today),
//             tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) === tomorrow),
//             createdTodayTasks: enriched.filter(t => t.creation?.slice(0, 10) === today),
//         };
//     }, [tasks]);

//     // 3. Return the final object, combining loading/error states with the processed data
//     return {
//         isLoading,
//         error: error || null, // Ensure error is null if undefined
//         ...dailyCategorizedTasks
//     };
// };