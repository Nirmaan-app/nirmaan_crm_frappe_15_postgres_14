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


const router = createBrowserRouter(
  createRoutesFromElements(
   <>
      <Route path="/" element={<HomeLayout />}>
          <Route index element={<MainContent />} />
					<Route path="prospect" element={<Prospect />} /> 
					 <Route path="tasks" element={<Tasks />} />
					 <Route path="calendar" element={<Calendar />} />
					 <Route path="settings" element={<Settings />} />
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
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
    </FrappeProvider>
  );
};

export default App;
