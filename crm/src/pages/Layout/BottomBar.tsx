// BottomBar.tsx (Refactored)

import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useNavItems } from "@/hooks/useNavItems"; // <-- 1. Import the new hook
import { Skeleton } from "@/components/ui/skeleton";

export const BottomBar = () => {
  const location = useLocation();
  // --- 2. Get the filtered items and loading state from the hook ---
  const { navItems, isLoading } = useNavItems(); 
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("Home");
    } else {
      // --- 3. IMPORTANT: Use the filtered `navItems` list to find the active tab ---
      const currentItem = navItems?.find(item => item.path !== '/' && location.pathname.includes(item.path));
      if (currentItem) {
        setActiveTab(currentItem.label);
      }
    }
    // Add navItems as a dependency to re-calculate when the list changes
  }, [location.pathname, navItems,isLoading]);

  if (isLoading) {
    // Loading state remains the same
    return (
      <nav className="fixed bottom-0 left-0 w-full bg-bottombarbackground shadow-black shadow-md p-2 flex justify-between items-center z-10">
        {Array.from({ length: 4 })?.map((_, index) => (
          <div key={index} className="p-2 flex flex-col items-center justify-center">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-2 w-10 rounded-md mt-1" />
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-bottombarbackground shadow-black shadow-md p-2 flex justify-between items-center z-10">
      {/* --- 4. Map directly over the correctly filtered list --- */}
      {navItems?.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`p-2 flex flex-col items-center justify-center ${activeTab === item.label ? "text-destructive" : ""}`}
        >
          <item.icon className="w-8 h-8" />
          <span className="text-xs font-semibold">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

// import { items } from "@/constants/navItems"
// import { useEffect, useState } from "react"
// import { NavLink, useLocation } from "react-router-dom"
// import { useCurrentUser } from "@/hooks/useCurrentUser"; 

// export const BottomBar = () => {

// 	const location = useLocation()
// const { role, isLoading } = useCurrentUser();
// 	const [activeTab, setActiveTab] = useState("Home")
	
// 	useEffect(() => {
// 		if(location.pathname === "/") {
// 			setActiveTab("Home")
// 		} else {
// 			setActiveTab(items.slice(1).find(i => location.pathname.includes(i.path))?.label)
// 		}
// 	}, [location.pathname])


// 	return (
// 		<nav className="fixed bottom-0 left-0 w-full bg-bottombarbackground shadow-black shadow-md p-2 flex justify-between items-center z-10">
// 			{items.map(item => {
// 				 if (item.adminOnly && role !== 'Nirmaan Admin User Profile') {
//             return null; // Don't render the item if it's admin-only and user is not an admin
//         }

// 				return (
// 				<NavLink key={item.path} to={item.path} className={`p-2 flex flex-col items-center justify-center ${activeTab === item.label ? "text-destructive" : ""}`}>
// 					<item.icon className="w-8 h-8" />
// 					<span className="text-xs font-semibold">{item.label}</span>
// 				</NavLink>
// 			)})}
// 		</nav>
// 	)
// }