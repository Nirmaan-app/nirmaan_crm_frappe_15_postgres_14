// src/pages/Tasks/TaskList.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatTime12Hour } from "@/utils/FormatDate";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Plus } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type EnrichedTask = CRMTask & { "contact.first_name"?: string; "contact.last_name"?: string; "company.company_name"?: string; };

interface TaskListProps {
    onTaskSelect?: (id: string) => void;
    activeTaskId?: string | null;
}

const TaskListItem = ({ task, onSelect, isActive }: { task: EnrichedTask, onSelect: () => void, isActive: boolean }) => {
    const getTaskStatusClass = useStatusStyles("task");
    return (
        <div
            role="button"
            onClick={onSelect}
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-lg ${isActive ? "bg-primary/10" : "hover:bg-secondary"}`}
        >
            <div>
                <strong className="text-black dark:text-muted-foreground">{task.type} with {task["contact.first_name"]}</strong>
                <p className="text-sm text-muted-foreground">{formatTime12Hour(task.time)}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTaskStatusClass(task.status)}`}>
                    {task.status || 'N/A'}
                </span>
                <ChevronRight className="md:hidden" />
            </div>
        </div>
    );
};

export const TaskList = ({ onTaskSelect, activeTaskId }: TaskListProps) => {
    const navigate = useNavigate();
    const { openNewTaskDialog } = useDialogStore();

    const { data: tasks, isLoading } = useFrappeGetDocList<EnrichedTask>("CRM Task", {
        fields: ["name", "type", "start_date", "time", "status", "contact.first_name", "contact.last_name", "company.company_name"],
        limit: 1000,
        orderBy: { field: "start_date", order: "desc" }
    });

    const { todayTasks, tomorrowTasks, upcomingTasks } = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

        const allTasks = tasks || [];
        return {
            todayTasks: allTasks.filter(t => t.start_date?.slice(0, 10) === today),
            tomorrowTasks: allTasks.filter(t => t.start_date?.slice(0, 10) === tomorrow),
            upcomingTasks: allTasks.filter(t => t.start_date?.slice(0, 10) > tomorrow),
        };
    }, [tasks]);

    const handleSelect = (id: string) => {
        if (onTaskSelect) {
            onTaskSelect(id);
        } else {
            navigate(`/tasks/task?id=${id}`);
        }
    };

    if (isLoading) {
        return <div>Loading Tasks...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <Accordion type="multiple" defaultValue={["today"]} className="w-full flex-1 overflow-y-auto">
                <AccordionItem value="today">
                    <AccordionTrigger>Today ({todayTasks.length})</AccordionTrigger>
                    <AccordionContent>
                        {todayTasks.map((task, i) => <div key={task.name}><TaskListItem task={task} onSelect={() => handleSelect(task.name)} isActive={task.name === activeTaskId} />{i < todayTasks.length - 1 && <Separator />}</div>)}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tomorrow">
                    <AccordionTrigger>Tomorrow ({tomorrowTasks.length})</AccordionTrigger>
                    <AccordionContent>
                        {tomorrowTasks.map((task, i) => <div key={task.name}><TaskListItem task={task} onSelect={() => handleSelect(task.name)} isActive={task.name === activeTaskId} />{i < tomorrowTasks.length - 1 && <Separator />}</div>)}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="upcoming">
                    <AccordionTrigger>Upcoming ({upcomingTasks.length})</AccordionTrigger>
                    <AccordionContent>
                        {upcomingTasks.map((task, i) => <div key={task.name}><TaskListItem task={task} onSelect={() => handleSelect(task.name)} isActive={task.name === activeTaskId} />{i < upcomingTasks.length - 1 && <Separator />}</div>)}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="mt-4 md:hidden">
                <button onClick={openNewTaskDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
                    <Plus size={20} /> Add New Task
                </button>
            </div>
        </div>
    );
};