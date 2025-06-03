import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarExpanded,
        toggleSidebar,
        selectedMetric,
        setSelectedMetric,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};