// src/pages/Home/PendingTasks.tsx
import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { format, subDays, isWithinInterval, isToday } from "date-fns"; // 2. Import date functions
import { useDialogStore } from "@/store/dialogStore";
import { EnrichedCRMTask } from "../Tasks/Tasks"; // We'll reuse this type
import { ChevronDown } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"; // 3. Import Dropdown components
// ... other imports
type FilterOption = 'last 7 days' | 'Today' | 'All';

const PendingTaskRow = ({ task }: { task: EnrichedCRMTask }) => {
    const { openEditTaskDialog } = useDialogStore();
    return (
        <div className="px-1"> {/* Add slight horizontal padding for better spacing */}
            <div className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                    <span className="font-medium text-sm">Call {task.contact_name} from {task.company_name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => openEditTaskDialog({ taskData: task, mode: 'updateStatus' })}>
                    Update
                </Button>
            </div>
            <Separator className="last:hidden" />
        </div>
    );
};

export const PendingTasks = ({ tasks, isLoading }: { tasks: EnrichedCRMTask[], isLoading: boolean }) => {
    // You can add the date range picker logic here later
        const [selectedFilter, setSelectedFilter] = useState<FilterOption>('last 7 days');
          // ADD THIS MEMOIZED FILTERING LOGIC
    const filteredTasks = useMemo(() => {
        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0)); // Start of today
        const sevenDaysAgo = subDays(today, 6); // Include today in the 7-day range

        switch (selectedFilter) {
            case 'Today':
                return tasks.filter(task => task.start_date && isToday(new Date(task.start_date)));
            
            case 'last 7 days':
                return tasks.filter(task => {
                    if (!task.start_date) return false;
                    const taskDate = new Date(task.start_date);
                    return isWithinInterval(taskDate, { start: sevenDaysAgo, end: now });
                });

            case 'All':
            default:
                return tasks; // Return all tasks
        }
    }, [tasks, selectedFilter]); // Dependencies: only re-filter when these change


    return (
        <div className="bg-background p-4 rounded-xl border-2 border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">Pending Tasks</h2>
                 {/* --- UPDATE THIS ENTIRE SECTION --- */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
 <Button 
        variant="outline" 
        size="sm" // Use a standard size like "sm" for proper padding and height
        className="border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive" 
    >
        {selectedFilter}
        <ChevronDown className="w-4 h-4 ml-2" />
    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setSelectedFilter('last 7 days')}>
                            last 7 days
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSelectedFilter('Today')}>
                            Today
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSelectedFilter('All')}>
                            All
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                 {/* --- END OF UPDATED SECTION --- */}
            </div >
              <div className={"transition-all duration-300  max-h-[270px] overflow-y-auto"}>
             {isLoading && <p className="text-center text-sm text-muted-foreground py-4">Loading tasks...</p>}
            
            {!isLoading && filteredTasks.length > 0 && filteredTasks.map(task => 
                <PendingTaskRow key={task.name} task={task} />
            )}
            
            {!isLoading && filteredTasks.length === 0 && 
                <p className="text-center text-sm text-muted-foreground py-4">
                    No pending tasks found for this period.
                </p>
            }
             </div>
        </div>
    );
};