import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Descriptions,
  Empty,
  Image,
  Modal,
  Spin,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  cancelBooking,
  createVnpayPayment,
  getBooking,
} from "../../../common/services/booking.service";
import { useAuthSelector } from "../../../common/stores/useAuthStore";
import { formatCurrency } from "../../../common/utils";

const ticketStatusMeta = {
  pending: { label: "Chờ thanh toán", color: "gold" },
  confirmed: { label: "Đã xác nhận", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
  used: { label: "Đã check-in", color: "blue" },
} as const;

const paymentStatusMeta = {
  pending: { label: "Chờ thanh toán", color: "gold" },
  paid: { label: "Đã thanh toán", color: "green" },
  expired: { label: "Đã hết hạn", color: "red" },
  cancelled: { label: "Đã hủy", color: "red" },
  failed: { label: "Thanh toán lỗi", color: "red" },
  refunded: { label: "Hoàn tiền/chờ xử lý", color: "blue" },
} as const;

const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const TicketDetail = () => {
  const { ticketId = "" } = useParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  const [now, setNow] = useState(() => dayjs());

  const ticket = useQuery({
    queryKey: ["MY_BOOKING", ticketId],
    queryFn: () => getBooking(ticketId),
    enabled: Boolean(ticketId) && isAuthenticated,
  });

  const item = ticket.data;
  const expiresAt = useMemo(
    () => (item?.expiresAt ? dayjs(item.expiresAt) : null),
    [item?.expiresAt],
  );
  const secondsToExpire = expiresAt ? expiresAt.diff(now, "second") : null;
  const isPaymentExpired =
    item?.status === "pending" &&
    item.paymentStatus === "pending" &&
    secondsToExpire !== null &&
    secondsToExpire <= 0;
  const canPay =
    item?.status === "pending" &&
    item.paymentStatus === "pending" &&
    !isPaymentExpired;

  const cancel = useMutation({
    mutationFn: () => cancelBooking(ticketId, "Người dùng chủ động hủy."),
    onSuccess: async () => {
      message.success("Đã hủy booking.");
      await queryClient.invalidateQueries({ queryKey: ["MY_BOOKING"] });
      await queryClient.invalidateQueries({ queryKey: ["MY_BOOKINGS"] });
    },
  });

  const pay = useMutation({
    mutationFn: () => createVnpayPayment(ticketId),
    onSuccess: (url) => window.location.assign(url),
    onError: () =>
      message.error("Không thể tạo liên kết thanh toán. Vui lòng thử lại."),
  });

  useEffect(() => {
    if (
      !item ||
      item.status !== "pending" ||
      item.paymentStatus !== "pending"
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [item]);

  useEffect(() => {
    if (!isPaymentExpired) return;

    void queryClient.invalidateQueries({ queryKey: ["MY_BOOKING", ticketId] });
    void queryClient.invalidateQueries({ queryKey: ["MY_BOOKINGS"] });
  }, [isPaymentExpired, queryClient, ticketId]);

  if (ticket.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (!item) return <Empty description="Không tìm thấy booking" />;

  const ticketMeta = ticketStatusMeta[item.status];
  const paymentMeta = paymentStatusMeta[item.paymentStatus];

  return (
    <div className="mx-4 mt-10 max-w-5xl sm:mx-6 xl:mx-auto">
      <Link
        to="/profile/ticket"
        className="inline-flex items-center gap-2 text-sm text-[#9A9A9A]"
      >
        <ArrowLeftOutlined /> Danh sách vé
      </Link>

      <div className="mt-5 grid gap-6 border border-white/10 bg-[#141414] p-5 md:grid-cols-[180px_1fr]">
        <Image
          src={item.moviePoster}
          alt={item.movieName}
          className="aspect-[2/3] object-cover"
        />

        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#DC0000]">
                {item.ticketCode}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold">
                {item.movieName}
              </h1>
            </div>
            <Tag color={ticketMeta?.color || "default"}>
              {ticketMeta?.label || item.status}
            </Tag>
          </div>

          <Descriptions className="mt-6" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Phòng">{item.roomName}</Descriptions.Item>
            <Descriptions.Item label="Định dạng">
              {item.projectionFormat}
            </Descriptions.Item>
            <Descriptions.Item label="Suất chiếu">
              {dayjs(item.startTime).format("HH:mm DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Ghế">
              {item.items.map((seat) => seat.seatLabel).join(", ")}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {formatCurrency(item.totalPrice)}
            </Descriptions.Item>
            <Descriptions.Item label="Thanh toán">
              <Tag color={paymentMeta?.color || "default"}>
                {paymentMeta?.label || item.paymentStatus}
              </Tag>
            </Descriptions.Item>
            {item.status === "pending" && item.expiresAt && (
              <Descriptions.Item label="Hạn thanh toán">
                <span
                  className={
                    canPay ? "font-semibold text-yellow-400" : "text-[#DC0000]"
                  }
                >
                  {canPay
                    ? `${formatCountdown(secondsToExpire || 0)} · ${dayjs(item.expiresAt).format("HH:mm DD/MM/YYYY")}`
                    : "Đã hết hạn"}
                </span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Khách hàng">
              {item.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Liên hệ">
              {item.customerPhone || item.customerEmail}
            </Descriptions.Item>
          </Descriptions>

          {canPay && (
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                danger
                loading={cancel.isPending}
                onClick={() =>
                  Modal.confirm({
                    title: "Hủy booking này?",
                    content: "Ghế đang giữ sẽ được mở lại cho người dùng khác.",
                    okText: "Hủy booking",
                    cancelText: "Quay lại",
                    onOk: () => cancel.mutateAsync(),
                  })
                }
              >
                Hủy booking
              </Button>
              <Button
                type="primary"
                loading={pay.isPending}
                onClick={() => pay.mutate()}
              >
                Thanh toán VNPAY
              </Button>
            </div>
          )}

          {isPaymentExpired && (
            <div className="mt-6 border border-[#DC0000]/30 bg-[#DC0000]/10 p-4 text-sm leading-6 text-[#F2F2F2]">
              Booking này đã hết hạn thanh toán. Ghế sẽ được mở lại cho khách
              khác, bạn vui lòng đặt lại nếu vẫn muốn xem suất này.
            </div>
          )}

          {item.status === "confirmed" && (
            <div className="mt-6 inline-flex flex-col items-center border border-white/10 bg-white p-4 text-[#0A0A0A]">
              <QRCodeCanvas value={item.qrCode || item.ticketCode} size={164} />
              <p className="mt-3 text-xs font-black uppercase tracking-[0.14em]">
                {item.ticketCode}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
