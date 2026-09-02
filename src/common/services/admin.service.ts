import type { ICategory } from "../types/category";
import type { IMovie } from "../types/movie";
import type { IRoom } from "../types/room";
import type { ISeat } from "../types/seat";
import type { IShowtime } from "../types/showtime";
import type { IAdminDashboardOverview } from "../types/stats";
import type { ITicket } from "../types/ticket";
import api from "../utils/api";

interface LaravelPaginator<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminListResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface MovieRevenueItem {
  movie_id: number;
  movie_name: string;
  movie_poster?: string | null;
  paid_orders: number;
  sold_seats: number;
  seat_revenue: number;
  product_revenue: number;
  discount_amount: number;
  gross_revenue: number;
  net_revenue: number;
  average_order_value: number;
  average_ticket_value: number;
}

export interface ConcessionOrder {
  id: number;
  order_code: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  total_amount: number;
  payment_method: "CASH" | "BANK_TRANSFER";
  amount_received: number;
  change_amount: number;
  transfer_reference?: string | null;
  status: string;
  paid_at: string;
  items: Array<{
    id: number;
    product_variant_id: number;
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface CategoryPayload {
  name: string;
  description?: string;
  status?: boolean;
}

export interface RoomPayload {
  name: string;
  description?: string;
  supported_projection_formats?: IShowtime["projectionFormat"][];
  rows: number;
  cols: number;
  status?: boolean;
}

export interface MoviePayload {
  name: string;
  description?: string;
  poster: string;
  trailer?: string;
  status_release?: IMovie["statusRelease"];
  actors: string[];
  director: string;
  rating: number;
  age_require: IMovie["ageRequire"];
  country?: string;
  language?: string;
  sub_language?: string;
  available_projection_formats?: IShowtime["projectionFormat"][];
  duration: number;
  release_date: string;
  end_date: string;
  is_featured: boolean;
  status: boolean;
  category_ids: number[];
}

export interface ShowtimePayload {
  movie_id: number;
  room_id: number;
  projection_format: IShowtime["projectionFormat"];
  start_time: string;
  prices: {
    NORMAL: number;
    VIP: number;
    COUPLE: number;
  };
}

export interface ProductPayload {
  name: string;
  type: "popcorn" | "drink" | "combo" | "other";
  description?: string;
  image_url?: string;
  is_active?: boolean;
  variants?: {
    id?: number;
    name: string;
    sku?: string;
    price: number;
    stock_quantity?: number | null;
    is_active?: boolean;
  }[];
}

export interface PromotionPayload {
  name: string;
  code?: string;
  description?: string;
  promotion_type?:
    | "automatic"
    | "voucher_code"
    | "member_benefit"
    | "gift_product";
  apply_method?: "manual" | "automatic";
  discount_type?: "percentage" | "fixed_amount" | "free_product";
  discount_value?: number;
  maximum_discount?: number | null;
  minimum_order_amount?: number;
  target_scope?: "order" | "ticket" | "product";
  priority?: number;
  stackable?: boolean;
  start_at?: string | null;
  end_at?: string | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  is_active?: boolean;
  conditions?: {
    condition_type: string;
    operator: string;
    value: unknown;
  }[];
  rewards?: {
    reward_type: "discount" | "free_product";
    target_scope: "order" | "ticket" | "product";
    discount_type: "percentage" | "fixed_amount" | "free_product";
    discount_value?: number;
    maximum_discount?: number | null;
    product_variant_id?: number | null;
    quantity?: number | null;
  }[];
}

interface BackendCategory {
  id: number;
  name: string;
  description?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BackendRoom {
  id: number;
  name: string;
  description?: string;
  supported_projection_formats?: IShowtime["projectionFormat"][];
  capacity: number;
  rows: number;
  cols: number;
  status: boolean;
  seats_count?: number;
  showtimes_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface BackendMovie {
  id: number;
  name: string;
  description?: string;
  poster: string;
  trailer?: string;
  categories?: BackendCategory[];
  actors?: string[] | string;
  director: string;
  rating: number | string;
  age_require: IMovie["ageRequire"];
  duration: number;
  status_release: IMovie["statusRelease"];
  release_date: string;
  end_date: string;
  is_featured: boolean;
  status: boolean;
  country?: string;
  language?: string;
  sub_language?: string;
  available_projection_formats?: IShowtime["projectionFormat"][];
  showtimes_count?: number;
}

interface BackendSeat {
  id: number;
  room_id: number;
  label: string;
  row: number;
  col: number;
  span: number;
  type: ISeat["type"];
  status: boolean;
}

interface BackendShowtimePrice {
  id: number;
  seat_type: string;
  price: number | string;
}

interface BackendShowtime {
  id: number;
  movie_id: number;
  room_id: number;
  movie: BackendMovie;
  room: BackendRoom;
  projection_format?: IShowtime["projectionFormat"];
  start_time: string;
  end_time: string;
  day_of_week: number;
  status: IShowtime["status"];
  booked_count?: number;
  prices?: BackendShowtimePrice[];
  created_at?: string;
  updated_at: string;
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
  user_id?: number | string | null;
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
  projection_format?: ITicket["projectionFormat"];
  start_time: string;
  paid_at?: string | null;
  used_at?: string | null;
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

interface BackendProduct {
  id: number | string;
  name: string;
  type: ProductPayload["type"];
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  variants?: {
    id: number | string;
    name: string;
    sku: string;
    price: number | string;
    stock_quantity?: number | string | null;
    is_active: boolean;
  }[];
}

interface BackendPromotion {
  id: number | string;
  name: string;
  code?: string | null;
  promotion_type: string;
  apply_method: string;
  discount_type: string;
  discount_value: number | string;
  maximum_discount?: number | string | null;
  minimum_order_amount: number | string;
  target_scope: string;
  priority: number | string;
  stackable: boolean;
  is_active: boolean;
  start_at?: string | null;
  end_at?: string | null;
  conditions?: unknown[];
  rewards?: unknown[];
}

const normalizeList = <TBackend, TFrontend>(
  paginator: LaravelPaginator<TBackend>,
  normalize: (item: TBackend) => TFrontend,
): AdminListResult<TFrontend> => ({
  items: paginator.data.map(normalize),
  page: paginator.current_page,
  pageSize: paginator.per_page,
  total: paginator.total,
  totalPages: paginator.last_page,
});

const normalizeCategory = (item: BackendCategory): ICategory => ({
  _id: String(item.id),
  name: item.name,
  description: item.description,
  status: item.status,
  createAt: item.created_at,
  updateAt: item.updated_at,
});

const normalizeRoom = (item: BackendRoom): IRoom => ({
  _id: String(item.id),
  name: item.name,
  description: item.description,
  capacity: item.capacity,
  rows: item.rows,
  cols: item.cols,
  status: item.status,
  supportedProjectionFormats: item.supported_projection_formats || ["2D"],
  seatCount: item.seats_count,
  showtimeCount: item.showtimes_count,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

const normalizeActors = (actors?: string[] | string) => {
  if (Array.isArray(actors)) return actors;
  if (!actors) return [];
  try {
    const parsed = JSON.parse(actors);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return actors
      .split(",")
      .map((actor) => actor.trim())
      .filter(Boolean);
  }
};

const normalizeMovie = (item: BackendMovie): IMovie => ({
  _id: String(item.id),
  name: item.name,
  description: item.description,
  poster: item.poster,
  trailer: item.trailer,
  category: item.categories?.map(normalizeCategory) || [],
  actor: normalizeActors(item.actors),
  director: item.director,
  rating: Number(item.rating),
  ageRequire: item.age_require,
  duration: item.duration,
  statusRelease: item.status_release,
  releaseDate: item.release_date,
  endDate: item.end_date,
  isFeatured: item.is_featured,
  status: item.status,
  country: item.country || "",
  language: item.language || "",
  subLanguage: item.sub_language || "",
  availableProjectionFormats: item.available_projection_formats || ["2D"],
  showtimeCount: item.showtimes_count,
});

const normalizeSeat = (item: BackendSeat): ISeat => ({
  _id: String(item.id),
  roomId: String(item.room_id),
  label: item.label,
  row: item.row,
  col: item.col,
  span: item.span,
  type: item.type,
  status: item.status,
});

const normalizeShowtime = (item: BackendShowtime): IShowtime => ({
  _id: String(item.id),
  movieId: normalizeMovie(item.movie),
  roomId: normalizeRoom(item.room),
  projectionFormat: item.projection_format || "2D",
  startTime: item.start_time,
  endTime: item.end_time,
  dayOfWeek: item.day_of_week,
  price: (item.prices || []).map((price) => ({
    _id: String(price.id),
    seatType: price.seat_type,
    value: Number(price.price),
  })),
  status: item.status,
  bookedCount: item.booked_count,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

const normalizeTicket = (ticket: BackendTicket): ITicket => ({
  _id: String(ticket.id),
  userId: ticket.user_id == null ? "" : String(ticket.user_id),
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
  projectionFormat: ticket.projection_format || "2D",
  startTime: ticket.start_time,
  paidAt: ticket.paid_at,
  usedAt: ticket.used_at,
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

export const adminService = {
  async dashboardOverview(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<IAdminDashboardOverview>>(
      "/admin/dashboard/overview",
      { params },
    );
    return response.data.data;
  },

  async categories(params?: Record<string, unknown>) {
    const response = await api.get<
      ApiResponse<LaravelPaginator<BackendCategory>>
    >("/categories", { params });
    return normalizeList(response.data.data, normalizeCategory);
  },
  async createCategory(payload: CategoryPayload) {
    await api.post("/admin/categories", payload);
  },
  async updateCategory(id: string, payload: CategoryPayload) {
    await api.patch(`/admin/categories/${id}`, payload);
  },
  async disableCategory(id: string) {
    await api.delete(`/admin/categories/${id}`);
  },

  async movies(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<LaravelPaginator<BackendMovie>>>(
      "/admin/movies",
      { params },
    );
    return normalizeList(response.data.data, normalizeMovie);
  },
  async movie(id: string) {
    const response = await api.get<ApiResponse<BackendMovie>>(
      `/admin/movies/${id}`,
    );
    return normalizeMovie(response.data.data);
  },
  async createMovie(payload: MoviePayload) {
    await api.post("/admin/movies", payload);
  },
  async updateMovie(id: string, payload: Partial<MoviePayload>) {
    await api.patch(`/admin/movies/${id}`, payload);
  },
  async disableMovie(id: string) {
    await api.delete(`/admin/movies/${id}`);
  },

  async showtimes(params?: Record<string, unknown>) {
    const response = await api.get<
      ApiResponse<LaravelPaginator<BackendShowtime>>
    >("/admin/showtimes", { params });
    return normalizeList(response.data.data, normalizeShowtime);
  },
  async createShowtime(payload: ShowtimePayload) {
    const response = await api.post<ApiResponse<BackendShowtime>>(
      "/admin/showtimes",
      payload,
    );
    return normalizeShowtime(response.data.data);
  },
  async updateShowtime(
    id: string,
    payload: Partial<ShowtimePayload> & { status?: string },
  ) {
    const response = await api.patch<ApiResponse<BackendShowtime>>(
      `/admin/showtimes/${id}`,
      payload,
    );
    return normalizeShowtime(response.data.data);
  },
  async publishShowtime(id: string) {
    const response = await api.post<ApiResponse<BackendShowtime>>(
      `/admin/showtimes/${id}/publish`,
    );
    return normalizeShowtime(response.data.data);
  },
  async tickets(params?: Record<string, unknown>) {
    const response = await api.get<
      ApiResponse<LaravelPaginator<BackendTicket>>
    >("/admin/tickets", { params });
    return normalizeList(response.data.data, normalizeTicket);
  },

  async rooms(params?: Record<string, unknown>) {
    const response = await api.get<ApiResponse<LaravelPaginator<BackendRoom>>>(
      "/admin/rooms",
      { params },
    );
    return normalizeList(response.data.data, normalizeRoom);
  },
  async room(id: string) {
    const response = await api.get<ApiResponse<BackendRoom>>(
      `/admin/rooms/${id}`,
    );
    return normalizeRoom(response.data.data);
  },
  async createRoom(payload: RoomPayload) {
    await api.post("/admin/rooms", payload);
  },
  async updateRoom(id: string, payload: Partial<RoomPayload>) {
    await api.patch(`/admin/rooms/${id}`, payload);
  },
  async disableRoom(id: string) {
    await api.delete(`/admin/rooms/${id}`);
  },

  async seatLayout(roomId: string) {
    const response = await api.get<
      ApiResponse<{ room: BackendRoom; layout: BackendSeat[][] }>
    >(`/admin/rooms/${roomId}/seats/layout`);
    return {
      room: normalizeRoom(response.data.data.room),
      layout: response.data.data.layout.map((row) => row.map(normalizeSeat)),
    };
  },
  async generateSeats(
    roomId: string,
    payload:
      | ISeat["type"]
      | {
          preset?: "standard" | "normal_only" | "vip_center" | "premium";
          zones?: Array<{
            row_from: number;
            row_to: number;
            col_from: number;
            col_to: number;
            type: ISeat["type"];
          }>;
        },
  ) {
    await api.post(
      `/admin/rooms/${roomId}/seats/generate`,
      typeof payload === "string" ? { type: payload } : payload,
    );
  },
  async updateSeat(id: string, payload: Partial<ISeat>) {
    await api.patch(`/admin/seats/${id}`, payload);
  },

  async checkInTicket(ticketCode: string) {
    const response = await api.post<
      ApiResponse<
        BackendTicket & {
          ticket?: BackendTicket;
          admission?: BackendTicketAdmission;
          check_in?: {
            status: "partial" | "completed";
            checked_in_count: number;
            total_admissions: number;
            remaining_count: number;
          };
        }
      >
    >("/admin/tickets/check-in", { ticket_code: ticketCode });
    const data = response.data.data;
    return {
      ticket: normalizeTicket(data.ticket || data),
      admission: data.admission
        ? {
            _id: String(data.admission.id),
            ticketItemId: String(data.admission.ticket_item_id),
            admissionCode: data.admission.admission_code,
            qrToken: data.admission.qr_token,
            status: data.admission.status,
            usedAt: data.admission.used_at,
            seatLabel: data.admission.ticket_item?.seat_label,
          }
        : null,
      progress: data.check_in || null,
    };
  },

  async concessionTicket(ticketCode: string) {
    const response = await api.get<ApiResponse<BackendTicket>>(
      "/admin/concession/ticket",
      { params: { ticket_code: ticketCode } },
    );
    return normalizeTicket(response.data.data);
  },

  async fulfillConcession(ticketCode: string, itemIds?: string[]) {
    const response = await api.post<ApiResponse<BackendTicket>>(
      "/admin/concession/fulfill",
      {
        ticket_code: ticketCode,
        item_ids: itemIds?.map(Number),
      },
    );
    return normalizeTicket(response.data.data);
  },

  async products(params?: Record<string, unknown>) {
    const response = await api.get<
      ApiResponse<LaravelPaginator<BackendProduct>>
    >("/admin/products", { params });
    return response.data.data;
  },
  async createProduct(payload: ProductPayload) {
    await api.post("/admin/products", payload);
  },
  async updateProduct(id: string, payload: Partial<ProductPayload>) {
    await api.patch(`/admin/products/${id}`, payload);
  },
  async disableProduct(id: string) {
    await api.delete(`/admin/products/${id}`);
  },

  async promotions(params?: Record<string, unknown>) {
    const response = await api.get<
      ApiResponse<LaravelPaginator<BackendPromotion>>
    >("/admin/promotions", { params });
    return response.data.data;
  },
  async createPromotion(payload: PromotionPayload) {
    await api.post("/admin/promotions", payload);
  },
  async updatePromotion(id: string, payload: Partial<PromotionPayload>) {
    await api.patch(`/admin/promotions/${id}`, payload);
  },
  async disablePromotion(id: string) {
    await api.delete(`/admin/promotions/${id}`);
  },
  async createCounterBooking(payload: {
    showtime_id: number;
    seat_ids: number[];
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    product_items?: { product_variant_id: number; quantity: number }[];
    voucher_code?: string;
    payment_method: "CASH";
    amount_received?: number;
    transfer_reference?: string;
    bank_code?: string;
  }) {
    const response = await api.post<ApiResponse<BackendTicket>>(
      "/admin/counter/bookings",
      payload,
    );
    return normalizeTicket(response.data.data);
  },
  async holdCounterSeats(payload: { showtime_id: number; seat_ids: number[] }) {
    await api.post("/admin/counter/holds", payload);
  },
  async releaseCounterSeats(payload: {
    showtime_id: number;
    seat_ids: number[];
  }) {
    await api.post("/admin/counter/holds/release", payload);
  },
  async realtimeHealth() {
    const response = await api.get<
      ApiResponse<{
        broadcast_connection: string;
        is_enabled: boolean;
        is_ready: boolean;
        missing: string[];
        reverb: {
          host?: string | null;
          port?: number | string | null;
          scheme?: string | null;
          app_id_configured: boolean;
          key_configured: boolean;
        };
        seat_channel_pattern: string;
        events: string[];
      }>
    >("/admin/realtime/health");

    return response.data.data;
  },
  async movieRevenue(params: {
    from: string;
    to: string;
    movie_id?: number;
    page?: number;
    per_page?: number;
  }) {
    const response = await api.get<
      ApiResponse<{
        data: MovieRevenueItem[];
        summary: {
          movies: number;
          paid_orders: number;
          sold_seats: number;
          seat_revenue: number;
          product_revenue: number;
          discount_amount: number;
          gross_revenue: number;
          net_revenue: number;
        };
        meta: {
          current_page: number;
          per_page: number;
          total: number;
          last_page: number;
          from: string;
          to: string;
        };
      }>
    >("/admin/reports/movies", { params });
    return response.data.data;
  },
  async concessionOrders(params?: Record<string, unknown>) {
    const response = await api.get<
      ApiResponse<LaravelPaginator<ConcessionOrder>>
    >("/admin/concession/orders", { params });
    return response.data.data;
  },
  async createConcessionOrder(payload: {
    customer_name?: string;
    customer_phone?: string;
    payment_method: "CASH";
    amount_received: number;
    items: { product_variant_id: number; quantity: number }[];
  }) {
    const response = await api.post<ApiResponse<ConcessionOrder>>(
      "/admin/concession/orders",
      payload,
    );
    return response.data.data;
  },
};
