// src/auth/AuthProvider.tsx

import { useFrappeAuth, useFrappeGetDoc } from 'frappe-react-sdk';
import React, { createContext, PropsWithChildren, useContext, FC, useMemo, useEffect } from 'react';

// Define the type for the detailed CRM User.
type CRMUser = {
    name: string;
    full_name: string;
    user_image?: string;
    nirmaan_role_name: string;
    has_company: "true" | "false" | 0 | 1;
    mobile_no?: string;
    email: string;
};

// Enhance the context to include the full user profile and loading state.
interface AuthContextType {
    currentUser: string | null;
    crmUser: CRMUser | null;
    isAuthLoading: boolean;
    login: (params: { usr: string; pwd?: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateCurrentUser: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const { 
        currentUser, 
        isLoading: isFrappeAuthLoading, 
        login: sdkLogin, 
        logout: sdkLogout, 
        updateCurrentUser 
    } = useFrappeAuth();

    const shouldFetchCrmUser = !!currentUser && currentUser !== 'Administrator';

    const { 
        data: crmUserDoc, 
        isLoading: isCrmUserLoading,
        mutate // <-- Get the mutate function from the hook
    } = useFrappeGetDoc<CRMUser>(
        'CRM Users',
        currentUser!,
        {
            enabled: shouldFetchCrmUser,
            // Add this to prevent automatic re-fetching on window focus, which can be noisy
            revalidateOnFocus: false,
        }
    );

 
    useEffect(() => {
        // If we have a logged-in user and it's not the Administrator,
        // manually trigger a re-fetch of their CRM User document.
        // This ensures that we get fresh data after the post-login page reload.
        if (shouldFetchCrmUser) {
            mutate();
        }
    }, [shouldFetchCrmUser, mutate]);
  

    const isAuthLoading = isFrappeAuthLoading || (shouldFetchCrmUser && isCrmUserLoading);

    const crmUser = useMemo<CRMUser | null>(() => {
        if (!currentUser) {
            return null; // Guest
        }
        if (currentUser === 'Administrator') {
            const adminUser = window.frappe?.boot?.user;
            return {
                name: 'Administrator',
                full_name: adminUser?.full_name || 'Administrator',
                user_image: adminUser?.user_image,
                nirmaan_role_name: 'Nirmaan Admin User Profile',
                has_company: "true",
                email: 'Administrator',
                mobile_no: ''
            };
        }
        return crmUserDoc || null;
    }, [currentUser, crmUserDoc]);

    const handleLogin = async (params: { usr: string; pwd?: string }) => {
        try {
            await sdkLogin(params);
            window.location.href = '/';
        } catch (e) {
            throw e;
        }
    };

    const handleLogout = async () => {
        try {
            sessionStorage.clear();
            localStorage.clear();
            await sdkLogout();
            window.location.href = '/login';
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };
    
    const value: AuthContextType = {
        currentUser,
        crmUser,
        isAuthLoading,
        login: handleLogin,
        logout: handleLogout,
        updateCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// import { FrappeError, useFrappeAuth } from 'frappe-react-sdk';
// import { createContext, PropsWithChildren, useContext, FC } from 'react';
// import { useNavigate } from 'react-router-dom';

// // Define the shape of the authentication context
// interface AuthContextType {
//     currentUser: string | null;
//     isLoading: boolean;
//     login: (params: any) => Promise<void>;
//     logout: () => Promise<void>;
//     updateCurrentUser: () => void;
// }

// // Create the context with a default value (or null!)
// const AuthContext = createContext<AuthContextType>(null!);

// export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
//     // The core frappe-react-sdk hook
//     const { login: sdkLogin, logout: sdkLogout, currentUser, isLoading, updateCurrentUser } = useFrappeAuth();
//     // const navigate = useNavigate();

//     /**
//      * Handles the login process.
//      * 1. Calls the SDK's login function.
//      * 2. On success, it's crucial to ensure the app state is refreshed.
//      *    A full page navigation is the most reliable way to force a reload
//      *    of the Frappe boot object and re-initialize the React app state.
//      */
//     const handleLogin = async (params: { usr: string; pwd?: string }) => {
//         try {
//             await sdkLogin(params);
//             // Instead of react-router's navigate, which can cause state sync issues,
//             // we do a full page load to the root. This is a robust pattern for Frappe apps.
//             window.location.href = '/';
//         } catch (e) {
//             // Re-throw the error so the login form can catch and display it
//             throw e;
//         }
//     };

//     /**
//      * Handles the logout process.
//      * 1. Clears any app-specific local/session storage.
//      * 2. Calls the SDK's logout function.
//      * 3. Redirects to the login page with a full page load.
//      */
//     const handleLogout = async () => {
//         try {
//             // Add any custom cleanup logic here (e.g., clearing caches)
//             sessionStorage.clear();
//             localStorage.clear();

//             await sdkLogout();
//             // Full page load to the login route ensures a clean state
//             window.location.href = '/login';
//         } catch (e) {
//             console.error("Logout failed:", e);
//         }
//     };

//     const value: AuthContextType = {
//         currentUser,
//         isLoading,
//         login: handleLogin,
//         logout: handleLogout,
//         updateCurrentUser,
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// // Custom hook for easy consumption of the context
// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };