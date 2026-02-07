import { create } from "zustand";
import type { UserType } from "@/types";

interface AppStoreType {
  // User state
  user: UserType | null;
  setUser: (user: UserType | null) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStoreType>((set) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // UI state
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Loading state
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
