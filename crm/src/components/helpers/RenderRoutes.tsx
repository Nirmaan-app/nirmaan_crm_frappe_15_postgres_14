// src/components/helpers/RenderRoutes.tsx
import { useRoutes } from "react-router-dom";
import { appRoutes } from "./routesConfig";

export const RenderRoutes = () => {
  // Always render the single, unified route configuration.
  return useRoutes(appRoutes);
}