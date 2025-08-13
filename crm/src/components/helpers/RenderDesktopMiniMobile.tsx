// src/components/helpers/RenderDesktopMiniMobileScreen.tsx

import DesktopTaskCalendar from "@/pages/Calendar/DesktopTaskCalendar";
// 1. Import from the new /BOQs path
import { DesktopMiniCompanyView } from "@/pages/BOQs/DesktopMiniCompanyView"; 
// 2. This component is no longer used, so we remove the import
// import { DesktopProspects } from "@/pages/Prospects/DesktopProspects"; 
import { DesktopMiniTasksScreen } from "@/pages/Tasks/DesktopMiniTasksScreen";
import React, { useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";

interface State {
  component: React.ReactElement | null;
}

type Action = { type: "SET_ROUTE"; payload: { pathname: string } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_ROUTE":
      const { pathname } = action.payload;
      // 3. Remove the check for "/prospects"
      // The new /companies and /contacts routes do not have a dedicated mini-view in this panel.
      // If you decide they need one, you can add a new `if` condition here.
      // e.g., if (pathname.startsWith("/companies")) { ... }

      // 4. Change the check from "/projects" to "/boqs"
      if (pathname.startsWith("/boqs")) {
        // This component lists companies to show their associated BOQs, so its usage is still valid.
        return { component: <DesktopMiniCompanyView /> };
      } else if (pathname.startsWith("/tasks")) {
        return { component: <DesktopMiniTasksScreen /> };
      } else if (pathname.startsWith("/calendar")) {
        return { component: <DesktopTaskCalendar /> };
      } else {
        // For all other routes like Home, Contacts, Companies, the panel will be empty.
        return { component: null };
      }
    default:
      return state;
  }
};

const initialState: State = { component: null };

export const RenderDesktopMiniMobileScreen = () => {
  const location = useLocation();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Dispatch an action whenever the location changes.
  useEffect(() => {
    dispatch({ type: "SET_ROUTE", payload: { pathname: location.pathname } });
  }, [location]);

  return <div>{state.component}</div>;
};