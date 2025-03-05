import { RenderDesktopMiniMobileScreen } from "@/components/helpers/RenderDesktopMiniMobile";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { Outlet, useLocation } from "react-router-dom";
import { NavBarDesktop } from "../Desktop/NavBar-Desktop";
import { NotificationsDesktop } from "../Desktop/Notifications-Desktop";
import { SidebarDesktop } from "../Desktop/Sidebar-Desktop";

export const DesktopLayout = () => {

  const location = useLocation()
  const { overlayOpen, handleClose } = useApplicationContext()
  return (
    <div className="flex flex-col h-dvh bg-background overflow-hidden">
      {/* Fixed Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-navbar border-b cardBorder z-10">
        <NavBarDesktop />
      </nav>

      {/* Main container with padding-top to account for the fixed navbar */}
      <div className="flex flex-1 mt-[--navbar-height]">
        {/* Fixed Left Sidebar */}
        <aside style={{
          top: 'var(--navbar-height)',
        }} className="fixed left-0 bottom-0 w-sidebar h-[85vh] border-r border-b cardBorder py-8">
          <SidebarDesktop />
        </aside>

        {/* Fixed Right Notification Bar */}
        {location.pathname === "/" && (
          <aside style={{
            top: 'var(--navbar-height)',
          }} className="fixed right-0 bottom-0 w-notifications h-[85vh] border-l border-b cardBorder max-xl:hidden overflow-y-auto">
            <NotificationsDesktop />
          </aside>
        )}

        {location.pathname !== "/" && (
          <aside style={{
            top: 'var(--navbar-height)',
          }} className="fixed left-[--sidebar-width] bottom-0 w-notifications h-[85vh] border-r border-b cardBorder py-8 overflow-y-auto">
            <RenderDesktopMiniMobileScreen />
          </aside>
        )}

        {/* Main Content Area */}
        <main 
        style={{
          // marginRight: 'var(--notifications-width)',
          // marginLeft: "calc('var(--sidebar-width) + var(--notifications-width)')",
        }} 
        className={`overflow-y-auto max-h-[calc(100vh-var(--navbar-height))] px-10 py-8 flex-1 ${location.pathname !== "/" ? "ml-[calc(var(--sidebar-width)+var(--notifications-width))]" : "xl:mr-[--notifications-width] ml-[--sidebar-width]"}`}>
          <Outlet />
        </main>
      </div>

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

export default DesktopLayout;
