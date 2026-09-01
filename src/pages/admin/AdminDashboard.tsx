import {
  CheckCircleOutlined,
  CreditCardOutlined,
  DesktopOutlined,
  GiftOutlined,
  ScheduleOutlined,
  ShoppingOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, DatePicker, Empty, Select, Spin, Tag } from "antd";
import type { ApexOptions } from "apexcharts";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router";
import { adminService } from "../../common/services/admin.service";

const RevenueChart = lazy(() => import("react-apexcharts"));
const { RangePicker } = DatePicker;

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value?: number | null) => currency.format(value || 0);
const formatNumber = (value?: number | null) => number.format(value || 0);

const periodOptions = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "this_month", label: "Tháng này" },
  { value: "this_year", label: "Năm nay" },
  { value: "custom", label: "Tùy chọn" },
];

const AdminDashboard = () => {
  const [period, setPeriod] = useState("30d");
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null);

  const dashboardParams = useMemo(() => {
    const params: Record<string, unknown> = { period };

    if (period === "custom") {
      if (!customRange) return { period: "30d" };
      params.from = customRange[0].format("YYYY-MM-DD");
      params.to = customRange[1].format("YYYY-MM-DD");
    }

    return params;
  }, [customRange, period]);

  const overview = useQuery({
    queryKey: ["ADMIN", "DASHBOARD", "OVERVIEW", dashboardParams],
    queryFn: () => adminService.dashboardOverview(dashboardParams),
  });

  const data = overview.data;
  const summary = data?.summary;
  const today = data?.today;
  const range = data?.range;
  const revenueTrend = data?.revenue_trend || [];

  const netRevenue =
    range?.net_revenue ??
    range?.revenue ??
    summary?.net_revenue_selected_range ??
    summary?.revenue_selected_range;
  const paidOrders =
    range?.paid_orders ??
    range?.tickets ??
    summary?.paid_orders_selected_range ??
    summary?.tickets_selected_range;
  const soldSeats =
    range?.sold_seats ??
    summary?.sold_seats_selected_range ??
    range?.tickets ??
    summary?.tickets_selected_range;
  const averageTicketValue = range?.average_ticket_value;

  const rangeLabel = range
    ? `${dayjs(range.from).format("DD/MM/YYYY")} - ${dayjs(range.to).format("DD/MM/YYYY")}`
    : "Đang tải dữ liệu";

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: "admin-revenue-trend",
        toolbar: { show: false },
        background: "transparent",
        foreColor: "#9A9A9A",
      },
      colors: ["#DC0000", "#F59E0B", "#10B981"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: [3, 2, 2] },
      fill: {
        type: ["gradient", "solid", "solid"],
        gradient: {
          shadeIntensity: 0.45,
          opacityFrom: 0.4,
          opacityTo: 0.05,
        },
      },
      grid: { borderColor: "rgba(255,255,255,0.08)" },
      xaxis: {
        categories: revenueTrend.map((item) => item.label),
        axisBorder: { color: "rgba(255,255,255,0.12)" },
        axisTicks: { color: "rgba(255,255,255,0.12)" },
        labels: { style: { colors: "#9A9A9A" } },
      },
      yaxis: [
        {
          title: { text: "Doanh thu", style: { color: "#9A9A9A" } },
          labels: {
            formatter: (value) => `${Math.round(Number(value) / 1000)}k`,
            style: { colors: "#9A9A9A" },
          },
        },
        {
          opposite: true,
          title: { text: "Số lượng", style: { color: "#9A9A9A" } },
          labels: {
            formatter: (value) => formatNumber(Number(value)),
            style: { colors: "#9A9A9A" },
          },
        },
      ],
      tooltip: {
        theme: "dark",
        y: [
          { formatter: (value) => formatCurrency(Number(value)) },
          { formatter: (value) => `${formatNumber(Number(value))} đơn` },
          { formatter: (value) => `${formatNumber(Number(value))} ghế` },
        ],
      },
      legend: { labels: { colors: "#EDEDED" } },
    }),
    [revenueTrend],
  );

  const chartSeries = useMemo(
    () => [
      {
        name: "Thực thu",
        type: "area" as const,
        data: revenueTrend.map((item) => item.net_revenue ?? item.revenue),
      },
      {
        name: "Đơn đã thanh toán",
        type: "line" as const,
        data: revenueTrend.map((item) => item.paid_orders ?? item.tickets),
      },
      {
        name: "Ghế đã bán",
        type: "line" as const,
        data: revenueTrend.map((item) => item.sold_seats ?? item.tickets),
      },
    ],
    [revenueTrend],
  );

  const hasRevenueData = revenueTrend.some(
    (item) =>
      (item.net_revenue ?? item.revenue) > 0 ||
      (item.sold_seats ?? item.tickets) > 0,
  );

  const cards = [
    {
      label: "Doanh thu thực thu",
      value: formatCurrency(netRevenue),
      hint: "Tổng tiền đã thu sau giảm giá, tính theo ngày thanh toán.",
      icon: CreditCardOutlined,
      to: "/admin/tickets",
    },
    {
      label: "Đơn đã thanh toán",
      value: formatNumber(paidOrders),
      hint: `${formatNumber(summary?.tickets_paid_total)} đơn paid toàn hệ thống`,
      icon: CheckCircleOutlined,
      to: "/admin/tickets",
    },
    {
      label: "Vé / ghế đã bán",
      value: formatNumber(soldSeats),
      hint: "Đếm số ghế trong các đơn đã thanh toán.",
      icon: ScheduleOutlined,
      to: "/admin/tickets",
    },
    {
      label: "Doanh thu vé",
      value: formatCurrency(
        range?.seat_revenue ?? summary?.seat_revenue_selected_range,
      ),
      hint: "Phần tiền ghế/vé trước khi tách bắp nước.",
      icon: DesktopOutlined,
      to: "/admin/tickets",
    },
    {
      label: "Doanh thu bắp nước",
      value: formatCurrency(
        range?.product_revenue ?? summary?.product_revenue_selected_range,
      ),
      hint: "Combo/sản phẩm bán kèm trong đơn vé.",
      icon: ShoppingOutlined,
      to: "/admin/concession",
    },
    {
      label: "Bắp nước bán lẻ",
      value: formatCurrency(
        range?.concession_order_revenue ??
          summary?.concession_order_revenue_selected_range,
      ),
      hint: "Doanh thu đơn bắp nước bán độc lập tại quầy.",
      icon: ShoppingOutlined,
      to: "/admin/concession-sales",
    },
    {
      label: "Giảm giá",
      value: formatCurrency(
        range?.discount_amount ?? summary?.discount_selected_range,
      ),
      hint: "Voucher và chương trình khuyến mại đã áp dụng.",
      icon: GiftOutlined,
      to: "/admin/promotions",
    },
    {
      label: "Check-in hôm nay",
      value: formatNumber(summary?.check_ins_today),
      hint: `${formatNumber(summary?.showtimes_today)} suất hôm nay · ${formatNumber(summary?.upcoming_showtimes)} suất sắp tới`,
      icon: TeamOutlined,
      to: "/admin/check-in",
    },
    {
      label: "Payment đang chờ",
      value: formatNumber(summary?.pending_payments),
      hint: "Giao dịch VNPAY/counter chưa được quyết toán cuối.",
      icon: WarningOutlined,
      to: "/admin/tickets",
      warning: Boolean(summary?.pending_payments),
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
        Tổng quan doanh thu & vận hành
      </h1>

      <div className="mt-5 flex flex-col gap-3 border border-white/10 bg-[#101010] p-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9A9A9A]">
            Mốc thời gian thống kê
          </p>
          <p className="mt-1 text-sm text-[#EDEDED]">{rangeLabel}</p>
          <p className="mt-1 max-w-3xl text-xs text-[#9A9A9A]">
            Doanh thu được ghi nhận theo ngày thanh toán. Chỉ tính các đơn đã
            thanh toán và còn hiệu lực; booking pending, expired, failed không
            được tính vào doanh thu.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            className="min-w-[170px]"
            value={period}
            options={periodOptions}
            onChange={(value) => setPeriod(value)}
          />
          {period === "custom" ? (
            <RangePicker
              value={customRange}
              format="DD/MM/YYYY"
              disabledDate={(current) =>
                current ? current.endOf("day").isAfter(dayjs()) : false
              }
              onChange={(value) =>
                setCustomRange(value ? [value[0]!, value[1]!] : null)
              }
            />
          ) : null}
        </div>
      </div>

      {overview.isError && (
        <Alert
          className="mt-6"
          type="error"
          showIcon
          message="Không thể tải dashboard vận hành."
        />
      )}

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className={`border bg-[#141414] p-5 transition hover:border-white/30 ${
              card.warning ? "border-[#F59E0B]/50" : "border-white/10"
            }`}
          >
            <card.icon
              className={
                card.warning
                  ? "text-2xl text-[#F59E0B]"
                  : "text-2xl text-[#DC0000]"
              }
            />
            <p className="mt-6 font-display text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
              {card.label}
            </p>
            <p className="mt-2 text-xs text-[#9A9A9A]">{card.hint}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 border border-white/10 bg-[#101010] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Biểu đồ doanh thu
            </h2>
            <p className="mt-1 text-xs text-[#9A9A9A]">
              Theo mốc thời gian đang chọn, chỉ tính đơn đã thanh toán và còn
              hiệu lực.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Thực thu" value={formatCurrency(netRevenue)} />
            <Metric label="Đơn paid" value={formatNumber(paidOrders)} />
            <Metric label="Ghế bán" value={formatNumber(soldSeats)} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric
            label="Doanh thu gộp"
            value={formatCurrency(range?.gross_revenue)}
          />
          <Metric
            label="Doanh thu vé"
            value={formatCurrency(range?.seat_revenue)}
          />
          <Metric
            label="Bắp nước"
            value={formatCurrency(range?.product_revenue)}
          />
          <Metric
            label="Bắp nước bán lẻ"
            value={formatCurrency(range?.concession_order_revenue)}
          />
          <Metric
            label="Giảm giá"
            value={formatCurrency(range?.discount_amount)}
          />
          <Metric
            label="Hoàn tiền"
            value={formatCurrency(range?.refund_amount)}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Metric
            label="Giá trị TB/đơn"
            value={formatCurrency(range?.average_order_value)}
          />
          <Metric
            label="Giá vé TB/ghế"
            value={formatCurrency(averageTicketValue)}
          />
        </div>

        <div className="mt-5 min-h-[320px]">
          {revenueTrend.length ? (
            <>
              <Suspense
                fallback={
                  <div className="flex min-h-[320px] items-center justify-center text-sm text-[#9A9A9A]">
                    Đang tải biểu đồ doanh thu...
                  </div>
                }
              >
                <RevenueChart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                  height={330}
                />
              </Suspense>
              {!hasRevenueData ? (
                <p className="mt-2 text-center text-xs text-[#9A9A9A]">
                  Mốc này chưa có đơn đã thanh toán, biểu đồ đang hiển thị đường
                  0.
                </p>
              ) : null}
            </>
          ) : (
            <Empty description="Chưa có dữ liệu doanh thu trong mốc này" />
          )}
        </div>
      </section>

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
            <Metric
              label="Thực thu"
              value={formatCurrency(today?.net_revenue ?? today?.revenue)}
            />
            <Metric
              label="Đơn paid"
              value={formatNumber(today?.paid_orders ?? today?.tickets)}
            />
            <Metric
              label="Ghế bán"
              value={formatNumber(
                today?.sold_seats ?? summary?.sold_seats_today,
              )}
            />
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
              Top phim theo doanh thu
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
                      {formatNumber(movie.total_tickets)} đơn ·{" "}
                      {formatCurrency(movie.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <Empty description="Chưa có dữ liệu đơn đã thanh toán" />
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
