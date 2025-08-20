// src/pages/Layout/MobileNavBar.tsx
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserNav } from "@/components/common/UserNav"; // <-- IMPORT

interface MobileNavBarProps {
    title: string;
    showBackButton: boolean;
}

export const MobileNavBar = ({ title, showBackButton }: MobileNavBarProps) => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 w-full bg-navbar-background shadow px-4 py-3 z-10">
            {title === 'Home' ? (
                <div className="flex justify-between items-center">
                    <h1 className="text-xl text-primary font-semibold">Nirmaan CRM</h1>
                    <UserNav /> {/* <-- REPLACE THE DIV */}
                </div>
            ) : (
                <div className="dark:text-white relative flex justify-center items-center h-6">
                    {showBackButton && (
                        <ArrowLeft className="cursor-pointer absolute left-0" onClick={() => navigate(-1)} />
                    )}
                    <h2 className="font-semibold text-lg">{title}</h2>
                </div>
            )}
        </nav>
    );
};