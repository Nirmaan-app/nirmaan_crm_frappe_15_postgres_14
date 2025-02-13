import React, { createContext, useContext, useState, ReactNode } from "react";

interface ApplicationContextProps {
  taskDialog: boolean;
  setTaskDialog: (open: boolean) => void;
  toggleTaskDialog: () => void;
}

const ApplicationContext = createContext<ApplicationContextProps | undefined>(
  undefined
);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskDialog, setTaskDialog] = useState(false);

  const toggleTaskDialog = () => {
    setTaskDialog((prev) => !prev);
  };

  return (
    <ApplicationContext.Provider value={{ taskDialog, setTaskDialog, toggleTaskDialog }}>
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
