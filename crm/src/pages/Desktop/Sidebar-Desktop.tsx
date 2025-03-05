import { items } from "@/constants/navItems";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export const SidebarDesktop = () => {

  const location = useLocation()

	const [activeTab, setActiveTab] = useState("Home")

	useEffect(() => {
		if(location.pathname === "/") {
			setActiveTab("Home")
		} else {
			setActiveTab(items.slice(1).find(i => location.pathname.includes(i.path))?.label)
		}
	}, [location.pathname])
  return (
    <nav className="flex flex-col gap-8">
      {items.map(item => (
        <NavLink to={item.path} key={item.label} className={`flex flex-col items-center ${activeTab === item.label ? "text-primary" : ""}`}>
          <item.icon className="h-[34px] w-[34px]" />
          <span className="text-xs font-semibold">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};