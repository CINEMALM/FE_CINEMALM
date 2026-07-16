import type { IMovie } from "../types/movie";
import type { ICategory } from "../types/category";
import type { IParameter } from "../types/parameter";
import api from "../utils/api";

interface BackendCategory {
  id: number | string;
  name: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
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
  country: string;
  language: string;
  sub_language: string;
  showtimes_count?: number;
  created_at?: string;
  updated_at?: string;
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

export interface MovieListResult {
  movies: IMovie[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const normalizeCategory = (category: BackendCategory): ICategory => ({
  _id: String(category.id),
  name: category.name,
  status: Boolean(category.status),
  createAt: category.created_at,
  updateAt: category.updated_at,
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
  category: movie.categories?.map(normalizeCategory) || [],
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
  showtimeCount: Number(movie.showtimes_count || 0),
  createdAt: movie.created_at,
  updatedAt: movie.updated_at,
});

export const getMovies = async (
  params?: IParameter,
): Promise<MovieListResult> => {
  const response = await api.get<
    BackendResponse<LaravelPaginator<BackendMovie>>
  >("/movies", { params });
  const paginator = response.data.data;

  return {
    movies: paginator.data.map(normalizeMovie),
    meta: {
      page: paginator.current_page,
      limit: paginator.per_page,
      total: paginator.total,
      totalPages: paginator.last_page,
    },
  };
};

export const getDetailMovie = async (id: string): Promise<{ data: IMovie }> => {
  const response = await api.get<BackendResponse<BackendMovie>>(
    `/movies/${id}`,
  );
  return { data: normalizeMovie(response.data.data) };
};
