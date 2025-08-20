import { useState, useEffect } from 'react';

/**
 * A custom hook to check user roles based on Frappe's boot information.
 * It provides boolean flags for easy consumption in components.
 *
 * @returns An object with boolean flags for each role and the raw roles array.
 */
export const useUserRoles = () => {
    const [roles, setRoles] = useState<string[]>([]);

    useEffect(() => {
        // The frappe.boot object might not be available immediately on mount.
        // We check for it and set the roles. In a real-world scenario with
        // extensive client-side navigation, you might pull this from a context
        // that is set once on app load.
        if (window.frappe?.boot?.user?.roles) {
            setRoles(window.frappe.boot.user.roles);
        }
    }, []); // Empty dependency array ensures this runs only once on mount

    // In development mode outside of Frappe's renderer, you can mock roles.
    if (import.meta.env.DEV && !window.frappe) {
        // Example mock: Uncomment the roles you want to test with.
        const mockRoles = [
            'System Manager',
            'Nirmaan Sales User',
            // 'Nirmaan Estimations User',
            // 'Nirmaan Admin User',
        ];
        return {
            roles: mockRoles,
            isSalesUser: mockRoles.includes('Nirmaan Sales User'),
            isEstimationsUser: mockRoles.includes('Nirmaan Estimations User'),
            isAdminUser: mockRoles.includes('Nirmaan Admin User'),
            isSystemManager: mockRoles.includes('System Manager'),
        };
    }

    return {
        roles,
        isSalesUser: roles.includes('Nirmaan Sales User'),
        isEstimationsUser: roles.includes('Nirmaan Estimations User'),
        isAdminUser: roles.includes('Nirmaan Admin User'),
        isSystemManager: roles.includes('System Manager'),
    };
};

// Example Usage in a component:
/*
import { useUserRoles } from '@/hooks/useUserRoles';

const MyComponent = () => {
    const { isAdminUser, isSalesUser } = useUserRoles();

    return (
        <div>
            {isAdminUser && <button>Admin Settings</button>}
            {isSalesUser && <p>Welcome, Sales Team Member!</p>}
        </div>
    );
}
*/