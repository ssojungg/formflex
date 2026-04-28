import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthStoreProps {
  userId: number | null;
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  setUserId: (userId: number | null) => void;
  setLoginStatus: (status: boolean) => void;
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
}

export const useAuthStore = create<AuthStoreProps>()(
  persist(
    (set) => ({
      userId: null,
      isLoggedIn: false,
      userName: '',
      userEmail: '',
      setUserId: (userId: number | null) => set({ userId }),
      setLoginStatus: (status: boolean) => set({ isLoggedIn: status }),
      setUserName: (userName: string) => set({ userName }),
      setUserEmail: (userEmail: string) => set({ userEmail }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
