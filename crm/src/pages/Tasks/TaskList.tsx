


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatTime12Hour } from "@/utils/FormatDate";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo, useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FilterControls } from "@/components/ui/FilterControls";
import { format, subDays } from "date-fns";
import { useViewport } from "@/hooks/useViewPort";
import {useTaskData} from "@/hooks/useTaskData"
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Search } from "lucide-react";



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
        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
            isActive ? 'bg-muted' : 'hover:bg-muted/50'
        }`}
    >
        <span className="font-medium text-sm">
            {/* Conditionally render the count, as "Tasks Created Today" doesn't have one */}
            {title} {count !== undefined && `- ${count} Tasks`}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
);


export const TaskDashboardRow = ({ task, context,onTaskSelect }: { task: EnrichedCRMTask, context: 'today' | 'tomorrow' | 'createdToday' ,onTaskSelect?: (id: string) => void}) => {
    const { openEditTaskDialog } = useDialogStore();
    const navigate = useNavigate();
 const { isMobile } = useViewport();
    // Determine button label and action based on the context
    let buttonLabel = "Update";
    let buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'updateStatus' });

    if (context === 'tomorrow') {
        buttonLabel = "Go To Task";
        buttonAction = () => isMobile?navigate(`/tasks/task?id=${task.name}`):onTaskSelect({id:task.name});
    } else if (context === 'createdtoday') {
        buttonLabel = "Edit Task";
        buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'edit' });
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
        <div className="flex items-center justify-between py-3 px-2 border-b last:border-b-0">
            <div className="flex flex-col cursor-pointer">
               {/* <div className="flex flex-col cursor-pointer" onClick={() => handleSelect(task.name)}> */}
                <span className="font-medium">{task.type} {task.first_name} from {task.company}</span>
                <span className="text-sm text-muted-foreground">at {formatTime12Hour(task.time)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={buttonAction}>
                {buttonLabel}
            </Button>
        </div>
    );
};


export const TaskList = ({ onTaskSelect, activeTaskId }: TaskListProps) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    // const [id, setId] = useStateSyncedWithParams<string>("id", "");

     const {
        isLoading,
        error,
        todayTasks,
        tomorrowTasks,
        createdTodayTasks
    } = useTaskData();

    const [dateRange, setDateRange] = useState({ from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });
     // --- USE OBJECT DESTRUCTURING ---
   

    const { data: tasks, taskisLoading } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
        fields: ["name", "type", "start_date", "time", "status", "contact", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation"],
        filters: [["start_date", "between", [dateRange.from, dateRange.to]]],
        limit: 0,
        orderBy: { field: "creation", order: "asc" }
    });

    // console.log("TTASKS",tasks)

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
            pendingTasks: enriched.filter(t => t.status !== 'Completed'),
            scheduledTasks: enriched.filter(t => t.status === 'Scheduled'),
        //      todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) == today),
        // tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) == tomorrow),
        // createdTodayTasks: enriched.filter(t => t.creation?.slice(0, 10) == today),
        };
    }, [tasks]);

    
    console.log(dateRange.from,dateRange.to)

    useEffect(()=>{
         onTaskSelect({from:dateRange.from,to:dateRange.to });
    },[dateRange])

    if (taskisLoading) { return <div className="text-center p-4">Loading Tasks...</div>; }

    // console.log("ALL DATA",allTasks, pendingTasks, scheduledTasks, todayTasks, tomorrowTasks, createdTodayTasks)


    const handleTaskClick=(path:string)=>{
      if(isMobile){
        //  navigate(`/tasks/${path}`)
                navigate(`/tasks/${path}?from=${dateRange.from}&to=${dateRange.to}`);

      }else{
       onTaskSelect({ id: path,from:dateRange.from,to:dateRange.to });
      }
    }
    
        return (
            <div className="space-y-4">
                <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange}/>
            {/* Header cards */}
            <div className="grid grid-cols-3 gap-3">
                <div onClick={() => handleTaskClick('all')} 
                className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
            activeTaskId === 'all'
                ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
                : 'bg-destructive text-white' // Default state
        }`}
                    >
                    <p className="text-2xl font-bold">{allTasks.length}</p>
                    <p className="text-sm">All</p>
                </div>
                <div onClick={() => handleTaskClick('pending')} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
            activeTaskId === 'pending'
                ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
                : 'bg-destructive text-white' // Default state
        }`}
                    >
                    <p className="text-2xl font-bold">{pendingTasks.length}</p>
                    <p className="text-sm">Pending</p>
                </div>
                <div onClick={() => handleTaskClick('upcoming')} className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${
            activeTaskId === 'upcoming'
                ? 'bg-red-700 ring-2 ring-offset-1 ring-red-700' // Active state: darker red + ring
                : 'bg-destructive text-white' // Default state
        }`}
                    >
                    <p className="text-2xl font-bold">{scheduledTasks.length}</p>
                    <p className="text-sm">Scheduled</p>
                </div>
            </div>

{isMobile?( <Accordion type="multiple" defaultValue={["today"]} className="w-full space-y-4">
                <div className="bg-background rounded-lg border">
                    <AccordionItem value="today" className="border-b-0">
                        <AccordionTrigger className="px-4">Today's Tasks - {todayTasks.length} Tasks</AccordionTrigger>
                        <AccordionContent>
                            {todayTasks.length > 0 
                                ? todayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="today" onTaskSelect={onTaskSelect}/>)
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
                                ? tomorrowTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="tomorrow" onTaskSelect={onTaskSelect}/>)
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
            
                
            </Accordion>):( <div className="space-y-2 pt-4">
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
                        // No count is passed, so it won't be rendered
                        isActive={activeTaskId === 'createdtoday'}
                        onClick={() => onTaskSelect({ id: 'createdtoday' })}
                    />
                </div>)}
           
            
        </div>

        )
    

  
};




