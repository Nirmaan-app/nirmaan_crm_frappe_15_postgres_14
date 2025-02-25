import { HomePageTasksAndTabs } from "@/components/helpers/homePagetasks&tabs";
import { AddNewButton } from "@/components/ui/AddNewButton";

export const MainContentDesktop = () => {

  const options = [
    {label : "New Contact", path : "/prospects/new-contact"},
    {label : "New Company", path : "/prospects/new-company"},
    {label : "New Project", path : "/projects/new"},
    {label : "New Task", path : "/tasks/new"},
  ]
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between relative">
        <h1 className="text-3xl">Welcome, User!</h1>
        <div className={`absolute top-0 right-0 z-30 flex flex-col items-end gap-2`}>
          <AddNewButton options={options} />
        </div>
      </div>
      <HomePageTasksAndTabs />
    </div>
  );

};