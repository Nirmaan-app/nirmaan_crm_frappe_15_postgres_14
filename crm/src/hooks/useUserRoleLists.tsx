import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";

// 1. UPDATE THE INTERFACE: We now need to fetch the role name itself
// to be able to differentiate the users on the client side.
interface CRMUsersWithRole {
    name: string;
    full_name: string;
    nirmaan_role_name: string; // This field is now required for our logic
}

/**
 * A more efficient custom hook to fetch and format separate lists of Sales and Estimation users.
 * It makes a SINGLE API call to fetch all relevant users and then processes the result
 * on the client side, reducing network overhead.
 */
export const useUserRoleLists = () => {
    // --- 1. Single, More Efficient API Call ---
    // We fetch all users where the role is 'in' our list of required roles.
    const { 
        data: allUsersData, 
        isLoading, 
        error 
    } = useFrappeGetDocList<CRMUsersWithRole>(
        "CRM Users",
        {
            // We must fetch 'nirmaan_role_name' to know which list each user belongs to.
            fields: ["name", "full_name", "nirmaan_role_name"],
            // This is the key change: using an "in" filter.
            filters: { 
                "nirmaan_role_name": ["in", [
                    "Nirmaan Sales User Profile", 
                    "Nirmaan Estimations User Profile"
                ]] 
            },
            limit: 0,
        },
        "all-role-users-list" // A new, appropriate cache key
    );

    // --- 2. Process the Combined List into Two Separate Lists ---
    // useMemo ensures this complex logic only runs when the data from the API changes.
    const { salesUserOptions, estimationUserOptions } = useMemo(() => {
        // If there's no data, return empty arrays immediately.
        if (!allUsersData) {
            return { salesUserOptions: [], estimationUserOptions: [] };
        }

        // We use the 'reduce' method to iterate through the list once and build both
        // of our final arrays at the same time. This is very efficient.
        const lists = allUsersData.reduce<{ sales: any[], estimations: any[] }>((accumulator, user) => {
            const userOption = {
                label: user.full_name,
                value: user.name,
            };

            if (user.nirmaan_role_name === "Nirmaan Sales User Profile") {
                accumulator.sales.push(userOption);
            } else if (user.nirmaan_role_name === "Nirmaan Estimations User Profile") {
                accumulator.estimations.push(userOption);
            }
            
            return accumulator;
        }, { sales: [], estimations: [] }); // The initial value for our accumulator object

        return {
            salesUserOptions: lists.sales,
            estimationUserOptions: lists.estimations,
        };
    }, [allUsersData]);

    // --- 3. Return the Final, Processed Data ---
    // The state is now much simpler, with only one loading and error state to manage.
    return {
        salesUserOptions,
        estimationUserOptions,
        isLoading,
        error,
    };
};

// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo } from "react";

// // A reusable interface for the user data we expect to fetch.
// interface CRMUsers {
//     name: string;
//     full_name: string;
// }

// /**
//  * A custom hook to fetch and format separate lists of Sales and Estimation users.
//  * It encapsulates the data fetching and transformation logic, returning clean lists
//  * for use in dropdowns throughout the application.
//  */
// export const useUserRoleLists = () => {
//     // --- 1. Fetch Sales Users ---
//     // This is the first API call, filtered for the Sales role.
//     const { 
//         data: salesUsersData, 
//         isLoading: isSalesLoading, 
//         error: salesError 
//     } = useFrappeGetDocList<CRMUsers>(
//         "CRM Users",
//         {
//             fields: ["name", "full_name"],
//             filters: { nirmaan_role_name: "Nirmaan Sales User Profile" },
//             limit: 0,
//         },
//         "sales-users-list" // A unique cache key for sales users
//     );

//     // --- 2. Fetch Estimation Users ---
//     // This is the second API call, filtered for the Estimation role.
//     const { 
//         data: estimationUsersData, 
//         isLoading: isEstimationLoading, 
//         error: estimationError 
//     } = useFrappeGetDocList<CRMUsers>(
//         "CRM Users",
//         {
//             fields: ["name", "full_name"],
//             filters: { nirmaan_role_name: "Nirmaan Estimations User Profile" },
//             limit: 0,
//         },
//         "estimation-users-list" // A different, unique cache key for estimation users
//     );

//     // --- 3. Format both lists for React Select ---
//     const salesUserOptions = useMemo(() =>
//         salesUsersData?.map(user => ({
//             label: user.full_name,
//             value: user.name, // 'name' is the user's ID/email
//         })) || [],
//         [salesUsersData]
//     );

//     const estimationUserOptions = useMemo(() =>
//         estimationUsersData?.map(user => ({
//             label: user.full_name,
//             value: user.name,
//         })) || [],
//         [estimationUsersData]
//     );

//     // --- 4. Return everything in a single, convenient object ---
//     return {
//         salesUserOptions,
//         estimationUserOptions,
//         // The component is loading if either of the API calls is in progress.
//         isLoading: isSalesLoading || isEstimationLoading,
//         // If either call resulted in an error, report it.
//         error: salesError || estimationError,
//     };
// };