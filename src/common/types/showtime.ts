import type { IMovie } from "./movie";
import type { IRoom } from "./room";

export interface IMovieHasShowtime extends IMovie {
  showtimeCount: number;
  firstStartTime: string;
  lastStartTime: string;
  dayOfWeeks: number[];
}

export interface IPriceShowTime {
  seatType: string;
  value: number;
  _id: string;
}

export type IShowtimeStatus =
  | "scheduled"
  | "sold_out"
  | "in_progress"
  | "ended"
  | "cancelled";

export interface IShowtime {
  _id: string;
  movieId: IMovie;
  roomId: IRoom;
  startTime: string;
  dayOfWeek: number;
  endTime: string;
  price: IPriceShowTime[];
  status: IShowtimeStatus;
  cancelDescription?: string;
  createdAt?: string;
  updatedAt: string;
  externalRoom?: IRoom[];
  bookedSeat?: number;
  bookedCount?: number;
}

export interface IWeekdayShowtime {
  [key: string]: IShowtime[];
}

export interface IShowtimePrice {
  seatType: "Regular" | "VIP" | "Couple" | string;
  value: number;
}

export interface ICreateManyShowtimePayload {
  movieId: string;
  roomId: string;
  price: IShowtimePrice[];
  startDate: string;
  endDate: string;
  dayOfWeeks: number[];
  fixedHour: string;
}
export interface ICreateShowtimePayload {
  movieId: string;
  roomId: string;
  price: IShowtimePrice[];
  startTime: string;
}

export interface IUpdateShowtimePayload {
  roomId: string;
  price: IShowtimePrice[];
  startTime: string;
  status: string;
  cancelDescription?: string;
}
