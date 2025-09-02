// File: src/pages/Desktop/NavBar-Desktop.tsx (With Logo)

import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { UserNav } from "@/components/common/UserNav"; 
// import logo from "@/assets/logo-svg.svg"; // Option 1: If logo is imported (e.g., from assets)

export const NavBarDesktop = () => {
  return (
    <div className="h-full w-full flex items-center pl-6 pr-6 lg:pl-10"> {/* Adjusted padding */}
      <div className="flex items-center justify-between w-full">
        <div
          // The width calculation for the left section might need adjustment if logo pushes things.
          // For now, let's remove the fixed width calc to allow content to flow.
          // style={{ width: 'calc(100% - var(--notifications-width))' }}
          className="flex items-center justify-between flex-grow" // Use flex-grow
        >
          <div className="flex items-center gap-2"> {/* Container for logo and text */}
            {/* --- NEW: Add your logo here --- */}
            <img 
              src="/web-app-manifest-512x512.png" // Path to your logo in the public folder
              alt="Nirmaan CRM Logo" 
              className="h-8 w-auto" // Adjust size as needed (e.g., h-8 for 32px height)
            />
            <h2 className="font-medium text-xl lg:text-2xl text-primary whitespace-nowrap"> {/* Adjusted text size */}
              <Link to="/">
                Nirmaan CRM
              </Link>
            </h2>
          </div>
          {/* Your Input component (commented out) would go here if active */}
        </div>
        <div className="pl-4 flex items-center gap-4"> {/* Adjusted padding */}
          <UserNav />
        </div>
      </div>
    </div>
  )
}


// import { Input } from "@/components/ui/input"
// // import { Bell, CalendarFold, EllipsisVertical } from "lucide-react"
// import { Link } from "react-router-dom"
// import { UserNav } from "@/components/common/UserNav"; // <-- IMPORT

// export const NavBarDesktop = () => {
//   return (
//     <div className="h-full w-full flex items-center pl-10">
//       <div className="flex items-center justify-between w-full">
//         <div
//           style={{
//             width: 'calc(100% - var(--notifications-width))',
//           }}
//           className="flex items-center justify-between">
//           <h2 className="font-medium text-2xl text-primary">
//             <Link to="/">
//               Nirmaan CRM
//             </Link>
//           </h2>
//           {/* <Input
//             className="w-[50%]"
//             placeholder="Search Something..."
//           /> */}
//         </div>
//         <div className="pr-10 flex items-center gap-4">
//           <UserNav /> {/* <-- REPLACE THE DIV */}
//         </div>
//       </div>
//     </div>
//   )
// }