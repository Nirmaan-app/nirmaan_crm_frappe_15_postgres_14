// routesConfig.ts
import { TaskCalendar } from "@/pages/Calendar/Calendar";
import { MainContentDesktop } from "@/pages/Desktop/MainContent-Desktop";
import { AppLayout } from "@/pages/Layout/AppLayout";
import { HomePage } from "@/pages/Layout/HomePage";
import { DesktopProjectsView } from "@/pages/Projects/DesktopProjectsView";
import { NewProjectScreens } from "@/pages/Projects/NewProjectScreens";
import { Project } from "@/pages/Projects/Project";
import { Projects } from "@/pages/Projects/Projects";
import { Company } from "@/pages/Prospects/Companies/Company";
import { NewCompanyForm } from "@/pages/Prospects/Companies/New-Company-Form";
import { Contact } from "@/pages/Prospects/Contacts/Contact";
import { NewContactForm } from "@/pages/Prospects/Contacts/New-Contact-Form";
import { DesktopContactOrCompany } from "@/pages/Prospects/DesktopContactOrCompany";
import { Prospects } from "@/pages/Prospects/Prospects";
import { Settings } from "@/pages/Settings/Settings";
import { DesktopRenderTasks } from "@/pages/Tasks/DesktopRenderTasks";
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
          { index: true, element: <Prospects /> },
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
          { index: true, element: <DesktopProjectsView /> },
          { path: "new", element: <NewProjectScreens /> },
          // { path: "project", element: <Project /> },
        ],
      },
      {
        path: "prospects",
        children: [
          { index: true, element: <DesktopContactOrCompany /> },
          { path: "new-contact", element: <NewContactForm /> },
          { path: "new-company", element: <NewCompanyForm /> },
        ],
      },
      { path: "calendar", element: <DesktopRenderTasks /> },
      {
        path: "tasks",
        children: [
          { index: true, element: <DesktopRenderTasks /> },
          { path: "task", element: <Task /> },
          { path: "history", element: <TasksVariantPage variant="history" /> },
          { path: "pending", element: <TasksVariantPage variant="pending" /> },
          { path: "upcoming", element: <TasksVariantPage variant="upcoming" /> },
        ],
      },
    ],
  },
];
