import { useViewport } from "@/hooks/useViewPort";
import { useRoutes } from "react-router-dom";
import { desktopRoutes, mobileRoutes } from "./routesConfig";

export const RenderRoutes = () => {
  const { isMobile } = useViewport();
  const routes = isMobile ? mobileRoutes : desktopRoutes;
  return useRoutes(routes);
}