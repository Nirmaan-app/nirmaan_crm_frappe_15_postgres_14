import { useAuth } from "@/auth/AuthProvider"; // <-- 1. IMPORT useAuth instead of useCurrentUser
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

const FullPageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const isPathAllowed = (currentPath: string, allowedPaths: string[]): boolean => {
    if (allowedPaths.includes(currentPath)) {
        return true;
    }
    return allowedPaths.some(
        (basePath) => basePath !== '/' && currentPath.startsWith(basePath + '/')
    );
};


export const AuthorizationGuard = () => {
  // 2. Use the simpler useAuth hook ONLY to check if authentication is complete.
  const { isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  // This check is still critical. We cannot check permissions until we know who the user is.
  if (isAuthLoading) {
    return <FullPageLoader />;
  }

  // --- 3. GET USER DETAILS DIRECTLY FROM LOCAL STORAGE ---
  // These calls are synchronous and instant, making the guard very fast.
  const role = localStorage.getItem('role');
  const has_company = localStorage.getItem('has_company');

  // --- The rest of your logic remains the same, but now uses the variables from localStorage ---

  if (role === 'Nirmaan Sales User Profile') {
    const allowedBasePaths = ['/', '/boqs', '/contacts', '/companies', '/tasks','/calendar'];
    if (!isPathAllowed(location.pathname, allowedBasePaths)) {
      return <Navigate to="/" replace />;
    }
  }
 
  if (role === 'Nirmaan Estimations User Profile') {
    const allowedBasePaths = ['/', '/boqs',"/calendar", "/tasks"];
    if (!isPathAllowed(location.pathname, allowedBasePaths)) {
      return <Navigate to="/" replace />;
    }
  }

  if (location.pathname.startsWith('/team') && role !== 'Nirmaan Admin User Profile') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};


// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { Loader2 } from "lucide-react";

// const FullPageLoader = () => (
//   <div className="flex items-center justify-center h-screen w-full">
//     <Loader2 className="h-8 w-8 animate-spin text-primary" />
//   </div>
// );

// // --- NEW: A precise path checker function ---
// const isPathAllowed = (currentPath: string, allowedPaths: string[]): boolean => {
//     // Check for an exact match first (especially for the homepage '/')
//     if (allowedPaths.includes(currentPath)) {
//         return true;
//     }
//     // Then, check if the current path starts with any of the allowed base paths,
//     // ensuring that the base path is not just '/' itself.
//     return allowedPaths.some(
//         (basePath) => basePath !== '/' && currentPath.startsWith(basePath + '/')
//     );
// };


// export const AuthorizationGuard = () => {
//   const { role, has_company, isLoading } = useCurrentUser();
//   const location = useLocation();

//   if (isLoading) {
//     return <FullPageLoader />;
//   }

//   // --- CORRECTED LOGIC for restricted Sales Users ---
//   if (role === 'Nirmaan Sales User Profile') {
//     // Define the base paths this user is allowed to access.
//     const allowedBasePaths = ['/', '/boqs','/contacts','/companies','/tasks'];
    
//     // Use our new, more precise function to check permissions.
//     if (!isPathAllowed(location.pathname, allowedBasePaths)) {
//       // If the path is NOT in the allowed list, redirect to home.
//       return <Navigate to="/" replace />;
//     }
//   }
//    if (role === 'Nirmaan Estimations User Profile') {
//     // Define the base paths this user is allowed to access.
//     const allowedBasePaths = ['/', '/boqs'];
    
//     // Use our new, more precise function to check permissions.
//     if (!isPathAllowed(location.pathname, allowedBasePaths)) {
//       // If the path is NOT in the allowed list, redirect to home.
//       return <Navigate to="/" replace />;
//     }
//   }

//   // --- Admin-only route check remains the same ---
//   // This logic is correct as it stands.
//   if (location.pathname.startsWith('/team') && role !== 'Nirmaan Admin User Profile') {
//     return <Navigate to="/" replace />;
//   }

//   // If all checks pass, render the requested page.
//   return <Outlet />;
// };