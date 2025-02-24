import { useApplicationContext } from "@/contexts/ApplicationContext";
import { NewTaskForm } from "@/pages/Tasks/TaskDialogs";
import { Outlet, useLocation } from "react-router-dom";
import { BottomBar } from "./BottomBar";
import { NavBar } from "./NavBar";

export const MobileLayout = () => {

  const { overlayOpen, handleClose } = useApplicationContext()

  const location = useLocation()

  return (
    <div className="flex flex-col h-dvh">
      <NavBar />

      <main className="mt-14 mb-20 flex-1 overflow-y-auto px-3 py-4">
        <Outlet />
      </main>

      <BottomBar />

      {location.pathname !== "/tasks/new" && <NewTaskForm />}

      {/* Overlay for Blur Effect */}
      {overlayOpen && (
            <div
              id="overlay"
              className="fixed z-20 inset-0 bg-black bg-opacity-20 backdrop-blur-[1px] transition-all duration-300"
              onClick={handleClose}
            />
          )}
    </div>
  );
};

export default MobileLayout;
