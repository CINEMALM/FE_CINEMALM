import { useQuery } from "@tanstack/react-query";
import { Empty, Pagination, Select, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useNavigate } from "react-router";
import { getBookings } from "../../../common/services/booking.service";
import { useAuthSelector } from "../../../common/stores/useAuthStore";
import type {
  ITicket,
  PaymentStatus,
  TicketStatus,
} from "../../../common/types/ticket";
import { formatCurrency } from "../../../common/utils";

const statusMeta: Record<TicketStatus, { label: string; color: string }> = {
  pending: { label: "Chờ thanh toán", color: "gold" },
  confirmed: { label: "Đã xác nhận", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
  used: { label: "Đã check-in", color: "blue" },
};

const paymentStatusMeta: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Chờ thanh toán", color: "gold" },
  paid: { label: "Đã thanh toán", color: "green" },
  expired: { label: "Đã hết hạn", color: "red" },
  cancelled: { label: "Đã hủy", color: "red" },
  failed: { label: "Thanh toán lỗi", color: "red" },
  refunded: { label: "Hoàn tiền/chờ xử lý", color: "blue" },
};

const isTicketPayable = (ticket: ITicket) =>
  ticket.status === "pending" &&
  ticket.paymentStatus === "pending" &&
  (!(ticket.paymentDueAt || ticket.expiresAt) ||
    dayjs(ticket.paymentDueAt || ticket.expiresAt).isAfter(dayjs()));

const MyTicket = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | undefined>();
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);

  const tickets = useQuery({
    queryKey: ["MY_BOOKINGS", page, status],
    queryFn: () =>
      getBookings({ page, per_page: 8, status: status || undefined }),
    enabled: isAuthenticated,
  });

  return (
    <div className="mx-4 mt-10 max-w-7xl sm:mx-6 xl:mx-auto">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DC0000]">
            My bookings
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Vé của tôi</h1>
        </div>
        <Select
          allowClear
          className="w-full sm:w-48"
          placeholder="Tất cả trạng thái"
          value={status}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
          options={Object.entries(statusMeta).map(([value, item]) => ({
            value,
            label: item.label,
          }))}
        />
      </div>

      <div className="overflow-hidden border border-white/10 bg-[#141414]">
        <Table<ITicket>
          rowKey="_id"
          loading={tickets.isLoading}
          dataSource={tickets.data?.items}
          pagination={false}
          scroll={{ x: 1100 }}
          locale={{ emptyText: <Empty description="Chưa có booking" /> }}
          onRow={(record) => ({
            onClick: () => navigate(`/profile/ticket/${record._id}`),
            className: "cursor-pointer",
          })}
          columns={[
            { title: "Mã vé", dataIndex: "ticketCode", width: 170 },
            { title: "Phim", dataIndex: "movieName", width: 220 },
            { title: "Phòng", dataIndex: "roomName", width: 120 },
            { title: "Định dạng", dataIndex: "projectionFormat", width: 110 },
            {
              title: "Suất chiếu",
              dataIndex: "startTime",
              width: 180,
              render: (value: string) =>
                dayjs(value).format("HH:mm DD/MM/YYYY"),
            },
            {
              title: "Ghế",
              dataIndex: "items",
              width: 130,
              render: (items: ITicket["items"]) =>
                items.map((item) => item.seatLabel).join(", ") || "—",
            },
            {
              title: "Trạng thái vé",
              dataIndex: "status",
              width: 150,
              render: (value: TicketStatus, record) => (
                <Tag color={statusMeta[value].color}>
                  {!isTicketPayable(record) && value === "pending"
                    ? "Hết hạn"
                    : statusMeta[value].label}
                </Tag>
              ),
            },
            {
              title: "Thanh toán",
              dataIndex: "paymentStatus",
              width: 150,
              render: (value: PaymentStatus) => (
                <Tag color={paymentStatusMeta[value].color}>
                  {paymentStatusMeta[value].label}
                </Tag>
              ),
            },
            {
              title: "Hạn thanh toán",
              dataIndex: "paymentDueAt",
              width: 180,
              render: (value: string | null | undefined, record) => {
                const dueAt = value || record.expiresAt;
                if (record.status !== "pending" || !dueAt) return "—";
                return dayjs(dueAt).isAfter(dayjs())
                  ? dayjs(dueAt).format("HH:mm DD/MM/YYYY")
                  : "Đã hết hạn";
              },
            },
            {
              title: "Tổng tiền",
              dataIndex: "totalPrice",
              width: 140,
              render: (value: number) => formatCurrency(value),
            },
          ]}
        />
      </div>

      <Pagination
        className="mt-5"
        align="end"
        current={page}
        pageSize={tickets.data?.pageSize || 8}
        total={tickets.data?.total || 0}
        onChange={setPage}
      />
    </div>
  );
};

export default MyTicket;
