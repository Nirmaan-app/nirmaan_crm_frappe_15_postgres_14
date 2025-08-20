import { useAuth } from "@/auth/AuthProvider";
import { useFrappeGetDoc } from "frappe-react-sdk";
// import { User } from "frappe-react-sdk/lib/types"; // Import the User type

/**
 * A hook to fetch the complete Frappe User document for the currently logged-in user.
 *
 * @returns An object containing the user document, loading state, and error state.
 */
export const useCurrentUser = () => {
    // Get the current user's email (e.g., "user@example.com") from our auth context
    const { currentUser } = useAuth();

    // Use the useFrappeGetDoc hook to fetch the User document.
    // The doc's name is the user's email address.
    const { data, isLoading, error, mutate } = useFrappeGetDoc(
        'User',
        currentUser!, // The '!' asserts that currentUser is not null here.
        {
            // IMPORTANT: Only run this query if the user is logged in.
            enabled: !!currentUser && currentUser !== 'Guest',
        }
    );

    // Provide convenient fallbacks and derived data
    const fullName = data?.full_name ?? 'User';
    const userImage = data?.user_image ?? undefined;

    return {
        user: data,
        fullName,
        userImage,
        isLoading,
        error,
        mutate,
    };
};