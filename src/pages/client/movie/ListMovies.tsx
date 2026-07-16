import dayjs from "dayjs";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  RightOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useState } from "react";
import { Link } from "react-router";
import { getAgeBadge } from "../../../common/utils/agePolicy";

const mockDates = Array.from({ length: 7 }, (_, index) =>
  dayjs().add(index, "day").format("YYYY-MM-DD"),
);

const mockMovies = [
  {
    id: "movie-1",
    name: "Dune: Part Two",
    poster:
      "https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=900&q=80",
    duration: 166,
    country: "Mỹ",
    releaseDate: "2024-03-01",
    ageRequire: 13,
    rating: "9.1",
    categories: ["Hành động", "Viễn tưởng"],
    showtimes: {
      [mockDates[0]]: [
        { time: "09:30", room: "Phòng 1" },
        { time: "12:15", room: "Phòng 2" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
        { time: "09:30", room: "Phòng 1" },
        { time: "12:15", room: "Phòng 2" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
        { time: "19:45", room: "Phòng 3" },
      ],
      [mockDates[1]]: [
        { time: "10:30", room: "Phòng 1" },
        { time: "13:30", room: "Phòng 2" },
      ],
      [mockDates[2]]: [{ time: "20:00", room: "Phòng 3" }],
    },
  },
  {
    id: "movie-2",
    name: "Kung Fu Panda 4",
    poster:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
    duration: 94,
    country: "Mỹ",
    releaseDate: "2024-03-15",
    ageRequire: 0,
    rating: "8.8",
    categories: ["Hoạt hình", "Gia đình"],
    showtimes: {
      [mockDates[0]]: [
        { time: "11:00", room: "Phòng 4" },
        { time: "14:30", room: "Phòng 5" },
      ],
      [mockDates[1]]: [{ time: "16:00", room: "Phòng 4" }],
      [mockDates[3]]: [{ time: "18:30", room: "Phòng 5" }],
    },
  },
  {
    id: "movie-3",
    name: "Inside Out 2",
    poster:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
    duration: 96,
    country: "Mỹ",
    releaseDate: "2024-06-14",
    ageRequire: 0,
    rating: "9.0",
    categories: ["Hoạt hình", "Tâm lý"],
    showtimes: {
      [mockDates[0]]: [{ time: "08:45", room: "Phòng 6" }],
      [mockDates[2]]: [
        { time: "09:15", room: "Phòng 6" },
        { time: "19:30", room: "Phòng 7" },
      ],
      [mockDates[4]]: [{ time: "17:00", room: "Phòng 6" }],
    },
  },
];

const ListMovies = () => {
  const [selectedDate, setSelectedDate] = useState(mockDates[0]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      <section className="border-b border-white/10 bg-[#101010]">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#DC0000]">
            Now Showing
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Phim đang chiếu
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9A9A9A]">
            Chọn ngày, khám phá các bộ phim nổi bật và đặt suất chiếu phù hợp
            với bạn.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
        <div className="border border-white/10 bg-[#141414] p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-[#DC0000]" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              Chọn ngày xem
            </p>
          </div>

          <div className="-mx-1 mt-4 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-7 sm:overflow-visible sm:pb-0">
            {mockDates.map((item, index) => {
              const isActive = item === selectedDate;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedDate(item)}
                  aria-pressed={isActive}
                  aria-label={`Xem lịch chiếu ngày ${dayjs(item).format(
                    "DD/MM/YYYY",
                  )}`}
                  className={`min-h-16 min-w-24 snap-start border px-3 py-2 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] sm:min-w-0 ${
                    isActive
                      ? "border-[#DC0000] bg-[#DC0000] text-[#0A0A0A]"
                      : "border-white/10 bg-[#0A0A0A] text-[#9A9A9A] hover:border-white/30 hover:text-[#F2F2F2]"
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-[0.14em]">
                    {index === 0 ? "Hôm nay" : dayjs(item).format("ddd")}
                  </span>
                  <span className="mt-1 block text-lg font-bold">
                    {dayjs(item).format("DD/MM")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {mockMovies.map((movie) => {
            const showtimes = movie.showtimes[selectedDate] || [];
            const { label, color, description } = getAgeBadge(movie.ageRequire);

            return (
              <article
                key={movie.id}
                className="group flex min-w-0 flex-col border border-white/10 bg-[#141414] p-1.5 transition duration-300 hover:z-10 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30 sm:p-2"
              >
                <Link
                  to={`/movie/${movie.id}`}
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
                      to={`/movie/${movie.id}`}
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
                    {movie.categories.join(", ")}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] font-semibold text-[#9A9A9A] sm:mt-2 sm:text-xs">
                    <span>{movie.duration} phút</span>
                    <span className="hidden text-white/20 sm:inline">•</span>
                    <span className="hidden sm:inline">{movie.country}</span>
                    <span className="hidden text-white/20 lg:inline">•</span>
                    <time
                      dateTime={movie.releaseDate}
                      className="hidden lg:inline"
                    >
                      {dayjs(movie.releaseDate).format("DD/MM/YYYY")}
                    </time>
                  </div>

                  <div className="pt-2.5">
                    <p className="mb-1.5 flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#9A9A9A] sm:text-[9px]">
                      <ClockCircleOutlined className="text-[#DC0000]" />
                      Lịch chiếu
                    </p>
                    {showtimes.length > 0 ? (
                      <div className="flex max-h-[76px] flex-wrap content-start gap-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                        {showtimes.map((showtime) => (
                          <Link
                            key={`${movie.id}-${showtime.time}`}
                            to="/showtime"
                            aria-label={`Đặt suất ${showtime.time}, ${showtime.room}, phim ${movie.name}`}
                            title={`${showtime.time} · ${showtime.room}`}
                            className="inline-flex min-h-7 shrink-0 items-center justify-center border border-white/10 px-2 py-1 text-[10px] font-bold leading-none text-[#F2F2F2] transition hover:border-[#DC0000] hover:bg-[#DC0000] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000] sm:min-h-8 sm:text-[11px]"
                          >
                            {showtime.time}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex min-h-8 items-center border border-dashed border-white/10 px-2 py-1.5 text-[9px] text-[#666666] sm:text-[10px]">
                        Chưa có suất chiếu.
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/movie/${movie.id}`}
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
      </main>
    </div>
  );
};

export default ListMovies;
