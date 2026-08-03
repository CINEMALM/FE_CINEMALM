import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Descriptions,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { adminService } from "../../common/services/admin.service";
import type {
  ITicket,
  PaymentStatus,
  TicketStatus,
} from "../../common/types/ticket";
import { formatCurrency } from "../../common/utils";

const ticketStatusLabels: Record<
  TicketStatus,
  { label: string; color: string }
> = {
  pending: { label: "Chờ thanh toán", color: "warning" },
  confirmed: { label: "Đã xác nhận", color: "success" },
  cancelled: { label: "Đã hủy", color: "error" },
  used: { label: "Đã check-in", color: "blue" },
};

const paymentStatusLabels: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: "Chờ thanh toán", color: "warning" },
  paid: { label: "Đã thanh toán", color: "success" },
  failed: { label: "Thanh toán lỗi", color: "error" },
  expired: { label: "Hết hạn", color: "default" },
  cancelled: { label: "Đã hủy", color: "default" },
  refunded: { label: "Hoàn tiền/chờ xử lý", color: "purple" },
};

const AdminTickets = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<TicketStatus | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<
    PaymentStatus | undefined
  >();
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 10,
      keyword: keyword.trim() || undefined,
      status,
      payment_status: paymentStatus,
    }),
    [keyword, page, paymentStatus, status],
  );

  const tickets = useQuery({
    queryKey: ["ADMIN", "TICKETS", queryParams],
    queryFn: () => adminService.tickets(queryParams),
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Tickets
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Quản lý vé</h1>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => tickets.refetch()}
          loading={tickets.isFetching}
        >
          Làm mới
        </Button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_220px]">
        <Input.Search
          allowClear
          placeholder="Tìm mã vé, khách hàng, email, SĐT hoặc phim"
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Trạng thái vé"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={Object.entries(ticketStatusLabels).map(([value, meta]) => ({
            value,
            label: meta.label,
          }))}
        />
        <Select
          allowClear
          placeholder="Trạng thái thanh toán"
          value={paymentStatus}
          onChange={(value) => {
            setPaymentStatus(value);
            setPage(1);
          }}
          options={Object.entries(paymentStatusLabels).map(([value, meta]) => ({
            value,
            label: meta.label,
          }))}
        />
      </div>

      <div className="mt-6 overflow-hidden border border-white/10 bg-[#141414]">
        <Table<ITicket>
          rowKey="_id"
          loading={tickets.isLoading}
          dataSource={tickets.data?.items}
          pagination={false}
          scroll={{ x: 1100 }}
          columns={[
            {
              title: "Mã vé",
              dataIndex: "ticketCode",
              width: 150,
              render: (value: string) => (
                <span className="font-bold">{value}</span>
              ),
            },
            {
              title: "Khách hàng",
              width: 230,
              render: (_, ticket) => (
                <Space direction="vertical" size={2}>
                  <span>{ticket.customerName || "Khách hàng"}</span>
                  <span className="text-xs text-[#9A9A9A]">
                    {ticket.customerEmail || ticket.customerPhone || "—"}
                  </span>
                </Space>
              ),
            },
            {
              title: "Phim / Suất chiếu",
              width: 260,
              render: (_, ticket) => (
                <Space direction="vertical" size={2}>
                  <span>{ticket.movieName}</span>
                  <span className="text-xs text-[#9A9A9A]">
                    {ticket.roomName} · {ticket.projectionFormat} ·{" "}
                    {dayjs(ticket.startTime).format("HH:mm DD/MM/YYYY")}
                  </span>
                </Space>
              ),
            },
            {
              title: "Ghế",
              width: 150,
              render: (_, ticket) =>
                ticket.items.map((item) => item.seatLabel).join(", ") || "—",
            },
            {
              title: "Tổng tiền",
              dataIndex: "totalPrice",
              width: 130,
              render: (value: number) => formatCurrency(value),
            },
            {
              title: "Vé",
              dataIndex: "status",
              width: 140,
              render: (value: TicketStatus) => {
                const meta = ticketStatusLabels[value];
                return <Tag color={meta.color}>{meta.label}</Tag>;
              },
            },
            {
              title: "Thanh toán",
              dataIndex: "paymentStatus",
              width: 170,
              render: (value: PaymentStatus) => {
                const meta = paymentStatusLabels[value];
                return <Tag color={meta.color}>{meta.label}</Tag>;
              },
            },
            {
              title: "Thao tác",
              width: 110,
              fixed: "right",
              render: (_, ticket) => (
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  Xem
                </Button>
              ),
            },
          ]}
          locale={{ emptyText: "Chưa có vé" }}
        />
      </div>

      <Pagination
        className="mt-5"
        align="end"
        current={page}
        pageSize={tickets.data?.pageSize || 10}
        total={tickets.data?.total || 0}
        onChange={setPage}
      />

      <Modal
        title="Chi tiết vé"
        open={Boolean(selectedTicket)}
        onCancel={() => setSelectedTicket(null)}
        footer={null}
        width={760}
      >
        {selectedTicket && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã vé">
              {selectedTicket.ticketCode}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {selectedTicket.customerName || "—"} ·{" "}
              {selectedTicket.customerEmail ||
                selectedTicket.customerPhone ||
                "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Phim">
              {selectedTicket.movieName}
            </Descriptions.Item>
            <Descriptions.Item label="Suất chiếu">
              {selectedTicket.roomName} · {selectedTicket.projectionFormat} ·{" "}
              {dayjs(selectedTicket.startTime).format("HH:mm DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Ghế">
              {selectedTicket.items
                .map((item) => `${item.seatLabel} (${item.type})`)
                .join(", ") || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {formatCurrency(selectedTicket.totalPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái vé">
              <Tag color={ticketStatusLabels[selectedTicket.status].color}>
                {ticketStatusLabels[selectedTicket.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái thanh toán">
              <Tag
                color={paymentStatusLabels[selectedTicket.paymentStatus].color}
              >
                {paymentStatusLabels[selectedTicket.paymentStatus].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán lúc">
              {selectedTicket.paidAt
                ? dayjs(selectedTicket.paidAt).format("HH:mm DD/MM/YYYY")
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Check-in lúc">
              {selectedTicket.usedAt
                ? dayjs(selectedTicket.usedAt).format("HH:mm DD/MM/YYYY")
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do hủy">
              {selectedTicket.cancelDescription || "—"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminTickets;
