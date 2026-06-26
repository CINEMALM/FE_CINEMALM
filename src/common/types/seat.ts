import type { IMovie } from "./movie";

export interface ISeat {
  _id: string;
  roomId: string | IMovie;
  label: string;
  col: number;
  row: number;
  span: number;
  price?: {
    seatType: string;
    value: number;
  }[];
  type: "NORMAL" | "VIP" | "COUPLE";
  status: boolean;
}

export interface ISeatStatus extends ISeat {
  userId: string | null;
  bookingStatus: string;
}
