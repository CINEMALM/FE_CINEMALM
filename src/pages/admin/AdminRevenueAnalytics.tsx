import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Progress,
  Select,
  Skeleton,
  Table,
  Tooltip,
  Typography,
} from "antd";
import type { ApexOptions } from "apexcharts";
import dayjs, { type Dayjs } from "dayjs";
import { lazy, Suspense, useMemo, useState } from "react";
import {
  adminService,
  type MovieRevenueItem,
} from "../../common/services/admin.service";
import { formatCurrency } from "../../common/utils";

const Chart = lazy(() => import("react-apexcharts"));
const number = new Intl.NumberFormat("vi-VN");
const formatNumber = (value?: number | null) => number.format(value || 0);
type MovieSort = "net_revenue" | "sold_seats";

const AdminRevenueAnalytics = () => {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [page, setPage] = useState(1);
  const [movieId, setMovieId] = useState<number>();
  const [roomId, setRoomId] = useState<number>();
  const [categoryId, setCategoryId] = useState<number>();
  const [movieSort, setMovieSort] = useState<MovieSort>("net_revenue");

  const params = useMemo(
    () => ({
      from: range[0].format("YYYY-MM-DD"),
      to: range[1].format("YYYY-MM-DD"),
      page,
      per_page: 20,
      ...(movieId ? { movie_id: movieId } : {}),
      ...(roomId ? { room_id: roomId } : {}),
      ...(categoryId ? { category_id: categoryId } : {}),
    }),
    [categoryId, movieId, page, range, roomId],
  );
  const report = useQuery({
    queryKey: ["ADMIN", "REVENUE_ANALYTICS", params],
    queryFn: () => adminService.movieRevenue(params),
  });
  const movies = useQuery({
    queryKey: ["ADMIN", "REVENUE_FILTER_MOVIES"],
    queryFn: () => adminService.movies({ per_page: 100 }),
  });
  const rooms = useQuery({
    queryKey: ["ADMIN", "REVENUE_FILTER_ROOMS"],
    queryFn: () => adminService.rooms({ per_page: 100 }),
  });
  const categories = useQuery({
    queryKey: ["ADMIN", "REVENUE_FILTER_CATEGORIES"],
    queryFn: () => adminService.categories({ per_page: 100 }),
  });

  const data = report.data;
  const summary = data?.summary;
  const revenueBreakdown = data?.revenue_breakdown ?? [
    { key: "ticket", label: "Doanh thu vé", value: summary?.seat_revenue || 0 },
    {
      key: "concession",
      label: "Doanh thu bắp nước",
      value: summary?.product_revenue || 0,
    },
  ];
  const moviePerformance = data?.movie_performance ?? data?.data ?? [];
  const hasData = Boolean(summary?.paid_orders);
  const donutOptions: ApexOptions = useMemo(
    () => ({
      chart: { background: "transparent" },
      labels: revenueBreakdown.map((item) => item.label),
      colors: ["#DC0000", "#F59E0B"],
      stroke: { colors: ["#171717"] },
      dataLabels: { enabled: false },
      legend: { position: "bottom", labels: { colors: "#EDEDED" } },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: { color: "#9A9A9A" },
              value: {
                color: "#FFFFFF",
                formatter: (value) => formatCurrency(Number(value)),
              },
              total: {
                show: true,
                label: "Tổng gộp",
                color: "#9A9A9A",
                formatter: () => formatCurrency(summary?.gross_revenue || 0),
              },
            },
          },
        },
      },
    }),
    [revenueBreakdown, summary?.gross_revenue],
  );
  const topMovies = useMemo(
    () =>
      [...moviePerformance].sort(
        (a, b) => Number(b[movieSort] || 0) - Number(a[movieSort] || 0),
      ),
    [moviePerformance, movieSort],
  );
  const topValue = Number(topMovies[0]?.[movieSort] || 1);
  const kpis = [
    [
      "Tổng doanh thu",
      formatCurrency(summary?.gross_revenue || 0),
      "Vé + bắp nước trước giảm giá.",
    ],
    [
      "Doanh thu thuần",
      formatCurrency(summary?.net_revenue || 0),
      "Doanh thu sau giảm giá.",
    ],
    [
      "Ghế đã bán",
      formatNumber(summary?.sold_seats),
      "Ghế thuộc các đơn paid hợp lệ.",
    ],
    [
      "Giá vé trung bình",
      formatCurrency(summary?.average_ticket_value || 0),
      "Doanh thu vé / ghế đã bán.",
    ],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Typography.Text className="text-xs font-black uppercase tracking-[0.18em] text-[#DC0000]">
            Revenue Intelligence
          </Typography.Text>
          <Typography.Title level={2} className="!mb-1 !mt-2 !text-white">
            Doanh thu phim
          </Typography.Title>
          <p className="text-sm text-[#9A9A9A]">
            Theo dõi doanh thu, lượng vé bán và hiệu suất phim theo thời gian.
          </p>
        </div>
        <DatePicker.RangePicker
          value={range}
          format="DD/MM/YYYY"
          allowClear={false}
          onChange={(value) => {
            if (value?.[0] && value[1]) {
              setRange([value[0], value[1]]);
              setPage(1);
            }
          }}
        />
      </div>

      <Card size="small">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Tất cả phim"
            value={movieId}
            loading={movies.isLoading}
            options={movies.data?.items.map((item) => ({
              value: Number(item._id),
              label: item.name,
            }))}
            onChange={(value) => {
              setMovieId(value);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="Tất cả phòng"
            value={roomId}
            loading={rooms.isLoading}
            options={rooms.data?.items.map((item) => ({
              value: Number(item._id),
              label: item.name,
            }))}
            onChange={(value) => {
              setRoomId(value);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="Tất cả thể loại"
            value={categoryId}
            loading={categories.isLoading}
            options={categories.data?.items.map((item) => ({
              value: Number(item._id),
              label: item.name,
            }))}
            onChange={(value) => {
              setCategoryId(value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {report.isError ? (
        <Alert
          type="error"
          showIcon
          message="Không thể tải dữ liệu doanh thu."
          action={
            <Button icon={<ReloadOutlined />} onClick={() => report.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {report.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Card>
            ))
          : kpis.map(([label, value, hint]) => {
              return (
                <Card key={label}>
                  <Tooltip title={hint}>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9A9A9A]">
                      {label}
                    </p>
                  </Tooltip>
                  <p className="mt-3 text-2xl font-black text-white">{value}</p>
                </Card>
              );
            })}
      </div>

      {!report.isLoading && !report.isError && !hasData ? (
        <Card>
          <Empty description="Không có doanh thu trong khoảng thời gian và bộ lọc đã chọn." />
        </Card>
      ) : null}

      {hasData ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(320px,520px)_1fr]">
            <Card title="Cơ cấu doanh thu">
              <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
                <Chart
                  type="donut"
                  height={300}
                  options={donutOptions}
                  series={revenueBreakdown.map((item) => item.value)}
                />
              </Suspense>
              <div className="grid grid-cols-2 gap-3">
                {revenueBreakdown.map((item) => (
                  <div
                    key={item.key}
                    className="border border-white/10 p-3 text-sm"
                  >
                    <span className="text-[#9A9A9A]">{item.label}</span>
                    <b className="mt-1 block">{formatCurrency(item.value)}</b>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Tổng quan kỳ báo cáo">
              <div className="grid h-full content-center gap-4 sm:grid-cols-2">
                <div className="border border-white/10 p-5">
                  <span className="text-sm text-[#9A9A9A]">
                    Đơn đã thanh toán
                  </span>
                  <b className="mt-2 block text-2xl">
                    {formatNumber(summary?.paid_orders)}
                  </b>
                </div>
                <div className="border border-white/10 p-5">
                  <span className="text-sm text-[#9A9A9A]">Tổng giảm giá</span>
                  <b className="mt-2 block text-2xl">
                    {formatCurrency(summary?.discount_amount || 0)}
                  </b>
                </div>
                <div className="border border-white/10 p-5">
                  <span className="text-sm text-[#9A9A9A]">Doanh thu vé</span>
                  <b className="mt-2 block text-2xl">
                    {formatCurrency(summary?.seat_revenue || 0)}
                  </b>
                </div>
                <div className="border border-white/10 p-5">
                  <span className="text-sm text-[#9A9A9A]">
                    Doanh thu bắp nước
                  </span>
                  <b className="mt-2 block text-2xl">
                    {formatCurrency(summary?.product_revenue || 0)}
                  </b>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title="Hiệu suất phim"
            extra={
              <Select
                value={movieSort}
                onChange={setMovieSort}
                options={[
                  { value: "net_revenue", label: "Theo doanh thu" },
                  { value: "sold_seats", label: "Theo ghế bán" },
                ]}
              />
            }
          >
            <div className="space-y-4">
              {topMovies.map((movie, index) => {
                const value = Number(movie[movieSort] || 0);
                const percent = (value / Math.max(1, topValue)) * 100;
                return (
                  <div
                    key={movie.movie_id}
                    className="grid items-center gap-3 md:grid-cols-[40px_1fr_2fr_auto]"
                  >
                    <b className="text-xl text-[#DC0000]">#{index + 1}</b>
                    <div className="flex items-center gap-3">
                      {movie.movie_poster ? (
                        <img
                          src={movie.movie_poster}
                          alt=""
                          className="h-14 w-10 object-cover"
                        />
                      ) : null}
                      <div>
                        <b>{movie.movie_name}</b>
                        <p className="text-xs text-[#9A9A9A]">
                          {formatNumber(movie.sold_seats)} ghế đã bán
                        </p>
                      </div>
                    </div>
                    <Progress
                      percent={Math.min(100, percent)}
                      showInfo={false}
                      strokeColor="#DC0000"
                      trailColor="rgba(255,255,255,.08)"
                    />
                    <b>
                      {movieSort === "net_revenue"
                        ? formatCurrency(value)
                        : `${formatNumber(value)} ghế`}
                    </b>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Bảng doanh thu phim">
            <Table<MovieRevenueItem>
              rowKey="movie_id"
              loading={report.isFetching}
              dataSource={data?.data || []}
              scroll={{ x: 1000 }}
              pagination={{
                current: data?.meta.current_page || page,
                pageSize: data?.meta.per_page || 20,
                total: data?.meta.total || 0,
                onChange: setPage,
                showSizeChanger: false,
              }}
              expandable={{
                expandedRowRender: (item) => (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <span>
                      Đơn paid: <b>{formatNumber(item.paid_orders)}</b>
                    </span>
                    <span>
                      Giảm giá: <b>{formatCurrency(item.discount_amount)}</b>
                    </span>
                    <span>
                      Doanh thu gộp: <b>{formatCurrency(item.gross_revenue)}</b>
                    </span>
                  </div>
                ),
              }}
              columns={[
                {
                  title: "Phim",
                  fixed: "left",
                  width: 230,
                  render: (_, item) => (
                    <div className="flex items-center gap-3">
                      {item.movie_poster ? (
                        <img
                          src={item.movie_poster}
                          alt=""
                          className="h-14 w-10 object-cover"
                        />
                      ) : null}
                      <b>{item.movie_name}</b>
                    </div>
                  ),
                },
                {
                  title: "Doanh thu thuần",
                  render: (_, item) => (
                    <b className="text-green-400">
                      {formatCurrency(item.net_revenue)}
                    </b>
                  ),
                  width: 165,
                },
                {
                  title: "Tiền vé",
                  render: (_, item) => formatCurrency(item.seat_revenue),
                  width: 140,
                },
                {
                  title: "Bắp nước",
                  render: (_, item) => formatCurrency(item.product_revenue),
                  width: 140,
                },
                { title: "Ghế bán", dataIndex: "sold_seats", width: 90 },
                {
                  title: "TB/ghế",
                  render: (_, item) =>
                    formatCurrency(item.average_ticket_value),
                  width: 130,
                },
              ]}
            />
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default AdminRevenueAnalytics;
