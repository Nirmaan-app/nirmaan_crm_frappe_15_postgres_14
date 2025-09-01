// SidebarDesktop.tsx (Refactored)

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useNavItems } from "@/hooks/useNavItems"; // <-- Use the same hook
import { Skeleton } from "@/components/ui/skeleton"; 

export const SidebarDesktop = () => {
  const location = useLocation();
  const { navItems, isLoading } = useNavItems(); // <-- Get items from the hook
  const [activeTab, setActiveTab] = useState("Home");

  // This useEffect logic can be identical to the one in BottomBar
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("Home");
    } else {
      const currentItem = navItems?.find(item => item.path !== '/' && location.pathname.includes(item.path));
      if (currentItem) {
        setActiveTab(currentItem.label);
      }
    }
  }, [location.pathname, navItems]);

  if (isLoading) {
    return (
      <nav className="flex flex-col gap-8" aria-label="Loading navigation">
        {/* We'll render a few placeholders to mimic the real nav items */}
        {Array.from({ length: 5 })?.map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            {/* Skeleton for the icon */}
            <Skeleton className="h-[34px] w-[34px] rounded-md" />
            {/* Skeleton for the label */}
            <Skeleton className="h-3 w-14 rounded-md" />
          </div>
        ))}
      </nav>
    );
  }


  return (
     <nav className="flex flex-col gap-8">
      {/* Map directly over the filtered list */}
      {navItems.map(item => (
        <NavLink 
          to={item.path} 
          key={item.label} 
          className={`flex flex-col items-center ${activeTab === item.label ? "text-primary" : ""}`}
        >
          <item.icon className="h-[34px] w-[34px]" />
          <span className="text-xs font-semibold">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

// import { items } from "@/constants/navItems";
// import { useEffect, useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { useCurrentUser } from "@/hooks/useCurrentUser"; 
// import { Skeleton } from "@/components/ui/skeleton"; 

// export const SidebarDesktop = () => {

//   const location = useLocation()
// const { role,has_company, isLoading } = useCurrentUser();
// 	const [activeTab, setActiveTab] = useState("Home")

// 	useEffect(() => {
// 		if(location.pathname === "/") {
// 			setActiveTab("Home")
// 		} else {
// 			setActiveTab(items.slice(1).find(i => location.pathname.includes(i.path))?.label)
// 		}
// 	}, [location.pathname])

//   // useEffect(() => {
//   //   if (location.pathname === "/") {
//   //     setActiveTab("Home");
//   //   } else {
//   //     const currentItem = items.slice(1).find(i => location.pathname.startsWith(i.path));
//   //     if (currentItem) {
//   //       setActiveTab(currentItem.label);
//   //     }
//   //   }
//   // }, [location.pathname]);

//  if (isLoading) {
//     return (
//       <nav className="flex flex-col gap-8" aria-label="Loading navigation">
//         {/* We'll render a few placeholders to mimic the real nav items */}
//         {Array.from({ length: 4 }).map((_, index) => (
//           <div key={index} className="flex flex-col items-center gap-2">
//             {/* Skeleton for the icon */}
//             <Skeleton className="h-[34px] w-[34px] rounded-full" />
//             {/* Skeleton for the label */}
//             <Skeleton className="h-2 w-12 rounded-md" />
//           </div>
//         ))}
//       </nav>
//     );
//   }

//   return (
//      <nav className="flex flex-col gap-8">
//       {items.map(item => {
//         // <-- 3. Add the conditional rendering logic
//         if (item.adminOnly && role !== 'Nirmaan Admin User Profile') {
//             return null; // Don't render the item if it's admin-only and user is not an admin
//         }

//         return (
//           <NavLink 
//             to={item.path} 
//             key={item.label} 
//             className={`flex flex-col items-center ${activeTab === item.label ? "text-primary" : ""}`}
//           >
//             <item.icon className="h-[34px] w-[34px]" />
//             <span className="text-xs font-semibold">{item.label}</span>
//           </NavLink>
//         );
//       })}
//     </nav>
//   );
// };