import { FrappeProvider } from "frappe-react-sdk";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { HomeLayout } from "./pages/HomeLayout/Home";
import { FC } from "react";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { Prospect } from "./pages/Prospect/Prospect";
import { Tasks } from "./pages/Tasks/Tasks";
import { Calendar } from "./pages/Calendar/Calendar";
import { Settings } from "./pages/Settings/Settings";
import { MainContent } from "./pages/HomeLayout/MainContent";
import { NewContactForm } from "./pages/Prospect/Contacts/New-Contact-Form";
import { NewCompanyForm } from "./pages/Prospect/Companies/New-Company-Form";
import { Contact } from "./pages/Prospect/Contacts/Contact";
import { Company } from "./pages/Prospect/Companies/Company";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import {NewTaskDialog} from "./pages/Tasks/TaskDialogs";

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

					<Route path="calendar" element={<Calendar />} />
					<Route path="settings" element={<Settings />} />

          <Route path="tasks">
            <Route index element={<Tasks />} />
            {/* <Route path="new-task" element={<NewTaskDialog />} /> */}
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
            <NewTaskDialog />
          </ThemeProvider>
      </ApplicationProvider>
    </FrappeProvider>
  );
};

export default App;
