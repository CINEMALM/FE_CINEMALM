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

interface BackendTicket {
  id: number | string;
  user_id: number | string;
  ticket_code: string;
  showtime_id: number | string;
  total_price: number | string;
  payment_status: ITicket["paymentStatus"];
  status: ITicket["status"];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  movie_name: string;
  movie_poster: string;
  room_name: string;
  start_time: string;
  paid_at?: string | null;
  expires_at?: string | null;
  cancel_description?: string | null;
  items?: BackendTicketItem[];
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
});

const normalizeTicket = (ticket: BackendTicket): ITicket => ({
  _id: String(ticket.id),
  userId: String(ticket.user_id),
  ticketCode: ticket.ticket_code,
  showtimeId: String(ticket.showtime_id),
  totalPrice: Number(ticket.total_price || 0),
  paymentStatus: ticket.payment_status,
  status: ticket.status,
  customerName: ticket.customer_name || "",
  customerEmail: ticket.customer_email || "",
  customerPhone: ticket.customer_phone || "",
  movieName: ticket.movie_name,
  moviePoster: ticket.movie_poster,
  roomName: ticket.room_name,
  startTime: ticket.start_time,
  paidAt: ticket.paid_at,
  expiresAt: ticket.expires_at,
  cancelDescription: ticket.cancel_description,
  items: (ticket.items || []).map((item) => ({
    _id: String(item.id),
    seatId: String(item.seat_id),
    seatLabel: item.seat_label,
    type: item.seat_type,
    price: Number(item.price),
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

export const createBooking = async (payload: {
  showtimeId: string;
  seatIds: string[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) => {
  const response = await api.post<ApiResponse<BackendTicket>>("/bookings", {
    showtime_id: Number(payload.showtimeId),
    seat_ids: payload.seatIds.map(Number),
    customer_name: payload.customerName,
    customer_email: payload.customerEmail,
    customer_phone: payload.customerPhone,
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
