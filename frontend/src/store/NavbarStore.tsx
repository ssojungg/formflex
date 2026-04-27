import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NavbarStoreProps {
  activeItem: string;
  handleItem: (newActiveItem: string) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  toggleMobileSidebar: () => void;
}

export const useNavbarStore = create<NavbarStoreProps>()(
  persist(
    (set) => ({
      activeItem: 'all',
      handleItem: (newActiveItem: string) => set(() => ({ activeItem: newActiveItem })),
      isMobileSidebarOpen: false,
      setMobileSidebarOpen: (isOpen: boolean) => set(() => ({ isMobileSidebarOpen: isOpen })),
      toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
    }),
    {
      name: 'navbar-item',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
