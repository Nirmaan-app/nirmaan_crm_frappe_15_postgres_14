import { HomePageTasksAndTabs } from "@/components/helpers/homePagetasks&tabs";
import { AddNewButton } from "@/components/ui/AddNewButton";
import { Input } from "@/components/ui/input";

export const HomePage = () => {

const options = [
  {label : "New Contact", path : "/contacts/new-contact"},
  {label : "New Company", path : "/companies/new-company"},
  {label : "New Project", path : "/boqs/new"},
  {label : "New Task", path : "/tasks/new"},
]

  return (
    <div className="flex flex-col gap-4 h-full relative pt-2">
      <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
      <h3 className="text-lg font-semibold text-center dark:text-white">Welcome, User!</h3>
      <HomePageTasksAndTabs />
      <div className="fixed bottom-24 z-30 right-6 flex flex-col items-end gap-4">
        <AddNewButton options={options} />
      </div>
    </div>
  );
};
