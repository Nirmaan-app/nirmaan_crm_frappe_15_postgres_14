import DesktopTaskCalendar from "@/pages/Calendar/DesktopTaskCalendar";
import { DesktopMiniCompanyView } from "@/pages/Projects/DesktopMiniCompanyView";
import { DesktopProspects } from "@/pages/Prospects/DesktopProspects";
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
      if (pathname.startsWith("/prospects")) {
        return { component: <DesktopProspects /> };
      } else if (pathname.startsWith("/projects")) {
        return { component: <DesktopMiniCompanyView /> };
      } else if (pathname.startsWith("/tasks")) {
        return { component: <DesktopMiniTasksScreen /> };
      } else if (pathname.startsWith("/calendar")) {
        return { component: <DesktopTaskCalendar /> };
      } else {
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
