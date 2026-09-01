import type { IRoom } from "../types/room";
import type { ISeatStatus } from "../types/seat";
import type { IShowtime } from "../types/showtime";
import type { ITicket } from "../types/ticket";
import api from "../utils/api";

interface BackendSeat {
  id: number | string;
  room_id: number | string;
  label: string;
  row: number;
  col: number;
  span: number;
  type: ISeatStatus["type"];
  status: boolean;
}

interface BackendSeatStatus {
  id: number | string;
  user_id?: number | string | null;
  status: string;
  held_until?: string | null;
  hold_context?: "SELECTION" | "PAYMENT";
  countdown_until?: string | null;
  seat: BackendSeat;
}

interface BackendShowtime {
  id: number | string;
  room: {
    id: number | string;
    name: string;
    description?: string;
    capacity: number;
    rows: number;
    cols: number;
    status: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LaravelPaginator<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

interface BackendTicketItem {
  id: number | string;
  seat_id: number | string;
  seat_label: string;
  seat_type: string;
  price: number | string;
}

interface BackendTicketProductItem {
  id: number | string;
  product_variant_id?: number | string | null;
  product_name: string;
  variant_name: string;
  sku?: string | null;
  unit_price: number | string;
  quantity: number | string;
  total_price: number | string;
  is_gift?: boolean;
  status?: string;
}

interface BackendTicketAdmission {
  id: number | string;
  ticket_item_id: number | string;
  admission_code: string;
  qr_token: string;
  status: "valid" | "used" | "void";
  used_at?: string | null;
  ticket_item?: BackendTicketItem | null;
}

interface BackendTicket {
  id: number | string;
  user_id: number | string;
  ticket_code: string;
  showtime_id: number | string;
  total_price: number | string;
  seat_amount?: number | string;
  product_amount?: number | string;
  subtotal_amount?: number | string;
  promotion_discount_amount?: number | string;
  discount_amount?: number | string;
  applied_voucher_code?: string | null;
  payment_status: ITicket["paymentStatus"];
  status: ITicket["status"];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  movie_name: string;
  movie_poster: string;
  room_name: string;
  projection_format?: ITicket["projectionFormat"];
  start_time: string;
  paid_at?: string | null;
  expires_at?: string | null;
  payment_due_at?: string | null;
  payment_method?: string | null;
  payment_code?: string | null;
  latest_payment?: {
    payment_code?: string | null;
  } | null;
  payments?: {
    payment_code?: string | null;
  }[];
  channel?: string | null;
  check_in_open_at?: string | null;
  check_in_close_at?: string | null;
  qr_code?: string | null;
  cancel_description?: string | null;
  items?: BackendTicketItem[];
  product_items?: BackendTicketProductItem[];
  admissions?: BackendTicketAdmission[];
  created_at: string;
  updated_at: string;
}

interface ShowtimeSeatsResponse {
  showtime: BackendShowtime;
  layout: BackendSeatStatus[][];
  server_time: string;
}

const normalizeRoom = (room: BackendShowtime["room"]): IRoom => ({
  _id: String(room.id),
  name: room.name,
  description: room.description,
  capacity: Number(room.capacity || 0),
  rows: Number(room.rows || 0),
  cols: Number(room.cols || 0),
  status: Boolean(room.status),
});

const normalizeSeatStatus = (item: BackendSeatStatus): ISeatStatus => ({
  _id: String(item.seat.id),
  roomId: String(item.seat.room_id),
  label: item.seat.label,
  row: Number(item.seat.row),
  col: Number(item.seat.col),
  span: Number(item.seat.span || 1),
  type: item.seat.type,
  status: Boolean(item.seat.status),
  userId: item.user_id == null ? null : String(item.user_id),
  bookingStatus: item.status,
  heldUntil: item.held_until,
  holdContext: item.hold_context,
  countdownUntil: item.countdown_until || item.held_until,
});

const normalizeTicket = (ticket: BackendTicket): ITicket => ({
  _id: String(ticket.id),
  userId: String(ticket.user_id),
  ticketCode: ticket.ticket_code,
  showtimeId: String(ticket.showtime_id),
  totalPrice: Number(ticket.total_price || 0),
  seatAmount: Number(ticket.seat_amount || ticket.total_price || 0),
  productAmount: Number(ticket.product_amount || 0),
  subtotalAmount: Number(ticket.subtotal_amount || ticket.total_price || 0),
  promotionDiscountAmount: Number(ticket.promotion_discount_amount || 0),
  discountAmount: Number(ticket.discount_amount || 0),
  appliedVoucherCode: ticket.applied_voucher_code,
  paymentStatus: ticket.payment_status,
  status: ticket.status,
  customerName: ticket.customer_name || "",
  customerEmail: ticket.customer_email || "",
  customerPhone: ticket.customer_phone || "",
  movieName: ticket.movie_name,
  moviePoster: ticket.movie_poster,
  roomName: ticket.room_name,
  projectionFormat: ticket.projection_format || "2D",
  startTime: ticket.start_time,
  paidAt: ticket.paid_at,
  expiresAt: ticket.expires_at,
  paymentDueAt: ticket.payment_due_at || ticket.expires_at,
  paymentMethod: ticket.payment_method,
  vnpayOrderCode:
    ticket.latest_payment?.payment_code ||
    ticket.payments?.find((payment) => payment.payment_code)?.payment_code ||
    ticket.payment_code ||
    null,
  channel: ticket.channel,
  checkInOpenAt: ticket.check_in_open_at,
  checkInCloseAt: ticket.check_in_close_at,
  qrCode: ticket.qr_code || ticket.ticket_code,
  cancelDescription: ticket.cancel_description,
  items: (ticket.items || []).map((item) => ({
    _id: String(item.id),
    seatId: String(item.seat_id),
    seatLabel: item.seat_label,
    type: item.seat_type,
    price: Number(item.price),
  })),
  productItems: (ticket.product_items || []).map((item) => ({
    _id: String(item.id),
    productVariantId:
      item.product_variant_id == null ? null : String(item.product_variant_id),
    productName: item.product_name,
    variantName: item.variant_name,
    sku: item.sku || "",
    unitPrice: Number(item.unit_price || 0),
    quantity: Number(item.quantity || 0),
    totalPrice: Number(item.total_price || 0),
    isGift: Boolean(item.is_gift),
    status: item.status || "pending",
  })),
  admissions: (ticket.admissions || []).map((item) => ({
    _id: String(item.id),
    ticketItemId: String(item.ticket_item_id),
    admissionCode: item.admission_code,
    qrToken: item.qr_token,
    status: item.status,
    usedAt: item.used_at,
    seatLabel: item.ticket_item?.seat_label,
  })),
  createdAt: ticket.created_at,
  updatedAt: ticket.updated_at,
});

export const getShowtimeSeats = async (showtimeId: string) => {
  const response = await api.get<ApiResponse<ShowtimeSeatsResponse>>(
    `/showtimes/${showtimeId}/seats`,
  );
  const result = response.data.data;

  return {
    showtimeId: String(result.showtime.id) as IShowtime["_id"],
    room: normalizeRoom(result.showtime.room),
    layout: result.layout.map((row) => row.map(normalizeSeatStatus)),
    serverTime: result.server_time,
  };
};

export const holdSeats = async (showtimeId: string, seatIds: string[]) => {
  const response = await api.post<
    ApiResponse<{
      held_until: string;
      hold_expires_in: number;
      server_time: string;
    }>
  >("/bookings/hold", {
    showtime_id: Number(showtimeId),
    seat_ids: seatIds.map(Number),
  });
  return response.data.data;
};

export const releaseSeats = async (showtimeId: string, seatIds: string[]) => {
  const response = await api.post<
    ApiResponse<{
      released_seat_ids: Array<number | string>;
      server_time: string;
    }>
  >("/bookings/release", {
    showtime_id: Number(showtimeId),
    seat_ids: seatIds.map(Number),
  });
  return response.data.data;
};

export interface ProductVariant {
  id: number | string;
  name: string;
  sku: string;
  price: number | string;
  is_active: boolean;
}

export interface ProductCatalogItem {
  id: number | string;
  name: string;
  type: "popcorn" | "drink" | "combo" | "other";
  description?: string | null;
  image_url?: string | null;
  variants: ProductVariant[];
}

export const getProducts = async () => {
  const response =
    await api.get<ApiResponse<ProductCatalogItem[]>>("/products");
  return response.data.data;
};

export interface PromotionPreviewGiftItem {
  product_variant_id?: number | string | null;
  product_name: string;
  variant_name: string;
  quantity: number;
  is_gift?: boolean;
}

export interface PromotionPreview {
  seat_amount: number;
  product_amount: number;
  subtotal_amount: number;
  promotion_discount_amount: number;
  discount_amount: number;
  total_amount: number;
  applied_promotions: {
    promotion_id: number;
    code?: string | null;
    name: string;
    discount_amount: number;
    gift_items: PromotionPreviewGiftItem[];
  }[];
  gift_items: PromotionPreviewGiftItem[];
}

export const previewPromotions = async (payload: {
  showtimeId: string;
  seatIds: string[];
  productItems?: { product_variant_id: number; quantity: number }[];
  voucherCode?: string;
}) => {
  const response = await api.post<ApiResponse<PromotionPreview>>(
    "/promotions/preview",
    {
      showtime_id: Number(payload.showtimeId),
      seat_ids: payload.seatIds.map(Number),
      product_items: payload.productItems || [],
      voucher_code: payload.voucherCode || undefined,
    },
  );
  return response.data.data;
};

export const createBooking = async (payload: {
  showtimeId: string;
  seatIds: string[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productItems?: { product_variant_id: number; quantity: number }[];
  voucherCode?: string;
}) => {
  const response = await api.post<ApiResponse<BackendTicket>>("/bookings", {
    showtime_id: Number(payload.showtimeId),
    seat_ids: payload.seatIds.map(Number),
    customer_name: payload.customerName,
    customer_email: payload.customerEmail,
    customer_phone: payload.customerPhone,
    product_items: payload.productItems || [],
    voucher_code: payload.voucherCode || undefined,
  });
  return normalizeTicket(response.data.data);
};

export const getBookings = async (params?: Record<string, unknown>) => {
  const response = await api.get<ApiResponse<LaravelPaginator<BackendTicket>>>(
    "/bookings",
    { params },
  );
  const paginator = response.data.data;
  return {
    items: paginator.data.map(normalizeTicket),
    page: paginator.current_page,
    pageSize: paginator.per_page,
    total: paginator.total,
    totalPages: paginator.last_page,
  };
};

export const getBooking = async (ticketId: string) => {
  const response = await api.get<ApiResponse<BackendTicket>>(
    `/bookings/${ticketId}`,
  );
  return normalizeTicket(response.data.data);
};

export const recoverTickets = async (payload: {
  email: string;
  phone: string;
}) => {
  const response = await api.post<
    ApiResponse<{
      tickets: BackendTicket[];
      count: number;
      support_message?: string | null;
    }>
  >("/tickets/recovery", payload);
  return {
    tickets: response.data.data.tickets.map(normalizeTicket),
    count: response.data.data.count,
    supportMessage: response.data.data.support_message,
  };
};

export const cancelBooking = async (
  ticketId: string,
  cancelDescription?: string,
) => {
  const response = await api.post<ApiResponse<BackendTicket>>(
    `/bookings/${ticketId}/cancel`,
    { cancel_description: cancelDescription },
  );
  return normalizeTicket(response.data.data);
};

export const createVnpayPayment = async (ticketId: string) => {
  const response = await api.post<ApiResponse<{ payment_url: string }>>(
    "/payments/vnpay/create",
    { ticket_id: Number(ticketId) },
  );
  return response.data.data.payment_url;
};

export interface PaymentStatusSnapshot {
  paymentCode: string;
  paymentStatus: "pending" | "success" | "failed" | "expired" | "refunded";
  status: "processing" | "success" | "failed";
  ticketId: string;
  ticketCode?: string | null;
  ticketStatus?: ITicket["status"] | null;
  ticketPaymentStatus?: ITicket["paymentStatus"] | null;
  amount: number;
  currency: string;
  paidAt?: string | null;
  expiredAt?: string | null;
}

interface BackendPaymentStatusSnapshot {
  payment_code: string;
  payment_status: PaymentStatusSnapshot["paymentStatus"];
  status: PaymentStatusSnapshot["status"];
  ticket_id: number | string;
  ticket_code?: string | null;
  ticket_status?: ITicket["status"] | null;
  ticket_payment_status?: ITicket["paymentStatus"] | null;
  amount: number | string;
  currency: string;
  paid_at?: string | null;
  expired_at?: string | null;
}

export const getPaymentStatus = async (
  paymentCode: string,
  ticketId?: string | null,
): Promise<PaymentStatusSnapshot> => {
  const response = await api.get<ApiResponse<BackendPaymentStatusSnapshot>>(
    "/payments/status",
    {
      params: {
        payment_code: paymentCode,
        ticket_id: ticketId || undefined,
      },
    },
  );
  const data = response.data.data;

  return {
    paymentCode: data.payment_code,
    paymentStatus: data.payment_status,
    status: data.status,
    ticketId: String(data.ticket_id),
    ticketCode: data.ticket_code,
    ticketStatus: data.ticket_status,
    ticketPaymentStatus: data.ticket_payment_status,
    amount: Number(data.amount || 0),
    currency: data.currency,
    paidAt: data.paid_at,
    expiredAt: data.expired_at,
  };
};
