import type { IShowtimeFormat } from "./showtime";

export type TicketStatus = "pending" | "confirmed" | "cancelled" | "used";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "failed"
  | "refunded";

export interface ITicketItem {
  _id: string;
  seatId: string;
  seatLabel: string;
  price: number;
  type: string;
}

export interface ITicket {
  _id: string;
  userId: string;
  ticketCode: string;
  showtimeId: string;
  status: TicketStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieName: string;
  moviePoster: string;
  roomName: string;
  projectionFormat: IShowtimeFormat;
  items: ITicketItem[];
  startTime: string;
  totalPrice: number;
  paidAt?: string | null;
  usedAt?: string | null;
  expiresAt?: string | null;
  checkInOpenAt?: string | null;
  checkInCloseAt?: string | null;
  qrCode?: string | null;
  cancelDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}
