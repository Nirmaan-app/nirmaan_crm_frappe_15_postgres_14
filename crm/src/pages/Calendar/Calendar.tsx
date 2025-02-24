import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime12Hour } from "@/utils/FormatDate";
import { useFrappeGetDocList } from "frappe-react-sdk";
import React, { useEffect } from "react";

export const TaskCalendar = () => {

  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const [tasksData, setTasksData] = React.useState<any>([]);

  const {data, isLoading} = useFrappeGetDocList("CRM Task", {
    fields: ["*"],
    limit: 100000
  }, 'CRM Task')

  const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList("CRM Contacts", {
    fields: ["*"],
    limit: 10000
}, "CRM Contacts")

const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList("CRM Company", {
    fields: ["name", "company_name"],
    limit: 1000,
  }, "CRM Company")

useEffect(() => {
    if(data && contactsList && companiesList) {
        const sortedTasks = data
        ?.sort((a, b) => a?.start_date?.localeCompare(b?.start_date))
        ?.map((t) => ({...t, contact: contactsList?.find(c => c.name === t.reference_docname)}))
        ?.map((k) => ({...k, company: companiesList?.find(c => c.name === k.contact?.company)}))
        setTasksData(sortedTasks)
    }
}, [data, contactsList, companiesList])

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

  const isTaskDate = React.useCallback((date: Date) => {
    const dStr = date.toISOString().split("T")[0];
    return tasksDatesSet.has(dStr);
  }, [tasksDatesSet]);

 
  return (
    <div>
    <Calendar
        mode="single"
        showOutsideDays={false}
        timeZone="Asia/Calcutta"
        className="min-w-full"
        selected={selectedDate}
        onDayClick={(day) => setSelectedDate(day.toISOString().split("T")[0])}
        modifiers={{ hasTask: isTaskDate }}
        modifiersClassNames={{ hasTask: "border-b-2 pb-2 border-[#000399] dark:text-primary text-[#000399]" }}
     />
     <Card className="bg-[#0003CB1A] dark:bg-background text-[#000399] dark:text-primary dark:border-foreground">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="text-sm font-medium">
         {
          selectedDate && tasksDatesSet?.has(selectedDate) ? (
            <div className="flex flex-col gap-2">
              {tasksData?.filter(task => task?.start_date?.split(" ")[0] === selectedDate).map(task => (
                <span key={task?.name}>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(task?.start_date?.split(" ")[1])}</span>
              ))}
            </div>
          ) : (
            (selectedDate && !tasksDatesSet?.has(selectedDate)) ? (
              <span>No tasks for {selectedDate}</span>
            ) :
            <span>Select a Date to display tasks</span>
          )
         }
        </CardContent>
     </Card>
      </div>
  )
}