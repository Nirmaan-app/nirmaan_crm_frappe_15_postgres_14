import { CalendarFold, ClipboardList, House, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const SidebarDesktop = () => {

  const location = useLocation()

	const [activeTab, setActiveTab] = useState("Home")

	const items = [
		{
			label : "Home",
			path: "/",
			icon : House
		},
		{
			label : "Prospect",
			path: "/prospects",
			icon : Users
		},
		{
			label : "Tasks",
			path: "/tasks",
			icon: ClipboardList
		},
		{
			label : "Calendar",
			path: "/calendar",
			icon: CalendarFold
		},
	]

	useEffect(() => {
		if(location.pathname === "/") {
			setActiveTab("Home")
		} else {
			setActiveTab(items.slice(1).find(i => location.pathname.includes(i.path))?.label)
		}
	}, [location.pathname])
  return (
    <div className="flex flex-col gap-8">
      {items.map(item => (
        <div key={item.label} className={`flex flex-col items-center ${activeTab === item.label ? "text-primary" : ""}`}>
          <item.icon className="h-8 w-8" />
          <span className="text-xs font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );

};