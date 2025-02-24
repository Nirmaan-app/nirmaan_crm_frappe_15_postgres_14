import { formatDate, formatTime12Hour } from "@/utils/FormatDate";
import { getFilteredTasks } from "@/utils/taskutils";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, History, Hourglass, Plus, SkipForward } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const Tasks = () => {
    const navigate = useNavigate();

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

    const cards = [
        { title: "History", icon: History, path: "/tasks/history" },
        { title: "Pending", icon: Hourglass, path: "/tasks/pending" },
        { title: "Upcoming", icon: SkipForward, path: "/tasks/upcoming" },
    ];

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const todayTasks = useMemo(() => getFilteredTasks(tasksData, today, contactsList, companiesList), [tasksData, contactsList, companiesList])

    const tomorrowTasks = useMemo(() => getFilteredTasks(tasksData, tomorrowDate, contactsList, companiesList), [tasksData, contactsList, companiesList])

    // useEffect(() => {
    //     if(tasksData && contactsList && companiesList) {
    //         const todayTasks =   getFilteredTasks(tasksData, today, contactsList, companiesList)
    //         const tomorrowTasks = getFilteredTasks(tasksData, tomorrowDate, contactsList, companiesList)
    //         setTodayTasks(todayTasks)
    //         setTomorrowTasks(tomorrowTasks)
    //     }
    // }, [tasksData, contactsList, companiesList])

    

    // const todayTasks = tasksData
    //     ?.filter((task) => task.start_date.startsWith(today))
    //     .sort((a, b) => a.start_date.localeCompare(b.start_date));

    // const tomorrowTasks = tasksData
    //     ?.filter((task) => task.start_date.startsWith(tomorrowDate))
    //     .sort((a, b) => a.start_date.localeCompare(b.start_date));

    return (
        <div>
            {/* Navigation Cards */}
            <div className="grid grid-cols-3 gap-2 text-white">
                {cards.map((card) => (
                    <div
                        onClick={() => navigate(card.path)}
                        className="h-[90px] bg-destructive rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer"
                        key={card.title}
                    >
                        <card.icon />
                        <p>{card.title}</p>
                    </div>
                ))}
            </div>

            {/* Tasks Sections */}
            <div className="mt-8 space-y-6">
                {/* Today's Tasks */}
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Today's</h2>
                        <p className="text-sm">{formatDate(new Date())}</p>
                    </div>
                    <ul className="mt-4 space-y-2">
                        {todayTasks?.length ? (
                            todayTasks?.map((task) => {
                                const [, time] = task?.start_date?.split(" ");
                                return (
                                    <li onClick={() => navigate(`task?id=${task?.name}`)} key={task?.name} className="p-2 border-b rounded-md flex justify-between items-center text-sm">
                                        <span>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(time)}</span>
                                        <ChevronRight />
                                    </li>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground text-center border-b pb-4">Empty!</p>
                        )}
                    </ul>
                </div>

                {/* Tomorrow's Tasks */}
                <div>
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Tomorrow's</h2>
                        <p className="text-sm">{formatDate(tomorrow)}</p>
                    </div>
                    <ul className="mt-4 space-y-2">
                        {tomorrowTasks?.length ? (
                            tomorrowTasks.map((task) => {
                                const [, time] = task.start_date.split(" ");
                                return (
                                    <li onClick={() => navigate(`task?id=${task?.name}`)} key={task?.name} className="p-2 border-b rounded-md flex justify-between items-center text-sm">
                                        <span>{task?.type} {task?.contact?.first_name} {task?.contact?.last_name} from {task?.company?.company_name} at {formatTime12Hour(time)}</span>
                                        <ChevronRight />
                                    </li>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground text-center border-b pb-4">Empty!</p>
                        )}
                    </ul>
                </div>
            </div>
            <div className="fixed bottom-24 right-6">
              <button
                onClick={() => navigate("/tasks/new")}
                className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center`}
              >
                <Plus size={24} />
              </button>
            </div>

        </div>
    );
};
