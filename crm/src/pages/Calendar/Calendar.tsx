import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";
import { useTaskCreationHandler } from "@/hooks/useTaskCreationHandler";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { useToast } from "@/hooks/use-toast";

// Type for enriched task with joined contact and company data
interface CalendarTask extends CRMTask {
  contact?: CRMContacts;
  company?: { name: string; company_name: string };
}

interface TaskListProps {
  tasks: CalendarTask[];
  selectedDate: string | null;
  hasTasksOnAnyDate: boolean;
}

export const TaskCalendar = () => {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = React.useState<string | null>(
    searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
  );
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    const dateParam = searchParams.get("date");
    return dateParam ? new Date(dateParam) : new Date();
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tasksData, setTasksData] = React.useState<CalendarTask[]>([]);

  // Calculate month boundaries for filtering
  const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data, isLoading: isTasksLoading, error: tasksError } = useFrappeGetDocList(
    "CRM Task",
    {
      fields: [
        "name",
        "start_date",
        "status",
        "type",
        "task_profile",
        "contact",
        "boq",
      ],
      filters: [
        ["start_date", ">=", monthStart],
        ["start_date", "<=", `${monthEnd} 23:59:59`],
      ],
      limit: 0,
      orderBy: {
        field: "start_date",
        order: "asc"
      }
    },
    `tasks-calendar-${monthStart}`
  );

  const { data: contactsList, isLoading: contactsListLoading, error: contactsError } =
    useFrappeGetDocList(
      "CRM Contacts",
      {
        fields: ["*"],
        limit: 0,
      },
      "all-contacts-calender"
    );

  const { data: companiesList, isLoading: companiesListLoading, error: companiesError } =
    useFrappeGetDocList(
      "CRM Company",
      {
        fields: ["name", "company_name"],
        limit: 0,
      },
      "all-companies-calender"
    );

  // Handle API errors
  useEffect(() => {
    const error = tasksError || contactsError || companiesError;
    if (error) {
      toast({
        title: "Failed to load calendar data",
        description: (error as Error)?.message || "Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [tasksError, contactsError, companiesError, toast]);

  // Enrich tasks with contact and company data
  useEffect(() => {
    if (data && contactsList && companiesList) {
      const enrichedTasks = data
        ?.map((t) => ({
          ...t,
          contact: contactsList?.find((c) => c.name === t.contact),
        }))
        ?.map((k) => ({
          ...k,
          company: companiesList?.find((c) => c.name === k.contact?.company),
        }));
      setTasksData(enrichedTasks);
    }
  }, [data, contactsList, companiesList]);

  const tasksDatesSet = React.useMemo(() => {
    const set = new Set<string>();
    if (data) {
      data.forEach((task) => {
        const datePart = task.start_date.split(" ")[0];
        set.add(datePart);
      });
    }
    return set;
  }, [data]);

  const isTaskDate = React.useCallback(
    (date: Date) => {
      const dStr = format(date, "yyyy-MM-dd");
      return tasksDatesSet.has(dStr);
    },
    [tasksDatesSet]
  );

  const updateURL = (key: string, value: string): void => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.pushState({}, "", url);
  };

  const handleDateChange = (date: string): void => {
    if (searchParams.get("date") === date) return;
    updateURL("date", date);
    setSelectedDate(date);
  };

  const filteredTasks = tasksData?.filter(
    (task) => task?.start_date?.split(" ")[0] === selectedDate
  );

  const isOverallLoading = isTasksLoading || contactsListLoading || companiesListLoading;

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full w-full p-2 md:p-2">
      {/* Top row for the back button and optional title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackToHome}
          aria-label="Back to Home"
          className="hidden md:inline-flex"
        >
          <div className="bg-destructive text-black font-bold p-2 rounded-full">
            <ArrowLeft color="#ffffff" className="w-8 h-8" />
          </div>
        </Button>

        <h1 className="text-md hidden md:inline-flex md:text-2xl font-bold">{"Calendar Tasks"}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-2 h-full">
        {/* Calendar Column */}
        <div className="min-h-[48vh] md:w-1/2">
          {isOverallLoading ? (
            <div className="w-full">
              <Skeleton className="h-[350px] w-full rounded-md" />
              <div className="flex justify-between mt-4">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
              <Skeleton className="h-10 w-full mt-4 rounded-md" />
            </div>
          ) : (
            <Calendar
              mode="single"
              showOutsideDays={false}
              timeZone="Asia/Calcutta"
              className="min-w-full"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              selected={selectedDate}
              onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
              modifiers={{ hasTask: isTaskDate }}
              modifiersClassNames={{
                hasTask: "border-b-2 border-destructive text-destructive font-medium",
              }}
            />
          )}
        </div>

        {/* Task List Column */}
        <div className="h-1/2 md:h-full md:w-1/2 flex-1 flex flex-col min-h-0">
          <TaskList
            tasks={filteredTasks}
            selectedDate={selectedDate}
            hasTasksOnAnyDate={tasksDatesSet.size > 0}
          />
        </div>
      </div>
    </div>
  );
};

const TaskList: React.FC<TaskListProps> = ({ tasks, selectedDate, hasTasksOnAnyDate }) => {
  const navigate = useNavigate();
  const handleCreateTask = useTaskCreationHandler();

  const title = selectedDate ? `Tasks for ${format(new Date(selectedDate), 'MMM dd')}` : 'Tasks';

  const renderContent = () => {
    if (!selectedDate) {
      return (
        <div role="status" aria-live="polite" className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a date to view tasks.
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <div role="status" aria-live="polite" className="flex-1 flex items-center justify-center text-muted-foreground">
          No tasks scheduled for this day.
        </div>
      );
    }

    const handleTaskClick = (taskName: string) => {
      navigate(`/tasks/task?id=${taskName}`);
    };

    const handleTaskKeyDown = (e: React.KeyboardEvent, taskName: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTaskClick(taskName);
      }
    };

    return (
      <div className="space-y-2" role="list" aria-label="Task list">
        {tasks.map((task, index) => {
          const taskLabel = task.task_profile === "Sales"
            ? `${task?.type} with ${task?.contact?.first_name} ${task?.contact?.last_name} from ${task?.company?.company_name}`
            : `${task?.type} for ${task?.boq}`;

          return (
            <React.Fragment key={task.name}>
              <div
                role="button"
                tabIndex={0}
                aria-label={taskLabel}
                className="flex justify-between items-center cursor-pointer hover:bg-muted p-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleTaskClick(task.name)}
                onKeyDown={(e) => handleTaskKeyDown(e, task.name)}
              >
                <div className="flex items-center gap-2">
                  <TaskStatusIcon status={task.status} className="flex-shrink-0"/>
                  <span className="text-sm">
                    {task.task_profile === "Sales" ? (
                      <>
                        {task?.type} with {task?.contact?.first_name}{" "}
                        {task?.contact?.last_name} from {task?.company?.company_name}
                      </>
                    ) : (
                      <>{task?.type} for {task?.boq}</>
                    )}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              </div>
              {index < tasks.length - 1 && <Separator className="bg-border" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full bg-destructive/10 dark:bg-card text-foreground border-border">
      <CardHeader className="py-4 border-b border-border">
        <CardTitle className="text-lg flex items-center gap-3 font-bold tracking-tight">
          <span
            className="bg-destructive text-destructive-foreground h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold shadow-sm"
            role="status"
            aria-label={`${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
          >
            {tasks.length}
          </span>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2">
        {renderContent()}
      </CardContent>

      <CardFooter className="p-2 border-t">
        <Button
          className="w-full bg-destructive"
          onClick={() => handleCreateTask()}
        >
          Add New Task
        </Button>
      </CardFooter>
    </Card>
  );
};
