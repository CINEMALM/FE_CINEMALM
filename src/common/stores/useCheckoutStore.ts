import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";
import type { ISeatStatus } from "../types/seat";
import type { IMovie } from "../types/movie";
import type { IShowtime } from "../types/showtime";
import type { IRoom } from "../types/room";

export interface ISeatState extends Omit<ISeatStatus, "price"> {
  price: number;
}

interface AuthState {
  seat: ISeatState[];
  movie: IMovie | null;
  room: IRoom | null;
  showtime: IShowtime | null;
  totalPrice: number;
  setInformation: (payload: {
    seat?: ISeatState[];
    totalPrice?: number;
    room?: IRoom;
    movie?: IMovie;
    showtime?: IShowtime;
  }) => void;
  resetInformation: () => void;
}

export const useCheckoutStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        seat: [],
        totalPrice: 0,
        movie: null,
        room: null,
        showtime: null,
        setInformation: (payload) =>
          set((state) => ({
            seat: payload.seat ?? state.seat,
            totalPrice: payload.totalPrice ?? state.totalPrice,
            room: payload.room ?? state.room,
            showtime: payload.showtime ?? state.showtime,
            movie: payload.movie ?? state.movie,
          })),
        resetInformation: () =>
          set({
            seat: [],
            totalPrice: 0,
            room: null,
            showtime: null,
            movie: null,
          }),
      }),
      { name: "Checkout" },
    ),
    { name: "Checkout" },
  ),
);

export const useCheckoutSelector = <T>(selector: (state: AuthState) => T): T =>
  useCheckoutStore(useShallow(selector));
