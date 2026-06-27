import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import type { IUser } from "../types/user";

interface AuthState {
  openModal: boolean;
  user: IUser | null;
  token: string | null;
  login: (user: IUser | null, token: string) => void;
  logout: () => void;
  setOpenModal: (e: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        openModal: false,
        user: null,
        token: null,
        login: (user, token) => set({ user, token }),
        logout: () => set({ user: null, token: null }),
        setOpenModal: (open) => set({ openModal: open }),
      }),
      { name: "Auth" },
    ),
    { name: "Auth" },
  ),
);

export const useAuthSelector = <T>(selector: (state: AuthState) => T): T =>
  useAuthStore(useShallow(selector));
