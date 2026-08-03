import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  DesktopOutlined,
  ScheduleOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Empty, Spin, Tag } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router";
import { adminService } from "../../common/services/admin.service";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value?: number) => currency.format(value || 0);
const formatNumber = (value?: number) => number.format(value || 0);

const AdminDashboard = () => {
  const overview = useQuery({
    queryKey: ["ADMIN", "DASHBOARD", "OVERVIEW"],
    queryFn: adminService.dashboardOverview,
  });

  const data = overview.data;
  const summary = data?.summary;
  const today = data?.today;

  const cards = [
    {
      label: "Doanh thu tháng",
      value: formatCurrency(summary?.revenue_month),
      hint: `${summary?.revenue_growth_percent ?? 0}% so với tháng trước`,
      icon: CreditCardOutlined,
      to: "/admin/tickets",
    },
    {
      label: "Vé đã thanh toán",
      value: formatNumber(summary?.tickets_paid_total),
      hint: `${formatNumber(summary?.tickets_today)} vé hôm nay`,
      icon: CheckCircleOutlined,
      to: "/admin/tickets",
    },
    {
      label: "Suất hôm nay",
      value: formatNumber(summary?.showtimes_today),
      hint: `${formatNumber(summary?.upcoming_showtimes)} suất sắp tới`,
      icon: ScheduleOutlined,
      to: "/admin/showtimes",
    },
    {
      label: "Check-in hôm nay",
      value: formatNumber(summary?.check_ins_today),
      hint: "Vé đã quét tại rạp",
      icon: ClockCircleOutlined,
      to: "/admin/check-in",
    },
    {
      label: "Khách hàng",
      value: formatNumber(summary?.clients),
      hint: "Tài khoản client",
      icon: TeamOutlined,
      to: "/admin/tickets",
    },
    {
      label: "Phim / Phòng",
      value: `${formatNumber(summary?.movies)} / ${formatNumber(summary?.rooms)}`,
      hint: "Master data đang quản lý",
      icon: DesktopOutlined,
      to: "/admin/movies",
    },
  ];

  if (overview.isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
        Dashboard
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        Tổng quan vận hành
      </h1>

      {overview.isError && (
        <Alert
          className="mt-6"
          type="error"
          showIcon
          message="Không thể tải dashboard vận hành."
        />
      )}

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="border border-white/10 bg-[#141414] p-5 transition hover:border-white/30"
          >
            <card.icon className="text-2xl text-[#DC0000]" />
            <p className="mt-6 font-display text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
              {card.label}
            </p>
            <p className="mt-2 text-xs text-[#9A9A9A]">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-white/10 bg-[#101010] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Hôm nay</h2>
              <p className="mt-1 text-xs text-[#9A9A9A]">
                {today?.date ? dayjs(today.date).format("DD/MM/YYYY") : "--"}
              </p>
            </div>
            {summary?.pending_payments ? (
              <Tag color="orange">
                {summary.pending_payments} payment đang chờ
              </Tag>
            ) : (
              <Tag color="green">Payment ổn</Tag>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Metric label="Doanh thu" value={formatCurrency(today?.revenue)} />
            <Metric label="Vé bán" value={formatNumber(today?.tickets)} />
            <Metric label="Suất chiếu" value={formatNumber(today?.showtimes)} />
            <Metric label="Check-in" value={formatNumber(today?.check_ins)} />
          </div>

          <h3 className="mt-7 text-sm font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
            Suất sắp tới
          </h3>
          <div className="mt-3 space-y-2">
            {data?.upcoming_showtimes.length ? (
              data.upcoming_showtimes.map((showtime) => (
                <div
                  key={String(showtime.id)}
                  className="flex flex-col gap-2 border border-white/10 bg-[#141414] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold">
                      {showtime.movie_name || "Chưa rõ phim"}
                    </p>
                    <p className="mt-1 text-xs text-[#9A9A9A]">
                      {dayjs(showtime.start_time).format("HH:mm DD/MM")} ·{" "}
                      {showtime.room_name || "Chưa rõ phòng"} ·{" "}
                      {showtime.projection_format}
                    </p>
                  </div>
                  <Tag color={showtime.is_booking_open ? "green" : "default"}>
                    {showtime.is_booking_open
                      ? "Đang bán"
                      : showtime.booking_closed_reason || "Đóng bán"}
                  </Tag>
                </div>
              ))
            ) : (
              <Empty description="Chưa có suất sắp tới" />
            )}
          </div>
        </section>

        <section className="border border-white/10 bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <VideoCameraOutlined className="text-xl text-[#DC0000]" />
            <h2 className="font-display text-2xl font-bold">
              Top phim tháng này
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            {data?.top_movies.length ? (
              data.top_movies.map((movie, index) => (
                <div
                  key={`${movie.movie_name}-${index}`}
                  className="flex items-center gap-3 border border-white/10 bg-[#141414] p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#DC0000] font-black text-[#0A0A0A]">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{movie.movie_name}</p>
                    <p className="mt-1 text-xs text-[#9A9A9A]">
                      {formatNumber(movie.total_tickets)} vé ·{" "}
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <Empty description="Chưa có dữ liệu vé đã thanh toán" />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-white/10 bg-[#141414] p-3">
    <p className="text-xs text-[#9A9A9A]">{label}</p>
    <p className="mt-2 font-display text-xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
