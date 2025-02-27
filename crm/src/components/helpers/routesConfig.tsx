// routesConfig.ts
import { TaskCalendar } from "@/pages/Calendar/Calendar";
import { MainContentDesktop } from "@/pages/Desktop/MainContent-Desktop";
import { AppLayout } from "@/pages/Layout/AppLayout";
import { HomePage } from "@/pages/Layout/HomePage";
import { NewProjectScreens } from "@/pages/Projects/NewProjectScreens";
import { Project } from "@/pages/Projects/Project";
import { Projects } from "@/pages/Projects/Projects";
import { Company } from "@/pages/Prospect/Companies/Company";
import { NewCompanyForm } from "@/pages/Prospect/Companies/New-Company-Form";
import { Contact } from "@/pages/Prospect/Contacts/Contact";
import { NewContactForm } from "@/pages/Prospect/Contacts/New-Contact-Form";
import { Prospect } from "@/pages/Prospect/Prospect";
import { Settings } from "@/pages/Settings/Settings";
import { Task } from "@/pages/Tasks/Task";
import { NewTaskForm } from "@/pages/Tasks/TaskDialogs";
import { Tasks } from "@/pages/Tasks/Tasks";
import { TasksVariantPage } from "@/pages/Tasks/TasksVariantPage";

// Mobile route configuration
export const mobileRoutes = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "prospects",
        children: [
          { index: true, element: <Prospect /> },
          { path: "new-contact", element: <NewContactForm /> },
          { path: "new-company", element: <NewCompanyForm /> },
          { path: "contact", element: <Contact /> },
          { path: "company", element: <Company /> },
        ],
      },
      { path: "calendar", element: <TaskCalendar /> },
      { path: "settings", element: <Settings /> },
      {
        path: "tasks",
        children: [
          { index: true, element: <Tasks /> },
          { path: "new", element: <NewTaskForm /> },
          { path: "task", element: <Task /> },
          { path: "history", element: <TasksVariantPage variant="history" /> },
          { path: "pending", element: <TasksVariantPage variant="pending" /> },
          { path: "upcoming", element: <TasksVariantPage variant="upcoming" /> },
        ],
      },
      {
        path: "projects",
        children: [
          { index: true, element: <Projects /> },
          { path: "new", element: <NewProjectScreens /> },
          { path: "project", element: <Project /> },
        ],
      },
    ],
  },
];

// Desktop route configuration
export const desktopRoutes = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <MainContentDesktop /> },
      {
        path: "projects",
        children: [
          { index: true, element: <Projects /> },
          { path: "new", element: <NewProjectScreens /> },
          { path: "project", element: <Project /> },
        ],
      },
    ],
  },
];
