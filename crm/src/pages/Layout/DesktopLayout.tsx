import { useApplicationContext } from "@/contexts/ApplicationContext";
import { Outlet } from "react-router-dom";
import { NavBarDesktop } from "../Desktop/NavBar-Desktop";
import { NotificationsDesktop } from "../Desktop/Notifications-Desktop";
import { SidebarDesktop } from "../Desktop/Sidebar-Desktop";

export const DesktopLayout = () => {

  const { overlayOpen, handleClose } = useApplicationContext()
  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Fixed Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-navbar border-b border-gray-300 z-10">
        <NavBarDesktop />
      </nav>

      {/* Main container with padding-top to account for the fixed navbar */}
      <div className="flex flex-1 pt-20">
        {/* Fixed Left Sidebar */}
        <aside style={{
          top: 'var(--navbar-height)',
        }} className="fixed left-0 bottom-0 w-sidebar h-[85vh] border-r border-b border-gray-300 py-8">
          <SidebarDesktop />
        </aside>

        {/* Fixed Right Notification Bar */}
        <aside style={{
          top: 'var(--navbar-height)',
        }} className="fixed right-0 bottom-0 w-notifications h-[85vh] border-l border-b border-gray-300 p-4">
          <NotificationsDesktop />
        </aside>

        {/* Main Content Area */}
        <main style={{
          marginRight: 'var(--notifications-width)',
          marginLeft: 'var(--sidebar-width)',
        }} className="overflow-y-auto px-10 py-8 flex-1">
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
