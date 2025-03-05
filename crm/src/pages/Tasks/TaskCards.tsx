import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatTime12Hour } from "@/utils/FormatDate";
import { groupTasksByDate, Task } from "@/utils/groupTasksByDate";
import { getFilteredTasks } from "@/utils/taskutils";
import { addDays, format, subDays } from "date-fns";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, PlusIcon } from "lucide-react";
import React, { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

interface TasksCardsProps {
  tasks: Task[];
}

export const TasksCards: React.FC<TasksCardsProps> = ({ tasks }) => {
  const grouped = groupTasksByDate(tasks);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams()

  const date = searchParams.get("date")

  // Build an array of groups to render
  const groupsArr = [
    {
      key: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      label: "Yesterday",
      tasks: grouped.yesterday,
    },
    {
      key: format(new Date(), "yyyy-MM-dd"),
      label: "Today",
      tasks: grouped.today,
    },
    {
      key: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      label: "Tomorrow",
      tasks: grouped.tomorrow,
    },
    {
      key: format(addDays(new Date(), 2), "yyyy-MM-dd"),
      // Format as "DD MMM" (e.g., "05 Mar")
      label: format(addDays(new Date(), 2), "dd MMM"),
      tasks: grouped.dayAfterTomorrow,
    },
    {
      key: format(addDays(new Date(), 3), "yyyy-MM-dd"),
      label: format(addDays(new Date(), 3), "dd MMM"),
      tasks: grouped.twoDaysAfterTomorrow,
    },
  ];

  const handleNavigateToGroup = (groupKey: string) => {
    if(date === groupKey) return;
    navigate(`/tasks?date=${groupKey}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {groupsArr.map((group) => (
        <div
          key={group.key}
          role="button"
          aria-label={group.label}
          className={`flex items-center justify-between border cardBorder shadow rounded-lg p-6 w-full  ${date === group.key ? "bg-[#E6E6FA]" : ""}`}
          onClick={() => handleNavigateToGroup(group.key)}
        >
          <strong className="text-black dark:text-muted-foreground">{group.label}</strong>
          <span>{group.tasks.length}</span>
        </div>
      ))}
    </div>
  );
};


export const TasksTableByDate = ({ date} : { date : string}) => {

  const now = new Date();
  const navigate = useNavigate()

  const { toggleTaskDialog} = useApplicationContext()

  const location = useLocation()

  const yesterday = subDays(now, 1);

  const renderHeader = (count) => {
    if(date === format(yesterday, "yyyy-MM-dd")) {
      return `You Had ${count} Task(s) Yesterday!`
    } else {
      return `You Have ${count} Task(s) Scheduled!`
    }
  }

  const {data : tasks, isLoading: tasksLoading} = useFrappeGetDocList<CRMTask>("CRM Task", {
          fields: ["name", "start_date", "type", "status", "reference_docname"],
          limit: 1000
      }, "CRM Task")

  const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
          fields: ["first_name", "last_name", "name", "company"],
          limit: 10000
      }, "CRM Contacts")
  
  const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList<CRMCompany>("CRM Company", {
      fields: ["name", "company_name"],
      limit: 1000,
    }, "CRM Company")

  const filteredTasks = useMemo(() => getFilteredTasks(tasks, date, contactsList, companiesList), [tasks, contactsList, companiesList, date])

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">
        {renderHeader(filteredTasks?.length)}
      </h2>
          {location.pathname === "/calendar" && (
          <Button onClick={toggleTaskDialog} className="">
            <PlusIcon className="h-4 w-4" />
            New Task
          </Button>
          )}
        </div>
      <section className="p-4 border cardBorder shadow rounded-md">
          <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks?.length ? (
                  filteredTasks?.map(task => (
                      <TableRow key={task?.name}>
                        <TableCell className="font-bold text-primary underline">{task?.contact?.first_name}</TableCell>
                        <TableCell className="font-bold text-primary underline">{task?.company?.company_name}</TableCell>
                        <TableCell className="font-bold">{formatTime12Hour(task?.start_date?.split(" ")[1])}</TableCell>
                        <TableCell className="font-bold">{task?.type}</TableCell>
                        <TableCell className="font-bold">{task?.status || "--"}</TableCell>
                        <TableCell>
                          <div
                          role="button"
                          aria-label="Task"
                          onClick={() => navigate(`/tasks/task?id=${task?.name}`)}
                          className="flex items-center justify-center p-0.5 border rounded-md">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </TableCell>
                      </TableRow>
                  ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center py-2">
                          No Tasks Found
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
      </section>
    </div>
    )
  }
