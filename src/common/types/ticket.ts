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

export interface ITicketAdmission {
  _id: string;
  ticketItemId: string;
  admissionCode: string;
  qrToken: string;
  status: "valid" | "used" | "void";
  usedAt?: string | null;
  seatLabel?: string;
}

export interface ITicketProductItem {
  _id: string;
  productVariantId: string | null;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isGift: boolean;
  status: string;
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
  productItems?: ITicketProductItem[];
  admissions?: ITicketAdmission[];
  startTime: string;
  totalPrice: number;
  seatAmount?: number;
  productAmount?: number;
  subtotalAmount?: number;
  promotionDiscountAmount?: number;
  discountAmount?: number;
  appliedVoucherCode?: string | null;
  paidAt?: string | null;
  usedAt?: string | null;
  expiresAt?: string | null;
  paymentDueAt?: string | null;
  paymentMethod?: "VNPAY" | "CASH" | "BANK_TRANSFER" | string | null;
  vnpayOrderCode?: string | null;
  channel?: "online" | "counter" | string | null;
  checkInOpenAt?: string | null;
  checkInCloseAt?: string | null;
  qrCode?: string | null;
  cancelDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}
