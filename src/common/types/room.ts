import type { ISeat } from "./seat";

export interface IRoom {
  _id: string;
  name: string;
  description?: string;
  capacity: number;
  cols: number;
  rows: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPayloadRoomWithSeats extends Omit<IRoom, "_id" | "status"> {
  seats: Omit<ISeat, "_id" | "roomId">[];
}
