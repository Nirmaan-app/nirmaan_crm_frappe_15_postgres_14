import { useApplicationContext } from "@/contexts/ApplicationContext";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "./separator";

interface FABOption {
    label: string;
   action: () => void; // Instead of 'path: string'
}


interface FloatingActionButtonProps {
    options: FABOption[];
}

export const FloatingActionButton = ({ options }: FloatingActionButtonProps) => {
    const { overlayOpen, setOverlayOpen } = useApplicationContext();
    const navigate = useNavigate();

   
    // Don't render the button if there are no actions for the current screen
    if (!options || options.length === 0) {
        return null;
    }

    // --- CHANGE 2: The click handler now executes the 'action' function ---
    const handleOptionClick = (action: () => void) => {
        action(); // Execute the function passed from the layout (e.g., openNewCompanyDialog)
        setOverlayOpen(false); // Close the menu after the action is triggered
    };


    return (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-4">
            {/* The expanded menu, matching the red style from the mockup */}
            {overlayOpen && (
                <div
                    className="p-4 bg-destructive text-white shadow-lg rounded-lg flex flex-col gap-2 min-w-[160px]"
                    style={{ transition: "opacity 0.3s ease-in-out" }}
                >
                    {options.map((option, index) => (
                        <div key={option.path}>
                            <button  onClick={() => handleOptionClick(option.action)} className="w-full text-left py-1 text-base">
                                {option.label}
                            </button>
                            {index < options.length - 1 && <Separator className="bg-white/30 my-1" />}
                        </div>
                    ))}
                </div>
            )}

            {/* The main floating action button */}
            <button
                onClick={() => setOverlayOpen(!overlayOpen)}
                className={`p-4 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 transform ${
                    overlayOpen ? "rotate-45" : "rotate-0"
                }`}
                aria-label={overlayOpen ? "Close menu" : "Open menu"}
            >
                <Plus size={28} />
            </button>
        </div>
    );
};