// src/pages/Tasks/Tasks.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// A reusable type for tasks that include contact/company names
export type EnrichedCRMTask = CRMTask & {
    contact_name?: string;
    company_name?: string;
};

const TaskDashboardRow = ({ task, context }: { task: EnrichedCRMTask, context: 'today' | 'tomorrow' | 'createdToday' }) => {
    const { openEditTaskDialog } = useDialogStore();
    const navigate = useNavigate();

    // Determine button label and action based on the context
    let buttonLabel = "Update";
    let buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'updateStatus' });

    if (context === 'tomorrow') {
        buttonLabel = "Go To Task";
        buttonAction = () => navigate(`/tasks/task?id=${task.name}`);
    } else if (context === 'createdToday') {
        buttonLabel = "Edit Task";
        buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'edit' });
    }
    // For 'today', the default action is 'Update', so no 'if' statement is needed.

    return (
        <div className="flex items-center justify-between py-3 px-2 border-b last:border-b-0">
            <div className="flex flex-col cursor-pointer" onClick={() => navigate(`/tasks/task?id=${task.name}`)}>
                <span className="font-medium">{task.type} {task.first_name} from {task.company}</span>
                <span className="text-sm text-muted-foreground">at {formatTime12Hour(task.time)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={buttonAction}>
                {buttonLabel}
            </Button>
        </div>
    );
};

export const Tasks = () => {
    const navigate = useNavigate();
    
    // Fetch all tasks and enrich them with linked document names
    // This is an efficient way to get related data in one call.
    const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
        fields: ["name", "type", "start_date", "time", "status", "contact", "company", "boq", "contact.first_name", "contact.last_name", "company.company_name","creation"],
        limit: 1000,
        orderBy: { field: "start_date", order: "asc" }
    });

    // Memoize the categorized tasks to prevent recalculation on every render
    const { allTasks, pendingTasks, scheduledTasks, todayTasks, tomorrowTasks,createdTodayTasks } = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
       
        const enriched = tasksData?.map(task => ({
            ...task,
            contact_name: `${task["contact.first_name"] || ''} ${task["contact.last_name"] || ''}`.trim(),
            company_name: task["company.company_name"] || 'N/A'
        })) || [];

        return {
            allTasks: enriched,
            pendingTasks: enriched.filter(t => t.status !== 'Completed'),
            scheduledTasks: enriched.filter(t => t.status === 'Scheduled' && t.start_date.slice(0, 10) >= today),
            todayTasks: enriched.filter(t => t.start_date.slice(0, 10) === today),
            tomorrowTasks: enriched.filter(t => t.start_date.slice(0, 10) === tomorrow),
            createdTodayTasks: enriched.filter(t => t.creation.slice(0, 10) === today),
        };
    }, [tasksData]);

    if (isLoading) return <div>Loading tasks...</div>;

    return (
        <div className="space-y-4">
            {/* Header cards */}
            <div className="grid grid-cols-3 gap-3">
                <div onClick={() => navigate('/tasks/all')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
                    <p className="text-2xl font-bold">{allTasks.length}</p>
                    <p className="text-sm">All</p>
                </div>
                <div onClick={() => navigate('/tasks/pending')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
                    <p className="text-2xl font-bold">{pendingTasks.length}</p>
                    <p className="text-sm">Pending</p>
                </div>
                <div onClick={() => navigate('/tasks/upcoming')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
                    <p className="text-2xl font-bold">{scheduledTasks.length}</p>
                    <p className="text-sm">Scheduled</p>
                </div>
            </div>

            {/* Accordion for task lists */}
            <Accordion type="multiple" defaultValue={["today"]} className="w-full space-y-4">
                <div className="bg-background rounded-lg border">
                    <AccordionItem value="today" className="border-b-0">
                        <AccordionTrigger className="px-4">Today's Tasks - {todayTasks.length} Tasks</AccordionTrigger>
                        <AccordionContent>
                            {todayTasks.length > 0 
                                ? todayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="today"/>)
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
                                ? tomorrowTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="tomorrow" />)
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
                                ? createdTodayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="createdToday" />)
                                : <p className="text-center text-sm text-muted-foreground py-4 px-4">No tasks were created today.</p>
                            }
                        </AccordionContent>
                    </AccordionItem>
                </div>
            
                
            </Accordion>
            
        </div>
    );
};

// import { useViewport } from "@/hooks/useViewPort";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
// import { getFilteredTasks } from "@/utils/taskutils";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { ChevronRight, History, Hourglass, Plus, SkipForward } from "lucide-react";
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";

// export const Tasks = () => {
//     const navigate = useNavigate();
//     const {isMobile} = useViewport()

//     const { data: tasksData, isLoading: tasksDataLoading } = useFrappeGetDocList<CRMTask>("CRM Task", {
//         fields: ["*"],
//         limit: 1000,
//     }, "CRM Task");

//     const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
//         fields: ["*"],
//         limit: 10000
//     }, "CRM Contacts")

//     const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
//         fields: ["name", "company_name"],
//         limit: 1000,
//       }, "CRM Company")

//     const cards = [
//         { title: "History", icon: History, path: "/tasks/history" },
//         { title: "Pending", icon: Hourglass, path: "/tasks/pending" },
//         { title: "Upcoming", icon: SkipForward, path: "/tasks/upcoming" },
//     ];

//     const today = new Date().toISOString().split("T")[0];
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const tomorrowDate = tomorrow.toISOString().split("T")[0];

//     const todayTasks = useMemo(() => getFilteredTasks(tasksData, today, contactsList, companiesList), [tasksData, contactsList, companiesList])

//     const tomorrowTasks = useMemo(() => getFilteredTasks(tasksData, tomorrowDate, contactsList, companiesList), [tasksData, contactsList, companiesList])

//     // useEffect(() => {
//     //     if(tasksData && contactsList && companiesList) {
//     //         const todayTasks =   getFilteredTasks(tasksData, today, contactsList, companiesList)
//     //         const tomorrowTasks = getFilteredTasks(tasksData, tomorrowDate, contactsList, companiesList)
//     //         setTodayTasks(todayTasks)
//     //         setTomorrowTasks(tomorrowTasks)
//     //     }
//     // }, [tasksData, contactsList, companiesList])

    

//     // const todayTasks = tasksData
//     //     ?.filter((task) => task.start_date.startsWith(today))
//     //     .sort((a, b) => a.start_date.localeCompare(b.start_date));

//     // const tomorrowTasks = tasksData
//     //     ?.filter((task) => task.start_date.startsWith(tomorrowDate))
//     //     .sort((a, b) => a.start_date.localeCompare(b.start_date));

//     return (
//         <div>
//             {/* Navigation Cards */}
//             <div className="grid grid-cols-3 gap-2 text-white">
//                 {cards.map((card) => (
//                     <div
//                         onClick={() => navigate(card.path)}
//                         className="h-[90px] bg-destructive rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer"
//                         key={card.title}
//                     >
//                         <card.icon />
//                         <p>{card.title}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* Tasks Sections */}
//             <div className="mt-8 space-y-6">
//                 {/* Today's Tasks */}
//                 <div>
//                     <div className="flex items-center justify-between">
//                         <h2 className="font-bold text-lg">Today's</h2>
//                         <p className="text-sm">{formatDate(new Date())}</p>
//                     </div>
//                     <ul className="mt-4 space-y-2">
//                         {todayTasks?.length ? (
//                             todayTasks?.map((task) => {
//                                 const [, time] = task?.start_date?.split(" ");
//                                 return (
//                                     <li onClick={() => navigate(`task?id=${task?.name}`)} key={task?.name} className="p-2 border-b rounded-md flex justify-between items-center text-sm">
//                                         <span>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(time)}</span>
//                                         <ChevronRight />
//                                     </li>
//                                 );
//                             })
//                         ) : (
//                             <p className="text-muted-foreground text-center border-b pb-4">Empty!</p>
//                         )}
//                     </ul>
//                 </div>

//                 {/* Tomorrow's Tasks */}
//                 <div>
//                     <div className="flex items-center justify-between">
//                         <h2 className="font-bold text-lg">Tomorrow's</h2>
//                         <p className="text-sm">{formatDate(tomorrow)}</p>
//                     </div>
//                     <ul className="mt-4 space-y-2">
//                         {tomorrowTasks?.length ? (
//                             tomorrowTasks.map((task) => {
//                                 const [, time] = task?.start_date?.split(" ");
//                                 return (
//                                     <li onClick={() => navigate(`task?id=${task?.name}`)} key={task?.name} className="p-2 border-b rounded-md flex justify-between items-center text-sm">
//                                         <span>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(time)}</span>
//                                         <ChevronRight />
//                                     </li>
//                                 );
//                             })
//                         ) : (
//                             <p className="text-muted-foreground text-center border-b pb-4">Empty!</p>
//                         )}
//                     </ul>
//                 </div>
//             </div>

//             {isMobile && (
//             <div className="fixed bottom-24 right-6">
//                 <button
//                   onClick={() => navigate("/tasks/new")}
//                   className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center`}
//                 >
//                   <Plus size={24} />
//                 </button>
//               </div>
//             )}
//         </div>
//     );
// };
