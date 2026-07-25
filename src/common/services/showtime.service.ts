import type { ICategory } from "../types/category";
import type { IMovie, IMovieShowtime } from "../types/movie";
import type { IParameter } from "../types/parameter";
import type { TypeResponse } from "../types/response";
import dayjs from "dayjs";
import type { IShowtime, IWeekdayShowtime } from "../types/showtime";
import api from "../utils/api";

interface BackendRoom {
  id: number | string;
  name: string;
  description?: string;
  capacity: number;
  cols: number;
  rows: number;
  status: boolean;
  supported_projection_formats?: IShowtime["projectionFormat"][];
  created_at?: string;
  updated_at?: string;
}

interface BackendShowtimePrice {
  id: number | string;
  seat_type: string;
  price: number | string;
}

interface BackendShowtime {
  id: number | string;
  movie_id: number | string;
  room_id: number | string;
  projection_format?: IShowtime["projectionFormat"];
  start_time: string;
  end_time: string;
  day_of_week: number;
  status: IShowtime["status"];
  booked_count?: number;
  seat_statuses_count?: number;
  booking_close_at?: string | null;
  booking_closed_reason?: IShowtime["bookingClosedReason"];
  is_booking_open?: boolean;
  is_sold_out?: boolean;
  room: BackendRoom;
  prices?: BackendShowtimePrice[];
  created_at?: string;
  updated_at: string;
  movie: BackendMovie;
}

interface BackendCategory {
  id: number | string;
  name: string;
  status: boolean;
}

interface BackendMovie {
  id: number | string;
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
}

interface LaravelPaginator<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const normalizeRoom = (room: BackendRoom) => ({
  _id: String(room.id),
  name: room.name,
  description: room.description,
  capacity: Number(room.capacity || 0),
  cols: Number(room.cols || 0),
  rows: Number(room.rows || 0),
  status: Boolean(room.status),
  supportedProjectionFormats: room.supported_projection_formats || ["2D"],
  createdAt: room.created_at,
  updatedAt: room.updated_at,
});

const normalizeActors = (actors?: BackendMovie["actors"]): string[] => {
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

const normalizeMovie = (movie: BackendMovie): IMovie => ({
  _id: String(movie.id),
  name: movie.name,
  description: movie.description,
  poster: movie.poster,
  trailer: movie.trailer,
  category: (movie.categories || []).map<ICategory>((category) => ({
    _id: String(category.id),
    name: category.name,
    status: Boolean(category.status),
  })),
  actor: normalizeActors(movie.actors),
  director: movie.director,
  rating: Number(movie.rating || 0),
  ageRequire: movie.age_require,
  duration: Number(movie.duration || 0),
  statusRelease: movie.status_release,
  releaseDate: movie.release_date,
  endDate: movie.end_date,
  isFeatured: Boolean(movie.is_featured),
  status: Boolean(movie.status),
  country: movie.country || "",
  language: movie.language || "",
  subLanguage: movie.sub_language || "",
  availableProjectionFormats: movie.available_projection_formats || ["2D"],
});

const normalizeShowtime = (showtime: BackendShowtime): IShowtime => {
  const prices = (showtime.prices || []).map((price) => ({
    _id: String(price.id),
    seatType: price.seat_type,
    value: Number(price.price),
  }));

  return {
    _id: String(showtime.id),
    movieId: showtime.movie
      ? normalizeMovie(showtime.movie)
      : ({ _id: String(showtime.movie_id) } as IShowtime["movieId"]),
    roomId: {
      ...normalizeRoom(showtime.room),
      showtimeId: String(showtime.id),
      showtimePrice: prices,
      showtimeProjectionFormat: showtime.projection_format || "2D",
    },
    projectionFormat: showtime.projection_format || "2D",
    startTime: showtime.start_time,
    endTime: showtime.end_time,
    dayOfWeek: Number(showtime.day_of_week),
    price: prices,
    status: showtime.status,
    bookedCount: Number(showtime.booked_count || 0),
    bookingCloseAt: showtime.booking_close_at || null,
    bookingClosedReason: showtime.booking_closed_reason || null,
    isBookingOpen: Boolean(showtime.is_booking_open),
    isSoldOut: Boolean(showtime.is_sold_out),
    createdAt: showtime.created_at,
    updatedAt: showtime.updated_at,
  };
};

export const getShowtimeWeekday = async (
  params?: IParameter,
): Promise<TypeResponse<IWeekdayShowtime>> => {
  const movieId = params?.movieId;
  const page = Math.max(1, Number(params?.page || 1));
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() + (page - 1) * 7);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const response = await api.get<
    BackendResponse<LaravelPaginator<BackendShowtime>>
  >(`/movies/${movieId}/showtimes`, {
    params: {
      from_date: formatDate(startDate),
      to_date: formatDate(endDate),
      per_page: 100,
    },
  });
  const paginator = response.data.data;
  const grouped = paginator.data.reduce<IWeekdayShowtime>((result, item) => {
    const normalized = normalizeShowtime(item);
    const date = dayjs(normalized.startTime).format("YYYY-MM-DD");
    const showtimeAtSameTime = result[date]?.find(
      (current) => current.startTime === normalized.startTime,
    );

    if (showtimeAtSameTime) {
      showtimeAtSameTime.externalRoom = [
        ...(showtimeAtSameTime.externalRoom || [showtimeAtSameTime.roomId]),
        {
          ...normalized.roomId,
          showtimeId: normalized._id,
          showtimePrice: normalized.price,
          showtimeProjectionFormat: normalized.projectionFormat,
        },
      ];
    } else {
      result[date] = [...(result[date] || []), normalized];
    }
    return result;
  }, {});

  return {
    success: response.data.success,
    message: response.data.message,
    data: grouped,
    meta: {
      page,
      limit: 7,
      total: paginator.total,
      totalPages: paginator.last_page,
    },
  };
};

export const getMovieShowtimes = async (
  params?: IParameter,
): Promise<TypeResponse<IMovieShowtime[]>> => {
  const response = await api.get<
    BackendResponse<LaravelPaginator<BackendShowtime>>
  >("/showtimes", {
    params: {
      from_date: params?.startTimeFrom
        ? String(params.startTimeFrom).slice(0, 10)
        : undefined,
      to_date: params?.startTimeTo
        ? String(params.startTimeTo).slice(0, 10)
        : undefined,
      per_page: 100,
    },
  });
  const movies = new Map<string, IMovieShowtime>();

  response.data.data.data.forEach((item) => {
    const showtime = normalizeShowtime(item);
    const movie = showtime.movieId;
    const current = movies.get(movie._id);
    if (current) {
      const sameTime = current.showtimes.find(
        (item) => item.startTime === showtime.startTime,
      );
      if (sameTime) {
        sameTime.externalRoom = [
          ...(sameTime.externalRoom || [sameTime.roomId]),
          {
            ...showtime.roomId,
            showtimeProjectionFormat: showtime.projectionFormat,
          },
        ];
      } else {
        current.showtimes.push(showtime);
      }
    } else {
      movies.set(movie._id, { ...movie, showtimes: [showtime] });
    }
  });

  return {
    success: response.data.success,
    message: response.data.message,
    data: Array.from(movies.values()),
    meta: null,
  };
};
