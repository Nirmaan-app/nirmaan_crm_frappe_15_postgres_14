import { ArrowLeft, Bell } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom";

export const NavBar = () => {

	const location = useLocation();

	const navigate = useNavigate()

	const items = [
		{
			label : "Prospects",
			path: "/prospect",
		},
		{
			label : "Tasks",
			path: "/tasks",
		},
		{
			label : "Calendar",
			path: "/calendar",
		},
		{
			label : "Settings",
			path: "/settings",
		}
	]
	return (
		<>
		
		{location.pathname === "/" ? (
			<nav className="fixed top-0 left-0 w-full bg-navbarbackground shadow p-4 flex justify-between items-center z-10">
				<h1 className="text-xl text-destructive font-semibold">Nirmaan CRM</h1>
				<Bell />
			</nav>
		) : (
			<nav className="fixed top-0 left-0 w-full bg-navbarbackground dark:text-white shadow p-4 z-10 grid grid-cols-3">
				<ArrowLeft onClick={() => navigate(-1)} />
				<h2 className="text-center font-semibold">{items.find(i => i.path === location.pathname)?.label}</h2>
			</nav>
		)}
		</>
	)
}