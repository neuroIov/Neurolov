import { create } from 'zustand'

interface SidebarTabState {
  selectedTab: string
  setSelectedTab: (tab: string) => void
}

export const SidebarTabProvider = create<SidebarTabState>((set) => ({
  selectedTab: 'home',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}))