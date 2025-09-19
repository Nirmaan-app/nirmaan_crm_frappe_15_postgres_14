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

// interface UseTaskDataReturn {
//     isLoading: boolean;
//     error: Error | null;
//     todayTasks: EnrichedTask[];
//     tomorrowTasks: EnrichedTask[];
//     createdTodayTasks: EnrichedTask[];
// }

// // --- 1. DEFINE THE NEW STRUCTURE FOR GROUPED TASKS ---
// interface TaskGroup {
//     pending: EnrichedTask[];
//     incomplete: EnrichedTask[];
//     scheduled: EnrichedTask[];
// }

// // A type for the filters we will pass into the hook
// type AssignmentFilter = ['assigned_sales', 'in' | 'is', any];

// /**
//  * Custom hook to fetch and categorize CRM Tasks for daily dashboards.
//  * It now accepts an optional array of assignment filters to apply to the main data fetch.
//  * @param assignmentFilters - An optional array of Frappe filters for 'assigned_sales'.
//  */


// // --- 3. CREATE A HELPER FUNCTION FOR GROUPING ---
// const groupTasksByStatus = (tasks: EnrichedTask[]): TaskGroup => {
//     const groups: TaskGroup = {
//         completed: [],
//         incomplete: [],
//         scheduled: [],
//     };

//     for (const task of tasks) {
//         if (task.status === 'Incomplete') {
//             groups.incomplete.push(task);
//         } else if (task.status === 'Scheduled') {
//             groups.scheduled.push(task);
//         } else if (task.status == 'Completed') {
//             // "Pending" will be the catch-all for any other non-completed status
//             groups.completed.push(task);
//         }
//     }
//     return groups;
// };


// export const useTaskData = (assignmentFilters?: AssignmentFilter[]): UseTaskDataReturn => {

//     // It ensures that if the filters change, the hook will re-fetch the data.
//     const swrKey = `all-tasks-CIS${JSON.stringify(assignmentFilters)}`;

//     const { data: tasks, isLoading, error } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
//         fields: [
//             "name", "type", "start_date", "time", "status", "contact", "company",
//             "contact.first_name", "contact.last_name", "company.company_name", "creation", "assigned_sales"
//         ],
//         filters: assignmentFilters, // Use the combined filters
//         orderBy: { field: "start_date DESC, time", order: "ASC" },
//         limit: 0,

//     }, swrKey); // Use the dynamic key

//   const dailyCategorizedTasks = useMemo(() => {
//         const emptyGroup: TaskGroup = { pending: [], incomplete: [], scheduled: [] };
//         if (!tasks) {
//             return { todayTasks: emptyGroup, tomorrowTasks: emptyGroup, createdTodayTasks: emptyGroup };
//         }

//         const today = new Date().toISOString().slice(0, 10);
//         const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

//         const enriched = tasks.map(task => ({
//             ...task,
//             contact_name: `${task.first_name || ''} ${task.last_name|| ''}`.trim(),
//             company_name: task.company_name || 'N/A'
//         }));

//         // First, filter by date
//         const todayRaw = enriched.filter(t => t.start_date === today);
//         const tomorrowRaw = enriched.filter(t => t.start_date === tomorrow);
//         const createdTodayRaw = enriched.filter(t => t.creation?.slice(0,10) === today);

//         // Then, pass each date-filtered array to our new grouping helper
//         return {
//             todayTasks: groupTasksByStatus(todayRaw),
//             tomorrowTasks: groupTasksByStatus(tomorrowRaw),
//             createdTodayTasks: groupTasksByStatus(createdTodayRaw),
//         };
//     }, [tasks]);

//     return {
//         isLoading,
//         error: error || null,
//         ...dailyCategorizedTasks
//     };
// };




import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { format, addDays, startOfDay, endOfDay, isWithinInterval ,parse,isValid} from 'date-fns';

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
    // NEW: Add upcoming7DaysTasks to the return type
    upcoming7DaysTasks: EnrichedTask[];

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

    // console.log("assignmentFilters",assignmentFilters)

    const allFilters = useMemo(() => {
        const baseFilters = [['status', '!=', '']];
        if (assignmentFilters && assignmentFilters.length > 0) {
            return [...baseFilters, ...assignmentFilters];
        }
        return baseFilters;
    }, [assignmentFilters]);

    const swrKey = `all-tasks-todays${JSON.stringify(allFilters)}`;

    const { data: tasks, isLoading, error } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
        fields: [
            "name", "type", "start_date", "status", "contact", "company",
            "contact.first_name", "contact.last_name", "company.company_name", "creation", "assigned_sales", "creation","remarks","task_profile","boq","task_profile"
        ],
        filters: allFilters, // Use the combined filters
        orderBy: { field: "start_date", order: "desc" },
        limit: 0,

    }, swrKey); // Use the dynamic key

    // 3. The categorization logic remains the same.
    const dailyCategorizedTasks = useMemo(() => {
        if (!tasks) {
            return { todayTasks: [], tomorrowTasks: [], createdTodayTasks: [] , upcoming7DaysTasks: [] }
        }
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

        // Define the interval for "Upcoming 7 Days"
        const intervalStart = startOfDay(today);
        const intervalEnd = endOfDay(addDays(today, 6)); // +6 days to include today as day 1, up to 7th day end

        const enriched = tasks.map(task => ({
            ...task,
            contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim(),
            company_name: task.company_name || 'N/A'
        }));
 // --- NEW: Upcoming 7 Days Pending (Scheduled) Tasks Logic ---
        const upcoming7DaysTasks = enriched.filter(t => {
            const taskStartDateStr = t.start_date?.slice(0, 10);
            if (!taskStartDateStr) return false;

            // CRITICAL: Status must be "Scheduled"
            if (t.status !== 'Scheduled') {
                return false;
            }

            // Parse the task's start date string into a Date object for comparison
            const taskDate = parse(taskStartDateStr, 'yyyy-MM-dd', new Date());

            // Check if the parsed task date is valid and falls within the 7-day interval
            return isValid(taskDate) && isWithinInterval(taskDate, { start: intervalStart, end: intervalEnd });
        });
        // console.log("enriched tasks in useTaskData", today);

        return {
            todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) === today),
            tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) === tomorrow),
            createdTodayTasks: enriched.filter(t => t.creation.slice(0, 10) === today),
            upcoming7DaysTasks,
        };
    }, [tasks]);

    return {
        isLoading,
        error: error || null,
        ...dailyCategorizedTasks
    };
};
