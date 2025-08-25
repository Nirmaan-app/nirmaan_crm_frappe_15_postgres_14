

import { FrappeError, useFrappeAuth } from 'frappe-react-sdk';
import { createContext, PropsWithChildren, useContext, FC } from 'react';
import { useNavigate } from 'react-router-dom';

// Define the shape of the authentication context
interface AuthContextType {
    currentUser: string | null;
    isLoading: boolean;
    login: (params: any) => Promise<void>;
    logout: () => Promise<void>;
    updateCurrentUser: () => void;
}

// Create the context with a default value (or null!)
const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    // The core frappe-react-sdk hook
    const { login: sdkLogin, logout: sdkLogout, currentUser, isLoading, updateCurrentUser } = useFrappeAuth();
    // const navigate = useNavigate();

    /**
     * Handles the login process.
     * 1. Calls the SDK's login function.
     * 2. On success, it's crucial to ensure the app state is refreshed.
     *    A full page navigation is the most reliable way to force a reload
     *    of the Frappe boot object and re-initialize the React app state.
     */
    const handleLogin = async (params: { usr: string; pwd?: string }) => {
        try {
            await sdkLogin(params);
            // Instead of react-router's navigate, which can cause state sync issues,
            // we do a full page load to the root. This is a robust pattern for Frappe apps.
            window.location.href = '/';
        } catch (e) {
            // Re-throw the error so the login form can catch and display it
            throw e;
        }
    };

    /**
     * Handles the logout process.
     * 1. Clears any app-specific local/session storage.
     * 2. Calls the SDK's logout function.
     * 3. Redirects to the login page with a full page load.
     */
    const handleLogout = async () => {
        try {
            // Add any custom cleanup logic here (e.g., clearing caches)
            sessionStorage.clear();
            localStorage.clear();

            await sdkLogout();
            // Full page load to the login route ensures a clean state
            window.location.href = '/login';
        } catch (e) {
            console.error("Logout failed:", e);
        }
    };

    const value: AuthContextType = {
        currentUser,
        isLoading,
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

// Custom hook for easy consumption of the context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};