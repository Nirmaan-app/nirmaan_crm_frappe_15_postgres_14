import { Separator } from "@/components/ui/separator";
import { useViewport } from "@/hooks/useViewPort";
import { formatCasualDate, formatTime12Hour } from "@/utils/FormatDate";
import { getFilteredTasks } from "@/utils/taskutils";
import { useFrappeGetDocCount, useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export const HomePageTasksAndTabs = () => {

  const navigate = useNavigate()

  const {isMobile} = useViewport()
  
    const { data: tasksData, isLoading: tasksDataLoading } = useFrappeGetDocList("CRM Task", {
        fields: ["*"],
        limit: 1000,
    }, "CRM Task");
    
    const {data : contactsList, isLoading: contactsListLoading} = useFrappeGetDocList("CRM Contacts", {
        fields: ["*"],
        limit: 10000
    }, "CRM Contacts")
    
    const {data : companiesList, isLoading: companiesListLoading} = useFrappeGetDocList("CRM Company", {
        fields: ["name", "company_name"],
        limit: 1000,
      }, "CRM Company")
    
    
    const {data : projectsCount, isLoading: projectsCountLoading} = useFrappeGetDocCount("CRM Projects")
    
    const today = new Date().toISOString().split("T")[0];
    
    const todayTasks = useMemo(() => getFilteredTasks(tasksData, today, contactsList, companiesList), [tasksData, contactsList, companiesList])
  return (
    <>

<div className="p-6 border-2 border-muted flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className={`${isMobile ? "text-sm" : ""} font-semibold dark:text-white`}>Today</p>
          <strong className="text-primary">{formatCasualDate(new Date())}</strong>
        </div>
          <ul className="my-2 space-y-2 text-sm">
              {todayTasks?.length ? (
                  todayTasks?.map((task, index, array) => {
                      const [, time] = task?.start_date?.split(" ");
                      return (
                        <>
                          <li 
                          // onClick={() => navigate(`/tasks/task?id=${task?.name}`)} 
                          key={task?.name} className="py-4 flex justify-between items-center">
                              <span>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(time)}</span>
                              {isMobile ? <ChevronRight /> : (
                                 <div className="flex gap-2 items-center">
                                  <Button variant={"green"}>Complete</Button>
                                  <Button>Incomplete</Button>
                                 </div>
                              )}
                          </li>
                          {array.length - 1 !== index && <Separator />}
                        </>
                      );
                  })
              ) : (
                  <p className="text-muted-foreground text-center">Empty!</p>
              )}
          </ul>
      </div>

      <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4 text-white font-light text-sm`}>
          <div
            role="button"
            aria-label="Prospects"
            onClick={() => navigate("/prospects")}
           className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Prospect Generated</p>
            <p className="font-normal text-base">{contactsList?.length}/{companiesList?.length}</p>
          </div>
           <div
           role="button"
           aria-label="Projects"
           onClick={() => navigate("/projects")}
            className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Projects</p>
            <p className="font-normal text-base">{projectsCount}</p>
          </div>
           <div className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Follow-Up Pending</p>
            <p className="font-normal text-base">11</p>
          </div>
           <div className="h-24 bg-primary rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Updates Pending</p>
            <p className="font-normal text-base">20</p>
          </div>
      </div>

    </>
  )
}