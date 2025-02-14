import { ArrowLeft, Bell } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom";

export const NavBar = () => {

	const location = useLocation();

	const navigate = useNavigate()

	const items = [
		{
			label : "Prospects",
			path: "/prospects",
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
		},
		{
			label : "Contact",
			path: "/prospects/new-contact",
		},
		{
			label : "Company",
			path: "/prospects/new-company",
		},
		{
			label : "Contact",
			path: "/prospects/contact",
		},
		{
			label : "Company",
			path: "/prospects/company",
		},
		{
			label : "New Task",
			path: "/tasks/new",
		},
		{
			label : "Task",
			path: "/tasks/task",
		}
	]
	return (
		<nav className="fixed top-0 left-0 w-full bg-navbarbackground shadow px-4 py-2 z-10">
		{location.pathname === "/" ? (
			<div className="flex justify-between items-center">
				<h1 className="text-xl text-destructive font-semibold">Nirmaan CRM</h1>
				<Bell />
			</div>
		) : ["/prospects", "/tasks", "/calendar", "/settings"].includes(location.pathname) ? (
			<div className="dark:text-white">
				<h2 className="text-center font-semibold">{items.find(i => location.pathname.includes(i.path))?.label}</h2>
			</div>
		) : (
			<div className="dark:text-white grid grid-cols-3 items-center">
				<ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
				<h2 className="text-center font-semibold">{items.find(i => i.path === location.pathname)?.label}</h2>
			</div>
		)}
		</nav>
	)
}