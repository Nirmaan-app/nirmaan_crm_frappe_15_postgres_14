import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatItem } from "@/store/dialogStore";
import React from 'react'; // Import React to use React.isValidElement

export const StatsDetailDialog = () => {
    const navigate = useNavigate();
    const { statsDetail, closeStatsDetailDialog } = useDialogStore();
    const { title, items } = statsDetail.context;
    console.log("StatsDetailDialog items",items);
    const handleItemClick = (item: StatItem) => {

        closeStatsDetailDialog();
        if (item.type === 'Task') {
            navigate(`/tasks/task?id=${item.id}`);
        } else if (item.type === 'BOQ') {
            navigate(`/boqs/boq?id=${item.id}`);
        } else if (item.type === 'Company') {
            navigate(`/companies/company?id=${item.id}`);
        }
       
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="bg-destructive text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {items?.length || "0"}
                </span>
                <h3 className="font-semibold text-md text-foreground">{title}</h3> 
            </div>
            
            <div className="max-h-80 overflow-y-auto p-1 space-y-2">
                {items && items.length > 0 ? (
                    items.map((item) => (
                        <div 
                            key={item.id} 
                            // The click handler now applies to the entire rendered block
                            onClick={() => handleItemClick(item)} 
                            className="cursor-pointer" // Let the inner content handle styling
                        >
                            {/* --- THIS IS THE ONLY LOGIC THAT MATTERS --- */}
                            {/* Check if item.name is a JSX component */}
                            {React.isValidElement(item.name) ? (
                                // If yes, render it directly.
                                item.name
                            ) : (
                                // If no (it's a string), render the simple list view with a separator.
                                <>
                                    <div className="flex justify-between items-center p-3 hover:bg-muted rounded-md">
                                        <span className="text-sm">{item.name}</span>

                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <Separator className="last:hidden"/>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No items to display.</p>
                )}
            </div>
            
            <Button variant="outline" className="w-full" onClick={closeStatsDetailDialog}>
                Close
            </Button>
        </div>
    );
};


// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { useDialogStore } from "@/store/dialogStore";
// import { ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { StatItem } from "@/store/dialogStore"; // Import the StatItem type

// export const StatsDetailDialog = () => {
//     const navigate = useNavigate();
//     const { statsDetail, closeStatsDetailDialog } = useDialogStore();
//     const { title, items } = statsDetail.context;

//     // UPDATED: handleItemClick now performs navigation
//     const handleItemClick = (item: StatItem) => {
//         // First, close the dialog
//         closeStatsDetailDialog();

//         // Then, navigate based on the item's type
//         if (item.type === 'Task') {
//             navigate(`/tasks/task?id=${item.id}`);
//         } else if (item.type === 'BOQ') {
//             // Note: Ensure your route for a single BOQ is correct
//             navigate(`/boqs/boq?id=${item.id}`);
//         }
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex items-center gap-3">
//                 <span className="bg-destructive text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
//                     {items?.length || "0"}
//                 </span>
//                 <h3 className="font-semibold text-lg text-foreground">{title}</h3>
//             </div>
            
//             <div className="max-h-64 overflow-y-auto">
//                 {items && items.length > 0 ? (
//                     items.map((item, index) => (
//                         // UPDATED: Use the unique item.id for the React key
//                         <div key={item.id}> 
//                             <div 
//                                 onClick={() => handleItemClick(item)} 
//                                 className="flex justify-between items-center py-3 cursor-pointer hover:bg-secondary rounded-md"
//                             >
//                                 <span className="text-sm">{item.name}</span>
//                                 {/* <ChevronRight className="w-4 h-4 text-muted-foreground" /> */}
//                             </div>
//                             {index < items.length - 1 && <Separator />}
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-center text-sm text-muted-foreground py-8">No items to display.</p>
//                 )}
//             </div>
            
//             <Button variant="outline" className="w-full" onClick={closeStatsDetailDialog}>
//                 Close
//             </Button>
//         </div>
//     );
// };
