import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime12Hour } from "@/utils/FormatDate";

import { format } from "date-fns";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useViewport } from "@/hooks/useViewPort"; // 1. IMPORT THE HOOK

export const TaskCalendar = () => {
  const { isMobile } = useViewport(); // 2. GET THE MOBILE STATE
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
    "all-tasks-calender"
  );

  const { data: contactsList, isLoading: contactsListLoading } =
    useFrappeGetDocList(
      "CRM Contacts",
      {
        fields: ["*"],
        limit: 10000,
      },
      "all-contacts-calender"
    );

  const { data: companiesList, isLoading: companiesListLoading } =
    useFrappeGetDocList(
      "CRM Company",
      {
        fields: ["name", "company_name"],
        limit: 1000,
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
  return isMobile ? (
    // ===================================
    // MOBILE LAYOUT (Your original code)
    // ===================================
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
       <div className="flex-1 flex flex-col mt-4">
      <Card className="h-full flex flex-col bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
          <CardHeader className="py-4">
            <CardTitle className="text-lg text-center border-bottom">Tasks for {selectedDate ? format(new Date(selectedDate), 'MMM dd') : '...'} -<span className="bg-red border-rounded">{ filteredTasks.length}</span></CardTitle>
          </CardHeader>
          
           <CardContent className="flex-1 overflow-y-auto text-sm font-medium p-2">
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
                    <p className="text-xs inline-block text-muted-foreground p-0 m-0">
                        {formatTime12Hour(task.time)}
                    </p>
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
      </div>
      
      {/* <Card className="flex-1 flex flex-col mt-4 bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
       
      </Card> */}
      <div className="py-4 bg-background border-t ">
        <Button
          className="w-full bg-destructive"
          onClick={() => openNewTaskDialog({})}
        >
          Add New Task
        </Button>
      </div>
    </div>
  ) : (
    // ===================================
    // DESKTOP LAYOUT (New two-column structure)
    // ===================================
    <div className="flex gap-6 p-6 h-[calc(100vh-var(--navbar-height)-80px)]">
      {/* Left Column */}
      <div className="w-[580px] flex flex-col gap-6">
      
        
          <Calendar
            mode="single"
            showOutsideDays={false}
            timeZone="Asia/Calcutta"
         className="min-w-full full-width-calendar" 
            selected={selectedDate}
            onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
            modifiers={{ hasTask: isTaskDate }}
            modifiersClassNames={{
              hasTask:
                "border-b border-[#000399] dark:border-primary dark:text-primary text-[#000399]",
            }}
          />
       
      </div>

      {/* Right Column */}
      <div className="flex-1">
        <Card className="h-full flex flex-col bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-medium flex-1 overflow-y-auto">
            {selectedDate && tasksDatesSet?.has(selectedDate) ? (
              <div className="flex flex-col gap-2">
                {filteredTasks.map((task, index) => (
                  <React.Fragment key={task.name}>
                    <div
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md"
                      onClick={() => navigate(`/tasks?id=${task.name}`)} // Navigate to update master-detail view
                    >
                      <span>
                        {task?.type} {task?.contact?.first_name}{" "}
                        {task?.contact?.last_name} from {task?.company?.company_name}
                      </span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    {index < filteredTasks.length - 1 && <Separator className="bg-black dark:bg-white" />}
                  </React.Fragment>
                ))}
              </div>
            ) : selectedDate && !tasksDatesSet?.has(selectedDate) ? (
              <div className="flex h-full items-center justify-center">
                <span>No tasks for {selectedDate}</span>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                 <span>Select a Date to display tasks</span>
              </div>
            )}
             <Button
          className="w-full bg-destructive"
          onClick={() => openNewTaskDialog({})}
        >
          Add New Task
        </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


// import { Calendar } from "@/components/ui/calendar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { formatTime12Hour } from "@/utils/FormatDate";
// import { format } from "date-fns";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import React, { useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
// import { useDialogStore } from "@/store/dialogStore";
// import { ChevronRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export const TaskCalendar = () => {
//   const [searchParams] = useSearchParams();
//   const [selectedDate, setSelectedDate] = React.useState<string | null>(
//     searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
//   );
//   const { openNewTaskDialog } = useDialogStore();
//   const navigate = useNavigate();

//   const [tasksData, setTasksData] = React.useState<any>([]);

//   const { data, isLoading } = useFrappeGetDocList(
//     "CRM Task",
//     {
//       fields: ["*"],
//       limit: 100000,
//     },
//     "CRM Task"
//   );

//   const { data: contactsList, isLoading: contactsListLoading } =
//     useFrappeGetDocList(
//       "CRM Contacts",
//       {
//         fields: ["*"],
//         limit: 10000,
//       },
//       "CRM Contacts"
//     );

//   const { data: companiesList, isLoading: companiesListLoading } =
//     useFrappeGetDocList(
//       "CRM Company",
//       {
//         fields: ["name", "company_name"],
//         limit: 1000,
//       },
//       "CRM Company"
//     );

//   useEffect(() => {
//     if (data && contactsList && companiesList) {
//       const sortedTasks = data
//         ?.sort((a, b) => a?.start_date?.localeCompare(b?.start_date))
//         ?.map((t) => ({
//           ...t,
//           contact: contactsList?.find((c) => c.name === t.contact),
//         }))
//         ?.map((k) => ({
//           ...k,
//           company: companiesList?.find((c) => c.name === k.contact?.company),
//         }));
//       setTasksData(sortedTasks);
//     }
//   }, [data, contactsList, companiesList]);

//   const tasksDatesSet = React.useMemo(() => {
//     const set = new Set<string>();
//     if (data) {
//       data.forEach((task) => {
//         const datePart = task.start_date.split(" ")[0];
//         set.add(datePart);
//       });
//     }
//     return set;
//   }, [data]);

//   const isTaskDate = React.useCallback(
//     (date: Date) => {
//       const dStr = format(date, "yyyy-MM-dd");
//       return tasksDatesSet.has(dStr);
//     },
//     [tasksDatesSet]
//   );

//   const updateURL = (key, value) => {
//     const url = new URL(window.location);
//     url.searchParams.set(key, value);
//     window.history.pushState({}, "", url);
//   };

//   const handleDateChange = (date) => {
//     if (searchParams.get("date") === date) return;
//     updateURL("date", date);
//     setSelectedDate(date);
//   };

//   console.log("tasksDataCalender", tasksData);

//   const filteredTasks = tasksData?.filter(
//     (task) => task?.start_date?.split(" ")[0] === selectedDate
//   );

//   return (
//     <div>
//       <Calendar
//         mode="single"
//         showOutsideDays={false}
//         timeZone="Asia/Calcutta"
//         className="min-w-full"
//         selected={selectedDate}
//         onDayClick={(day) => handleDateChange(format(day, "yyyy-MM-dd"))}
//         modifiers={{ hasTask: isTaskDate }}
//         modifiersClassNames={{
//           hasTask:
//             "border-b border-[#000399] dark:border-primary dark:text-primary text-[#000399]",
//         }}
//       />
//       <Card className="bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
//         <CardHeader>
//           <CardTitle>Tasks</CardTitle>
//         </CardHeader>
//         <CardContent className="text-sm font-medium">
//           {selectedDate && tasksDatesSet?.has(selectedDate) ? (
//             <div className="flex flex-col gap-2">
//               {filteredTasks.map((task, index) => (
//                 <React.Fragment key={task.name}>
//                   <div
//                     className="flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-md"
//                     onClick={() => navigate(`/tasks/task?id=${task.name}`)}
//                   >
//                     <span>
//                       {task?.type} {task?.contact?.first_name}{" "}
//                       {task?.contact?.last_name} from {task?.company?.company_name}
//                     </span>
//                     <ChevronRight className="h-5 w-5" />
//                   </div>
//                   {index < filteredTasks.length - 1 &&  <Separator className="bg-black dark:bg-white" />}
//                 </React.Fragment>
//               ))}
//             </div>
//           ) : selectedDate && !tasksDatesSet?.has(selectedDate) ? (
//             <span>No tasks for {selectedDate}</span>
//           ) : (
//             <span>Select a Date to display tasks</span>
//           )}
//         </CardContent>
//       </Card>
//       <div className="sticky bottom-0 py-4 bg-background mt-auto">
//         <Button
//           className="w-full bg-destructive"
//           onClick={() => openNewTaskDialog({})}
//         >
//           Add New Task
//         </Button>
//       </div>
//     </div>
//   );
// };