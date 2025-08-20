import { FrappeProvider } from "frappe-react-sdk";
import { FC } from "react";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import { RenderRoutes } from "./components/helpers/RenderRoutes";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { AuthProvider } from "./auth/AuthProvider";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <RenderRoutes />,
  },
]);

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
      <AuthProvider>
        <ApplicationProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
          </ThemeProvider>
        </ApplicationProvider>
      </AuthProvider>
    </FrappeProvider>
  );
};

export default App;
