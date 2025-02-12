import { CalendarFold, ClipboardList, House, Settings, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"

export const BottomBar = () => {

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
		{
			label : "Settings",
			path: "/settings",
			icon: Settings
		}
	]

	useEffect(() => {
		if(location.pathname === "/") {
			setActiveTab("Home")
		} else {
			setActiveTab(items.slice(1).find(i => location.pathname.includes(i.path))?.label)
		}
	}, [location.pathname])


	return (
		<nav className="fixed bottom-0 left-0 w-full bg-bottombarbackground shadow-black shadow-md p-2 flex justify-between items-center z-10">
			{items.map(item => (
				<NavLink key={item.path} to={item.path} className={`p-2 flex flex-col items-center justify-center text-sm ${activeTab === item.label ? "text-destructive" : ""}`}>
					<item.icon /> 
					{item.label}
				</NavLink>
			))}
		</nav>
	)
}