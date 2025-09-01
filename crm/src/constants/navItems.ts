// src/constants/navItems.ts
import { 
    CalendarFold, 
    ClipboardList, 
    House, 
    Building2,  // New icon for Company
    User,
    Users,        // New icon for Contact
    GanttChartSquare // New icon for BOQs
} from "lucide-react"

interface NavItem {
  label : string
  path : string
  icon : any
    adminOnly?: boolean
}

// The new navigation structure
export const items : NavItem[] = [
  {
    label : "Home",
    path: "/",
    icon : House
  },
  {
    label: "My Team",
    path: "/team",
    icon: Users,
    adminOnly: true // This is our flag for role-based rendering
  },
  {
    label : "Company", // NEW
    path: "/companies",
    icon : Building2
  },
  {
    label : "Contact", // NEW
    path: "/contacts",
    icon: User
  },
  {
    label : "BOQs", // REPLACED Project
    path: "/boqs",
    icon: GanttChartSquare
  },
  {
    label : "Tasks",
    path: "/tasks",
    icon: ClipboardList
  },
  // {
  //   label : "Calendar",
  //   path: "/calendar",
  //   icon: CalendarFold
  // },
]

// import { CalendarFold,Building2, ClipboardList, FileUser, FolderKanban, House } from "lucide-react"

// interface NavItem {
//   label : string
//   path : string
//   icon : any
// }

// export const items : NavItem[] = [
//   {
//     label : "Home",
//     path: "/",
//     icon : House
//   },
//   {
//     label : "Company",
//     path: "/company",
//     icon: Building2
//   },
//   {
//     label : "Contacts",
//     path: "/contacts",
//     icon : FileUser
//   },
//   {
//     label : "Projects",
//     path: "/projects",
//     icon: FolderKanban
//   },
//   {
//     label : "Tasks",
//     path: "/tasks",
//     icon: ClipboardList
//   },
//   {
//     label : "Calendar",
//     path: "/calendar",
//     icon: CalendarFold
//   },
// ]