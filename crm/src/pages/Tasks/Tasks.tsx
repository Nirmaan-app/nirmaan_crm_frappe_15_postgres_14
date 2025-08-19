
// src/pages/Tasks/Tasks.tsx

import { useViewport } from "@/hooks/useViewPort";
import { TaskList } from "./TaskList";
import { Task } from "./Task";

import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import {TasksVariantPage} from "./TasksVariantPage"
const DesktopPlaceholder = () => (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-secondary">
        <span className="text-muted-foreground">Please select a Task from the list</span>
    </div>
);

export const Tasks = () => {
    const { isMobile } = useViewport();
    const [id, setId] = useStateSyncedWithParams<string>("id", "");
    const { openNewTaskDialog } = useDialogStore();

console.log(id)

    if (isMobile) {
        const fabOptions = [{ label: 'Add New Task', action: openNewTaskDialog }];
        return (
            <div className="space-y-4">
                 <h1 className="text-2xl font-bold text-center">Taskss</h1>
                 <TaskList />
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
        if (lowercasedId === 'all' || lowercasedId === 'pending' || lowercasedId === 'upcoming') {
            // Note: The mobile view navigates to '/tasks/upcoming' but the category is 'Scheduled'.
            // We handle this by using a consistent 'variant' prop.
            const variant = lowercasedId === 'upcoming' ? 'upcoming' : lowercasedId;
            return <TasksVariantPage variant={variant} />;
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
                    onTaskSelect={setId}
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


// // src/pages/Tasks/Tasks.tsx
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button";
// import { useDialogStore } from "@/store/dialogStore";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";

// // A reusable type for tasks that include contact/company names
// export type EnrichedCRMTask = CRMTask & {
//     contact_name?: string;
//     company_name?: string;
// };

// const TaskDashboardRow = ({ task, context }: { task: EnrichedCRMTask, context: 'today' | 'tomorrow' | 'createdToday' }) => {
//     const { openEditTaskDialog } = useDialogStore();
//     const navigate = useNavigate();

//     // Determine button label and action based on the context
//     let buttonLabel = "Update";
//     let buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'updateStatus' });

//     if (context === 'tomorrow') {
//         buttonLabel = "Go To Task";
//         buttonAction = () => navigate(`/tasks/task?id=${task.name}`);
//     } else if (context === 'createdToday') {
//         buttonLabel = "Edit Task";
//         buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'edit' });
//     }
//     // For 'today', the default action is 'Update', so no 'if' statement is needed.

//     return (
//         <div className="flex items-center justify-between py-3 px-2 border-b last:border-b-0">
//             <div className="flex flex-col cursor-pointer" onClick={() => navigate(`/tasks/task?id=${task.name}`)}>
//                 <span className="font-medium">{task.type} {task.first_name} from {task.company}</span>
//                 <span className="text-sm text-muted-foreground">at {formatTime12Hour(task.time)}</span>
//             </div>
//             <Button variant="outline" size="sm" onClick={buttonAction}>
//                 {buttonLabel}
//             </Button>
//         </div>
//     );
// };

// export const Tasks = () => {
//     const navigate = useNavigate();
    
//     // Fetch all tasks and enrich them with linked document names
//     // This is an efficient way to get related data in one call.
//     const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
//         fields: ["name", "type", "start_date", "time", "status", "contact", "company", "boq", "contact.first_name", "contact.last_name", "company.company_name","creation"],
//         limit: 1000,
//         orderBy: { field: "start_date", order: "asc" }
//     });

//     // Memoize the categorized tasks to prevent recalculation on every render
//     const { allTasks, pendingTasks, scheduledTasks, todayTasks, tomorrowTasks,createdTodayTasks } = useMemo(() => {
//         const today = new Date().toISOString().slice(0, 10);
//         const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
       
//         const enriched = tasksData?.map(task => ({
//             ...task,
//             contact_name: `${task["contact.first_name"] || ''} ${task["contact.last_name"] || ''}`.trim(),
//             company_name: task["company.company_name"] || 'N/A'
//         })) || [];

//         return {
//             allTasks: enriched,
//             pendingTasks: enriched.filter(t => t.status !== 'Completed'),
//             scheduledTasks: enriched.filter(t => t.status === 'Scheduled' && t.start_date.slice(0, 10) >= today),
//             todayTasks: enriched.filter(t => t.start_date.slice(0, 10) === today),
//             tomorrowTasks: enriched.filter(t => t.start_date.slice(0, 10) === tomorrow),
//             createdTodayTasks: enriched.filter(t => t.creation.slice(0, 10) === today),
//         };
//     }, [tasksData]);

//     if (isLoading) return <div>Loading tasks...</div>;

//     return (
//         <div className="space-y-4">
//             {/* Header cards */}
//             <div className="grid grid-cols-3 gap-3">
//                 <div onClick={() => navigate('/tasks/all')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
//                     <p className="text-2xl font-bold">{allTasks.length}</p>
//                     <p className="text-sm">All</p>
//                 </div>
//                 <div onClick={() => navigate('/tasks/pending')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
//                     <p className="text-2xl font-bold">{pendingTasks.length}</p>
//                     <p className="text-sm">Pending</p>
//                 </div>
//                 <div onClick={() => navigate('/tasks/upcoming')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
//                     <p className="text-2xl font-bold">{scheduledTasks.length}</p>
//                     <p className="text-sm">Scheduled</p>
//                 </div>
//             </div>

//             {/* Accordion for task lists */}
//             <Accordion type="multiple" defaultValue={["today"]} className="w-full space-y-4">
//                 <div className="bg-background rounded-lg border">
//                     <AccordionItem value="today" className="border-b-0">
//                         <AccordionTrigger className="px-4">Today's Tasks - {todayTasks.length} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                             {todayTasks.length > 0 
//                                 ? todayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="today"/>)
//                                 : <p className="text-center text-sm text-muted-foreground py-4">No tasks for today.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div>
//                 <div className="bg-background rounded-lg border">
//                     <AccordionItem value="tomorrow" className="border-b-0">
//                         <AccordionTrigger className="px-4">Tomorrow - {tomorrowTasks.length} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                             {tomorrowTasks.length > 0
//                                 ? tomorrowTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="tomorrow" />)
//                                 : <p className="text-center text-sm text-muted-foreground py-4">No tasks for tomorrow.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div>
//                  {/* *** NEWLY ADDED ACCORDION ITEM *** */}
//                 <div className="bg-background rounded-lg border">
//                     <AccordionItem value="createdToday" className="border-b-0">
//                         <AccordionTrigger className="px-4">Tasks created today - {createdTodayTasks.length} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                             {createdTodayTasks.length > 0
//                                 ? createdTodayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="createdToday" />)
//                                 : <p className="text-center text-sm text-muted-foreground py-4 px-4">No tasks were created today.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div>
            
                
//             </Accordion>
            
//         </div>
//     );
// };
