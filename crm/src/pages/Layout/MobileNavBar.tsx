// File: src/components/layout/MobileNavBar.tsx (or wherever MobileNavBar is located)

import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserNav } from "@/components/common/UserNav";
// import logo from "@/assets/logo-svg.svg"; // Option 1: If logo is imported (e.g., from assets)
import logo from "@/assets/nirmaan-red.svg"

interface MobileNavBarProps {
    title: string;
    showBackButton: boolean;
}

export const MobileNavBar = ({ title, showBackButton }: MobileNavBarProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBackClick = () => {
        if (location.pathname.startsWith('/calendar')) {
            navigate('/');
        } else {
            navigate(-1);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-navbar-background shadow px-4 py-3 z-10">
            {title === 'Home' ? (
                <div className="flex justify-between items-center">
                    {/* --- NEW: Add Logo before Nirmaan CRM --- */}
                    <div className="flex items-center gap-1"> {/* Container for logo and text */}
                        {/* <img
                            src="/web-app-manifest-512x512.png" // Path to your logo in the public folder
                            alt="Nirmaan CRM Logo"
                            className="h-8 w-8" // Adjust size as needed
                        /> */}
                        <Link to={"/"}>
                            <img src={logo} alt="Nirmaan CRM" width="36" height="36" />
                        </Link>
                        <h1 className="text-xl text-primary font-bold whitespace-nowrap">CRM</h1>
                    </div>
                    <UserNav />
                </div>
            ) : (
                <div className="dark:text-white relative flex justify-center items-center h-6">
                    {showBackButton && (
                        <ArrowLeft className="cursor-pointer absolute left-0 text-foreground" onClick={handleBackClick} />
                    )}
                    <h2 className="font-semibold text-lg text-foreground">{title}</h2> {/* Themed title */}
                </div>
            )}
        </nav>
    );
};

// import { ArrowLeft } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom"; // <-- 1. IMPORT useLocation
// import { UserNav } from "@/components/common/UserNav";

// interface MobileNavBarProps {
//     title: string;
//     showBackButton: boolean;
// }

// export const MobileNavBar = ({ title, showBackButton }: MobileNavBarProps) => {
//     const navigate = useNavigate();
//     const location = useLocation(); // <-- 2. GET THE CURRENT LOCATION OBJECT

//     // 3. CREATE A HANDLER FUNCTION FOR THE BACK BUTTON
//     const handleBackClick = () => {
//         // 4. ADD THE CONDITIONAL LOGIC
//         // If the current path starts with /calendar, always go to the home page.
//         if (location.pathname.startsWith('/calendar')) {
//             navigate('/');
//         } else {
//             // Otherwise, perform the default "back" action.
//             navigate(-1);
//         }
//     };

//     return (
//         <nav className="fixed top-0 left-0 w-full bg-navbar-background shadow px-4 py-3 z-10">
//             {title === 'Home' ? (
//                 <div className="flex justify-between items-center">
//                     <h1 className="text-xl text-primary font-semibold">Nirmaan CRM</h1>
//                     <UserNav />
//                 </div>
//             ) : (
//                 <div className="dark:text-white relative flex justify-center items-center h-6">
//                     {showBackButton && (
//                         // Use the new handler function here
//                         <ArrowLeft className="cursor-pointer absolute left-0" onClick={handleBackClick} />
//                     )}
//                     <h2 className="font-semibold text-lg">{title}</h2>
//                 </div>
//             )}
//         </nav>
//     );
// };

