import { FrappeProvider } from "frappe-react-sdk";
import { FC, useEffect } from "react";
import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import { RenderRoutes } from "./components/helpers/RenderRoutes";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { ApplicationProvider } from "./contexts/ApplicationContext";
import { AuthProvider } from "./auth/AuthProvider";
import { RealTimeProvider } from "./auth/RealTimeProvider";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <RenderRoutes />,
  },
], {
  basename: `/${import.meta.env.VITE_BASE_NAME}`,
}
);

const App: FC = () => {

  const getSiteName = () => {
    return window.frappe?.boot?.sitename !== undefined
      ? window.frappe?.boot?.sitename
      : import.meta.env.VITE_SITE_NAME;
  };

  console.log("window.frappe?.boot?.sitename", window.frappe?.boot?.sitename, import.meta.env.VITE_SITE_NAM)
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
        <RealTimeProvider>
          <ApplicationProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <RouterProvider router={router} />
            </ThemeProvider>
          </ApplicationProvider>
        </RealTimeProvider>
      </AuthProvider>
    </FrappeProvider>
  );
};

export default App;
