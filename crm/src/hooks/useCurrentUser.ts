import { useAuth } from "@/auth/AuthProvider";
import { useFrappeGetDoc } from "frappe-react-sdk";
import { useEffect } from "react"; // <-- 1. IMPORT useEffect

export const useCurrentUser = () => {
    const { currentUser, isLoading: isAuthLoading } = useAuth();

    const shouldFetchCrmUser = !!currentUser && currentUser !== 'Administrator';

    const { data: crmUserDoc, isLoading: isCrmUserLoading, error, mutate } = useFrappeGetDoc(
        'CRM Users',
        currentUser!,
        {
            enabled: shouldFetchCrmUser,
        }
    );

    // --- 2. ADD THIS useEffect HOOK ---
    // This effect runs whenever the `crmUserDoc` data changes (i.e., after it's been fetched).
    useEffect(() => {
        // We only want to set the storage if we have valid user data.
        if (crmUserDoc) {
            localStorage.setItem('userId', crmUserDoc.name || '');
            localStorage.setItem('role', crmUserDoc.nirmaan_role_name || '');
            localStorage.setItem('has_company', String(crmUserDoc.has_company ?? "false"));
        }
    }, [crmUserDoc]); // The dependency array ensures this runs only when crmUserDoc changes.


    const isLoading = isAuthLoading || (shouldFetchCrmUser && isCrmUserLoading);

    if (isAuthLoading) {
        return {
            isLoading: true,
            user: null,
            role: '',
            has_company: "false",
            error: null
        };
    }

    if (!currentUser) {
        // --- 3. ADD CLEANUP LOGIC FOR LOGOUT ---
        // When the user logs out, clear the stored details.
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('has_company');

        return {
            user: null, user_id: 'Guest', full_name: 'Guest', user_image: undefined,
            role: '', has_company: "false", isLoading: false, error: null, mutate: () => {},
        };
    }

    if (currentUser === 'Administrator') {
        // --- 4. OPTIONAL: SET STORAGE FOR ADMIN USER ---
        localStorage.setItem('userId', 'Administrator');
        localStorage.setItem('role', 'Nirmaan Admin User Profile');
        localStorage.setItem('has_company', 'true');

        const adminUser = window.frappe?.boot?.user;
        return {
            user: adminUser, user_id: 'Administrator', full_name: adminUser?.full_name || 'Administrator',
            user_image: adminUser?.user_image || undefined, role: 'Nirmaan Admin User Profile',
            has_company: "true", isLoading: false, error: null, mutate: () => {}
        };
    }

    return {
        user: crmUserDoc,
        user_id: crmUserDoc?.name || '',
        full_name: crmUserDoc?.full_name || 'User',
        user_image: crmUserDoc?.user_image || undefined,
        role: crmUserDoc?.nirmaan_role_name || '',
        has_company: String(crmUserDoc?.has_company ?? "false"),
        isLoading: isLoading,
        error,
        mutate,
    };
};

// import { useAuth } from "@/auth/AuthProvider";
// import { useFrappeGetDoc } from "frappe-react-sdk";

// export const useCurrentUser = () => {
//     const { currentUser, isLoading: isAuthLoading } = useAuth();

//     const shouldFetchCrmUser = !!currentUser && currentUser != 'Administrator';

// console.log("shouldFetchCrmUser",currentUser)


//     const { data: crmUserDoc, isLoading: isCrmUserLoading, error, mutate } = useFrappeGetDoc(
//         'CRM Users',
//         currentUser!, 
//         {
//             enabled:shouldFetchCrmUser,
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


