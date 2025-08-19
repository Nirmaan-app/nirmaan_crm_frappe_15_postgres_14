// src/components/helpers/RenderRoutes.tsx
import { useRoutes } from "react-router-dom";
import { appRoutes } from "./routesConfig";

export const RenderRoutes = () => {
  // Always render the single, unified route configuration.
  return useRoutes(appRoutes);
}



// import { useViewport } from "@/hooks/useViewPort";
// import { useRoutes } from "react-router-dom";
// import { desktopRoutes, mobileRoutes } from "./routesConfig";

// export const RenderRoutes = () => {
//   const { isMobile } = useViewport();
//   const routes = isMobile ? mobileRoutes : desktopRoutes;
//   return useRoutes(routes);
// }