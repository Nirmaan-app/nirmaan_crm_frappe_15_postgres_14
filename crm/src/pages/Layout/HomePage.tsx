import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { formatCasualDate } from "@/utils/FormatDate";
import { getFilteredTasks } from "@/utils/taskutils";
import { useFrappeGetDocCount, useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Plus, X } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime12Hour } from "../../utils/FormatDate";

export const HomePage = () => {
  const { setOverlayOpen, overlayOpen } = useApplicationContext()

  const navigate = useNavigate()

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

const options = [
  {label : "New Contact", path : "/prospects/new-contact"},
  {label : "New Company", path : "/prospects/new-company"},
  {label : "New Project", path : "/projects/new"},
  {label : "New Task", path : "/tasks/new"},
]

  return (
    <div className="flex flex-col gap-4 h-full relative pt-2">
      <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
      <h3 className="text-lg font-semibold text-center dark:text-white">Welcome, User!</h3>
      <div className="p-6 border-2 border-muted flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold dark:text-white">Today</p>
          <strong className="text-destructive">{formatCasualDate(new Date())}</strong>
        </div>
          <ul className="my-2 space-y-2 text-sm">
              {todayTasks?.length ? (
                  todayTasks?.map((task, index, array) => {
                      const [, time] = task?.start_date?.split(" ");
                      return (
                        <>
                          <li onClick={() => navigate(`/tasks/task?id=${task?.name}`)} key={task?.name} className="py-4 flex justify-between items-center">
                              <span>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(time)}</span>
                              <ChevronRight />
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

      <div className="grid grid-cols-2 gap-4 text-white font-light text-sm">
          <div
            role="button"
            aria-label="Prospects"
            onClick={() => navigate("/prospects")}
           className="h-20 bg-destructive rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Prospect Generated</p>
            <p className="font-normal text-base">{contactsList?.length}/{companiesList?.length}</p>
          </div>
           <div
           role="button"
           aria-label="Projects"
           onClick={() => navigate("/projects")}
            className="h-20 bg-destructive rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Projects</p>
            <p className="font-normal text-base">{projectsCount}</p>
          </div>
           <div className="h-20 bg-destructive rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Follow-Up Pending</p>
            <p className="font-normal text-base">11</p>
          </div>
           <div className="h-20 bg-destructive rounded-lg p-4 flex flex-col items-center justify-center">
            <p>Updates Pending</p>
            <p className="font-normal text-base">20</p>
          </div>
      </div>

      <div className="fixed bottom-24 z-30 right-6 flex flex-col items-end gap-4">
        {overlayOpen && (
          <div
            className="p-4 bg-destructive text-white shadow-lg rounded-lg flex flex-col gap-2"
            style={{ transition: "opacity 0.3s ease-in-out" }}
          >
            {options.map((option, index, arr) => (
              <>
                <button onClick={() => {
                  navigate(option.path)
                  setOverlayOpen(false)
                }}>{option.label}</button>
                {index !== arr.length - 1 && <Separator />}
              </>
            ))}
          </div>
        )}
        <button
          onClick={() => setOverlayOpen(!overlayOpen)}
          className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 ${
            overlayOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          {overlayOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </div>
  );
};
