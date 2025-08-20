/**
 * Checks if the current user has a specific role.
 * Relies on the frappe.boot object injected by Frappe.
 */
const hasRole = (role: string): boolean => {
    // In development, you might need to mock this if not running through Frappe's renderer
    if (import.meta.env.DEV && !(window as any).frappe) {
        // Example mock for development
        // return role === 'Standard User'; 
        return true; // Or grant all roles for easy dev
    }
    // @ts-ignore
    return (window?.frappe?.boot?.user?.roles ?? []).includes(role);
};

export const isSalesUser = () => hasRole('Nirmaan Sales User');
export const isEstimationsUser = () => hasRole('Nirmaan Estimations User');
export const isAdminUser = () => hasRole('Nirmaan Admin User');