import { RenderDesktopMiniMobileScreen } from "@/components/helpers/RenderDesktopMiniMobile";
import { AddNewButton } from "@/components/ui/AddNewButton"; // Import the AddNewButton
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { useEffect, useState } from "react"; // Import hooks
import { Outlet, useLocation } from "react-router-dom";
import { NavBarDesktop } from "../Desktop/NavBar-Desktop";
import { NotificationsDesktop } from "../Desktop/Notifications-Desktop";
import { SidebarDesktop } from "../Desktop/Sidebar-Desktop";

export const DesktopLayout = () => {
    const location = useLocation();
    const { overlayOpen, handleClose } = useApplicationContext();

    // --- NEW LOGIC: State to hold the dynamic button options ---
    const [options, setOptions] = useState<Array<{ label: string; path: string }>>([]);

    // --- NEW LOGIC: Effect to calculate options based on the route ---
    useEffect(() => {
        const { pathname, search } = location;
        const params = new URLSearchParams(search);
        const id = params.get('id');

        let newOptions = [];

        // Order matters: More specific routes (detail pages) go first.
        if (pathname.startsWith('/companies/company') && id) {
            newOptions = [
                { label: "Add New BOQ", path: `/boqs/new?company_id=${id}` },
                { label: "Add New Contact", path: `/contacts/new?company_id=${id}` },
                { label: "Add New Task", path: `/tasks/new?company_id=${id}` }
            ];
        } else if (pathname.startsWith('/contacts/contact') && id) {
            newOptions = [
                { label: "Add New Task", path: `/tasks/new?contact_id=${id}` },
                { label: "Add New Note", path: `/notes/new?contact_id=${id}` }
            ];
        } else if (pathname.startsWith('/boqs/boq') && id) {
            newOptions = [
                { label: "Revise BOQ", path: `/boqs/revise?id=${id}` },
                { label: "Add Follow-up", path: `/tasks/new?boq_id=${id}` }
            ];
        }
        // Fallback to list page options
        else if (pathname.startsWith('/companies')) {
            newOptions = [{ label: "Add New Company", path: "/companies/new" }];
        } else if (pathname.startsWith('/contacts')) {
            newOptions = [{ label: "Add New Contact", path: "/contacts/new" }];
        } else if (pathname.startsWith('/boqs')) {
            newOptions = [{ label: "Add New BOQ", path: "/boqs/new" }];
        } else if (pathname.startsWith('/tasks')) {
            newOptions = [{ label: "Add New Task", path: "/tasks/new" }];
        }
        
        setOptions(newOptions);
    }, [location]); // Re-run when the location changes

    return (
        <div className="flex flex-col h-dvh bg-background overflow-hidden">
            {/* Fixed Top Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-navbar border-b cardBorder z-10">
                <NavBarDesktop />
            </nav>

            {/* Main container with padding-top to account for the fixed navbar */}
            <div className="flex flex-1 mt-[--navbar-height]">
                {/* Fixed Left Sidebar */}
                <aside style={{ top: 'var(--navbar-height)' }}
                    className="fixed left-0 bottom-0 w-sidebar h-[calc(100vh-var(--navbar-height))] border-r cardBorder py-8">
                    <SidebarDesktop />
                </aside>

                {/* Fixed Middle Panel (your RenderDesktopMiniMobileScreen) */}
                {location.pathname !== "/" && (
                    <aside style={{ top: 'var(--navbar-height)' }}
                        className="fixed left-[--sidebar-width] bottom-0 w-notifications h-[calc(100vh-var(--navbar-height))] border-r cardBorder py-8 overflow-y-auto">
                        <RenderDesktopMiniMobileScreen />
                    </aside>
                )}
                
                {/* Main Content Area */}
                <main
                    className={`overflow-y-auto max-h-[calc(100vh-var(--navbar-height))] px-10 py-8 flex-1 
                                ${location.pathname !== "/" ? "ml-[calc(var(--sidebar-width)+var(--notifications-width))]" : "xl:mr-[--notifications-width] ml-[--sidebar-width]"}`}>
                    
                    {/* --- NEW LOGIC: Header with context-aware button --- */}
                    <div className="flex items-center justify-between relative mb-6">
                        <h1 className="text-3xl font-bold">Welcome, User!</h1>
                        <AddNewButton options={options} />
                    </div>

                    <Outlet />
                </main>

                 {/* Fixed Right Notification Bar (only on homepage) */}
                 {location.pathname === "/" && (
                    <aside style={{ top: 'var(--navbar-height)' }}
                        className="fixed right-0 bottom-0 w-notifications h-[calc(100vh-var(--navbar-height))] border-l cardBorder max-xl:hidden overflow-y-auto">
                        <NotificationsDesktop />
                    </aside>
                )}
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

// import { RenderDesktopMiniMobileScreen } from "@/components/helpers/RenderDesktopMiniMobile";
// import { useApplicationContext } from "@/contexts/ApplicationContext";
// import { Outlet, useLocation } from "react-router-dom";
// import { NavBarDesktop } from "../Desktop/NavBar-Desktop";
// import { NotificationsDesktop } from "../Desktop/Notifications-Desktop";
// import { SidebarDesktop } from "../Desktop/Sidebar-Desktop";

// export const DesktopLayout = () => {

//   const location = useLocation()
//   const { overlayOpen, handleClose } = useApplicationContext()
//   return (
//     <div className="flex flex-col h-dvh bg-background overflow-hidden">
//       {/* Fixed Top Navbar */}
//       <nav className="fixed top-0 left-0 right-0 h-navbar border-b cardBorder z-10">
//         <NavBarDesktop />
//       </nav>

//       {/* Main container with padding-top to account for the fixed navbar */}
//       <div className="flex flex-1 mt-[--navbar-height]">
//         {/* Fixed Left Sidebar */}
//         <aside style={{
//           top: 'var(--navbar-height)',
//         }} className="fixed left-0 bottom-0 w-sidebar h-[85vh] border-r border-b cardBorder py-8">
//           <SidebarDesktop />
//         </aside>

//         {/* Fixed Right Notification Bar */}
//         {location.pathname === "/" && (
//           <aside style={{
//             top: 'var(--navbar-height)',
//           }} className="fixed right-0 bottom-0 w-notifications h-[85vh] border-l border-b cardBorder max-xl:hidden overflow-y-auto">
//             <NotificationsDesktop />
//           </aside>
//         )}

//         {location.pathname !== "/" && (
//           <aside style={{
//             top: 'var(--navbar-height)',
//           }} className="fixed left-[--sidebar-width] bottom-0 w-notifications h-[85vh] border-r border-b cardBorder py-8 overflow-y-auto">
//             <RenderDesktopMiniMobileScreen />
//           </aside>
//         )}

//         {/* Main Content Area */}
//         <main 
//         style={{
//           // marginRight: 'var(--notifications-width)',
//           // marginLeft: "calc('var(--sidebar-width) + var(--notifications-width)')",
//         }} 
//         className={`overflow-y-auto max-h-[calc(100vh-var(--navbar-height))] px-10 py-8 flex-1 ${location.pathname !== "/" ? "ml-[calc(var(--sidebar-width)+var(--notifications-width))]" : "xl:mr-[--notifications-width] ml-[--sidebar-width]"}`}>
//           <Outlet />
//         </main>
//       </div>

//       {/* Overlay for Blur Effect */}
//       {overlayOpen && (
//             <div
//               id="overlay"
//               className="fixed z-20 inset-0 bg-black bg-opacity-20 backdrop-blur-[1px] transition-all duration-300"
//               onClick={handleClose}
//             />
//           )}
//     </div>
//   );
// };

// export default DesktopLayout;
