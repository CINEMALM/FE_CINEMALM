import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  getBooking,
  getPaymentStatus,
} from "../../../common/services/booking.service";

const POLLING_INTERVAL = 2500;
const POLLING_TIMEOUT = 60_000;

const PaymentResult = () => {
  const [params] = useSearchParams();
  const redirectStatus = params.get("status") || "failed";
  const paymentCode = params.get("payment_code");
  const ticketId = params.get("ticket_id");
  const redirectTicketCode = params.get("ticket_code");
  const [isTimedOut, setIsTimedOut] = useState(false);

  const paymentStatusQuery = useQuery({
    queryKey: ["PAYMENT_STATUS", paymentCode, ticketId],
    queryFn: async () => {
      if (paymentCode) return getPaymentStatus(paymentCode, ticketId);
      const ticket = await getBooking(ticketId!);
      return {
        paymentCode: "",
        paymentStatus:
          ticket.paymentStatus === "paid"
            ? ("success" as const)
            : ticket.paymentStatus === "pending"
              ? ("pending" as const)
              : ("failed" as const),
        status:
          ticket.paymentStatus === "paid" || ticket.status === "confirmed"
            ? ("success" as const)
            : ticket.paymentStatus === "pending"
              ? ("processing" as const)
              : ("failed" as const),
        ticketId: ticket._id,
        ticketCode: ticket.ticketCode,
        ticketStatus: ticket.status,
        ticketPaymentStatus: ticket.paymentStatus,
        amount: ticket.totalPrice,
        currency: "VND",
      };
    },
    enabled:
      redirectStatus === "processing" && Boolean(paymentCode || ticketId),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const paymentStatus = paymentStatusQuery.data;
  const isPaid = paymentStatus?.status === "success";
  const isFailed =
    paymentStatus?.status === "failed" ||
    paymentStatus?.ticketPaymentStatus === "expired" ||
    paymentStatus?.ticketPaymentStatus === "cancelled" ||
    paymentStatus?.ticketPaymentStatus === "failed" ||
    paymentStatus?.ticketStatus === "cancelled";

  useEffect(() => {
    if (
      redirectStatus !== "processing" ||
      (!paymentCode && !ticketId) ||
      isPaid ||
      isFailed ||
      isTimedOut
    ) {
      return;
    }

    const pollingTimer = window.setInterval(() => {
      void paymentStatusQuery.refetch();
    }, POLLING_INTERVAL);

    return () => window.clearInterval(pollingTimer);
  }, [
    isFailed,
    isPaid,
    isTimedOut,
    paymentCode,
    ticketId,
    paymentStatusQuery.refetch,
    redirectStatus,
  ]);

  useEffect(() => {
    if (
      redirectStatus !== "processing" ||
      (!paymentCode && !ticketId) ||
      isPaid ||
      isFailed
    ) {
      return;
    }

    const timeoutTimer = window.setTimeout(() => {
      setIsTimedOut(true);
    }, POLLING_TIMEOUT);

    return () => window.clearTimeout(timeoutTimer);
  }, [isFailed, isPaid, paymentCode, redirectStatus, ticketId]);

  const isSuccess = redirectStatus === "success" || isPaid;
  const hasFailed = redirectStatus === "failed" || isFailed;
  const needsManualCheck =
    redirectStatus === "processing" &&
    ((!paymentCode && !ticketId) || (isTimedOut && !isPaid && !isFailed));
  const isProcessing =
    redirectStatus === "processing" &&
    !isSuccess &&
    !hasFailed &&
    !needsManualCheck;
  const ticketCode = paymentStatus?.ticketCode || redirectTicketCode;
  const Icon = isSuccess
    ? CheckCircleOutlined
    : isProcessing || needsManualCheck
      ? ClockCircleOutlined
      : CloseCircleOutlined;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#0A0A0A] px-4 text-center text-[#F2F2F2]">
      <div className="w-full max-w-xl border border-white/10 bg-[#141414] p-8">
        <Icon
          className={`text-6xl ${isSuccess ? "text-green-500" : isProcessing || needsManualCheck ? "text-yellow-500" : "text-[#DC0000]"}`}
        />
        <h1 className="mt-5 font-display text-3xl font-bold">
          {isSuccess
            ? "Thanh toán thành công"
            : hasFailed
              ? "Thanh toán thất bại"
              : needsManualCheck
                ? "Giao dịch đang được xử lý"
                : isProcessing
                  ? "Đang xác nhận thanh toán"
                  : "Thanh toán thất bại"}
        </h1>
        {ticketCode && (
          <p className="mt-3 text-sm text-[#9A9A9A]">
            Mã vé: <strong className="text-[#F2F2F2]">{ticketCode}</strong>
          </p>
        )}
        <p className="mt-3 text-sm leading-6 text-[#9A9A9A]">
          {isSuccess
            ? "Vé và trạng thái ghế đã được xác nhận."
            : hasFailed
              ? "Giao dịch đã bị hủy, hết hạn hoặc không thể xác thực."
              : needsManualCheck
                ? "Đang xử lý, vui lòng kiểm tra vé của tôi."
                : "VNPAY đã tiếp nhận giao dịch. Hệ thống đang xác nhận trạng thái thanh toán."}
        </p>
        <Link
          to="/profile/ticket"
          className="mt-6 inline-flex min-h-11 items-center bg-[#DC0000] px-6 text-xs font-black uppercase tracking-[0.14em] text-[#0A0A0A]"
        >
          Xem vé của tôi
        </Link>
      </div>
    </div>
  );
};

export default PaymentResult;
