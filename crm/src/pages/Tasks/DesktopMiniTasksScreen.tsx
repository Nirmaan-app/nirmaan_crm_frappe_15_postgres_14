import { useApplicationContext } from "@/contexts/ApplicationContext";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { History, Hourglass, Plus, SkipForward } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { TasksCards } from "./TaskCards";

export const DesktopMiniTasksScreen : React.FC = () => {
    const navigate = useNavigate();

    const {toggleTaskDialog} = useApplicationContext()

    const { data: tasksData, isLoading: tasksDataLoading } = useFrappeGetDocList<CRMTask>("CRM Task", {
        fields: ["*"],
        limit: 10000,
    }, "CRM Task");

    const cards = [
        { title: "History", icon: History, path: "/tasks/history" },
        { title: "Pending", icon: Hourglass, path: "/tasks/pending" },
        { title: "Upcoming", icon: SkipForward, path: "/tasks/upcoming" },
    ];

    return (
        <div className="px-3">
            {/* Navigation Cards */}
            <div className="grid grid-cols-3 gap-2 text-white border-b-2 cardBorder pb-4">
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
            <div className="mt-8 space-y-6 px-2">
                <h2 className="font-semibold text-xl">Tasks</h2>
                <button onClick={toggleTaskDialog} className="flex w-full items-center justify-center border border-primary rounded-lg p-6 text-primary">
                  <Plus className="w-4 h-4" />
                  <span className="">New Task</span>
                </button>
                
                <TasksCards tasks={tasksData || []} />
            </div>
        </div>
    );
};
