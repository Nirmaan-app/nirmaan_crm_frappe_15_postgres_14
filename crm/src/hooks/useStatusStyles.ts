// src/hooks/useStatusStyles.ts

// Define the possible types of entities we can style.
// This provides type safety and autocompletion.
type StatusEntityType = 'boq' | 'task';

/**
 * A custom hook to get Tailwind CSS classes for different entity statuses.
 * @param entityType - The type of entity ('boq' or 'task').
 * @returns A function that takes a status string and returns the corresponding CSS classes.
 */
export const useStatusStyles = (entityType: StatusEntityType) => {
    
    const getBoqStatusClass = (status: string): string => {
        // Returns border, background, and text color classes for BOQ statuses
        switch (status?.toLowerCase()) {
            case 'won': return 'border-green-300 bg-green-50 text-green-700';
            case 'lost': return 'border-red-300 bg-red-50 text-red-700';
            case 'hold': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
            case 'revision pending': return 'border-orange-300 bg-orange-50 text-orange-700';
            case 'negotiation': return 'border-emerald-300 bg-emerald-50 text-emerald-700';
            case 'revision submitted': return 'border-blue-300 bg-blue-50 text-blue-700';
            case 'new': return 'border-sky-300 bg-sky-50 text-sky-700';
            default: return 'border-gray-300 bg-gray-100 text-gray-700';
        }
    };

    const getTaskStatusClass = (status: string): string => {
        // Returns border, background, and text color classes for Task statuses
        switch (status?.toLowerCase()) {
            case 'completed': return 'border-green-300 bg-green-50 text-green-700';
            case 'scheduled': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
            case 'incomplete': return 'border-red-300 bg-red-50 text-red-700';
            case 'pending': return 'border-amber-300 bg-amber-50 text-amber-700';
            default: return 'border-gray-300 bg-gray-100 text-gray-700';
        }
    };

    // Return the correct styling function based on the entity type
    if (entityType === 'boq') {
        return getBoqStatusClass;
    }

    if (entityType === 'task') {
        return getTaskStatusClass;
    }

    // Fallback function if an unknown entity type is provided
    return (status: string) => 'border-gray-300 bg-gray-100 text-gray-700';
};