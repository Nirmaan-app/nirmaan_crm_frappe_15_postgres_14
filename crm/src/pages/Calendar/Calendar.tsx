// "use client";

// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar"; // Using the new shadcn calendar
// import { Separator } from "@/components/ui/separator";
// import { useDialogStore } from "@/store/dialogStore";
// import { EnrichedCRMTask } from "@/pages/Tasks/Tasks";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { format } from "date-fns";
// import { useMemo, useState } from "react";
// import { ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// // A sub-component to render the list of tasks for the selected day
// // This component does not need any changes.
// const DailyTaskList = ({ tasks }: { tasks: EnrichedCRMTask[] }) => {
//     const navigate = useNavigate();
    
//     if (tasks.length === 0) {
//         return <p className="text-center text-muted-foreground py-8">No tasks to do on this day.</p>;
//     }

//     return (
//         <div className="flex flex-col">
//             {tasks.map((task, index) => (
//                 <div key={task.name}>
//                     <div 
//                         className="flex justify-between items-center py-4 cursor-pointer"
//                         onClick={() => navigate(`/tasks/task?id=${task.name}`)}
//                     >
//                         <div className="flex flex-col">
//                             <span className="font-semibold">{task.type} with {task.contact_name}</span>
//                             <span className="text-sm text-muted-foreground">from {task.company_name}</span>
//                         </div>
//                         <ChevronRight className="h-5 w-5 text-muted-foreground" />
//                     </div>
//                     {index < tasks.length - 1 && <Separator />}
//                 </div>
//             ))}
//         </div>
//     );
// };

// export const TaskCalendar = () => {
//     const { openNewTaskDialog } = useDialogStore();
//     const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

//     // Fetch all tasks and enrich them with linked document names
//     const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
//         fields: ["name", "type", "start_date", "contact.first_name", "contact.last_name", "company.company_name"],
//         limit: 1000,
//     });

//     // Memoize the processed tasks for performance. This logic remains the same.
//     const { tasksByDate, taskDatesSet } = useMemo(() => {
//         const tasksByDate = new Map<string, EnrichedCRMTask[]>();
//         const taskDatesSet = new Set<string>();

//         tasksData?.forEach(task => {
//             if (!task.start_date) return; // Guard against tasks without dates
//             const dateStr = task.start_date.slice(0, 10); // "YYYY-MM-DD"
            
//             taskDatesSet.add(dateStr);

//             if (!tasksByDate.has(dateStr)) {
//                 tasksByDate.set(dateStr, []);
//             }
//             tasksByDate.get(dateStr)?.push({
//                 ...task,
//                 contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim(),
//                 company_name: task.company_name || 'N/A'
//             });
//         });
        
//         return { tasksByDate, taskDatesSet };
//     }, [tasksData]);

//     // Get the tasks for the currently selected date
//     const tasksForSelectedDay = selectedDate ? tasksByDate.get(format(selectedDate, "yyyy-MM-dd")) || [] : [];
    
//     // Create the modifier function to identify days with tasks
//     const hasTaskModifier = (date: Date) => {
//         return taskDatesSet.has(format(date, "yyyy-MM-dd"));
//     };

//     return (
//         <div className="flex flex-col h-full p-4"> {/* Added padding for better layout */}
//             <div className="bg-background rounded-lg border py-4 flex justify-center">
//                 <Calendar
//                     mode="single"
//                     selected={selectedDate}
//                     onSelect={setSelectedDate}
//                   //  className="rounded-md border shadow-sm"
//         captionLayout="dropdown"
//         modifiers={{ hasTask: hasTaskModifier }}
//                 />
//             </div>

//             <div className="mt-6 flex-1 space-y-2">
//                 <div className="flex justify-between items-baseline">
//                     <h2 className="text-lg font-semibold">Tasks to do on:</h2>
//                     {selectedDate && (
//                          <p className="text-sm text-muted-foreground">{format(selectedDate, "dd MMM, yyyy")}</p>
//                     )}
//                 </div>
                
//                 <div className="bg-background rounded-lg border p-4 flex-1">
//                     {isLoading ? (
//                         <p className="text-center text-muted-foreground py-8">Loading tasks...</p>
//                     ) : (
//                         <DailyTaskList tasks={tasksForSelectedDay} />
//                     )}
//                 </div>
//             </div>

//             {/* Sticky "Add New Task" button at the bottom */}
//             <div className="sticky bottom-0 py-4 bg-background mt-auto">
//                 <Button className="w-full bg-destructive" onClick={() => openNewTaskDialog({})}>
//                     Add New Task
//                 </Button>
//             </div>
//         </div>
//     );
// };





import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime12Hour } from "@/utils/FormatDate";
import { format } from "date-fns";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TaskCalendar = () => {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = React.useState<string | null>(
    searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
  );
  const { openNewTaskDialog } = useDialogStore();
  const navigate = useNavigate();

  const [tasksData, setTasksData] = React.useState<any>([]);

  const { data, isLoading } = useFrappeGetDocList(
    "CRM Task",
    {
      fields: ["*"],
      limit: 100000,
    },
    "CRM Task"
  );

  const { data: contactsList, isLoading: contactsListLoading } =
    useFrappeGetDocList(
      "CRM Contacts",
      {
        fields: ["*"],
        limit: 10000,
      },
      "CRM Contacts"
    );

  const { data: companiesList, isLoading: companiesListLoading } =
    useFrappeGetDocList(
      "CRM Company",
      {
        fields: ["name", "company_name"],
        limit: 1000,
      },
      "CRM Company"
    );

  useEffect(() => {
    if (data && contactsList && companiesList) {
      const sortedTasks = data
        ?.sort((a, b) => a?.start_date?.localeCompare(b?.start_date))
        ?.map((t) => ({
          ...t,
          contact: contactsList?.find((c) => c.name === t.contact),
        }))
        ?.map((k) => ({
          ...k,
          company: companiesList?.find((c) => c.name === k.contact?.company),
        }));
      setTasksData(sortedTasks);
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

  const updateURL = (key, value) => {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, "", url);
  };

  const handleDateChange = (date) => {
    if (searchParams.get("date") === date) return;
    updateURL("date", date);
    setSelectedDate(date);
  };

  console.log("tasksDataCalender", tasksData);

  const filteredTasks = tasksData?.filter(
    (task) => task?.start_date?.split(" ")[0] === selectedDate
  );

  return (
    <div>
      <Calendar
        mode="single"
        showOutsideDays={false}
        timeZone="Asia/Calcutta"
        className="min-w-full"
        selected={selectedDate}
        onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
        modifiers={{ hasTask: isTaskDate }}
        modifiersClassNames={{
          hasTask:
            "border-b border-[#000399] dark:border-primary dark:text-primary text-[#000399]",
        }}
      />
      <Card className="bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm font-medium">
          {selectedDate && tasksDatesSet?.has(selectedDate) ? (
            <div className="flex flex-col gap-2">
              {filteredTasks.map((task, index) => (
                <React.Fragment key={task.name}>
                  <div
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md"
                    onClick={() => navigate(`/tasks/task?id=${task.name}`)}
                  >
                    <span>
                      {task?.type} {task?.contact?.first_name}{" "}
                      {task?.contact?.last_name} from {task?.company?.company_name}
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                  {index < filteredTasks.length - 1 &&  <Separator className="bg-black dark:bg-white" />}
                </React.Fragment>
              ))}
            </div>
          ) : selectedDate && !tasksDatesSet?.has(selectedDate) ? (
            <span>No tasks for {selectedDate}</span>
          ) : (
            <span>Select a Date to display tasks</span>
          )}
        </CardContent>
      </Card>
      <div className="sticky bottom-0 py-4 bg-background mt-auto">
        <Button
          className="w-full bg-destructive"
          onClick={() => openNewTaskDialog({})}
        >
          Add New Task
        </Button>
      </div>
    </div>
  );
};