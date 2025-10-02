import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUserId: null,
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
    }),
    {
      name: 'trpg-app-storage',
    },
  ),
);
