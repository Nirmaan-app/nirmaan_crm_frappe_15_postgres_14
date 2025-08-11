
// src/routesConfig.ts

// --- Layouts and Shared Pages ---
import { MainContentDesktop } from "@/pages/Desktop/MainContent-Desktop";
import { AppLayout } from "@/pages/Layout/AppLayout";
import { MobileLayout } from "@/pages/Layout/MobileLayout"; // Using the new mobile home page
import { Settings } from "@/pages/Settings/Settings";
import { TaskCalendar } from "@/pages/Calendar/Calendar";
import { HomePage } from "@/pages/Layout/HomePage";
// --- Company Pages (Moved from Prospects) ---
import { Companies } from "@/pages/Companies/Companies";
import { Company } from "@/pages/Companies/Company";
import { NewCompanyForm } from "@/pages/Companies/New-Company-Form";

// --- Contact Pages (Moved from Prospects) ---
import { Contacts } from "@/pages/Contacts/Contacts";
import { Contact } from "@/pages/Contacts/Contact";
import { NewContactForm } from "@/pages/Contacts/New-Contact-Form";

// --- BOQ Pages (Replaced Projects) ---
import { BOQs } from "@/pages/BOQs/BOQs"; // Renamed from Projects
import { BOQ } from "@/pages/BOQs/BOQ"; // Renamed from Project
import { NewBOQScreen } from "@/pages/BOQs/NewBOQScreen"; // Renamed from NewProjectScreens
import { DesktopBOQsView } from "@/pages/BOQs/DesktopBOQsView"; // Renamed from DesktopProjectsView

// --- Task Pages (Unchanged) ---
import { Tasks } from "@/pages/Tasks/Tasks";
import { Task } from "@/pages/Tasks/Task";
import { NewTaskForm } from "@/pages/Tasks/TaskDialogs";
import { TasksVariantPage } from "@/pages/Tasks/TasksVariantPage";
import { DesktopRenderTasks } from "@/pages/Tasks/DesktopRenderTasks";

// --- REMOVED COMPONENTS (No longer needed) ---
// import { Prospects } from "@/pages/Prospects/Prospects";
// import { DesktopContactOrCompany } from "@/pages/Prospects/DesktopContactOrCompany";

// ===================================================================
// Mobile Route Configuration
// ===================================================================
export const mobileRoutes = [
  {
    path: "/",
    element: <MobileLayout />, // This should use the MobileLayout internally based on useViewport
    children: [
      { index: true, element: <HomePage /> },

      // NEW Company route object
      {
        path: "companies",
        children: [
          { index: true, element: <Companies /> },
          { path: "new-company", element: <NewCompanyForm /> },
          { path: "company", element: <Company /> }, // Detail view
        ],
      },

      // NEW Contact route object
      {
        path: "contacts",
        children: [
          { index: true, element: <Contacts /> },
          { path: "new-contact", element: <NewContactForm /> },
          { path: "contact", element: <Contact /> }, // Detail view
        ],
      },
      
      // NEW BOQ route object (replaces projects)
      {
        path: "boqs",
        children: [
          { index: true, element: <BOQs /> },
          { path: "new", element: <NewBOQScreen /> },
          { path: "boq", element: <BOQ /> }, // Detail view
        ],
      },

      // REMOVED: The entire "/prospects" object is gone.
      
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
    ],
  },
];


// ===================================================================
// Desktop Route Configuration
// ===================================================================
export const desktopRoutes = [
  {
    path: "/",
    element: <AppLayout />, // This should use the DesktopLayout internally based on useViewport
    children: [
      { index: true, element: <MainContentDesktop /> },

      // NEW Top-level routes for Company and Contact.
      // The components themselves will handle the master-detail view using URL params.
      { path: "companies", element: <Companies /> },
      { path: "companies/new-company", element: <NewCompanyForm /> },
      { path: "contacts", element: <Contacts /> },
      { path: "contacts/new-contact", element: <NewContactForm /> },

      // NEW BOQ route object (replaces projects)
      {
        path: "boqs",
        children: [
          { index: true, element: <DesktopBOQsView /> },
          { path: "new", element: <NewBOQScreen /> },
          // The detail view for a single BOQ can be handled within DesktopBOQsView via URL param
        ],
      },
      
      // REMOVED: The "/prospects" object is gone.
      // The DesktopContactOrCompany component is obsolete.

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

// // routesConfig.ts
// import { TaskCalendar } from "@/pages/Calendar/Calendar";
// import { MainContentDesktop } from "@/pages/Desktop/MainContent-Desktop";
// import { AppLayout } from "@/pages/Layout/AppLayout";
// import { HomePage } from "@/pages/Layout/HomePage";
// import { DesktopProjectsView } from "@/pages/Projects/DesktopProjectsView";
// import { NewProjectScreens } from "@/pages/Projects/NewProjectScreens";
// import { Project } from "@/pages/Projects/Project";
// import { Projects } from "@/pages/Projects/Projects";
// import { Company } from "@/pages/Prospects/Companies/Company";
// import { NewCompanyForm } from "@/pages/Prospects/Companies/New-Company-Form";
// import { Contact } from "@/pages/Prospects/Contacts/Contact";
// import { NewContactForm } from "@/pages/Prospects/Contacts/New-Contact-Form";
// import { DesktopContactOrCompany } from "@/pages/Prospects/DesktopContactOrCompany";
// import { Prospects } from "@/pages/Prospects/Prospects";
// import { Settings } from "@/pages/Settings/Settings";
// import { DesktopRenderTasks } from "@/pages/Tasks/DesktopRenderTasks";
// import { Task } from "@/pages/Tasks/Task";
// import { NewTaskForm } from "@/pages/Tasks/TaskDialogs";
// import { Tasks } from "@/pages/Tasks/Tasks";
// import { TasksVariantPage } from "@/pages/Tasks/TasksVariantPage";

// // Mobile route configuration
// export const mobileRoutes = [
//   {
//     path: "/",
//     element: <AppLayout />,
//     children: [
//       { index: true, element: <HomePage /> },
//       {
//         path: "prospects",
//         children: [
//           { index: true, element: <Prospects /> },
//           { path: "new-contact", element: <NewContactForm /> },
//           { path: "new-company", element: <NewCompanyForm /> },
//           { path: "contact", element: <Contact /> },
//           { path: "company", element: <Company /> },
//         ],
//       },
//       { path: "calendar", element: <TaskCalendar /> },
//       { path: "settings", element: <Settings /> },
//       {
//         path: "tasks",
//         children: [
//           { index: true, element: <Tasks /> },
//           { path: "new", element: <NewTaskForm /> },
//           { path: "task", element: <Task /> },
//           { path: "history", element: <TasksVariantPage variant="history" /> },
//           { path: "pending", element: <TasksVariantPage variant="pending" /> },
//           { path: "upcoming", element: <TasksVariantPage variant="upcoming" /> },
//         ],
//       },
//       {
//         path: "projects",
//         children: [
//           { index: true, element: <Projects /> },
//           { path: "new", element: <NewProjectScreens /> },
//           { path: "project", element: <Project /> },
//         ],
//       },
//     ],
//   },
// ];

// // Desktop route configuration
// export const desktopRoutes = [
//   {
//     path: "/",
//     element: <AppLayout />,
//     children: [
//       { index: true, element: <MainContentDesktop /> },
//       {
//         path: "projects",
//         children: [
//           { index: true, element: <DesktopProjectsView /> },
//           { path: "new", element: <NewProjectScreens /> },
//           // { path: "project", element: <Project /> },
//         ],
//       },
//       {
//         path: "prospects",
//         children: [
//           { index: true, element: <DesktopContactOrCompany /> },
//           { path: "new-contact", element: <NewContactForm /> },
//           { path: "new-company", element: <NewCompanyForm /> },
//         ],
//       },
//       { path: "calendar", element: <DesktopRenderTasks /> },
//       {
//         path: "tasks",
//         children: [
//           { index: true, element: <DesktopRenderTasks /> },
//           { path: "task", element: <Task /> },
//           { path: "history", element: <TasksVariantPage variant="history" /> },
//           { path: "pending", element: <TasksVariantPage variant="pending" /> },
//           { path: "upcoming", element: <TasksVariantPage variant="upcoming" /> },
//         ],
//       },
//     ],
//   },
// ];
