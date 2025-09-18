import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime12Hour } from "@/utils/FormatDate";

import { format } from "date-fns";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { useNavigate } from "react-router-dom";
import { useViewport } from "@/hooks/useViewPort"; // 1. IMPORT THE HOOK
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";
import {taskClick} from "@/utils/LinkNavigate"
import { useTaskCreationHandler } from "@/hooks/useTaskCreationHandler";
import { Skeleton } from '@/components/ui/skeleton'; // <--- 
import { ArrowLeft, SquarePen, ChevronRight, Plus } from "lucide-react";

export const TaskCalendar = () => {

  const { isMobile } = useViewport(); // 2. GET THE MOBILE STATE
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = React.useState<string | null>(
    searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
  );
  const { openNewTaskDialog } = useDialogStore();
  const navigate = useNavigate();

  const [tasksData, setTasksData] = React.useState<any>([]);

  const { data, isLoading:isTasksLoading } = useFrappeGetDocList(
    "CRM Task",
    {
      fields: ["*"],
      limit: 0,
       orderBy: {
        field: "start_date DESC, modified",
        order: "desc"
    }
    },
    "all-tasks-calender"
  );

  const { data: contactsList, isLoading: contactsListLoading } =
    useFrappeGetDocList(
      "CRM Contacts",
      {
        fields: ["*"],
        limit: 0,
        
      },
      "all-contacts-calender"
    );

  const { data: companiesList, isLoading: companiesListLoading } =
    useFrappeGetDocList(
      "CRM Company",
      {
        fields: ["name", "company_name"],
        limit: 0,
      },
      "all-companies-calender"
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

  const filteredTasks = tasksData?.filter(
    (task) => task?.start_date?.split(" ")[0] === selectedDate
  );

  // 3. RETURN STATEMENT WITH CONDITIONAL LAYOUT
  // return isMobile ? (
  //   // ===================================
  //   // MOBILE LAYOUT (Your original code)
  //   // ===================================
  //   <div>
  //     <Calendar
  //       mode="single"
  //       showOutsideDays={false}
  //       timeZone="Asia/Calcutta"
  //       className="min-w-full"
  //       selected={selectedDate}
  //       onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
  //       modifiers={{ hasTask: isTaskDate }}
  //       modifiersClassNames={{
  //         hasTask:
  //           "border-b border-[#000399] dark:border-primary dark:text-primary text-[#000399]",
  //       }}
  //     />
  //      <div className="flex-1 flex flex-col mt-4">
  //     <Card className="h-full flex flex-col bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
  //         <CardHeader className="py-4">
  //           <CardTitle className="text-lg text-center border-bottom"><span className="bg-[#000399] p-1.5 border rounded-full text-white">{ filteredTasks.length}</span> Tasks for {selectedDate ? format(new Date(selectedDate), 'MMM dd') : '...'} </CardTitle>
  //         </CardHeader>
          
  //          <CardContent className="flex-1 overflow-y-auto text-sm font-medium p-2">
  //         {selectedDate && tasksDatesSet?.has(selectedDate) ? (
  //           <div className="flex flex-col gap-2">
  //             {filteredTasks.map((task, index) => (
  //               <React.Fragment key={task.name}>
  //                 <div
  //                   className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md"
  //                   onClick={() => navigate(`/tasks/task?id=${task.name}`)}
  //                 >
  //                   <span>
  //                     {task?.type} with {task?.contact?.first_name}{" "}
  //                     {task?.contact?.last_name} from {task?.company?.company_name} at {" "}
  //                     <p className="text-xs inline-block text-muted-foreground p-0 m-0">
  //                       {formatTime12Hour(task.time)}
  //                   </p>
  //                   </span>
                    
  //                   <ChevronRight className="h-5 w-5" />
  //                 </div>
                    
  //                 {index < filteredTasks.length - 1 &&  <Separator className="bg-black dark:bg-white" />}
  //               </React.Fragment>
  //             ))}
  //           </div>
  //         ) : selectedDate && !tasksDatesSet?.has(selectedDate) ? (
  //           <span>No tasks for {selectedDate}</span>
  //         ) : (
  //           <span>Select a Date to display tasks</span>
  //         )}
  //         </CardContent>
  //       </Card>
  //     </div>
      
  //     {/* <Card className="flex-1 flex flex-col mt-4 bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
  //       <CardHeader>
  //         <CardTitle>Tasks</CardTitle>
  //       </CardHeader>
       
  //     </Card> */}
  //     <div className="py-4 bg-background border-t ">
  //       <Button
  //         className="w-full bg-destructive"
  //         onClick={() => openNewTaskDialog({})}
  //       >
  //         Add New Task
  //       </Button>
  //     </div>
  //   </div>
  // ) : (
  //   // ===================================
  //   // DESKTOP LAYOUT (New two-column structure)
  //   // ===================================
  //   <div className="flex gap-6 p-6 h-[calc(100vh-var(--navbar-height)-80px)]">
  //     {/* Left Column */}
  //     <div className="w-[580px] flex flex-col gap-6">
      
        
  //         <Calendar
  //           mode="single"
  //           showOutsideDays={false}
  //           timeZone="Asia/Calcutta"
  //        className="min-w-full full-width-calendar" 
  //           selected={selectedDate}
  //           onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
  //           modifiers={{ hasTask: isTaskDate }}
  //           modifiersClassNames={{
  //             hasTask:
  //               "border-b border-[#000399] dark:border-primary dark:text-primary text-[#000399]",
  //           }}
  //         />
       
  //     </div>

  //     {/* Right Column */}
  //     <div className="flex-1">
  //       <Card className="h-full flex flex-col bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
  //         <CardHeader>
  //           <CardTitle>Tasks</CardTitle>
  //         </CardHeader>
  //         <CardContent className="text-sm font-medium flex-1 overflow-y-auto">
  //           {selectedDate && tasksDatesSet?.has(selectedDate) ? (
  //             <div className="flex flex-col gap-2">
  //               {filteredTasks.map((task, index) => (
  //                 <React.Fragment key={task.name}>
  //                   <div
  //                     className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md"
  //                     onClick={() => navigate(`/tasks?id=${task.name}`)} // Navigate to update master-detail view
  //                   >
  //                     <span>
  //                       {task?.type} {task?.contact?.first_name}{" "}
  //                       {task?.contact?.last_name} from {task?.company?.company_name}
  //                     </span>
  //                     <ChevronRight className="h-5 w-5" />
  //                   </div>
  //                   {index < filteredTasks.length - 1 && <Separator className="bg-black dark:bg-white" />}
  //                 </React.Fragment>
  //               ))}
  //             </div>
  //           ) : selectedDate && !tasksDatesSet?.has(selectedDate) ? (
  //             <div className="flex h-full items-center justify-center">
  //               <span>No tasks for {selectedDate}</span>
  //             </div>
  //           ) : (
  //             <div className="flex h-full items-center justify-center">
  //                <span>Select a Date to display tasks</span>
  //             </div>
  //           )}
  //            <Button
  //         className="w-full bg-destructive"
  //         onClick={() => openNewTaskDialog({})}
  //       >
  //         Add New Task
  //       </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   </div>
  // );
  const isOverallLoading = isTasksLoading || contactsListLoading || companiesListLoading;

// if(isOverallLoading){
// return (
//   <div className="w-full">
//           {/* Skeleton to mimic the calendar shape */}
//           <Skeleton className="h-[350px] w-full rounded-md" />
//           <div className="flex justify-between mt-4">
//             <Skeleton className="h-8 w-20 rounded-md" />
//             <Skeleton className="h-8 w-20 rounded-md" />
//             <Skeleton className="h-8 w-20 rounded-md" />
//           </div>
//           <Skeleton className="h-10 w-full mt-4 rounded-md" /> {/* For the "Add New Task" button area if it were here */}
//         </div>
// )
//   }
  
 const handleBackToHome = () => {
        // Construct the path back to /boqs, including statusTab if it exists

        navigate("/");
    };
  return (
    // On mobile (default): `flex-col`. From the `md` breakpoint upwards: `flex-row`
    // `h-full` assumes the parent container of TaskCalendar has a defined height.
     <div className="flex flex-col h-full w-full p-2 md:p-2">
            {/* Top row for the back button and optional title */}
            
             <div className="flex items-center gap-4"> {/* Container for back button and header text */}
             
                                 <Button
                                     variant="ghost"
                                     size="icon"
                                     onClick={handleBackToHome}
                                     aria-label="Back to Company List"
                                     className="hidden md:inline-flex" // Hide on mobile, show on desktop
                                 >
                                     <div className="bg-destructive text-black font-bold p-2 rounded-full">
                                         <ArrowLeft className="w-8 h-8" />
                                     </div>
                                 </Button>
             
                                 <h1 className="text-md hidden md:inline-flex md:text-2xl font-bold">{"Calendar Tasks"}</h1>
                             </div>
                                 
    <div className="flex flex-col md:flex-row gap-6 p-4 md:p-2 h-full">
     
      
      {/* ===== CALENDAR COLUMN ===== */}
      {/* On desktop (`md:`), it takes half the width. On mobile, it's full-width by default. */}
      {/* <div className="min-h-[48vh] md:w-1/2">
        

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
        
      </div> */}
       <div className="min-h-[48vh] md:w-1/2">
      {isOverallLoading ? ( // NEW: Conditional rendering for loading state
        <div className="w-full">
          {/* Skeleton to mimic the calendar shape */}
          <Skeleton className="h-[350px] w-full rounded-md" />
          <div className="flex justify-between mt-4">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
          <Skeleton className="h-10 w-full mt-4 rounded-md" /> {/* For the "Add New Task" button area if it were here */}
        </div>
      ) : (
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
      )}
    </div>

      {/* ===== TASK LIST COLUMN ===== */}
      {/* On mobile: takes half the height (`h-1/2`).
          On desktop (`md:`): takes half the width and the full height.
          `min-h-0` is a crucial flexbox fix that allows the child (`TaskList`) to scroll correctly within this flex container. */}
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

const TaskList = ({ tasks, selectedDate, hasTasksOnAnyDate }) => {
  const navigate = useNavigate();
  const { openNewTaskDialog } = useDialogStore();
  const { isMobile } = useViewport(); // 2. GET THE MOBILE STATE
  const handleCreateTask = useTaskCreationHandler();
  


  const title = selectedDate ? `Tasks for ${format(new Date(selectedDate), 'MMM dd')}` : 'Tasks';

  const renderContent = () => {
    if (!selectedDate) {
      return <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a date to view tasks.</div>;
    }

    if (tasks.length === 0) {
      return <div className="flex-1 flex items-center justify-center text-muted-foreground">No tasks scheduled for this day.</div>;
    }

    // This renders the actual list of tasks
    return (
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <React.Fragment key={task.name}>
           
             <div
                    className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md"
                    onClick={() => navigate(`/tasks/task?id=${task.name}`)}
                  >
                    
                    <span>
                      <div className="flex">
                        <TaskStatusIcon status={task.status} className="mr-1 flex-shrink-0"/>
                        <div>
                          {task.task_profile==="Sales"?( <span>{task?.type} with {task?.contact?.first_name}{" "}
                      {task?.contact?.last_name} from {task?.company?.company_name} </span>):( <span>{task?.type} for {task?.boq} </span>)}
                         
                      
                      {/* <p className="text-xs inline-block text-muted-foreground p-0 m-0">
                        {formatTime12Hour(task.time)}
                    </p> */}
                    </div>
                    </div>
                    </span>
                    
                    <ChevronRight className="h-5 w-5" />
                  </div>
                    
                  {index < tasks.length - 1 &&  <Separator className="bg-black dark:bg-white" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    // The parent card uses flexbox to structure its children
    <Card className="flex flex-col h-full bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
      <CardHeader className="py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          {/* Dynamic task count badge */}
          <span className="bg-[#000399] dark:bg-primary h-7 w-7 flex items-center justify-center rounded-full text-white text-sm font-semibold">
            {tasks.length}
          </span>
          {title}
        </CardTitle>
      </CardHeader>

      {/* This is the key for scrolling: `flex-1` makes it take all available space, and `overflow-y-auto` enables the scrollbar when needed. */}
      <CardContent className="flex-1 overflow-y-auto p-2">
        {renderContent()}
      </CardContent>

      {/* The footer is fixed at the bottom of the card, it does not scroll. */}
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
