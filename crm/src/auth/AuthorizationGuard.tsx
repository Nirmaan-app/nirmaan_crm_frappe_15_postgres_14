import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const FullPageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// --- NEW: A precise path checker function ---
const isPathAllowed = (currentPath: string, allowedPaths: string[]): boolean => {
    // Check for an exact match first (especially for the homepage '/')
    if (allowedPaths.includes(currentPath)) {
        return true;
    }
    // Then, check if the current path starts with any of the allowed base paths,
    // ensuring that the base path is not just '/' itself.
    return allowedPaths.some(
        (basePath) => basePath !== '/' && currentPath.startsWith(basePath + '/')
    );
};


export const AuthorizationGuard = () => {
  const { role, has_company, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  // --- CORRECTED LOGIC for restricted Sales Users ---
  if (role === 'Nirmaan Sales User Profile' && has_company =="false") {
    // Define the base paths this user is allowed to access.
    const allowedBasePaths = ['/', '/boqs'];
    
    // Use our new, more precise function to check permissions.
    if (!isPathAllowed(location.pathname, allowedBasePaths)) {
      // If the path is NOT in the allowed list, redirect to home.
      return <Navigate to="/" replace />;
    }
  }

  // --- Admin-only route check remains the same ---
  // This logic is correct as it stands.
  if (location.pathname.startsWith('/team') && role !== 'Nirmaan Admin User Profile') {
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the requested page.
  return <Outlet />;
};