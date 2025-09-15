// src/pages/Layout/AppLayout.tsx


import { Outlet, useLocation } from "react-router-dom";
import { useViewport } from "@/hooks/useViewPort";
import { useApplicationContext } from "@/contexts/ApplicationContext";
import { useFabOptions } from "@/hooks/useFabOptions";
import { usePageHeader } from "@/hooks/usePageHeader";
import { MobileNavBar } from "./MobileNavBar";
import { BottomBar } from "./BottomBar";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { NavBarDesktop } from "../Desktop/NavBar-Desktop";
import { SidebarDesktop } from "../Desktop/Sidebar-Desktop";
import { NotificationsDesktop } from "../Desktop/Notifications-Desktop";
import { MainDialogs } from "@/components/dialogs/MainDialogs";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export const AppLayout = () => {
	const { isMobile } = useViewport();
	const location = useLocation();
  const { user,isLoading } = useCurrentUser();
	
	const { overlayOpen, handleClose } = useApplicationContext();
	const { title, showBackButton } = usePageHeader();
	const actionOptions = useFabOptions();

	if (isMobile) {
		// Mobile layout remains the same and is correct.
		return (
			<div className="flex flex-col h-dvh">
				<MobileNavBar title={title} showBackButton={showBackButton} />
				<main className="mt-14 mb-20 flex-1 overflow-y-auto px-3 py-1">
					<Outlet />
				</main>
				<BottomBar/>
				<FloatingActionButton options={actionOptions} />
				<MainDialogs />
				{overlayOpen && (<div id="overlay" className="fixed z-20 inset-0 bg-black bg-opacity-20 backdrop-blur-[1px]" onClick={handleClose} />)}
			</div>
		);
	}

	// --- DESKTOP LAYOUT (SIMPLIFIED) ---
	return (
		<div className="flex flex-col h-dvh bg-background overflow-hidden">
			<nav className="fixed top-0 left-0 right-0 h-[var(--navbar-height)] border-b cardBorder z-10">
				<NavBarDesktop />
			</nav>
			<div className="flex flex-1 mt-[var(--navbar-height)]">
				<aside style={{ top: 'var(--navbar-height)' }} className="fixed left-0 bottom-0 w-[var(--sidebar-width)] h-[calc(100vh-var(--navbar-height))] border-r cardBorder py-8">
					<SidebarDesktop />
				</aside>

				{/* --- THIS IS THE KEY CHANGE --- */}
				{/* The main content area now only accounts for the sidebar's width. */}
				<main className={`overflow-y-auto max-h-[calc(100vh-var(--navbar-height))] px-10 py-2 flex-1 ml-[var(--sidebar-width)]`}>
					{/* The header inside the main content is removed as pages like Companies/BOQs now control their own titles and buttons */}
					<Outlet />
				</main>

				{/* The right-side notifications panel is now only for the homepage */}
				{/* {location.pathname === "/" && (
					<aside style={{ top: 'var(--navbar-height)' }} className="fixed right-0 bottom-0 w-[var(--notifications-width)] h-[calc(100vh-var(--navbar-height))] border-l cardBorder max-xl:hidden overflow-y-auto">
						<NotificationsDesktop />
					</aside>
				)} */}
			</div>
			
				<FloatingActionButton options={actionOptions} />

			<MainDialogs />
			{overlayOpen && (<div id="overlay" className="fixed z-20 inset-0 bg-black bg-opacity-20 backdrop-blur-[1px]" onClick={handleClose} />)}
		</div>
	);
};

// import { useViewport } from "@/hooks/useViewPort";
// import React, { Suspense } from "react";
// import { NewTaskForm } from "../Tasks/NewTaskForm";

// export const AppLayout = () => {

// 	const {isMobile} = useViewport()

// 	const MobileLayout = React.lazy(() => import("./MobileLayout"));
// 	const DesktopLayout = React.lazy(() => import("./DesktopLayout"));

// 	// const isMobile = () => {
// 	// 	const userAgent = navigator.userAgent || navigator.vendor || window.opera;
// 	// 	return /Mobi|Android|BlackBerry|iPhone|iPad|iPod|Opera Mini/i.test(userAgent);
// 	// }

// 	// console.log("isMobile", isMobile())

// 	console.log("IssMobile",isMobile)
// 	console.log("IssMobile",isMobile)


// 	return (
// 		<>
// 			<Suspense fallback={<div>Loading...</div>}>
//       	{isMobile ? <MobileLayout /> : <DesktopLayout />}
//     	</Suspense>
// 			<NewTaskForm />
// 		</>
// 	);
// };
