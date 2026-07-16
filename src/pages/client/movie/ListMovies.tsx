import dayjs from "dayjs";
import { RightOutlined, StarFilled } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { QUERYKEY } from "../../../common/constants/queryKey";
import { getMovies } from "../../../common/services/movie.service";
import type { ICategory } from "../../../common/types/category";
import type { IMovie } from "../../../common/types/movie";
import { getAgeBadge } from "../../../common/utils/agePolicy";

type MovieStatusFilter = "nowShowing" | "upcoming" | "released";

const movieFilters: { label: string; value: MovieStatusFilter }[] = [
  { label: "Đang chiếu", value: "nowShowing" },
  { label: "Sắp chiếu", value: "upcoming" },
  { label: "Đã chiếu", value: "released" },
];

const statusContent: Record<
  MovieStatusFilter,
  { eyebrow: string; title: string; description: string }
> = {
  nowShowing: {
    eyebrow: "Now Showing",
    title: "Phim đang chiếu",
    description:
      "Khám phá các bộ phim đang được phát hành và chọn suất chiếu phù hợp với bạn.",
  },
  upcoming: {
    eyebrow: "Coming Soon",
    title: "Phim sắp chiếu",
    description:
      "Theo dõi những bộ phim chuẩn bị ra mắt và cập nhật ngày khởi chiếu.",
  },
  released: {
    eyebrow: "Released",
    title: "Phim đã chiếu",
    description:
      "Khám phá lại những bộ phim đã kết thúc thời gian phát hành tại rạp.",
  },
};

const ListMovies = () => {
  const [statusFilter, setStatusFilter] =
    useState<MovieStatusFilter>("nowShowing");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERYKEY.MOVIE, statusFilter],
    queryFn: () =>
      getMovies({
        status_release: statusFilter,
        sort: "release_date",
        per_page: 60,
      }),
  });
  const movies = data?.movies || [];
  const currentContent = statusContent[statusFilter];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      <section className="border-b border-white/10 bg-[#101010]">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#DC0000]">
            {currentContent.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            {currentContent.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9A9A9A]">
            {currentContent.description}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
        <div className="border border-white/10 bg-[#141414] p-4 sm:p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DC0000]">
            Danh mục phim
          </p>
          <div className="mt-4 grid grid-cols-3">
            {movieFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={filter.value === statusFilter}
                onClick={() => setStatusFilter(filter.value)}
                className={`min-h-11 border px-2 text-[10px] font-black uppercase tracking-[0.1em] transition sm:text-xs ${
                  filter.value === statusFilter
                    ? "border-[#DC0000] bg-[#DC0000] text-[#0A0A0A]"
                    : "border-white/10 bg-[#0A0A0A] text-[#9A9A9A] hover:border-white/30 hover:text-[#F2F2F2]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 10 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse border border-white/10 bg-[#141414] p-2"
              >
                <div className="aspect-[2/3] bg-white/5" />
                <div className="mt-3 h-4 bg-white/5" />
                <div className="mt-2 h-3 w-2/3 bg-white/5" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="mt-7 border border-[#DC0000]/30 bg-[#141414] px-5 py-12 text-center">
            <p className="text-sm text-[#9A9A9A]">
              Không thể tải danh sách phim.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 min-h-10 bg-[#DC0000] px-5 text-xs font-black uppercase tracking-[0.12em] text-[#0A0A0A]"
            >
              Thử lại
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="mt-7 border border-dashed border-white/10 bg-[#141414] px-5 py-12 text-center text-sm text-[#9A9A9A]">
            Chưa có phim trong danh mục này.
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {movies.map((movie: IMovie) => {
              const { label, color, description } = getAgeBadge(
                movie.ageRequire,
              );
              const categories = (movie.category as ICategory[])
                .map((category) => category.name)
                .join(", ");

              return (
                <article
                  key={movie._id}
                  className="group flex min-w-0 flex-col border border-white/10 bg-[#141414] p-1.5 transition duration-300 hover:z-10 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30 sm:p-2"
                >
                  <Link
                    to={`/movie/${movie._id}`}
                    aria-label={`Xem chi tiết phim ${movie.name}`}
                    className="relative block overflow-hidden bg-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000]"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.name}
                      width={600}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span
                      title={description}
                      className="absolute left-2 top-2 border border-black/20 px-2 py-0.5 text-[10px] font-black shadow-lg sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs"
                      style={{
                        backgroundColor: color,
                        color: ["#FFD700", "#32CD32"].includes(color)
                          ? "#0A0A0A"
                          : "#FFFFFF",
                      }}
                    >
                      {label}
                    </span>
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 pt-2.5 sm:px-2 sm:pb-2 sm:pt-3">
                    <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                      <Link
                        to={`/movie/${movie._id}`}
                        className="line-clamp-2 font-display text-sm font-bold leading-tight text-[#F2F2F2] transition hover:text-[#DC0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000] sm:text-base lg:text-lg"
                      >
                        {movie.name}
                      </Link>
                      <span
                        className="shrink-0 text-[11px] font-bold sm:text-xs"
                        aria-label={`Điểm đánh giá ${movie.rating} trên 10`}
                      >
                        <StarFilled className="mr-1 text-[#DC0000]" />
                        {movie.rating}
                      </span>
                    </div>

                    <p className="mt-1.5 line-clamp-1 text-[11px] text-[#9A9A9A] sm:text-xs">
                      {categories || "Chưa cập nhật thể loại"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] font-semibold text-[#9A9A9A] sm:mt-2 sm:text-xs">
                      <span>{movie.duration} phút</span>
                      <span className="hidden text-white/20 sm:inline">•</span>
                      <span className="hidden sm:inline">{movie.country}</span>
                      <span className="hidden text-white/20 lg:inline">•</span>
                      <time
                        dateTime={String(movie.releaseDate)}
                        className="hidden lg:inline"
                      >
                        {dayjs(movie.releaseDate).format("DD/MM/YYYY")}
                      </time>
                    </div>

                    <div className="pt-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#9A9A9A] sm:text-[10px]">
                      {movie.showtimeCount
                        ? `${movie.showtimeCount} suất chiếu`
                        : statusFilter === "nowShowing"
                          ? "Lịch chiếu đang cập nhật"
                          : "Thông tin phát hành"}
                    </div>

                    <Link
                      to={`/movie/${movie._id}`}
                      className="mt-auto inline-flex min-h-9 items-center justify-center gap-1.5 border-t border-white/10 pt-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#F2F2F2] transition hover:text-[#DC0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000] sm:min-h-10 sm:text-[10px] sm:tracking-[0.14em]"
                    >
                      Xem chi tiết
                      <RightOutlined aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ListMovies;
