// src/hooks/useCurrentUser.ts

import { useAuth } from "@/auth/AuthProvider";
// import { useContext } from "react";
// import { AuthContext, AuthContextType  } from "@/auth/AuthProvider";


/**
 * A simple hook that consumes the enriched AuthContext and provides the
 * current user's profile in a consistent format for UI components.
 * It no longer performs any data fetching itself.
 */
export const useCurrentUser = () => {
    // Consume the new, powerful context from our AuthProvider
    const { crmUser, isAuthLoading } = useAuth();
    // const { crmUser, isAuthLoading } = useContext(AuthContext);

    // Return the data in the exact same shape as before,
    // ensuring no other components need to be changed.
    return {
        user: crmUser,
        user_id: crmUser?.name || 'Guest',
        full_name: crmUser?.full_name || 'Guest',
        user_image: crmUser?.user_image || undefined,
        role: crmUser?.nirmaan_role_name || '',
        has_company: String(crmUser?.has_company ?? "false"),
        isLoading: isAuthLoading,
    };
};



// // src/hooks/useCurrentUser.ts (Corrected and Final Version)

// import { useAuth } from "@/auth/AuthProvider";
// import { useFrappeGetDoc } from "frappe-react-sdk";

// export const useCurrentUser = () => {
//     const { currentUser, isLoading: isAuthLoading } = useAuth();

//     const shouldFetchCrmUser = !!currentUser && currentUser !== 'Administrator';

//     const { data: crmUserDoc, isLoading: isCrmUserLoading, error, mutate } = useFrappeGetDoc(
//         'CRM Users',
//         currentUser!, 
//         {
//             enabled: shouldFetchCrmUser,
//         }
//     );

//     // This is the combined, reliable loading state.
//     const isLoading = isAuthLoading || (shouldFetchCrmUser && isCrmUserLoading);

//     // --- LOGIC IS RE-ORDERED FOR CORRECTNESS AND TO PREVENT RACE CONDITIONS ---

//     // 1. If the auth state is still being determined, we are definitely loading.
//     if (isAuthLoading) {
//         return { 
//             isLoading: true, 
//             user: null, 
//             role: '', 
//             has_company: "false", // Return a consistent shape
//             error: null 
//         };
//     }

//     // --- THIS IS THE CRITICAL FIX ---
//     // 2. If auth is loaded but there is NO currentUser, we know for certain the user is a Guest.
//     // This stops the code from falling through to the wrong return statement during navigation.
//     if (!currentUser) {
//         return {
//             user: null, user_id: 'Guest', full_name: 'Guest', user_image: undefined,
//             role: '', has_company: "false", isLoading: false, error: null, mutate: () => {},
//         };
//     }
    
//     // 3. If we have a currentUser, now we can safely check if it's the Administrator.
//     if (currentUser === 'Administrator') {
//         const adminUser = window.frappe?.boot?.user;
//         return {
//             user: adminUser, user_id: 'Administrator', full_name: adminUser?.full_name || 'Administrator',
//             user_image: adminUser?.user_image || undefined, role: 'Nirmaan Admin User Profile',
//             has_company: "true", isLoading: false, error: null, mutate: () => {}
//         };
//     }

//     // 4. If it's not the admin, it must be a CRM User. Return their data.
//     // The `isLoading` flag will correctly report true until `isCrmUserLoading` is false.
//     return {
//         user: crmUserDoc,
//         user_id: crmUserDoc?.name || '',
//         full_name: crmUserDoc?.full_name || 'User',
//         user_image: crmUserDoc?.user_image || undefined,
//         role: crmUserDoc?.nirmaan_role_name || '',
//         // Safely convert the 0/1 or boolean from Frappe into a string.
//         has_company: String(crmUserDoc?.has_company ?? "false"),
//         isLoading: isLoading, // Use the combined loading state
//         error,
//         mutate,
//     };
// };
//--------------------------------
// import { useAuth } from "@/auth/AuthProvider";
// import { useFrappeGetDoc } from "frappe-react-sdk";

// /**
//  * A hook to fetch the complete Frappe User document for the currently logged-in user.
//  * It provides a unified profile object for both Administrators and custom CRM Users.
//  *
//  * @returns An object containing the user profile, loading state, and error state.
//  */
// export const useCurrentUser = () => {
//     // Get the current user's ID (string) from our auth context
//     const { currentUser, isLoading: isAuthLoading } = useAuth();
//     console.log("hooks",currentUser)

//     // Determine if we need to fetch the custom CRM User profile.
//     const shouldFetchCrmUser = !!currentUser && currentUser !== 'Administrator';

//     // Call the hook unconditionally, but control its execution with the `enabled` option.
//     const { data: crmUserDoc, isLoading: isCrmUserLoading, error, mutate } = useFrappeGetDoc(
//         'CRM Users',
//         currentUser!, 
//         {
//             enabled: shouldFetchCrmUser,
//         }
//     );

//     // Handle the initial authentication loading state.
//     if (isAuthLoading) {
//         return { isLoading: true, user: null, error: null };
//     }

//     // Handle the Administrator case to prevent the 404 error.
//     if (currentUser === 'Administrator') {
//         const adminUser = window.frappe?.boot?.user;
//         return {
//             user: adminUser,
//             user_id: 'Administrator',
//             full_name: adminUser?.full_name || 'Administrator',
//             user_image: adminUser?.user_image || undefined,
//             role: 'Nirmaan Admin User Profile',
//             has_company: "true",
//             isLoading: false,
//             error: null,
//             mutate: () => {}
//         };
//     }

//     // Handle the custom CRM User case.
//     if (shouldFetchCrmUser) {
//         return {
//             user: crmUserDoc,
//             user_id: crmUserDoc?.name || '',
//             full_name: crmUserDoc?.full_name || 'User',
//             user_image: crmUserDoc?.user_image || undefined,
//             role: crmUserDoc?.nirmaan_role_name || '',
//             has_company: crmUserDoc?.has_company || "false",
//             isLoading: isCrmUserLoading,
//             error,
//             mutate,
//         };
//     }

//     // Default return for guests.
//     return {
//         user: null,
//         user_id: 'Guest',
//         full_name: 'Guest',
//         user_image: undefined,
//         role: '',
//         has_company: "false",
//         isLoading: false,
//         error: null,
//         mutate: () => {},
//     };
// };




//---------------------
// import { useAuth } from "@/auth/AuthProvider";
// import { useFrappeGetDoc } from "frappe-react-sdk";
// // import { User } from "frappe-react-sdk/lib/types"; // Import the User type

// /**
//  * A hook to fetch the complete Frappe User document for the currently logged-in user.
//  *
//  * @returns An object containing the user document, loading state, and error state.
//  */
// export const useCurrentUser = () => {
//     // Get the current user's email (e.g., "user@example.com") from our auth context
//     const { currentUser,isLoading } = useAuth();

//     // console.log("currentUser",currentUser)
// if(isLoading){
//     return "loading"
// }
//     // Use the useFrappeGetDoc hook to fetch the User document.
// // Nirmaan Estimations User Profile,Nirmaan Sales User Profile,Nirmaan Admin User Profile
//      if(currentUser?.name==="Administrator") {
//     const role = "Nirmaan Admin User Profile";
//     const has_company = "true";
//      const user_id="Administrator";
//     const full_name = currentUser?.full_name;
//     const user_image = currentUser?.user_image;
//     return {
//       user_id,
//       full_name,
//       user_image,
//       role,
//       has_company
//     }
//   }else{
// const { data, isLoading:UserLoading, error, mutate } = useFrappeGetDoc(
//         'CRM Users',
//         currentUser!, // The '!' asserts that currentUser is not null here.
//         // {
//         //     // IMPORTANT: Only run this query if the user is logged in.
//         //     enabled: !!currentUser && currentUser !== 'Guest',
//         // }
//     );

//     // console.log("CRM User",data)

//     // Provide convenient fallbacks and derived data
//     const user=data
//     const user_id=data?.name||""
//     const full_name = data?.full_name||'User';
//     const user_image = data?.user_image || undefined;
//     const role=data?.nirmaan_role_name||"";
//     const has_company=data?.has_company||"false"

//     return {
//         user,
//         user_id,
//         full_name,
//         user_image,
//         role,
//         has_company,
//         isLoading,
//         error,
//         mutate,
//     };
//   }

//     // The doc's name is the user's email address.
    
// };