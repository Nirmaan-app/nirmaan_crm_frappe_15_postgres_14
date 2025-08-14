// src/pages/Layout/MobileLayout.tsx

import { useApplicationContext } from "@/contexts/ApplicationContext";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { items as navItems } from "@/constants/navItems";
import { BottomBar } from "./BottomBar";
import { NavBar } from "./NavBar";
import { useDialogStore } from "@/store/dialogStore";
import {MainDialogs} from "../../components/dialogs/MainDialogs"

// Helper function to determine the page title from the URL path
const getPageTitle = (pathname: string): string => {
    if (pathname.startsWith('/companies/company')) return 'Company Details';
    if (pathname.startsWith('/companies/new')) return 'Add New Company';
    if (pathname.startsWith('/companies')) return 'Companies';

    if (pathname.startsWith('/boqs/boq')) return 'BOQ Details';
    if (pathname.startsWith('/boqs/new')) return 'Add New BOQ';
    if (pathname.startsWith('/boqs')) return 'BOQs';

    if (pathname.startsWith('/contacts/contact')) return 'Contact Details';
    if (pathname.startsWith('/contacts/new')) return 'Add New Contact';
    if (pathname.startsWith('/contacts')) return 'Contacts';
    
    if (pathname.startsWith('/tasks')) return 'Tasks';
    return 'Home'; // Default title
};

export const MobileLayout = () => {
    const { overlayOpen, handleClose } = useApplicationContext();
    const location = useLocation();
  const { openNewCompanyDialog, openNewContactDialog, openNewBoqDialog, openNewTaskDialog } = useDialogStore();
    // --- STATE to hold the dynamic data for child components ---
    const [title, setTitle] = useState('');
    const [showBackButton, setShowBackButton] = useState(false);
    const [fabOptions, setFabOptions] = useState<Array<{ label: string; path: string }>>([]);
    const [options, setOptions] = useState<Array<{ label: string; action: () => void }>>([]);

    // --- LOGIC to calculate the dynamic data ---
  useEffect(() => {
    const { pathname, search } = location;
    const params = new URLSearchParams(search);
    const id = params.get('id');
    let newOptions = [];

    // ===================================================================
    // THE CORRECTED LOGIC BLOCK
    // ===================================================================

    // --- DETAIL PAGE OPTIONS ---
    if (pathname.startsWith('/companies/company') && id) {
        newOptions = [
            { label: "Add New BOQ", action: () => openNewBoqDialog({ companyId: id }) },
            { label: "Add New Contact", action: () => openNewContactDialog({ companyId: id }) },
            { label: "Add New Task", action: () => openNewTaskDialog({ companyId: id }) }
        ];
    } else if (pathname.startsWith('/contacts/contact') && id) {
        newOptions = [
            { label: "Add New Task", action: () => openNewTaskDialog({ contactId: id }) },
            { label: "Add New BOQ", action: () => openNewBoqDialog({ contactId: id })  }
        ];
        
    }
    else if (pathname.startsWith('/boqs/boq') && id) {
         newOptions = [];
    }else if(pathname.startsWith('/tasks/task') && id) {
         newOptions = [];
    }
    
    // --- LIST PAGE OPTIONS (NOW FULLY CORRECTED) ---
    else if (pathname.startsWith('/companies')) {
        newOptions = [{ label: "Add New Company", action: openNewCompanyDialog }];
    } 
    else if (pathname.startsWith('/contacts')) {
        // CORRECTED: from 'path' to 'action'
        newOptions = [{ label: "Add New Contact", action: openNewContactDialog }];
    } 
    else if (pathname.startsWith('/boqs')) {
        // CORRECTED: from 'path' to 'action'
        newOptions = [{ label: "Add New BOQ", action: openNewBoqDialog }];
    } 
    else if (pathname.startsWith('/tasks')) {
        // CORRECTED: from 'path' to 'action'
        newOptions = [{ label: "Add New Task", action: openNewTaskDialog }];
    }
    
    setOptions(newOptions);

}, [
    location, 
    openNewCompanyDialog, 
    openNewContactDialog, 
    openNewBoqDialog, 
    openNewTaskDialog
]);
    // --- RENDER ---
    return (
        <div className="flex flex-col h-dvh">
            <NavBar title={title} showBackButton={showBackButton} />

            <main className="mt-14 mb-20 flex-1 overflow-y-auto px-3 py-4">
                <Outlet />
            </main>

            <BottomBar />

            <FloatingActionButton options={options} />

            {overlayOpen && (
                <div
                    id="overlay"
                    className="fixed z-20 inset-0 bg-black bg-opacity-20 backdrop-blur-[1px] transition-all duration-300"
                    onClick={handleClose}
                />
            )}
            <MainDialogs /> {/* Add this here */}
        </div>
    );
};

// import { useApplicationContext } from "@/contexts/ApplicationContext";
// import { Outlet } from "react-router-dom";
// import { BottomBar } from "./BottomBar";
// import { NavBar } from "./NavBar";

// export const MobileLayout = () => {

//   const { overlayOpen, handleClose } = useApplicationContext()

//   return (
//     <div className="flex flex-col h-dvh">
//       <NavBar />

//       <main className="mt-14 mb-20 flex-1 overflow-y-auto px-3 py-4">
//         <Outlet />
//       </main>

//       <BottomBar />

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

// export default MobileLayout;
