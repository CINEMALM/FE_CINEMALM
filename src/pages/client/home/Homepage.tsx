import {
  CalendarOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  FireOutlined,
  PlayCircleOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "react-router";
import { QUERYKEY } from "../../../common/constants/queryKey";
import { getMovies } from "../../../common/services/movie.service";
import type { ICategory } from "../../../common/types/category";
import { getAgeBadge } from "../../../common/utils/agePolicy";

const featuredMovie = {
  title: "Dạ Khúc Đỏ",
  subtitle: "Suất chiếu đặc biệt cuối tuần",
  description:
    "Một hành trình hồi hộp trong thành phố về đêm, nơi mỗi lựa chọn mở ra một bí mật mới. Đặt ghế đẹp trước khi suất chiếu lấp đầy.",
  image:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1800&q=85",
  poster:
    "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=900&q=85",
};

const experiences = [
  {
    icon: TeamOutlined,
    title: "Giữ ghế realtime",
    text: "Sơ đồ ghế cập nhật theo thời gian thực, tránh trùng ghế khi nhiều người cùng đặt.",
  },
  {
    icon: CreditCardOutlined,
    title: "Thanh toán VNPay",
    text: "Checkout nhanh với thông tin vé rõ ràng trước khi chuyển sang cổng thanh toán.",
  },
  {
    icon: SafetyCertificateOutlined,
    title: "Vé trong tài khoản",
    text: "Theo dõi booking pending, vé đã xác nhận và xem đầy đủ thông tin ghế trong tài khoản.",
  },
];

const HomePage = () => {
  const nowShowingQuery = useQuery({
    queryKey: [QUERYKEY.MOVIE, "HOME", "NOW_SHOWING"],
    queryFn: () =>
      getMovies({
        status_release: "nowShowing",
        sort: "release_date",
        per_page: 4,
      }),
  });
  const comingSoonQuery = useQuery({
    queryKey: [QUERYKEY.MOVIE, "HOME", "COMING_SOON"],
    queryFn: () =>
      getMovies({
        status_release: "upcoming",
        sort: "release_date",
        per_page: 3,
      }),
  });
  const nowShowing = nowShowingQuery.data?.movies || [];
  const comingSoon = comingSoonQuery.data?.movies || [];

  return (
    <div className="bg-[#0A0A0A] text-[#F2F2F2]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-45">
          <img
            src={featuredMovie.image}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-[#0A0A0A]/72" />

        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-[1440px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-16">
          <div className="max-w-3xl pt-8 lg:pt-0">
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#DC0000]">
              {featuredMovie.subtitle}
            </p>
            <h1 className="mt-5 font-display text-[3.5rem] font-bold leading-[0.95] tracking-normal text-[#F2F2F2] sm:text-[5rem] lg:text-[7rem]">
              CinemaLM
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#D8D8D8] sm:text-lg">
              {featuredMovie.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/movie"
                className="inline-flex h-[52px] items-center justify-center gap-3 bg-[#DC0000] px-6 text-sm font-black uppercase tracking-[0.16em] text-[#0A0A0A] transition hover:bg-[#F2F2F2]"
              >
                Đặt vé ngay
                <RightOutlined />
              </Link>
              <button
                type="button"
                className="inline-flex h-[52px] items-center justify-center gap-3 border border-white/20 px-6 text-sm font-bold uppercase tracking-[0.16em] text-[#F2F2F2] transition hover:border-white/50"
              >
                <PlayCircleOutlined />
                Xem trailer
              </button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 border border-white/10 bg-[#141414]/80">
              {[
                ["24", "Suất hôm nay"],
                ["08", "Rạp đối tác"],
                ["4.9", "Đánh giá"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-r border-white/10 p-4 last:border-r-0"
                >
                  <p className="font-display text-3xl font-bold text-[#F2F2F2]">
                    {value}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A9A9A]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="w-full max-w-sm border border-white/10 bg-[#141414] p-3">
              <img
                src={featuredMovie.poster}
                alt={featuredMovie.title}
                className="aspect-[3/4] w-full object-cover"
              />
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9A9A9A]">
                  Featured
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  {featuredMovie.title}
                </h2>
                <div className="mt-4 flex items-center justify-between text-sm text-[#9A9A9A]">
                  <span>T16</span>
                  <span>128 phút</span>
                  <span className="text-[#F2F2F2]">
                    <StarFilled className="mr-1 text-[#DC0000]" />
                    9.2
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="border border-white/10 bg-[#141414] p-4 shadow-2xl shadow-black/30 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
                Đặt vé nhanh
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#F2F2F2]">
                Tìm suất chiếu phù hợp
              </h2>
            </div>
            <div className="grid grid-cols-3 border border-white/10 text-xs font-bold uppercase tracking-[0.12em] text-[#9A9A9A]">
              {["Theo phim", "Theo rạp", "Theo ngày"].map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`h-11 px-3 transition ${
                    index === 0
                      ? "bg-[#DC0000] text-[#0A0A0A]"
                      : "hover:text-[#F2F2F2]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
            {[
              ["Chọn phim", "Màn Đêm Thức Giấc", PlayCircleOutlined],
              ["Ngày chiếu", "Hôm nay, 13/07", CalendarOutlined],
              ["Rạp", "CinemaLM Nam Từ Liêm", EnvironmentOutlined],
              ["Suất", "19:10", ClockCircleOutlined],
            ].map(([label, value, Icon]) => (
              <button
                key={label as string}
                type="button"
                className="flex h-16 items-center gap-3 border border-white/10 bg-[#0A0A0A] px-4 text-left transition hover:border-white/30"
              >
                <Icon className="text-[#DC0000]" />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A9A9A]">
                    {label as string}
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-[#F2F2F2]">
                    {value as string}
                  </span>
                </span>
              </button>
            ))}
            <Link
              to="/movie"
              className="inline-flex h-16 items-center justify-center bg-[#DC0000] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-[#F2F2F2] md:col-span-2 xl:col-span-1"
            >
              Tìm vé
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#DC0000]">
              Now Showing
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-[#F2F2F2] sm:text-5xl">
              Đang chiếu
            </h2>
          </div>
          <Link
            to="/movie"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#F2F2F2]"
          >
            Xem tất cả
            <RightOutlined />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {nowShowingQuery.isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="animate-pulse border border-white/10 bg-[#141414] p-2"
                >
                  <div className="aspect-[2/3] bg-white/5" />
                  <div className="mt-3 h-4 bg-white/5" />
                  <div className="mt-2 h-3 w-2/3 bg-white/5" />
                </div>
              ))
            : nowShowing.map((movie) => {
                const ageBadge = getAgeBadge(movie.ageRequire);
                const genres = (movie.category as ICategory[])
                  .map((category) => category.name)
                  .join(", ");

                return (
                  <article
                    key={movie._id}
                    className="group min-w-0 border border-white/10 bg-[#141414] p-1.5 transition duration-300 hover:z-10 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30 sm:p-2"
                  >
                    <Link
                      to={`/movie/${movie._id}`}
                      aria-label={`Xem chi tiết phim ${movie.name}`}
                      className="relative block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000]"
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
                        className="absolute left-2 top-2 border border-black/20 px-2 py-0.5 text-[10px] font-black shadow-lg sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs"
                        style={{
                          backgroundColor: ageBadge.color,
                          color: ["#FFD700", "#32CD32"].includes(ageBadge.color)
                            ? "#0A0A0A"
                            : "#FFFFFF",
                        }}
                      >
                        {ageBadge.label}
                      </span>
                    </Link>
                    <div className="px-1 pb-1 pt-2.5 sm:px-2 sm:pb-2 sm:pt-3">
                      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                        <Link
                          to={`/movie/${movie._id}`}
                          className="line-clamp-2 font-display text-sm font-bold leading-tight text-[#F2F2F2] transition hover:text-[#DC0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000] sm:text-base lg:text-lg"
                        >
                          {movie.name}
                        </Link>
                        <span
                          className="shrink-0 text-[11px] font-bold text-[#F2F2F2] sm:text-xs"
                          aria-label={`Điểm đánh giá ${movie.rating} trên 10`}
                        >
                          <StarFilled className="mr-1 text-[#DC0000]" />
                          {movie.rating}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-1 text-[11px] text-[#9A9A9A] sm:text-xs">
                        {genres || "Chưa cập nhật thể loại"}
                      </p>
                      <div className="pt-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#9A9A9A] sm:text-[10px]">
                        {movie.duration} phút
                        {movie.showtimeCount
                          ? ` · ${movie.showtimeCount} suất chiếu`
                          : " · Lịch chiếu đang cập nhật"}
                      </div>
                      <Link
                        to={`/movie/${movie._id}`}
                        className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center gap-1.5 border-t border-white/10 pt-2.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#F2F2F2] transition hover:text-[#DC0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000] sm:min-h-10 sm:text-[10px]"
                      >
                        Xem chi tiết
                        <RightOutlined aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
        </div>
        {nowShowingQuery.isError && (
          <p className="mt-6 text-center text-sm text-[#9A9A9A]">
            Không thể tải phim đang chiếu.
          </p>
        )}
      </section>

      <section className="border-y border-white/10 bg-[#101010]">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#DC0000]">
              Coming Soon
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-[#F2F2F2] sm:text-5xl">
              Sắp chiếu
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#9A9A9A]">
              Theo dõi lịch khởi chiếu, đặt nhắc lịch và sẵn sàng chọn ghế ngay
              khi hệ thống mở bán.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
            {comingSoonQuery.isLoading
              ? Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse border border-white/10 bg-[#141414] p-2"
                  >
                    <div className="aspect-[2/3] bg-white/5" />
                    <div className="mt-3 h-3 bg-white/5" />
                    <div className="mt-2 h-4 bg-white/5" />
                  </div>
                ))
              : comingSoon.map((movie) => (
                  <Link
                    key={movie._id}
                    to={`/movie/${movie._id}`}
                    aria-label={`Xem chi tiết phim ${movie.name}`}
                    className="group border border-white/10 bg-[#141414] p-2 transition hover:-translate-y-1 hover:border-white/30 sm:p-3"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.name}
                      width={600}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#DC0000] sm:mt-4 sm:text-xs sm:tracking-[0.2em]">
                      {dayjs(movie.releaseDate).format("DD.MM.YYYY")}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-base font-bold leading-tight text-[#F2F2F2] sm:text-xl lg:text-2xl">
                      {movie.name}
                    </h3>
                  </Link>
                ))}
          </div>
          {comingSoonQuery.isError && (
            <p className="text-sm text-[#9A9A9A]">
              Không thể tải phim sắp chiếu.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#101010]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#DC0000]">
                CinemaLM Experience
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold text-[#F2F2F2] sm:text-5xl">
                Trải nghiệm đặt vé liền mạch
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#9A9A9A]">
              <SafetyCertificateOutlined className="text-[#DC0000]" />
              Cookie auth, bảo mật tốt hơn cho tài khoản
            </div>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {experiences.map((item) => (
              <article
                key={item.title}
                className="border border-white/10 bg-[#141414] p-6"
              >
                <item.icon className="text-3xl text-[#DC0000]" />
                <h3 className="mt-6 font-display text-2xl font-bold text-[#F2F2F2]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#9A9A9A]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 grid gap-6 border border-white/10 bg-[#0A0A0A] p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
                <FireOutlined />
                Thành viên CinemaLM
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold text-[#F2F2F2]">
                Lưu vé, nhận ưu đãi và quay lại lịch sử đặt vé bất cứ lúc nào.
              </h3>
            </div>
            <Link
              to="/profile"
              className="inline-flex h-[52px] items-center justify-center border border-white/20 px-6 text-sm font-bold uppercase tracking-[0.16em] text-[#F2F2F2] transition hover:border-white/50"
            >
              Tài khoản của tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
