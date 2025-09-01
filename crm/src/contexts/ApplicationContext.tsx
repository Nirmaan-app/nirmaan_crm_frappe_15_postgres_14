

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ApplicationContextProps {
  taskDialog: boolean;
  setTaskDialog: (open: boolean) => void;
  toggleTaskDialog: () => void;
  overlayOpen: boolean;
  setOverlayOpen: (open: boolean) => void;
  handleClose: (e: React.MouseEvent) => void;
}

const ApplicationContext = createContext<ApplicationContextProps | undefined>(
  undefined
);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskDialog, setTaskDialog] = useState(false);

  const toggleTaskDialog = () => {
    setTaskDialog((prev) => !prev);
  };

  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "overlay") {
      setOverlayOpen(false);
    }
  };

  return (
    <ApplicationContext.Provider value={{ taskDialog, setTaskDialog, toggleTaskDialog, overlayOpen, setOverlayOpen, handleClose }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplicationContext = (): ApplicationContextProps => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplicationContext must be used within an ApplicationProvider");
  }
  return context;
};
