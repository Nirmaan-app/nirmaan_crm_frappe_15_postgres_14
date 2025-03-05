import { CalendarFold, ClipboardList, FileUser, FolderKanban, House } from "lucide-react"

interface NavItem {
  label : string
  path : string
  icon : any
}

export const items : NavItem[] = [
  {
    label : "Home",
    path: "/",
    icon : House
  },
  {
    label : "Prospect",
    path: "/prospects",
    icon : FileUser
  },
  {
    label : "Projects",
    path: "/projects",
    icon: FolderKanban
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