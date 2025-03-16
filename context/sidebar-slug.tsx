"use client"

import { createContext, useContext, useEffect, useState } from "react";

type sidebarTabField = {
    currentTab: string;
    setCurrentTabHandler: (tab: string) => void;
} 

export const SidebarContex = createContext<sidebarTabField>({
    currentTab: "",
    setCurrentTabHandler: () => {},
});

export function useSidebarContext () {
    const context = useContext(SidebarContex)
    if (!context) {
      throw new Error('useSidebarContext must be used within a SidebarProvider')
    }
    return context
  }
  

export const SidebarTabProvider = ({children}: {children: React.ReactNode}) => {
    const [currentTab, setCurrentTab] = useState<string>("");

    useEffect(() => {
        const storedTab = sessionStorage.getItem("currentTab");
        if (storedTab) {
            setCurrentTab(storedTab);
        }   
    }, [])

    const setCurrentTabHandler = (tab: string) => {
        sessionStorage.setItem("currentTab", tab);
        console.log("switching to tab is ", tab);
        setCurrentTab(tab);
    }

    return (
        <SidebarContex.Provider value={{currentTab, setCurrentTabHandler}}>
            {children}
        </SidebarContex.Provider>
    )
}


