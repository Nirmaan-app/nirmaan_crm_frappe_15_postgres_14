// src/pages/Tasks/TaskList.tsx

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatTime12Hour } from "@/utils/FormatDate";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FilterControls } from "@/components/ui/FilterControls";
import { format, subDays } from "date-fns";
import { useViewport } from "@/hooks/useViewPort";
import { Separator } from "@/components/ui/separator";

import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";

// A reusable type for tasks that include contact/company names
type EnrichedTask = CRMTask & { 
    "contact.first_name"?: string; 
    "contact.last_name"?: string; 
    "company.company_name"?: string; 
    contact_name?: string;
    company_name?: string;
};

interface TaskListProps {
    onTaskSelect?: (id: string) => void;
    activeTaskId?: string | null;
}



const TaskDashboardRow = ({ task, context,onTaskSelect }: { task: EnrichedCRMTask, context: 'today' | 'tomorrow' | 'createdToday' ,onTaskSelect?: (id: string) => void}) => {
    const { openEditTaskDialog } = useDialogStore();
    const navigate = useNavigate();
 const { isMobile } = useViewport();
    // Determine button label and action based on the context
    let buttonLabel = "Update";
    let buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'updateStatus' });

    if (context === 'tomorrow') {
        buttonLabel = "Go To Task";
        buttonAction = () => isMobile?navigate(`/tasks/task?id=${task.name}`):onTaskSelect(task.name);
    } else if (context === 'createdToday') {
        buttonLabel = "Edit Task";
        buttonAction = () => openEditTaskDialog({ taskData: task, mode: 'edit' });
    }
    
    // // For 'today', the default action is 'Update', so no 'if' statement is needed.
    //  // --- NEW RESPONSIVE CLICK HANDLER ---
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
               {/* <div className="flex flex-col cursor-pointer" onClick={() => handleSelect(task.name)}>*/}
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
    const [id, setId] = useStateSyncedWithParams<string>("id", "");

    const [dateRange, setDateRange] = useState({ from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });

    const { data: tasks, isLoading } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
        fields: ["name", "type", "start_date", "time", "status", "contact", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation"],
        filters: [["creation", "between", [dateRange.from, dateRange.to]]],
        limit: 0,
        orderBy: { field: "creation", order: "asc" }
    });

    // console.log("TTASKS",tasks)

    const { allTasks, pendingTasks, scheduledTasks, todayTasks, tomorrowTasks, createdTodayTasks } = useMemo(() => {
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
             todayTasks: enriched.filter(t => t.start_date?.slice(0, 10) == today),
        tomorrowTasks: enriched.filter(t => t.start_date?.slice(0, 10) == tomorrow),
        createdTodayTasks: enriched.filter(t => t.creation?.slice(0, 10) == today),
        };
    }, [tasks]);

    // const handleDateRangeChange = useCallback((newRange) => { setDateRange(newRange); }, []);

    if (isLoading) { return <div className="text-center p-4">Loading Tasks...</div>; }

    console.log("ALL DATA",allTasks, pendingTasks, scheduledTasks, todayTasks, tomorrowTasks, createdTodayTasks)


    const handleTaskClick=(path:string)=>{
      if(isMobile){
        navigate(`/tasks/${path}`)
      }else{
      onTaskSelect(path);
      }
    }
    
        return (
            <div className="space-y-4">
                <FilterControls onDateRangeChange={setDateRange} dateRange={dateRange}/>
            {/* Header cards */}
            <div className="grid grid-cols-3 gap-3">
                <div onClick={() => handleTaskClick('all')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
                    <p className="text-2xl font-bold">{allTasks.length}</p>
                    <p className="text-sm">All</p>
                </div>
                <div onClick={() => handleTaskClick('pending')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
                    <p className="text-2xl font-bold">{pendingTasks.length}</p>
                    <p className="text-sm">Pending</p>
                </div>
                <div onClick={() => handleTaskClick('upcoming')} className="bg-destructive text-white p-3 rounded-lg text-center cursor-pointer">
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
                                ? createdTodayTasks.map(task => <TaskDashboardRow key={task.name} task={task} context="createdToday" onTaskSelect={onTaskSelect} />)
                                : <p className="text-center text-sm text-muted-foreground py-4 px-4">No tasks were created today.</p>
                            }
                        </AccordionContent>
                    </AccordionItem>
                </div>
            
                
            </Accordion>
            
        </div>

        )
    

  
};