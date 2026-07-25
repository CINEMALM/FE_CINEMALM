import type { ISeat } from "./seat";
import type { IPriceShowTime } from "./showtime";

export interface IRoom {
  _id: string;
  name: string;
  description?: string;
  capacity: number;
  cols: number;
  rows: number;
  status: boolean;
  seatCount?: number;
  showtimeCount?: number;
  createdAt?: string;
  updatedAt?: string;
  showtimeId?: string;
  showtimePrice?: IPriceShowTime[];
}

export interface IPayloadRoomWithSeats extends Omit<IRoom, "_id" | "status"> {
  seats: Omit<ISeat, "_id" | "roomId">[];
}
