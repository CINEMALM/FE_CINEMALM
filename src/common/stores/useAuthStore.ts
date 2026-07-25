import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import type { IUser } from "../types/user";

interface AuthState {
  openModal: boolean;
  pendingPath: string | null;
  pendingAction: (() => void) | null;
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser | null) => void;
  clearAuth: () => void;
  setOpenModal: (e: boolean) => void;
  requestLogin: (options?: { path?: string; action?: () => void }) => void;
  clearPendingLogin: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        openModal: false,
        pendingPath: null,
        pendingAction: null,
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
        clearAuth: () => set({ user: null, isAuthenticated: false }),
        setOpenModal: (open) => set({ openModal: open }),
        requestLogin: (options) =>
          set({
            openModal: true,
            pendingPath: options?.path || null,
            pendingAction: options?.action || null,
          }),
        clearPendingLogin: () =>
          set({
            openModal: false,
            pendingPath: null,
            pendingAction: null,
          }),
      }),
      {
        name: "Auth",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          pendingPath: state.pendingPath,
        }),
      },
    ),
    { name: "Auth" },
  ),
);

export const useAuthSelector = <T>(selector: (state: AuthState) => T): T =>
  useAuthStore(useShallow(selector));
