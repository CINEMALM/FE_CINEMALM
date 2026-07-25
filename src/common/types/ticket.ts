export type TicketStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "failed";

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
  items: ITicketItem[];
  startTime: string;
  totalPrice: number;
  paidAt?: string | null;
  expiresAt?: string | null;
  cancelDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}
