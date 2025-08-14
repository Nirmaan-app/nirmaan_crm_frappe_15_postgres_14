import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatItem } from "@/store/dialogStore"; // Import the StatItem type

export const StatsDetailDialog = () => {
    const navigate = useNavigate();
    const { statsDetail, closeStatsDetailDialog } = useDialogStore();
    const { title, items } = statsDetail.context;

    // UPDATED: handleItemClick now performs navigation
    const handleItemClick = (item: StatItem) => {
        // First, close the dialog
        closeStatsDetailDialog();

        // Then, navigate based on the item's type
        if (item.type === 'Task') {
            navigate(`/tasks/task?id=${item.id}`);
        } else if (item.type === 'BOQ') {
            // Note: Ensure your route for a single BOQ is correct
            navigate(`/boqs/boq?id=${item.id}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <span className="bg-destructive text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {items?.length || "0"}
                </span>
                <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto pr-2">
                {items && items.length > 0 ? (
                    items.map((item, index) => (
                        // UPDATED: Use the unique item.id for the React key
                        <div key={item.id}> 
                            <div 
                                onClick={() => handleItemClick(item)} 
                                className="flex justify-between items-center py-3 cursor-pointer hover:bg-secondary rounded-md px-2"
                            >
                                <span className="text-sm">{item.name}</span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                            {index < items.length - 1 && <Separator />}
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

// // src/components/dialogs/StatsDetailDialog.tsx
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { useDialogStore } from "@/store/dialogStore";
// import { ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export const StatsDetailDialog = () => {
//     const navigate = useNavigate();
//     // Get the context (title, items) and the close action from the store
//     const { statsDetail, closeStatsDetailDialog } = useDialogStore();
//     const { title, items } = statsDetail.context;

//     const handleItemClick = (item) => {
//         // You can define navigation logic here later if needed
//         console.log("Navigating to item:", item);
//         closeStatsDetailDialog(); // Close dialog on item click
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex items-center gap-3">
//                 <span className="bg-destructive text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
//                     {items?.length||"0"}
//                 </span>
//                 <h3 className="font-semibold text-lg text-foreground">{title}</h3>
//             </div>
            
//             {/* Scrollable container for the list */}
//             <div className="max-h-64 overflow-y-auto pr-2">
//                 {items && items.length > 0 ? (
//                     items.map((item, index) => (
//                         <div key={index}>
//                             <div 
//                                 onClick={() => handleItemClick(item)} 
//                                 className="flex justify-between items-center py-3 cursor-pointer hover:bg-secondary rounded-md px-2"
//                             >
//                                 <span className="text-sm">{item.name}</span>
//                                 <ChevronRight className="w-4 h-4 text-muted-foreground" />
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