
// // src/pages/Tasks/Tasks.tsx

// import { useViewport } from "@/hooks/useViewPort";
// import { TaskList } from "./TaskList";
// import { Task } from "./Task";
// import { useStatesSyncedWithParams } from "@/hooks/useSearchParamsManager";
// import { useDialogStore } from "@/store/dialogStore";
// import { Plus } from "lucide-react";
// import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
// import { TasksVariantPage } from "./TasksVariantPage";
// import { format, subDays } from "date-fns";

// const DesktopPlaceholder = () => (
//     <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-secondary">
//         <span className="text-muted-foreground">Please select a category or task from the list</span>
//     </div>
// );

// export const Tasks = () => {
//     const { isMobile } = useViewport();
//     const { openNewTaskDialog } = useDialogStore();

//     // This hook is now the single source of truth for the page's state.
//     const [params, setParams] = useStatesSyncedWithParams([
//         { key: 'id', defaultValue: '' }, // Default to no selection
//         { key: 'from', defaultValue: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
//         { key: 'to', defaultValue: format(new Date(), 'yyyy-MM-dd') },
//     ]);
//     const { id, from, to } = params;

//     // The logic for rendering the detail panel on desktop
//     const renderDetailPanel = () => {
//         if (!id) {
//             return <DesktopPlaceholder />;
//         }
        
//         const lowercasedId = id.toLowerCase();
//         if (['all', 'pending', 'upcoming'].includes(lowercasedId)) {
//             const variant = lowercasedId as 'all' | 'pending' | 'upcoming';
//             return <TasksVariantPage variant={variant} from={from} to={to} />;
//         }
        
//         // If the ID is not a category, it must be a specific task ID.
//         // The <Task /> component already uses `useStateSyncedWithParams` internally to read the ID.
//         return <Task />;
//     };

//     if (isMobile) {
//         const fabOptions = [{ label: 'Add New Task', action: openNewTaskDialog }];
//         return (
//             <div className="space-y-4">
//                  <h1 className="text-2xl font-bold text-center">Tasks</h1>
//                  <TaskList onCategorySelect={setParams} dateRange={params} activeId={id} />
//                  <FloatingActionButton options={fabOptions} />
//             </div>
//         );
//     }

//     return (
//         <div className="grid grid-cols-[400px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
//             {/* Master Panel (Left) */}
//             <div className="bg-background rounded-lg border p-4 flex flex-col">
//                 <TaskList
//                     onCategorySelect={setParams} // Pass the setter function
//                     activeId={id}                  // Pass the active ID for styling
//                     dateRange={params}             // Pass the current date range
//                 />
//                 <div className="mt-4 pt-4 border-t">
//                     <button onClick={openNewTaskDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors">
//                         <Plus size={20} /> Add New Task
//                     </button>
//                 </div>
//             </div>

//             {/* Detail Panel (Right) */}
//             <div className="overflow-y-auto -mr-4 pr-4">
//                {renderDetailPanel()}
//             </div>
//         </div>
//     );
// };



import { useViewport } from "@/hooks/useViewPort";
import { TaskList } from "./TaskList";
import { Task } from "./Task";
import { format, subDays } from "date-fns";
import { useStatesSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import {TasksVariantPage} from "./TasksVariantPage"
import { useTaskData } from "@/hooks/useTaskData";
import { useMemo, useState,useEffect } from "react";
import {TaskDestopThree} from "./TaskDestopThree"



const DesktopPlaceholder = () => (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-secondary">
        <span className="text-muted-foreground">Please select a Task from the list</span>
    </div>
);

export const Tasks = () => {
    const { isMobile } = useViewport();
   const [params, setParams] = useStatesSyncedWithParams([
           { key: 'id', defaultValue: '' }, // Default to no selection
           { key: 'from', defaultValue: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
           { key: 'to', defaultValue: format(new Date(), 'yyyy-MM-dd') },
       ]);
       const { id, from, to } = params;
       console.log("params",params)
    const { openNewTaskDialog } = useDialogStore();

  const { isLoading, error, todayTasks, tomorrowTasks, createdTodayTasks } = useTaskData();
     // --- THE FIX IS HERE ---
    // 2. Create a memoized map that links the ID to its title and data.
    const dailyTaskDetails = useMemo(() => ({
        todays: {
            title: "Today's Tasks",
            tasks: todayTasks || [] // Use || [] as a safeguard
        },
        tomorrow: {
            title: "Tomorrow's Tasks",
            tasks: tomorrowTasks || []
        },
        createdtoday: { // Ensure this key matches the one set in TaskList's onClick
            title: "Tasks Created Today",
            tasks: createdTodayTasks || []
        }
    }), [todayTasks, tomorrowTasks, createdTodayTasks]); // Dependencies


    if (isMobile) {
        const fabOptions = [{ label: 'Add New Task', action: openNewTaskDialog }];

        
        return (
            <div className="space-y-4">
                 {/* <h1 className="text-2xl font-bold text-center">Taskss</h1> */}
                 <TaskList onTaskSelect={setParams}/>
              
                 <FloatingActionButton options={fabOptions} />
            </div>
        );
    }
const renderDetailPanel = () => {
        if (!id) {
            return <DesktopPlaceholder />;
        }
        
        // Check for category-based IDs first
        const lowercasedId = id.toLowerCase();

          // 3. Look up the details for the current ID in our map.
        const detailInfo = dailyTaskDetails[lowercasedId];

        // If a match is found, render the component with the correct title and tasks.
        if (detailInfo) {
            return <TaskDestopThree title={detailInfo.title} tasks={detailInfo.tasks} />;
        }


        if (lowercasedId === 'all' || lowercasedId === 'pending' || lowercasedId === 'upcoming') {
            // Note: The mobile view navigates to '/tasks/upcoming' but the category is 'Scheduled'.
            // We handle this by using a consistent 'variant' prop.
            const variant = lowercasedId === 'upcoming' ? 'upcoming' : lowercasedId;
            return <TasksVariantPage variant={variant}  from={from} to ={to}/>;
        }
       
        
        // If it's not a category, assume it's a specific task ID
        return <Task />;
    };

    return (
        <div className="grid grid-cols-[400px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
            {/* Master Panel (Left) */}
            <div className="bg-background rounded-lg border p-4 flex flex-col">
                {/* <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Tasks</h2>
                </div> */}
                <TaskList
                    onTaskSelect={setParams}
                    activeTaskId={id}
                />
                <div className="mt-4 pt-4 border-t">
                    <button onClick={openNewTaskDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors">
                        <Plus size={20} /> Add New Task
                    </button>
                </div>
            </div>

            {/* Detail Panel (Right) */}
            <div className="overflow-y-auto -mr-4 pr-4">
               {renderDetailPanel()}
            </div>
        </div>
    );
};

