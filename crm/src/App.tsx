import { FrappeProvider } from "frappe-react-sdk";
import { FC } from "react";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { TaskCalendar } from "./pages/Calendar/Calendar";
import { HomeLayout } from "./pages/HomeLayout/Home";
import { MainContent } from "./pages/HomeLayout/MainContent";
import { Company } from "./pages/Prospect/Companies/Company";
import { NewCompanyForm } from "./pages/Prospect/Companies/New-Company-Form";
import { Contact } from "./pages/Prospect/Contacts/Contact";
import { NewContactForm } from "./pages/Prospect/Contacts/New-Contact-Form";
import { Prospect } from "./pages/Prospect/Prospect";
import { Settings } from "./pages/Settings/Settings";
import { Task } from "./pages/Tasks/Task";
import { NewTaskForm } from "./pages/Tasks/TaskDialogs";
import { Tasks } from "./pages/Tasks/Tasks";
import { TasksVariantPage } from "./pages/Tasks/TasksVariantPage";

const router = createBrowserRouter(
  createRoutesFromElements(
   <>
      <Route path="/" element={<HomeLayout />}>
          <Route index element={<MainContent />} />
					<Route path="prospects">
            <Route index element={<Prospect />} />
            <Route path="new-contact" element={<NewContactForm/>} />
            <Route path="new-company" element={<NewCompanyForm/>} />
            <Route path="contact" element={<Contact />} />
            <Route path="company" element={<Company />} />
          </Route> 

					<Route path="calendar" element={<TaskCalendar />} />
					<Route path="settings" element={<Settings />} />

          <Route path="tasks">
            <Route index element={<Tasks />} />
            <Route path="new" element={<NewTaskForm />} />
            <Route path="task" element={<Task />} />
            <Route path="history" element={<TasksVariantPage variant="history" />} />
            <Route path="pending" element={<TasksVariantPage variant="pending" />} />
            <Route path="upcoming" element={<TasksVariantPage variant="upcoming" />} />

          </Route>
      </Route>
   </>
  )
);

const App: FC = () => {

  const getSiteName = () => {
    return window.frappe?.boot?.sitename !== undefined
      ? window.frappe?.boot?.sitename
      : import.meta.env.VITE_SITE_NAME;
  };


  return (
    <FrappeProvider
      url={import.meta.env.VITE_FRAPPE_PATH ?? ""}
      socketPort={
        import.meta.env.VITE_SOCKET_PORT
          ? import.meta.env.VITE_SOCKET_PORT
          : undefined
      }
      siteName={getSiteName()}
    >
      <ApplicationProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
      </ApplicationProvider>
    </FrappeProvider>
  );
};

export default App;
