// src/hooks/useNavItems.ts

import { useMemo } from "react";
import { items } from "@/constants/navItems";
import { useCurrentUser } from "./useCurrentUser";

// Define the shape of a navigation item for clarity
interface NavItem {
  label: string;
  path: string;
  icon: any;
  adminOnly?: boolean;
}

/**
 * A pure function to filter navigation items based on user role and company status.
 * It is defined outside the component for testability and separation of concerns.
 * @param role The user's role profile name.
 * @param has_company The user's company status.
 * @returns A filtered array of NavItem objects.
 */
const getFilteredNavItems = (role: string, has_company: string): NavItem[] => {
  // Rule 1: Restricted Sales User (most specific rule first)
  if (role === 'Nirmaan Sales User Profile' && has_company == "false") {
    return items.filter(item => 
      item.label !== 'team'
    );
  }

  // Rule 2: Estimation User
  console.log(has_company=="false")

  if (role === 'Nirmaan Estimations User Profile') {
    // Assumption: Estimation users need Home, BOQs, and Tasks. This can be easily customized.
    console.log(items)
    return items.filter(item =>
      ['Home', 'BOQs'].includes(item.label)
    );
  }
  
  // Default rule for all other users (including Admins and general Sales Users)
  return items.filter(item => {
    // If an item is marked as admin-only, only include it if the user is an admin.
    if (item.adminOnly && role !== 'Nirmaan Admin User Profile') {
      return false; // Exclude admin-only items for non-admins
    }
    return true; // Include all other items
  });
};

export const useNavItems = () => {
  const { role, has_company, isLoading: isAuthLoading } = useCurrentUser();

  // Determine the final loading state. We are "loading" if the auth hook is loading 
  // OR if it's done but we don't have a role yet.
  const isLoading = isAuthLoading || !role;

  // useMemo will only re-run the filtering logic when `role` or `has_company` actually changes.
  const navItems = useMemo(() => {
    // If there's no role, we can't filter, so return an empty array.
    // The `isLoading` flag above will correctly inform the UI to show a loading state.
    if (!role) {
      return [];
    }
    // Once the role is available, run the filtering logic.
    return getFilteredNavItems(role, has_company);
  }, [role, has_company]); // Dependencies: This function re-runs ONLY when these values change.

  // The hook returns the memoized items and the comprehensive loading state.
  return { navItems, isLoading };
};