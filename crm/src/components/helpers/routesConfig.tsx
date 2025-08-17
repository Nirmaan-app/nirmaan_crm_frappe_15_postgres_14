// src/components/helpers/routesConfig.tsx
import { AppLayout } from "@/pages/Layout/AppLayout";
import { HomePage } from "@/pages/Layout/HomePage";
import { Settings } from "@/pages/Settings/Settings";
import { TaskCalendar } from "@/pages/Calendar/Calendar";
import { Companies } from "@/pages/Companies/Companies";
import { Company } from "@/pages/Companies/Company";
import { Contacts } from "@/pages/Contacts/Contacts";
import { Contact } from "@/pages/Contacts/Contact";
import { BOQs } from "@/pages/BOQS/BOQs";
import { BOQ } from "@/pages/BOQS/BOQ";
import { Tasks } from "@/pages/Tasks/Tasks";
import { Task } from "@/pages/Tasks/Task";
import { TasksVariantPage } from "@/pages/Tasks/TasksVariantPage";

export const appRoutes = [
  {
    path: "/",
    element: <AppLayout />, // The single, stable layout for all routes
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "companies",
        children: [
          { index: true, element: <Companies /> },
          { path: "company", element: <Company /> },
        ],
      },
      {
        path: "contacts",
        children: [
          { index: true, element: <Contacts /> },
          { path: "contact", element: <Contact /> },
        ],
      },
      {
        path: "boqs",
        children: [
          { index: true, element: <BOQs /> },
          { path: "boq", element: <BOQ /> },
        ],
      },
      { path: "calendar", element: <TaskCalendar /> },
      { path: "settings", element: <Settings /> },
      {
        path: "tasks",
        children: [
          { index: true, element: <Tasks /> },
          { path: "task", element: <Task /> },
          { path: "all", element: <TasksVariantPage variant="all" /> },
          { path: "pending", element: <TasksVariantPage variant="pending" /> },
          { path: "upcoming", element: <TasksVariantPage variant="upcoming" /> },
        ],
      },
    ],
  },
];