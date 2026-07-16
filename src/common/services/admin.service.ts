import type { ICategory } from "../types/category";
import type { IMovie } from "../types/movie";
import type { IRoom } from "../types/room";
import type { ISeat } from "../types/seat";
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

export interface CategoryPayload {
  name: string;
  description?: string;
  status?: boolean;
}

export interface RoomPayload {
  name: string;
  description?: string;
  rows: number;
  cols: number;
  status?: boolean;
}

export interface MoviePayload {
  name: string;
  description?: string;
  poster: string;
  trailer?: string;
  status_release: IMovie["statusRelease"];
  actors: string[];
  director: string;
  rating: number;
  age_require: IMovie["ageRequire"];
  country?: string;
  language?: string;
  sub_language?: string;
  duration: number;
  release_date: string;
  end_date: string;
  is_featured: boolean;
  status: boolean;
  category_ids: number[];
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

export const adminService = {
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
  async generateSeats(roomId: string, type: ISeat["type"]) {
    await api.post(`/admin/rooms/${roomId}/seats/generate`, { type });
  },
  async updateSeat(id: string, payload: Partial<ISeat>) {
    await api.patch(`/admin/seats/${id}`, payload);
  },
};
