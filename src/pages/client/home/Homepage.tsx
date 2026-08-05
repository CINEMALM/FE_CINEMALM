import {
  CreditCardOutlined,
  FireOutlined,
  PlayCircleOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { QUERYKEY } from "../../../common/constants/queryKey";
import { getMovies } from "../../../common/services/movie.service";
import type { ICategory } from "../../../common/types/category";
import { getAgeBadge } from "../../../common/utils/agePolicy";

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
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const featuredQuery = useQuery({
    queryKey: [QUERYKEY.MOVIE, "HOME", "FEATURED"],
    queryFn: () =>
      getMovies({
        is_featured: true,
        per_page: 5,
        sort: "release_date",
      }),
  });
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
  const featuredMovies = (featuredQuery.data?.movies || []).slice(0, 5);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveBannerIndex((current) =>
        current + 1 >= featuredMovies.length ? 0 : current + 1,
      );
    }, 6000);

    return () => window.clearInterval(timer);
  }, [featuredMovies.length]);

  useEffect(() => {
    if (activeBannerIndex >= featuredMovies.length) {
      setActiveBannerIndex(0);
    }
  }, [activeBannerIndex, featuredMovies.length]);

  return (
    <div className="bg-[#0A0A0A] text-[#F2F2F2]">
      <section className="relative overflow-hidden border-b border-white/10">
        {featuredMovies.length ? (
          <div className="relative h-[70svh] min-h-[560px] max-h-[680px] lg:h-[80vh] lg:min-h-0 lg:max-h-none xl:h-[80vh]">
            {featuredMovies.map((movie, index) => {
              const ageBadge = getAgeBadge(movie.ageRequire);
              const rawOffset = index - activeBannerIndex;
              const halfLength = featuredMovies.length / 2;
              const circularOffset =
                rawOffset > halfLength
                  ? rawOffset - featuredMovies.length
                  : rawOffset < -halfLength
                    ? rawOffset + featuredMovies.length
                    : rawOffset;
              const isActive = circularOffset === 0;
              const isAdjacent = Math.abs(circularOffset) === 1;

              return (
                <article
                  key={movie._id}
                  aria-hidden={!isActive}
                  className={`absolute left-1/2 top-0 h-[70svh] min-h-[560px] max-h-[680px] w-[92%] overflow-hidden border-x border-white/10 transition-[transform,opacity,filter] duration-700 ease-in-out sm:w-[88%] lg:h-[80vh] lg:min-h-0 lg:max-h-none lg:w-[84%] xl:h-[80vh] xl:w-[82%] ${
                    isActive
                      ? "pointer-events-auto z-20 opacity-100"
                      : isAdjacent
                        ? "pointer-events-auto z-10 cursor-pointer opacity-55 brightness-50"
                        : "pointer-events-none z-0 opacity-0"
                  }`}
                  style={{
                    transform: `translateX(calc(-50% + ${circularOffset * 78}%)) scale(${isActive ? 1 : 0.82})`,
                  }}
                  onClick={() => {
                    if (isAdjacent) setActiveBannerIndex(index);
                  }}
                >
                  <div className="absolute inset-0">
                    <img
                      src={movie.poster}
                      alt=""
                      className="absolute inset-0 block h-full w-full scale-110 object-cover object-center opacity-45 blur-sm"
                    />
                    <img
                      src={movie.poster}
                      alt={movie.name}
                      className="absolute inset-0 block h-full w-full object-contain object-center lg:hidden"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/90 lg:hidden" />
                  <div className="absolute inset-0 hidden bg-[#0A0A0A]/72 lg:block" />

                  <div className="relative mx-auto flex h-full max-w-[1440px] items-end px-4 pb-20 pt-8 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:px-8 lg:pb-20 lg:pt-12 xl:gap-10 xl:px-10 xl:pb-24 xl:pt-16">
                    <div className="relative w-full max-w-4xl overflow-hidden border border-white/10 bg-black/35 p-4 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none xl:p-0">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent lg:hidden" />
                      <div className="relative z-10">
                        <h1 className="font-display text-[1.75rem] font-bold leading-tight text-[#F2F2F2] sm:text-[2.5rem] lg:text-[3rem] lg:leading-tight xl:text-[4rem]">
                          {movie.name}
                        </h1>
                        <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-[#D8D8D8] sm:mt-4 sm:text-base lg:mt-5 lg:line-clamp-3 lg:text-base lg:leading-7 xl:max-w-xl">
                          {movie.description ||
                            "Khám phá bộ phim nổi bật đang được trình chiếu tại CinemaLM."}
                        </p>

                        <div className="mt-4 flex flex-row gap-2 sm:mt-6 sm:gap-3 md:mt-8">
                          <Link
                            to={`/movie/${movie._id}`}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 bg-[#DC0000] px-3 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition hover:bg-[#F2F2F2] sm:text-xs lg:h-[52px] lg:flex-none lg:gap-3 lg:px-6 lg:text-sm lg:tracking-[0.16em]"
                          >
                            Đặt vé ngay
                            <RightOutlined />
                          </Link>
                          <Link
                            to={`/movie/${movie._id}`}
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-white/20 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#F2F2F2] transition hover:border-white/50 sm:text-xs lg:h-[52px] lg:flex-none lg:gap-3 lg:px-6 lg:text-sm lg:tracking-[0.16em]"
                          >
                            <PlayCircleOutlined />
                            Xem chi tiết
                          </Link>
                        </div>

                        <div className="mt-4 grid max-w-2xl grid-cols-3 border border-white/10 bg-[#141414]/80 sm:mt-6 lg:mt-10">
                          {[
                            [ageBadge.label, "Phân loại"],
                            [`${movie.duration} phút`, "Thời lượng"],
                            [String(movie.rating), "Đánh giá"],
                          ].map(([value, label]) => (
                            <div
                              key={label}
                              className="border-r border-white/10 p-2 last:border-r-0 sm:p-3 lg:p-4"
                            >
                              <p className="font-display text-base font-bold text-[#F2F2F2] sm:text-xl lg:text-3xl">
                                {value}
                              </p>
                              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#9A9A9A] sm:text-[9px] lg:text-[10px] lg:tracking-[0.18em]">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="hidden justify-end lg:flex">
                      <div className="w-full max-w-[260px] border border-white/10 bg-[#141414] p-2 xl:max-w-sm xl:p-3">
                        <img
                          src={movie.poster}
                          alt={movie.name}
                          className="aspect-[2/3] w-full object-cover"
                        />
                        <div className="p-4 xl:p-5">
                          <h2 className="line-clamp-2 font-display text-xl font-bold xl:text-3xl">
                            {movie.name}
                          </h2>
                          <div className="mt-3 flex items-center justify-between text-xs text-[#9A9A9A] xl:mt-4 xl:text-sm">
                            <span>{ageBadge.label}</span>
                            <span>{movie.duration} phút</span>
                            <span className="text-[#F2F2F2]">
                              <StarFilled className="mr-1 text-[#DC0000]" />
                              {movie.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 text-center text-[#9A9A9A]">
            {featuredQuery.isLoading
              ? "Đang tải phim nổi bật..."
              : "Chưa có phim nổi bật."}
          </div>
        )}

        {featuredMovies.length > 0 && (
          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
            {featuredMovies.map((movie, index) => (
              <button
                key={movie._id}
                type="button"
                aria-label={`Hiển thị banner phim ${movie.name}`}
                aria-current={index === activeBannerIndex ? "true" : undefined}
                onClick={() => setActiveBannerIndex(index)}
                className={`block h-3 w-3 shrink-0 appearance-none border p-0 transition-all ${
                  index === activeBannerIndex
                    ? "scale-110 border-[#DC0000] bg-[#DC0000]"
                    : "border-[#DC0000]/45 bg-transparent hover:border-[#DC0000]"
                }`}
                style={{ borderRadius: "9999px" }}
              />
            ))}
          </div>
        )}
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
