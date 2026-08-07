import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  selectedClaimId: string | null;
  setSelectedClaimId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  selectedClaimId: null,
  setSelectedClaimId: (id) => set({ selectedClaimId: id }),
}));
