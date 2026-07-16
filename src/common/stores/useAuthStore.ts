import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import type { IUser } from "../types/user";

interface AuthState {
  openModal: boolean;
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser | null) => void;
  clearAuth: () => void;
  setOpenModal: (e: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        openModal: false,
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
        clearAuth: () => set({ user: null, isAuthenticated: false }),
        setOpenModal: (open) => set({ openModal: open }),
      }),
      {
        name: "Auth",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: "Auth" },
  ),
);

export const useAuthSelector = <T>(selector: (state: AuthState) => T): T =>
  useAuthStore(useShallow(selector));
