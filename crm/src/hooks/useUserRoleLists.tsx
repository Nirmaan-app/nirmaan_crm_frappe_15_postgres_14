import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";

// Updated Interface: Ensure 'name' (Frappe doc ID) and 'email' are explicitly defined
interface CRMUsersWithRole {
    name: string; // The primary key (doc.name) of the 'CRM Users' document
    email: string; // The actual email address of the user
    full_name: string;
    nirmaan_role_name: string;
}

/**
 * A more efficient custom hook to fetch and format separate lists of Sales and Estimation users.
 * It makes a SINGLE API call to fetch all relevant users and then processes the result
 * on the client side, reducing network overhead. It also provides a utility to
 * get a user's full name by their email.
 */
export const useUserRoleLists = () => {
    // --- 1. Single, More Efficient API Call ---
    const { 
        data: allUsersData, 
        isLoading, 
        error 
    } = useFrappeGetDocList<CRMUsersWithRole>(
        "CRM Users", // Your custom doctype for CRM Users
        {
            // Crucial: Ensure 'email' and 'full_name' are fetched.
            fields: ["name", "email", "full_name", "nirmaan_role_name"],
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

    // --- 2. Process the Combined List and create a lookup map ---
    const { salesUserOptions, estimationUserOptions, userEmailToFullNameMap } = useMemo(() => {
        if (!allUsersData) {
            return {
                salesUserOptions: [],
                estimationUserOptions: [],
                userEmailToFullNameMap: {}, // Initialize as an empty object
            };
        }

        const lists = allUsersData.reduce<{ 
            sales: { label: string; value: string; }[], 
            estimations: { label: string; value: string; }[], 
            emailMap: { [email: string]: string } // Map from email (string) to full_name (string)
        }>(
            (accumulator, user) => {
                const userOption = {
                    label: user.full_name,
                    value: user.name, // Use user.name (doc.name) for select value, user.email for lookup
                };

                // Populate the email-to-full-name map
                // user.email is used as the key to look up the full_name
                accumulator.emailMap[user.email] = user.full_name;

                if (user.nirmaan_role_name === "Nirmaan Sales User Profile") {
                    accumulator.sales.push(userOption);
                } else if (user.nirmaan_role_name === "Nirmaan Estimations User Profile") {
                    accumulator.estimations.push(userOption);
                }
                
                return accumulator;
            },
            { sales: [], estimations: [], emailMap: {} } // Initial accumulator values
        );

        return {
            salesUserOptions: lists.sales,
            estimationUserOptions: lists.estimations,
            userEmailToFullNameMap: lists.emailMap,
        };
    }, [allUsersData]);

    // --- 3. Create the utility function to get full_name by email ---
    // This function leverages the memoized map for efficient lookups.
    const getUserFullNameByEmail = useMemo(() => (email: string): string | undefined => {
        // Look up the full name using the provided email
        return userEmailToFullNameMap[email];
    }, [userEmailToFullNameMap]); // Recreate this function only if the map changes

    // --- 4. Return the Final, Processed Data and the Utility Function ---
    return {
        salesUserOptions,
        estimationUserOptions,
        getUserFullNameByEmail, // <-- This is the function that returns a single string (full_name)
        isLoading,
        error,
    };
};

// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo } from "react";

// // 1. UPDATE THE INTERFACE: We now need to fetch the role name itself
// // to be able to differentiate the users on the client side.
// interface CRMUsersWithRole {
//     name: string;
//     full_name: string;
//     nirmaan_role_name: string; // This field is now required for our logic
// }

// /**
//  * A more efficient custom hook to fetch and format separate lists of Sales and Estimation users.
//  * It makes a SINGLE API call to fetch all relevant users and then processes the result
//  * on the client side, reducing network overhead.
//  */
// export const useUserRoleLists = () => {
//     // --- 1. Single, More Efficient API Call ---
//     // We fetch all users where the role is 'in' our list of required roles.
//     const { 
//         data: allUsersData, 
//         isLoading, 
//         error 
//     } = useFrappeGetDocList<CRMUsersWithRole>(
//         "CRM Users",
//         {
//             // We must fetch 'nirmaan_role_name' to know which list each user belongs to.
//               fields: ["name", "full_name", "nirmaan_role_name"],

//             // This is the key change: using an "in" filter.
//             filters: { 
//                 "nirmaan_role_name": ["in", [
//                     "Nirmaan Sales User Profile", 
//                     "Nirmaan Estimations User Profile"
//                 ]] 
//             },
//             limit: 0,
//         },
//         "all-role-users-list" // A new, appropriate cache key
//     );

//     // --- 2. Process the Combined List into Two Separate Lists ---
//     // useMemo ensures this complex logic only runs when the data from the API changes.
//     const { salesUserOptions, estimationUserOptions } = useMemo(() => {
//         // If there's no data, return empty arrays immediately.
//         if (!allUsersData) {
//             return { salesUserOptions: [], estimationUserOptions: [] };
//         }

//         // We use the 'reduce' method to iterate through the list once and build both
//         // of our final arrays at the same time. This is very efficient.
//         const lists = allUsersData.reduce<{ sales: any[], estimations: any[] }>((accumulator, user) => {
//             const userOption = {
//                 label: user.full_name,
//                 value: user.name,
//             };

//             if (user.nirmaan_role_name === "Nirmaan Sales User Profile") {
//                 accumulator.sales.push(userOption);
//             } else if (user.nirmaan_role_name === "Nirmaan Estimations User Profile") {
//                 accumulator.estimations.push(userOption);
//             }
            
//             return accumulator;
//         }, { sales: [], estimations: [] }); // The initial value for our accumulator object

//         return {
//             salesUserOptions: lists.sales,
//             estimationUserOptions: lists.estimations,
//         };
//     }, [allUsersData]);

//     // --- 3. Return the Final, Processed Data ---
//     // The state is now much simpler, with only one loading and error state to manage.
//     return {
//         salesUserOptions,
//         estimationUserOptions,
//         isLoading,
//         error,
//     };
// };
