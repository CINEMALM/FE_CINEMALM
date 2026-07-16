import {
  CalendarOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router";
import { QUERYKEY } from "../../../../common/constants/queryKey";
import { getDetailMovie } from "../../../../common/services/movie.service";
import { useCheckoutSelector } from "../../../../common/stores/useCheckoutStore";
import type { ICategory } from "../../../../common/types/category";
import { getAgeBadge } from "../../../../common/utils/agePolicy";
import ModalDescription from "./components/ModalDescription";
import ModalTrailer from "./components/ModalTrailer";

const DetailMovie = () => {
  const { id } = useParams();
  const setInformation = useCheckoutSelector((state) => state.setInformation);
  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERYKEY.MOVIE, id],
    queryFn: () => getDetailMovie(id as string),
    enabled: Boolean(id),
  });
  const movie = data?.data;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    if (!movie) return;
    setInformation({ seat: [], movie, totalPrice: 0 });
  }, [movie, setInformation]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0A0A0A]">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
          Đang tải thông tin phim...
        </p>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0A0A0A] px-4 text-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Không thể tải phim
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold">
            Thông tin phim hiện không khả dụng
          </h1>
        </div>
      </div>
    );
  }

  const ageBadge = getAgeBadge(movie.ageRequire);
  const categories = (movie.category as ICategory[])
    ?.map((item) => item.name)
    .join(", ");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img
            src={movie.poster}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-105 object-cover opacity-25 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/55 via-[#0A0A0A]/85 to-[#0A0A0A]" />
        </div>

        <div className="relative mx-auto grid max-w-[1440px] gap-7 px-4 py-10 sm:px-6 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] lg:gap-10 lg:px-10 lg:py-16">
          <div className="mx-auto w-full max-w-[280px] md:mx-0">
            <div className="border border-white/10 bg-[#141414] p-2">
              <img
                src={movie.poster}
                alt={`Poster phim ${movie.name}`}
                width={600}
                height={900}
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
          </div>

          <div className="min-w-0 self-center">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="border border-black/20 px-2.5 py-1 text-xs font-black"
                style={{
                  backgroundColor: ageBadge.color,
                  color: ["#FFD700", "#32CD32"].includes(ageBadge.color)
                    ? "#0A0A0A"
                    : "#FFFFFF",
                }}
              >
                {ageBadge.label}
              </span>
              <span className="border border-white/15 bg-[#141414]/90 px-2.5 py-1 text-xs font-bold text-[#9A9A9A]">
                {movie.statusRelease === "nowShowing"
                  ? "Đang chiếu"
                  : "Sắp chiếu"}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {movie.name}
            </h1>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#B8B8B8]">
              <span className="flex items-center gap-2">
                <ClockCircleOutlined className="text-[#DC0000]" />
                {movie.duration} phút
              </span>
              <span className="flex items-center gap-2">
                <CalendarOutlined className="text-[#DC0000]" />
                {dayjs(movie.releaseDate).format("DD/MM/YYYY")}
              </span>
              <span className="flex items-center gap-2">
                <GlobalOutlined className="text-[#DC0000]" />
                {movie.country}
              </span>
              {movie.rating > 0 && (
                <span className="flex items-center gap-2">
                  <StarFilled className="text-[#DC0000]" />
                  {movie.rating}/10
                </span>
              )}
            </div>

            <p className="mt-5 text-sm font-semibold text-[#F2F2F2]">
              {categories || "Thể loại chưa cập nhật"}
            </p>
            <p className="mt-4 line-clamp-4 max-w-4xl text-sm leading-7 text-[#9A9A9A] sm:text-base">
              {movie.description || "Nội dung phim đang được cập nhật."}
            </p>

            <div className="mt-6 grid gap-2 text-sm text-[#9A9A9A] sm:grid-cols-2">
              <p>
                <span className="font-bold text-[#F2F2F2]">Đạo diễn:</span>{" "}
                {movie.director || "Chưa cập nhật"}
              </p>
              <p>
                <span className="font-bold text-[#F2F2F2]">Ngôn ngữ:</span>{" "}
                {movie.language || "Chưa cập nhật"}
                {movie.subLanguage ? ` · Phụ đề ${movie.subLanguage}` : ""}
              </p>
              <p className="flex gap-2 sm:col-span-2">
                <TeamOutlined className="mt-1 text-[#DC0000]" />
                <span>
                  <span className="font-bold text-[#F2F2F2]">Diễn viên:</span>{" "}
                  {movie.actor?.join(", ") || "Chưa cập nhật"}
                </span>
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {movie.trailer && (
                <ModalTrailer movie={movie}>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#DC0000] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-[#F2F2F2]"
                  >
                    <PlayCircleOutlined />
                    Xem trailer
                  </button>
                </ModalTrailer>
              )}
              <ModalDescription
                description={movie.description}
                movieName={movie.name}
              >
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center justify-center border border-white/20 px-5 text-xs font-black uppercase tracking-[0.14em] transition hover:border-white/50"
                >
                  Nội dung phim
                </button>
              </ModalDescription>
            </div>
          </div>
        </div>
      </section>

      {movie.statusRelease === "nowShowing" ? (
        <Outlet />
      ) : (
        <section className="border-b border-white/10 bg-[#101010] px-4 py-12 text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Phim chưa mở bán vé
          </p>
          <p className="mt-3 text-sm text-[#9A9A9A]">
            Lịch chiếu sẽ được cập nhật khi phim chính thức công chiếu.
          </p>
        </section>
      )}
    </div>
  );
};

export default DetailMovie;
