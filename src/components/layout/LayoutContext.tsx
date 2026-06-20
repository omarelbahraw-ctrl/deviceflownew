"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type LayoutContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <LayoutContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayoutState = () => useContext(LayoutContext);
