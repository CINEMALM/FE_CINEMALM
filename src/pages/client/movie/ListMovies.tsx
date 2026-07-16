import dayjs from "dayjs";
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
    categories: ["Hành động", "Viễn tưởng"],
    showtimes: {
      [mockDates[0]]: [
        { time: "09:30", room: "Phòng 1" },
        { time: "12:15", room: "Phòng 2" },
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
    <div className="min-h-screen bg-[#020617] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 rounded-full bg-primary" />
          <h2 className="text-xl font-semibold">Phim đang chiếu</h2>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {mockDates.map((item) => {
            const isActive = item === selectedDate;
            return (
              <button
                key={item}
                onClick={() => setSelectedDate(item)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-gray-700/80 bg-slate-900/70 text-gray-300 hover:border-primary/70 hover:text-white"
                }`}
              >
                {dayjs(item).format("DD/MM")}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {mockMovies.map((movie) => {
            const showtimes = movie.showtimes[selectedDate] || [];
            const { label, description } = getAgeBadge(movie.ageRequire);

            return (
              <div
                key={movie.id}
                className="group overflow-hidden rounded-2xl border border-gray-800/70 bg-slate-900/80 shadow-[0_0_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-primary/60"
              >
                <div className="flex flex-col sm:flex-row">
                  <img
                    src={movie.poster}
                    alt={movie.name}
                    className="h-72 w-full object-cover sm:w-48"
                  />
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span>{movie.duration} phút</span>
                      <span>•</span>
                      <span>{movie.country}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      {movie.categories.join(" • ")}
                    </div>
                    <Link
                      to={`/movie/${movie.id}`}
                      className="mt-3 block text-lg font-semibold uppercase text-white transition group-hover:text-primary"
                    >
                      {movie.name}
                    </Link>
                    <p className="mt-2 text-sm text-gray-400">
                      Khởi chiếu:{" "}
                      {dayjs(movie.releaseDate).format("DD/MM/YYYY")}
                    </p>
                    <p className="mt-2 text-sm text-primary">
                      {label} - {description}
                    </p>

                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold text-gray-300">
                        Lịch chiếu
                      </p>
                      {showtimes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {showtimes.map((showtime) => (
                            <button
                              key={`${movie.id}-${showtime.time}`}
                              className="rounded-md border border-gray-600/70 px-2.5 py-1.5 text-sm text-white transition hover:bg-gray-700/70"
                            >
                              {showtime.time} · {showtime.room}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Không có lịch chiếu cho ngày này.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ListMovies;
