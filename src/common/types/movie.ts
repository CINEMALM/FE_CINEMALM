import type { ICategory } from "./category";
import type { IShowtime } from "./showtime";

export interface IMovie {
  _id: string;
  name: string;
  description?: string;
  poster: string;
  category: string[] | ICategory[];
  trailer?: string;
  actor: string[];
  director: string;
  rating: number;
  ageRequire: "P" | "K" | "C13" | "C16" | "C18";
  duration: number;
  statusRelease: "upcoming" | "nowShowing" | "released";
  releaseDate: Date;
  endDate: Date;
  isFeatured: boolean;
  status: boolean;
  country: string;
  language: string;
  subLanguage: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMovieShowtime extends IMovie {
  showtimes: Omit<IShowtime, "movieId">[];
}
