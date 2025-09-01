import React from "react";
import { useSearchParams } from "react-router-dom";
import { TasksTableByDate } from "./TaskCards";

export const DesktopRenderTasks : React.FC = () => {

  const [searchParams] = useSearchParams();
  const date = searchParams.get("date");

  if(date) {
    return <TasksTableByDate date={date} />
  }
  
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-muted-foreground border border-muted-foreground rounded-lg px-4 py-2 tracking-tight">
        SELECT A DAY TO SHOW ASSOCIATED TASKS
      </span>
    </div>
  )
}