import { ArrowLeft, Bell } from "lucide-react";
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
		},
		{
			label : "Tasks History",
			path: "/tasks/history",
		},
		{
			label : "Pending Tasks",
			path: "/tasks/pending",
		},
		{
			label : "Upcoming Tasks",
			path: "/tasks/upcoming",
		},
		{
			label : "Projects",
			path: "/projects",
		},
		{
			label : "New Project",
			path: "/projects/new",
		},
		{
			label : "Project",
			path: "/projects/project",
		},
	]
	return (
		<nav className="fixed top-0 left-0 w-full bg-navbarbackground shadow px-4 py-3 z-10">
		{location.pathname === "/" ? (
			<div className="flex justify-between items-center">
				<h1 className="text-xl text-primary font-semibold">Nirmaan CRM</h1>
				<Bell />
			</div>
		) : ["/prospects", "/tasks", "/calendar", "/settings"].includes(location.pathname) ? (
			<div className="dark:text-white">
				<h2 className="text-center font-semibold">{items.find(i => location.pathname.includes(i.path))?.label}</h2>
			</div>
		) : (
			<div className="dark:text-white relative">
				<ArrowLeft className="cursor-pointer absolute left-0 top-1/2 transform -translate-y-1/2 " onClick={() => navigate(-1)} />
				<h2 className="font-semibold text-center">{items.find(i => i.path === location.pathname)?.label}</h2>
			</div>
		)}
		</nav>
	)
}