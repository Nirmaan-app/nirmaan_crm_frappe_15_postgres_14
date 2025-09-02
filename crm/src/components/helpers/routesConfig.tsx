
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
import { LoginPage } from "@/pages/Login";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { MyTeamPage } from "@/pages/MyTeam/MyTeamPage";
import { MobileMemberDetailsPage } from "@/pages/MyTeam/MobileMemberDetailsPage";
// --- CHANGE 1: Import the new AuthorizationGuard ---
import { AuthorizationGuard } from "@/auth/AuthorizationGuard";
import ForgotPassword from "@/pages/forgot-password";

export const appRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path:"/forgot-password",
    element:<ForgotPassword/>
  },
  {
    path: "/",
    element: <ProtectedRoute />, // Level 1 Check: Is user logged in?
    children: [
      {
        path: "/",
        // --- CHANGE 2: Nest the AuthorizationGuard here ---
        element: <AuthorizationGuard />, // Level 2 Check: Does user have permission for this route?
        children: [
          // All routes below are now protected by BOTH guards.
          {
            path: "/",
            element: <AppLayout />, // This now only renders for authorized users
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
                  { path: "completed", element: <TasksVariantPage variant="completed" /> },
                ],
              },
              {
                path: "team", // This admin-only route is now fully protected
                children: [
                  { index: true, element: <MyTeamPage /> },
                  { path: "details", element: <MobileMemberDetailsPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

// // src/components/helpers/routesConfig.tsx
// import { AppLayout } from "@/pages/Layout/AppLayout";
// import { HomePage } from "@/pages/Layout/HomePage";
// import { Settings } from "@/pages/Settings/Settings";
// import { TaskCalendar } from "@/pages/Calendar/Calendar";
// import { Companies } from "@/pages/Companies/Companies";
// import { Company } from "@/pages/Companies/Company";
// import { Contacts } from "@/pages/Contacts/Contacts";
// import { Contact } from "@/pages/Contacts/Contact";
// import { BOQs } from "@/pages/BOQS/BOQs";
// import { BOQ } from "@/pages/BOQS/BOQ";
// import { Tasks } from "@/pages/Tasks/Tasks";
// import { Task } from "@/pages/Tasks/Task";
// import { TasksVariantPage } from "@/pages/Tasks/TasksVariantPage";
// import path from "path";
// import { LoginPage } from "@/pages/Login";
// import { ProtectedRoute } from "@/auth/ProtectedRoute";
// import { MyTeamPage } from "@/pages/MyTeam/MyTeamPage";
// import { MemberDetails } from "@/pages/MyTeam/MemberDetails";
// import {MobileMemberDetailsPage} from "@/pages/MyTeam/MobileMemberDetailsPage"

// export const appRoutes = [
//   {
//     path: "/login",
//     element: <LoginPage />, // Placeholder for login page
//   },
//   {
//     path: "/",
//     element: <ProtectedRoute />, // Authentication Wrapper
//     children: [
//         {
//     path: "/",
//     element: <AppLayout />, // The single, stable layout for all routes
//     children: [
//       { index: true, element: <HomePage /> },
//       {
//         path: "companies",
//         children: [
//           { index: true, element: <Companies /> },
//           { path: "company", element: <Company /> },
//         ],
//       },
//       {
//         path: "contacts",
//         children: [
//           { index: true, element: <Contacts /> },
//           { path: "contact", element: <Contact /> },
//         ],
//       },
//       {
//         path: "boqs",
//         children: [
//           { index: true, element: <BOQs /> },
//           { path: "boq", element: <BOQ /> },
//         ],
//       },
//       { path: "calendar", element: <TaskCalendar /> },
//       { path: "settings", element: <Settings /> },
//       {
//         path: "tasks",
//         children: [
//           { index: true, element: <Tasks /> },
//           { path: "task", element: <Task /> },
//           { path: "all", element: <TasksVariantPage variant="all" /> },
//           { path: "pending", element: <TasksVariantPage variant="pending" /> },
//           { path: "upcoming", element: <TasksVariantPage variant="upcoming" /> },
//         ],
//       },
//       {
//         path: "team",
//         children: [
//           { index: true, element: <MyTeamPage /> },
//           //  { path: "details", element: <MemberDetails /> },
//            { path: "details", element: <MobileMemberDetailsPage /> },
//         ],
//       },
     
//     ],
//   },
//     ]
//   },
  
// ];

