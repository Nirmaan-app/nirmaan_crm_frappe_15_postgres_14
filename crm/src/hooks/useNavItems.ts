import { useMemo } from "react";
import { items } from "@/constants/navItems";
import { useAuth } from "@/auth/AuthProvider"; // <-- 1. IMPORT useAuth

// The NavItem interface remains the same
interface NavItem {
  label: string;
  path: string;
  icon: any;
  adminOnly?: boolean;
}

/**
 * A pure function to filter navigation items based on the user's role.
 * It is defined outside the hook for clarity and testability.
 * @param role The user's role profile name from localStorage.
 * @returns A filtered array of NavItem objects.
 */
const getFilteredNavItems = (role: string | null): NavItem[] => {
  // If we don't have a role (e.g., user is logged out), return an empty array.
  // if (!role) {
  //   return [];
  // }

if (role === 'Nirmaan Sales User Profile') {
    return items.filter(item => 
      item.label !== 'My Team'
    );
  }

  // Rule 1: Handle specific permissions for the Estimation User
  if (role === 'Nirmaan Estimations User Profile') {
    // This user can only see 'Home' and 'BOQs'
    return items.filter(item => ['Home', 'BOQs'].includes(item.label));
  }
  
  // Rule 2: Handle the Admin User
  if (role === 'Nirmaan Admin User Profile') {
    // Admins can see all items, so we return the original, unfiltered list.
    return items;
  }
  
  // Rule 3: Default for all other users (like Sales User)
  // This will filter out any item marked with `adminOnly: true`.
  return items.filter(item => !item.adminOnly);
};


export const useNavItems = () => {
  // 2. Use the lighter useAuth hook to know when authentication is complete.
  const { isLoading: isAuthLoading, currentUser } = useAuth();
    const role = localStorage.getItem('role');

  // The isLoading state is now ONLY dependent on the initial authentication check.
  const isLoading = isAuthLoading;

  // 3. useMemo will calculate the nav items instantly after authentication is done.
  // It re-runs only when the user's login status changes.
  const navItems = useMemo(() => {
    // If authentication is still loading or if there's no user, we can't show any items.
    if (isAuthLoading || !currentUser) {
      return [];
    }

    // --- CORE CHANGE: Read directly from localStorage ---
    // This is synchronous and happens instantly.
    const role = localStorage.getItem('role');
    
    // Pass the retrieved role to our pure filtering function.
    return getFilteredNavItems(role);

  }, [currentUser, role]); // Dependency array: Re-run when login/logout happens.

  // The hook returns the memoized items and the lean loading state.
  return { navItems, isLoading };
};






// import { useMemo } from "react";
// import { items } from "@/constants/navItems";
// import { useCurrentUser } from "./useCurrentUser";

// // Define the shape of a navigation item for clarity
// interface NavItem {
//   label: string;
//   path: string;
//   icon: any;
//   adminOnly?: boolean;
// }

// /**
//  * A pure function to filter navigation items based on user role and company status.
//  * It is defined outside the component for testability and separation of concerns.
//  * @param role The user's role profile name.
//  * @param has_company The user's company status.
//  * @returns A filtered array of NavItem objects.
//  */
// const getFilteredNavItems = (role: string, has_company: string): NavItem[] => {
//   // Rule 1: Restricted Sales User (most specific rule first)
//   if (role === 'Nirmaan Sales User Profile') {
//     return items.filter(item => 
//       item.label !== 'My Team'
//     );
//   }

//   // Rule 2: Estimation User
//   console.log(has_company=="false")

//   if (role === 'Nirmaan Estimations User Profile') {
//     // Assumption: Estimation users need Home, BOQs, and Tasks. This can be easily customized.
//     console.log(items)
//     return items.filter(item =>
//       ['Home', 'BOQs'].includes(item.label)
//     );
//   }
  
//   // Default rule for all other users (including Admins and general Sales Users)
//   return items.filter(item => {
//     // If an item is marked as admin-only, only include it if the user is an admin.
//     if (item.adminOnly && role !== 'Nirmaan Admin User Profile') {
//       return false; // Exclude admin-only items for non-admins
//     }
//     return true; // Include all other items
//   });
// };

// export const useNavItems = () => {
//   const { role, has_company, isLoading: isAuthLoading } = useCurrentUser();

//   // Determine the final loading state. We are "loading" if the auth hook is loading 
//   // OR if it's done but we don't have a role yet.
//   const isLoading = isAuthLoading || !role;

//   // useMemo will only re-run the filtering logic when `role` or `has_company` actually changes.
//   const navItems = useMemo(() => {
//     // If there's no role, we can't filter, so return an empty array.
//     // The `isLoading` flag above will correctly inform the UI to show a loading state.
//     if (!role) {
//       return [];
//     }
//     // Once the role is available, run the filtering logic.
//     return getFilteredNavItems(role, has_company);
//   }, [role, has_company]); // Dependencies: This function re-runs ONLY when these values change.

//   // The hook returns the memoized items and the comprehensive loading state.
//   return { navItems, isLoading };
// };