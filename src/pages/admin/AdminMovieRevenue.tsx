import { BarChartOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, DatePicker, Row, Statistic, Table, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import {
  adminService,
  type MovieRevenueItem,
} from "../../common/services/admin.service";
import { formatCurrency } from "../../common/utils";

const AdminMovieRevenue = () => {
  const [range, setRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [page, setPage] = useState(1);
  const report = useQuery({
    queryKey: [
      "ADMIN",
      "MOVIE_REVENUE",
      range[0].format("YYYY-MM-DD"),
      range[1].format("YYYY-MM-DD"),
      page,
    ],
    queryFn: () =>
      adminService.movieRevenue({
        from: range[0].format("YYYY-MM-DD"),
        to: range[1].format("YYYY-MM-DD"),
        page,
        per_page: 20,
      }),
  });
  const summary = report.data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Typography.Text className="text-xs font-black uppercase tracking-[0.18em] text-[#DC0000]">
            Revenue Intelligence
          </Typography.Text>
          <Typography.Title level={2} className="!mt-2 !text-white">
            Doanh thu theo phim
          </Typography.Title>
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Phim có doanh thu"
              value={summary?.movies || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Ghế đã bán" value={summary?.sold_seats || 0} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Doanh thu vé"
              value={summary?.seat_revenue || 0}
              formatter={(v) => formatCurrency(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Doanh thu thuần"
              value={summary?.net_revenue || 0}
              formatter={(v) => formatCurrency(Number(v))}
            />
          </Card>
        </Col>
      </Row>
      <Card>
        <Table<MovieRevenueItem>
          rowKey="movie_id"
          loading={report.isLoading}
          dataSource={report.data?.data || []}
          scroll={{ x: 1200 }}
          pagination={{
            current: report.data?.meta.current_page || page,
            pageSize: report.data?.meta.per_page || 20,
            total: report.data?.meta.total || 0,
            onChange: setPage,
            showSizeChanger: false,
          }}
          columns={[
            {
              title: "Phim",
              fixed: "left",
              width: 240,
              render: (_, item) => (
                <div className="flex items-center gap-3">
                  {item.movie_poster && (
                    <img
                      src={item.movie_poster}
                      alt=""
                      className="h-14 w-10 object-cover"
                    />
                  )}
                  <b>{item.movie_name}</b>
                </div>
              ),
            },
            { title: "Đơn paid", dataIndex: "paid_orders", width: 100 },
            { title: "Ghế bán", dataIndex: "sold_seats", width: 100 },
            {
              title: "Tiền vé",
              render: (_, i) => formatCurrency(i.seat_revenue),
              width: 150,
            },
            {
              title: "Bắp nước",
              render: (_, i) => formatCurrency(i.product_revenue),
              width: 150,
            },
            {
              title: "Giảm giá",
              render: (_, i) => formatCurrency(i.discount_amount),
              width: 140,
            },
            {
              title: "Doanh thu gộp",
              render: (_, i) => formatCurrency(i.gross_revenue),
              width: 160,
            },
            {
              title: "Doanh thu thuần",
              render: (_, i) => (
                <b className="text-green-400">
                  {formatCurrency(i.net_revenue)}
                </b>
              ),
              width: 170,
            },
            {
              title: "TB/ghế",
              render: (_, i) => formatCurrency(i.average_ticket_value),
              width: 140,
            },
          ]}
        />
      </Card>
    </div>
  );
};
export default AdminMovieRevenue;
