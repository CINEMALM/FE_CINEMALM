import {
  CalendarOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  FireOutlined,
  PlayCircleOutlined,
  QrcodeOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";

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

const nowShowing = [
  {
    title: "Màn Đêm Thức Giấc",
    age: "T16",
    genre: "Tâm lý, hồi hộp",
    rating: "9.1",
    poster:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=700&q=85",
    times: ["10:30", "13:45", "19:10"],
  },
  {
    title: "Hạ Âm",
    age: "K",
    genre: "Gia đình, âm nhạc",
    rating: "8.8",
    poster:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=700&q=85",
    times: ["09:15", "15:20", "20:30"],
  },
  {
    title: "Đường Đua Cuối",
    age: "T13",
    genre: "Hành động",
    rating: "9.0",
    poster:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=700&q=85",
    times: [
      "11:00",
      "16:40",
      "21:45",
      "11:00",
      "16:40",
      "21:45",
      "11:00",
      "16:40",
      "21:45",
      "11:00",
      "16:40",
      "21:45",
      "11:00",
      "16:40",
      "21:45",
      "11:00",
      "16:40",
      "21:45",
    ],
  },
  {
    title: "Ký Ức Rạp Số 7",
    age: "T18",
    genre: "Kinh dị",
    rating: "8.6",
    poster:
      "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=700&q=85",
    times: ["18:00", "22:15", "23:30"],
  },
];

const comingSoon = [
  {
    title: "Thành Phố Không Ngủ",
    date: "24.07",
    image:
      "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Mùa Gió Trở Lại",
    date: "31.07",
    image:
      "https://images.unsplash.com/photo-1460881680858-30d872d5b530?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Vòng Lặp Ánh Sáng",
    date: "08.08",
    image:
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=700&q=85",
  },
];

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
    icon: QrcodeOutlined,
    title: "Vé QR trong tài khoản",
    text: "Quản lý vé đã mua, xem chi tiết vé và dùng QR để xác nhận tại rạp.",
  },
];

const HomePage = () => {
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
                to="/showtime"
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
              to="/showtime"
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
          {nowShowing.map((movie) => (
            <article
              key={movie.title}
              className="group min-w-0 border border-white/10 bg-[#141414] p-1.5 transition duration-300 hover:z-10 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-black/30 sm:p-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  width={600}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 bg-[#0A0A0A] px-2 py-0.5 text-[10px] font-black text-[#F2F2F2] shadow-lg sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
                  {movie.age}
                </span>
              </div>
              <div className="px-1 pb-1 pt-2.5 sm:px-2 sm:pb-2 sm:pt-3">
                <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                  <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-[#F2F2F2] sm:text-base lg:text-lg">
                    {movie.title}
                  </h3>
                  <span
                    className="shrink-0 text-[11px] font-bold text-[#F2F2F2] sm:text-xs"
                    aria-label={`Điểm đánh giá ${movie.rating} trên 10`}
                  >
                    <StarFilled className="mr-1 text-[#DC0000]" />
                    {movie.rating}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-1 text-[11px] text-[#9A9A9A] sm:text-xs">
                  {movie.genre}
                </p>
                <div className="pt-2.5">
                  <p className="mb-1.5 flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#9A9A9A] sm:text-[9px]">
                    <ClockCircleOutlined className="text-[#DC0000]" />
                    Lịch chiếu
                  </p>
                  <div className="flex max-h-[76px] flex-wrap content-start gap-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                    {movie.times.map((time) => (
                      <Link
                        key={time}
                        to="/showtime"
                        aria-label={`Đặt suất ${time}, phim ${movie.title}`}
                        className="inline-flex min-h-7 shrink-0 items-center justify-center border border-white/10 px-2 py-1 text-[10px] font-bold leading-none text-[#F2F2F2] transition hover:border-[#DC0000] hover:bg-[#DC0000] hover:text-[#0A0A0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC0000] sm:min-h-8 sm:text-[11px]"
                      >
                        {time}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
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

          <div className="grid gap-4 sm:grid-cols-3">
            {comingSoon.map((movie) => (
              <article
                key={movie.title}
                className="border border-white/10 bg-[#141414] p-3"
              >
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="aspect-[4/5] w-full object-cover"
                />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#DC0000]">
                  {movie.date}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-[#F2F2F2]">
                  {movie.title}
                </h3>
              </article>
            ))}
          </div>
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
