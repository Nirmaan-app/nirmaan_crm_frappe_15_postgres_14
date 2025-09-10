


// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Button } from "@/components/ui/button";
// import { useDialogStore } from "@/store/dialogStore";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FilterControls } from "@/components/ui/FilterControls";
// import { format, subDays, addDays } from "date-fns";
// import { useViewport } from "@/hooks/useViewPort";
// import { useTaskData } from "@/hooks/useTaskData"
// import { Separator } from "@/components/ui/separator";
// import { ChevronRight, Search } from "lucide-react";
// import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { AssignmentFilterControls } from "@/components/ui/AssignmentFilterControls";
// import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon';
// import { StatusPill } from "./TasksVariantPage";
// import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";

// // A reusable type for tasks that include contact/company names
// type EnrichedTask = CRMTask & {
//     "contact.first_name"?: string;
//     "contact.last_name"?: string;
//     "company.company_name"?: string;
//     contact_name?: string;
//     company_name?: string;
// };

// interface TaskListProps {
//     onTaskSelect?: (params: { id: string }) => void; // Updated signature for clarity
//     activeTaskId?: string | null;

// }


// // --- 1. CREATE THE NEW REUSABLE GROUPING COMPONENT ---
// const TaskStatusGroup = ({ title, tasks, context, onTaskSelect }) => {
//     // Don't render the group if there are no tasks for it
//     if (!tasks || tasks.length === 0) {
//         return null;
//     }

//     return (
//         <div className="pt-2">
//             {/* Group Header */}
//             <h4 className="px-4 pb-1 text-xs font-bold uppercase text-muted-foreground tracking-wider">
//                 {title} ({tasks.length})
//             </h4>
//             {/* List of Tasks in this group */}
//             {tasks.map(task => (
//                 <TaskDashboardRow key={task.name} task={task} context={context} onTaskSelect={onTaskSelect} />
//             ))}
//         </div>
//     );
// };


// // Define the shape of the data this component expects
// interface TaskGroup {
//     pending: CRMTask[];
//     incomplete: CRMTask[];
//     scheduled: CRMTask[];
// }

// interface DesktopTaskDetailViewProps {
//     title: string;
//     taskGroup: TaskGroup;
//     context: 'today' | 'tomorrow' | 'createdToday';
// }

// export const DesktopTaskDetailView = ({ title, taskGroup, context }: DesktopTaskDetailViewProps) => {

//     const totalTasks = (taskGroup?.completed?.length || 0) + 
//                        (taskGroup?.incomplete?.length || 0) + 
//                        (taskGroup?.scheduled?.length || 0);

//     return (
//         <div className="bg-background rounded-lg border p-4 h-full flex flex-col">
//             <h2 className="text-lg font-semibold mb-4">{title} - {totalTasks} Tasks</h2>

//             {/* Scrollable content area */}
//             <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
//                 {totalTasks > 0 ? (
//                     <>
//                         {/* Render the groups in the desired priority order */}
//                         <TaskStatusGroup title="Pending" tasks={taskGroup.scheduled} context={context} onTaskSelect={() => {}} />

//                         <TaskStatusGroup title="Completed" tasks={taskGroup.completed} context={context} onTaskSelect={() => {}} />
//                         <TaskStatusGroup title="Incomplete" tasks={taskGroup.incomplete} context={context} onTaskSelect={() => {}} />
//                     </>
//                 ) : (
//                     <div className="flex h-full items-center justify-center">
//                         <p className="text-muted-foreground">No tasks in this category.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };


// // A new, local component for the desktop view's clickable rows
// const DesktopTaskCategoryRow = ({ title, count, onClick, isActive }) => (
//     <div
//         onClick={onClick}
//         className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-muted' : 'hover:bg-muted/50'
//             }`}
//     >
//         <span className="font-medium text-sm">
//             {/* Conditionally render the count, as "Tasks Created Today" doesn't have one */}
//             {title} {count !== undefined && `- ${count} Tasks`}
//         </span>
//         <ChevronRight className="h-4 w-4 text-muted-foreground" />
//     </div>
// );


// export const TaskDashboardRow = ({ task, context, onTaskSelect }: { task: EnrichedCRMTask, context: 'today' | 'tomorrow' | 'createdToday', onTaskSelect?: (id: string) => void }) => {
//     const { openEditTaskDialog } = useDialogStore();
//     const navigate = useNavigate();
//     const { isMobile } = useViewport();
//     // Determine button label and action based on the context
//     let buttonLabel = "Update";
//     let buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'updateStatus' });

//     if (context === 'tomorrow') {
//         buttonLabel = "Go To Task";
//         buttonAction = () => isMobile ? navigate(`/tasks/task?id=${task.name}`) : onTaskSelect({ id: task.name });
//     } else if (context === 'createdtoday') {
//         buttonLabel = "Edit Task";
//         buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'edit' });
//     }

//     // // For 'today', the default action is 'Update', so no 'if' statement is needed.
//     // --- NEW RESPONSIVE CLICK HANDLER ---
//     // const handleSelect = (task_id) => {
//     //     if (!isMobile) {
//     //         // If the onTaskSelect function is provided (desktop mode), use it.
//     //         onTaskSelect(task.name);
//     //     } else {
//     //         // Otherwise (mobile mode), navigate.
//     //         navigate(`/task?id=${task_id}`);
//     //     }
//     // };

//     return (
//         <div className="px-4"> {/* Add slight horizontal padding for better spacing */}
//             <div className="flex items-center justify-between py-3">
//                 <span>
//                     <div className="flex">
//                         <TaskStatusIcon status={task.status} className="mr-1 flex-shrink-0" />
//                         <div>
//                             {task?.type} with {task?.first_name}{" "} from {task?.company_name} {" "}
//                             <p className="text-xs inline-block text-muted-foreground p-0 m-0">
//                                 {context === "createdtoday" && (`on ${formatCasualDate(task.start_date)} `)}
//                                 {/* {formatCasualDate(task.start_date)}   */}

//                                 {formatTime12Hour(task.time)}
//                             </p>
//                         </div>
//                     </div>
//                 </span>
//                 <Button variant="outline" size="sm" onClick={buttonAction}>
//                     {buttonLabel}
//                 </Button>
//             </div>
//             <Separator className="last:hidden" />
//         </div>
//         // <div className="flex items-center justify-between py-3 px-2 border-b last:border-b-0">
//         //     <div className="flex flex-col cursor-pointer">
//         //         {/* <div className="flex flex-col cursor-pointer" onClick={() => handleSelect(task.name)}> */}
//         //         <span className="font-medium">{task.type} {task.first_name} from {task.company}</span>
//         //         <span className="text-sm text-muted-foreground">at {formatTime12Hour(task.time)} {context==="createdtoday"&&(`on ${task.start_date}`) }</span>


//         //     </div>
//         //     <Button variant="outline" size="sm" onClick={buttonAction}>
//         //         {buttonLabel}
//         //     </Button>
//         // </div>
//     );
// };


// export const TaskList = ({ onTaskSelect, activeTaskId }: TaskListProps) => {
//     const navigate = useNavigate();
//     const { isMobile } = useViewport();
//     // const { role, isLoading: isUserLoading } = useCurrentUser();
//     const role = localStorage.getItem("role")
//     const user_id = localStorage.getItem("userId")
//     // const [id, setId] = useStateSyncedWithParams<string>("id", "");
//     const [assignmentFilters, setAssignmentFilters] = useState([]);

//     const [dateRange, setDateRange] = useState({ from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });



//     const {
//         isLoading,
//         error,
//         todayTasks,
//         tomorrowTasks,
//         createdTodayTasks
//     } = useTaskData(assignmentFilters);
//         // A helper to calculate total tasks for a group

//     const getTaskCount = (taskGroup: TaskGroup) => 
//         taskGroup?.completed?.length + taskGroup?.incomplete?.length + taskGroup?.scheduled?.length;



// console.log("today Three Group",todayTasks)
// console.log("tomorrowTasksThree Group",tomorrowTasks)

// console.log("tomorrowTasks Three Group",createdTodayTasks)

//     // const allFilters = useMemo(() => {
//     //     // REMOVED: No default filters for Sales User. Backend handles it.
//     //     const dateFilters = [['start_date', 'between', [dateRange.from, dateRange.to]]];
//     //     console.log("assignmentFilters",assignmentFilters)
//     //     // console.log([...dateFilters, ...assignmentFilters])
//     //     return [...dateFilters, ...assignmentFilters||[]];
//     // }, [dateRange, assignmentFilters]);

//     const allFilters = useMemo(() => {
//         // Always start with the base date filters.
//         const baseFilters = [
//             ['start_date', 'between', [dateRange.from, dateRange.to]]
//         ];

//         // Check if the assignmentFilters array has any actual filters in it.
//         // The .length > 0 check is crucial here.
//         console.log("assignmentFilters", assignmentFilters)
//         if (assignmentFilters && assignmentFilters.length > 0) {
//             // If there are assignment filters, combine them with the base filters.
//             return [...baseFilters, ...assignmentFilters];
//         }

//         // If assignmentFilters is empty, return ONLY the base filters.
//         return baseFilters;

//     }, [dateRange, assignmentFilters]);


//     console.log("allFilters", allFilters)
//     const swrkey = `all-tasks-${allFilters}`

//     const { data: tasks, taskisLoading } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
//         fields: ["name", "type", "start_date", "time", "status", "contact", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation", "assigned_sales"],
//         filters: allFilters,
//         limit: 0,
//         orderBy: { field: "creation", order: "asc" }
//     }, swrkey);

//     // console.log("TTASKS", tasks)

//     const { allTasks, pendingTasks, scheduledTasks } = useMemo(() => {
//         const today = new Date().toISOString().slice(0, 10);
//         const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

//         const enriched = tasks?.map(task => ({
//             ...task,
//             contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim(),
//             company_name: task.company_name || 'N/A'
//         })) || [];


//         return {
//             allTasks: enriched,
//             pendingTasks: enriched.filter(t => t.status !== 'Completed'),
//             scheduledTasks: enriched.filter(t => t.status === 'Completed'),
//             //      todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) == today),
//             // tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) == tomorrow),
//             // createdTodayTasks: enriched.filter(t => t.creation?.slice(0, 10) == today),
//         };
//     }, [tasks, assignmentFilters]);


//     console.log(dateRange.from, dateRange.to)

//     useEffect(() => {
//         onTaskSelect({ from: dateRange.from, to: dateRange.to });
//     }, [dateRange])

//     // if (taskisLoading) { return <div className="text-center p-4">Loading Tasks...</div>; }

//     // console.log("ALL DATA", allTasks, pendingTasks, scheduledTasks)


//     // const handleTaskClick = (path: string) => {
//     //     if (isMobile) {
//     //         //  navigate(`/tasks/${path}`)
//     //         navigate(`/tasks/${path}?from=${dateRange.from}&to=${dateRange.to}`);

//     //     } else {
//     //         onTaskSelect({ id: path, from: dateRange.from, to: dateRange.to });
//     //     }
//     // }
//     const handleTaskClick = (path: 'all' | 'pending' | 'completed') => {
//         // 1. Start with the base query parameters (date range)
//         const params = new URLSearchParams({
//             from: dateRange.from,
//             to: dateRange.to,
//         });

//         // 2. Check if there are active assignment filters
//         // The filter structure is [['assigned_sales', 'in', ['user1@email.com', 'user2@email.com']]]
//         if (assignmentFilters && assignmentFilters.length > 0) {
//             // Extract the user emails/IDs from the filter
//             const assignedUsers = assignmentFilters[0][2]; // This gets the array ['user1@email.com', ...]

//             // 3. Add the users to the query string.
//             // We'll join them into a comma-separated string, which is a common and clean way to pass arrays.
//             if (assignedUsers && assignedUsers.length > 0) {
//                 params.set('assigned_to', assignedUsers?.join(','));
//             }
//         }

//         const queryString = params.toString();

//         if (isMobile) {
//             navigate(`/tasks/${path}?${queryString}`);
//         } else {
//             // For desktop, we also need to pass the query string along.
//             onTaskSelect({ id: path, from: dateRange.from, to: dateRange.to, assigned_to: params.get('assigned_to') });
//         }
//     };


//     return (
//         <div className="space-y-4">
//             <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange} />
//             {/* MODIFIED: Conditionally render ONLY for Admin */}
//             {role === 'Nirmaan Admin User Profile' && (
//                 <div className="mt-4">
//                     <AssignmentFilterControls onFilterChange={setAssignmentFilters} filterType="task" />
//                 </div>
//             )}
//             {/* Header cards */}
//             <div className="grid grid-cols-3 gap-3">
//                 <div onClick={() => handleTaskClick('all')}
//                     className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${activeTaskId === 'all'
//                         ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
//                         : 'bg-destructive text-white' // Default state
//                         }`}
//                 >
//                     <p className="text-2xl font-bold">{allTasks.length}</p>
//                     <p className="text-sm">All</p>
//                 </div>
//                 <div onClick={() => handleTaskClick('pending')} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${activeTaskId === 'pending'
//                     ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
//                     : 'bg-destructive text-white' // Default state
//                     }`}
//                 >
//                     <p className="text-2xl font-bold">{pendingTasks.length}</p>
//                     <p className="text-sm">Pending</p>
//                 </div>
//                 <div onClick={() => handleTaskClick('completed')} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${activeTaskId === 'completed'
//                     ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
//                     : 'bg-destructive text-white' // Default state
//                     }`}
//                 >
//                     <p className="text-2xl font-bold">{scheduledTasks.length}</p>
//                     <p className="text-sm">Completed</p>
//                 </div>
//             </div>

//             {isMobile ? (<Accordion type="multiple" defaultValue={["today"]} className="w-full space-y-4">

//                 {/* <div className="bg-background rounded-lg border">
//                     <AccordionItem value="today" className="border-b-0">
//                         <AccordionTrigger className="px-4">Today's Tasks - {todayTasks.length} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                             {todayTasks.length > 0
//                                 ? todayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="today" onTaskSelect={onTaskSelect} />)
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
//                                 ? tomorrowTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="tomorrow" onTaskSelect={onTaskSelect} />)
//                                 : <p className="text-center text-sm text-muted-foreground py-4">No tasks for tomorrow.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div>

//                 <div className="bg-background rounded-lg border">
//                     <AccordionItem value="createdToday" className="border-b-0">
//                         <AccordionTrigger className="px-4">Tasks created today - {createdTodayTasks.length} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                             {createdTodayTasks.length > 0
//                                 ? createdTodayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="createdtoday" onTaskSelect={onTaskSelect} />)
//                                 : <p className="text-center text-sm text-muted-foreground py-4 px-4">No tasks were created today.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div> */}

// <div className="bg-background rounded-lg border">
//                     <AccordionItem value="today" className="border-b-0">
//                         <AccordionTrigger className="px-4">Today's Tasks - {getTaskCount(todayTasks)} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                             {getTaskCount(todayTasks) > 0 ? (
//                                 <>
//                                     <TaskStatusGroup title="Pending" tasks={todayTasks.scheduled} context="today" onTaskSelect={onTaskSelect} />

//                                     <TaskStatusGroup title="Completed" tasks={todayTasks.completed} context="today" onTaskSelect={onTaskSelect} />
//                                     <TaskStatusGroup title="Incomplete" tasks={todayTasks.incomplete} context="today" onTaskSelect={onTaskSelect} />
//                                 </>
//                             ) : <p className="text-center text-sm text-muted-foreground py-4">No tasks for today.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div>
//                 <div className="bg-background rounded-lg border">
//                     <AccordionItem value="tomorrow" className="border-b-0">
//                         <AccordionTrigger className="px-4">Tomorrow - {getTaskCount(tomorrowTasks)} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                              {getTaskCount(tomorrowTasks) > 0 ? (
//                                 <>
//                                     <TaskStatusGroup title="Pending" tasks={tomorrowTasks.scheduled} context="tomorrow" onTaskSelect={onTaskSelect} />

//                                     <TaskStatusGroup title="Completed" tasks={tomorrowTasks.completed} context="tomorrow" onTaskSelect={onTaskSelect} />
//                                     <TaskStatusGroup title="Incomplete" tasks={tomorrowTasks.incomplete} context="tomorrow" onTaskSelect={onTaskSelect} />
//                                 </>
//                             ) : <p className="text-center text-sm text-muted-foreground py-4">No tasks for tomorrow.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div>
//                 <div className="bg-background rounded-lg border">
//                     <AccordionItem value="createdToday" className="border-b-0">
//                         <AccordionTrigger className="px-4">Tasks created today - {getTaskCount(createdTodayTasks)} Tasks</AccordionTrigger>
//                         <AccordionContent>
//                             {getTaskCount(createdTodayTasks) > 0 ? (
//                                 <>
//                                     <TaskStatusGroup title="Pending" tasks={createdTodayTasks.scheduled} context="createdtoday" onTaskSelect={onTaskSelect} />

//                                     <TaskStatusGroup title="Completed" tasks={createdTodayTasks.completed} context="createdtoday" onTaskSelect={onTaskSelect} />
//                                     <TaskStatusGroup title="Incomplete" tasks={createdTodayTasks.incomplete} context="createdtoday" onTaskSelect={onTaskSelect} />
//                                 </>
//                             ) : <p className="text-center text-sm text-muted-foreground py-4 px-4">No tasks were created today.</p>
//                             }
//                         </AccordionContent>
//                     </AccordionItem>
//                 </div>

//             </Accordion>
//         ) : 

//         (
//                 // --- CHANGE 3: UPDATE the Desktop view's onClick handlers ---
//                 <div className="space-y-2 pt-4">
//                     <DesktopTaskCategoryRow
//                         title="Today"
//                         count={getTaskCount(todayTasks)}
//                         isActive={activeTaskId === 'today'}
//                         onClick={() => onTaskSelect({ 
//                             id: 'today', 
//                             title: "Today's Tasks", 
//                             data: todayTasks, 
//                             context: 'today' 
//                         })}
//                     />
//                     <DesktopTaskCategoryRow
//                         title="Tomorrow"
//                         count={getTaskCount(tomorrowTasks)}
//                         isActive={activeTaskId === 'tomorrow'}
//                         onClick={() => onTaskSelect({ 
//                             id: 'tomorrow', 
//                             title: 'Tomorrow\'s Tasks', 
//                             data: tomorrowTasks, 
//                             context: 'tomorrow' 
//                         })}
//                     />
//                     <DesktopTaskCategoryRow
//                         title="Tasks Created Today"
//                         count={getTaskCount(createdTodayTasks)}
//                         isActive={activeTaskId === 'createdToday'}
//                         onClick={() => onTaskSelect({ 
//                             id: 'createdToday', 
//                             title: 'Tasks Created Today', 
//                             data: createdTodayTasks, 
//                             context: 'createdToday' 
//                         })}
//                     />
//                 </div>
//             )
//         }


//         </div>

//     )



// };







import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FilterControls } from "@/components/ui/FilterControls";
import { format, subDays, addDays } from "date-fns";
import { useViewport } from "@/hooks/useViewPort";
import { useTaskData } from "@/hooks/useTaskData"
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Search } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AssignmentFilterControls } from "@/components/ui/AssignmentFilterControls";
import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon';
import { StatusPill } from "./TasksVariantPage";
import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";

// A reusable type for tasks that include contact/company names
type EnrichedTask = CRMTask & {
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
    contact_name?: string;
    company_name?: string;
};

interface TaskListProps {
    onTaskSelect?: (params: { id: string }) => void; // Updated signature for clarity
    activeTaskId?: string | null;

}

// A new, local component for the desktop view's clickable rows
const DesktopTaskCategoryRow = ({ title, count, onClick, isActive }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-muted' : 'hover:bg-muted/50'
            }`}
    >
        <span className="font-medium text-sm">
            {/* Conditionally render the count, as "Tasks Created Today" doesn't have one */}
            {title} {count !== undefined && `- ${count} Tasks`}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
);


export const TaskDashboardRow = ({ task, context, onTaskSelect }: { task: EnrichedCRMTask, context: 'today' | 'tomorrow' | 'createdToday'|'upcoming7Days', onTaskSelect?: (id: string) => void }) => {
    const { openEditTaskDialog } = useDialogStore();
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    // Determine button label and action based on the context
    let buttonLabel = "Update";
    let buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'updateStatus' });
 console.log("upcoming7Days",context)
    if (context === 'tomorrow') {
        buttonLabel = "Go To Task";
        buttonAction = () => isMobile ? navigate(`/tasks/task?id=${task.name}`) :navigate(`/tasks?id=${task.name}`) 
    } else if (context === 'createdtoday') {
        buttonLabel = "Edit Task";
        buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'edit' });
    }else if (context === 'upcoming7Days') { // NEW: Upcoming 7 Days context
        buttonLabel = "Go To Task";
        buttonAction = () => isMobile ? navigate(`/tasks/task?id=${task.name}`) :navigate(`/tasks?id=${task.name}`) 
    }

    if(task.status==="Completed"||task.status==="Incomplete"){
        buttonLabel = "Go To Task";
        buttonAction = () => isMobile ? navigate(`/tasks/task?id=${task.name}`) :navigate(`/tasks?id=${task.name}`) 
    }

    // // For 'today', the default action is 'Update', so no 'if' statement is needed.
    // --- NEW RESPONSIVE CLICK HANDLER ---
    // const handleSelect = (task_id) => {
    //     if (!isMobile) {
    //         // If the onTaskSelect function is provided (desktop mode), use it.
    //         onTaskSelect(task.name);
    //     } else {
    //         // Otherwise (mobile mode), navigate.
    //         navigate(`/task?id=${task_id}`);
    //     }
    // };

    return (
        <div className="px-4"> {/* Add slight horizontal padding for better spacing */}
            <div className="flex items-center justify-between py-3">
                <span>
                    <div className="flex">
                        <TaskStatusIcon status={task.status} className="mr-1 flex-shrink-0" />
                        <div>
                            {task?.type} with {task?.first_name}{" "} from {task?.company_name} {" "}
                            <p className="text-xs inline-block text-muted-foreground p-0 m-0">
                                {(context === "createdtoday"||context === 'upcoming7Days') && (`on ${formatCasualDate(task.start_date)} `)}
                                {/* {formatCasualDate(task.start_date)}   */}

                                {formatTime12Hour(task.time)}
                            </p>
                        </div>
                    </div>
                </span>
                <Button variant="outline" size="sm" onClick={buttonAction}>
                    {buttonLabel}
                </Button>
            </div>
            <Separator className="last:hidden" />
        </div>
        // <div className="flex items-center justify-between py-3 px-2 border-b last:border-b-0">
        //     <div className="flex flex-col cursor-pointer">
        //         {/* <div className="flex flex-col cursor-pointer" onClick={() => handleSelect(task.name)}> */}
        //         <span className="font-medium">{task.type} {task.first_name} from {task.company}</span>
        //         <span className="text-sm text-muted-foreground">at {formatTime12Hour(task.time)} {context==="createdtoday"&&(`on ${task.start_date}`) }</span>


        //     </div>
        //     <Button variant="outline" size="sm" onClick={buttonAction}>
        //         {buttonLabel}
        //     </Button>
        // </div>
    );
};


export const TaskList = ({ onTaskSelect, activeTaskId }: TaskListProps) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    // const { role, isLoading: isUserLoading } = useCurrentUser();
    const role = localStorage.getItem("role")
    const user_id = localStorage.getItem("userId")
    // const [id, setId] = useStateSyncedWithParams<string>("id", "");
    const [assignmentFilters, setAssignmentFilters] = useState([]);

    const [dateRange, setDateRange] = useState({ from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });



    const {
        isLoading,
        error,
        todayTasks,
        tomorrowTasks,
        createdTodayTasks,
        upcoming7DaysTasks
    } = useTaskData(assignmentFilters);


    console.log(upcoming7DaysTasks)

    // const allFilters = useMemo(() => {
    //     // REMOVED: No default filters for Sales User. Backend handles it.
    //     const dateFilters = [['start_date', 'between', [dateRange.from, dateRange.to]]];
    //     console.log("assignmentFilters",assignmentFilters)
    //     // console.log([...dateFilters, ...assignmentFilters])
    //     return [...dateFilters, ...assignmentFilters||[]];
    // }, [dateRange, assignmentFilters]);

    const allFilters = useMemo(() => {
        // Always start with the base date filters.
        const baseFilters = [
            ['start_date', 'between', [dateRange.from, dateRange.to]]
        ];

        // Check if the assignmentFilters array has any actual filters in it.
        // The .length > 0 check is crucial here.
        // console.log("assignmentFilters", assignmentFilters)
        if (assignmentFilters && assignmentFilters.length > 0) {
            // If there are assignment filters, combine them with the base filters.
            return [...baseFilters, ...assignmentFilters];
        }

        // If assignmentFilters is empty, return ONLY the base filters.
        return baseFilters;

    }, [dateRange, assignmentFilters]);


    // console.log("allFilters", allFilters)
    const swrkey = `all-tasks-${allFilters}`

    const { data: tasks, taskisLoading } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
        fields: ["name", "type", "start_date", "time", "status", "contact", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation", "assigned_sales"],
        filters: allFilters,
        limit: 0,
        orderBy: { field: "creation", order: "asc" }
    }, swrkey);

    // console.log("TTASKS", tasks)

    const { allTasks, pendingTasks, scheduledTasks } = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

        const enriched = tasks?.map(task => ({
            ...task,
            contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim(),
            company_name: task.company_name || 'N/A'
        })) || [];


        return {
            allTasks: enriched,
            pendingTasks: enriched.filter(t => t.status === 'Scheduled'),
            scheduledTasks: enriched.filter(t => t.status === 'Completed'),
            //      todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) == today),
            // tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) == tomorrow),
            // createdTodayTasks: enriched.filter(t => t.creation?.slice(0, 10) == today),
        };
    }, [tasks, assignmentFilters]);


    // console.log(dateRange.from, dateRange.to)

    useEffect(() => {
        onTaskSelect({ from: dateRange.from, to: dateRange.to });
    }, [dateRange])

    // if (taskisLoading) { return <div className="text-center p-4">Loading Tasks...</div>; }

    // console.log("ALL DATA", allTasks, pendingTasks, scheduledTasks)


    // const handleTaskClick = (path: string) => {
    //     if (isMobile) {
    //         //  navigate(`/tasks/${path}`)
    //         navigate(`/tasks/${path}?from=${dateRange.from}&to=${dateRange.to}`);

    //     } else {
    //         onTaskSelect({ id: path, from: dateRange.from, to: dateRange.to });
    //     }
    // }
    const handleTaskClick = (path: 'all' | 'pending' | 'completed') => {
        // 1. Start with the base query parameters (date range)
        const params = new URLSearchParams({
            from: dateRange.from,
            to: dateRange.to,
        });

        // 2. Check if there are active assignment filters
        // The filter structure is [['assigned_sales', 'in', ['user1@email.com', 'user2@email.com']]]
        if (assignmentFilters && assignmentFilters.length > 0) {
            // Extract the user emails/IDs from the filter
            const assignedUsers = assignmentFilters[0][2]; // This gets the array ['user1@email.com', ...]

            // 3. Add the users to the query string.
            // We'll join them into a comma-separated string, which is a common and clean way to pass arrays.
            if (assignedUsers && assignedUsers.length > 0) {
                params.set('assigned_to', assignedUsers?.join(','));
            }
        }

        const queryString = params.toString();

        if (isMobile) {
            navigate(`/tasks/${path}?${queryString}`);
        } else {
            // For desktop, we also need to pass the query string along.
            onTaskSelect({ id: path, from: dateRange.from, to: dateRange.to, assigned_to: params.get('assigned_to') });
        }
    };


    return (
        <div className="space-y-4 mb-20">
            <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange} />
            {/* MODIFIED: Conditionally render ONLY for Admin */}
            {role === 'Nirmaan Admin User Profile' && (
                <div className="mt-4">
                    <AssignmentFilterControls onFilterChange={setAssignmentFilters} filterType="task" />
                </div>
            )}
            {/* Header cards */}
            <div className="grid grid-cols-3 gap-3">
                <div onClick={() => handleTaskClick('all')}
                    className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${activeTaskId === 'all'
                        ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
                        : 'bg-destructive text-white' // Default state
                        }`}
                >
                    <p className="text-2xl font-bold">{allTasks.length}</p>
                    <p className="text-sm">All</p>
                </div>
                <div onClick={() => handleTaskClick('pending')} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${activeTaskId === 'pending'
                    ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
                    : 'bg-destructive text-white' // Default state
                    }`}
                >
                    <p className="text-2xl font-bold">{pendingTasks.length}</p>
                    <p className="text-sm">Pending</p>
                </div>
                <div onClick={() => handleTaskClick('completed')} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${activeTaskId === 'completed'
                    ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
                    : 'bg-destructive text-white' // Default state
                    }`}
                >
                    <p className="text-2xl font-bold">{scheduledTasks.length}</p>
                    <p className="text-sm">Completed</p>
                </div>
            </div>

            {isMobile ? (<Accordion type="multiple" defaultValue={["today"]} className="w-full space-y-4">
                <div className="bg-background rounded-lg border">
                    <AccordionItem value="today" className="border-b-0">
                        <AccordionTrigger className="px-4">Today's Tasks - {todayTasks.length} Tasks</AccordionTrigger>
                        <AccordionContent>
                            {todayTasks.length > 0
                                ? todayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="today" onTaskSelect={onTaskSelect} />)
                                : <p className="text-center text-sm text-muted-foreground py-4">No tasks for today.</p>
                            }
                        </AccordionContent>
                    </AccordionItem>
                </div>
                <div className="bg-background rounded-lg border">
                    <AccordionItem value="tomorrow" className="border-b-0">
                        <AccordionTrigger className="px-4">Tomorrow - {tomorrowTasks.length} Tasks</AccordionTrigger>
                        <AccordionContent>
                            {tomorrowTasks.length > 0
                                ? tomorrowTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="tomorrow" onTaskSelect={onTaskSelect} />)
                                : <p className="text-center text-sm text-muted-foreground py-4">No tasks for tomorrow.</p>
                            }
                        </AccordionContent>
                    </AccordionItem>
                </div>
                {/* *** NEWLY ADDED ACCORDION ITEM *** */}
                <div className="bg-background rounded-lg border">
                    <AccordionItem value="createdToday" className="border-b-0">
                        <AccordionTrigger className="px-4">Tasks created today - {createdTodayTasks.length} Tasks</AccordionTrigger>
                        <AccordionContent>
                            {createdTodayTasks.length > 0
                                ? createdTodayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="createdtoday" onTaskSelect={onTaskSelect} />)
                                : <p className="text-center text-sm text-muted-foreground py-4 px-4">No tasks were created today.</p>
                            }
                        </AccordionContent>
                    </AccordionItem>
                </div>
                 <div className="bg-background rounded-lg border">
                        <AccordionItem value="upcoming7Days" className="border-b-0">
                            <AccordionTrigger className="px-4">Upcoming 7 Days - {upcoming7DaysTasks.length} Tasks</AccordionTrigger>
                            <AccordionContent>
                                {upcoming7DaysTasks.length > 0
                                    ? upcoming7DaysTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="upcoming7Days" onTaskSelect={onTaskSelect} />)
                                    : <p className="text-center text-sm text-muted-foreground py-4">No upcoming tasks.</p>
                                }
                            </AccordionContent>
                        </AccordionItem>
                    </div>


            </Accordion>) : (<div className="space-y-2 pt-4">
                <DesktopTaskCategoryRow
                    title="Today"
                    count={todayTasks.length}
                    isActive={activeTaskId === 'todays'}
                    onClick={() => onTaskSelect({ id: 'todays' })}
                />
                <DesktopTaskCategoryRow
                    title="Tomorrow"
                    count={tomorrowTasks.length}
                    isActive={activeTaskId === 'tomorrow'}
                    onClick={() => onTaskSelect({ id: 'tomorrow' })}
                />
                <DesktopTaskCategoryRow
                    title="Tasks Created Today"
                    count={createdTodayTasks.length}
                    // No count is passed, so it won't be rendered
                    isActive={activeTaskId === 'createdtoday'}
                    onClick={() => onTaskSelect({ id: 'createdtoday' })}
                />
                {/* NEW: Upcoming 7 Days Desktop Category Row */}
                                    {/* NEW: Upcoming 7 Days Desktop Category Row */}
                     <DesktopTaskCategoryRow
                         title="Upcoming 7 Days Tasks"
                         count={upcoming7DaysTasks.length}
                         // --- FIX HERE: Use 'upcoming7Days' for activeTaskId comparison ---
                         isActive={activeTaskId === 'upcoming7Days'}
                         // --- FIX HERE: Pass 'upcoming7Days' as the ID ---
                         onClick={() => onTaskSelect({ id: 'upcoming7Days' })}
                     />

            </div>)}


        </div>

    )



};




