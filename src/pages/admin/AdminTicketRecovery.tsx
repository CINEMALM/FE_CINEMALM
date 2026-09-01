import { PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import { createPortal } from "react-dom";
import { adminService } from "../../common/services/admin.service";
import type { ITicket } from "../../common/types/ticket";
import { formatCurrency } from "../../common/utils";

interface RecoveryValues {
  paymentCode: string;
}

const normalizePaymentCode = (value: string) => value.trim().toUpperCase();

const AdminTicketRecovery = () => {
  const [form] = Form.useForm<RecoveryValues>();
  const recovery = useMutation({
    mutationFn: async ({ paymentCode }: RecoveryValues) => {
      const normalizedCode = normalizePaymentCode(paymentCode);
      const result = await adminService.tickets({
        keyword: normalizedCode,
        payment_status: "paid",
        per_page: 10,
      });
      return result.items.find(
        (ticket) =>
          normalizePaymentCode(ticket.vnpayOrderCode || "") === normalizedCode,
      );
    },
    onError: () => message.error("Không thể tra cứu vé. Vui lòng thử lại."),
  });

  return (
    <div className="space-y-6">
      <style>{`
        .ticket-recovery-print { display: none; }
        @media print {
          body > *:not(.ticket-recovery-print) { display: none !important; }
          .ticket-recovery-print {
            display: block !important; width: 80mm;
            margin: 0 auto; padding: 6px; color: #000; background: #fff;
            font-family: Arial, sans-serif;
          }
          .ticket-recovery-print__title { text-align: center; font-size: 15px; font-weight: 800; margin-bottom: 2px; }
          .ticket-recovery-print__subtitle { text-align: center; font-size: 9px; margin-bottom: 5px; }
          .ticket-recovery-print__qr { display: flex; justify-content: center; padding: 5px 0 3px; }
          .ticket-recovery-print__page {
            width: 100%;
            break-inside: avoid;
            page-break-inside: avoid;
            break-after: auto;
            page-break-after: auto;
          }
          .ticket-recovery-print__page + .ticket-recovery-print__page {
            break-before: page;
            page-break-before: always;
          }
          .ticket-recovery-print__row {
            display: flex; justify-content: space-between; gap: 12px;
            border-top: 1px dashed #999; padding: 3px 0; font-size: 10px;
          }
          .ticket-recovery-print__row strong { text-align: right; }
        }
      `}</style>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
          Ticket Support
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Tra cứu vé</h1>
        <p className="mt-2 text-sm text-[#9A9A9A]">
          Nhập chính xác mã đơn hàng dạng PAY... để đối chiếu và in lại vé cho
          khách.
        </p>
      </div>

      <Card title="Mã giao dịch" className="border border-white/10">
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => recovery.mutate(values)}
        >
          <Form.Item
            label="Mã đơn hàng"
            name="paymentCode"
            normalize={(value) =>
              typeof value === "string" ? value.toUpperCase() : value
            }
            rules={[
              { required: true, message: "Vui lòng nhập mã đơn hàng." },
              {
                pattern: /^PAY[A-Z0-9-]+$/i,
                message: "Mã đơn hàng phải có dạng PAY...",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="PAY..."
              allowClear
              autoComplete="off"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SearchOutlined />}
            loading={recovery.isPending}
          >
            Tra cứu vé
          </Button>
        </Form>
      </Card>

      {recovery.isSuccess && !recovery.data && (
        <Alert
          type="warning"
          showIcon
          message="Không tìm thấy vé đã thanh toán khớp với mã đơn hàng này."
        />
      )}
      {recovery.data && <TicketRecoveryResult ticket={recovery.data} />}
      {!recovery.isSuccess && !recovery.isPending && (
        <Empty description="Nhập mã đơn hàng để bắt đầu tra cứu" />
      )}
    </div>
  );
};

const TicketRecoveryResult = ({ ticket }: { ticket: ITicket }) => {
  const canPrint =
    ticket.paymentStatus === "paid" &&
    (ticket.status === "confirmed" || ticket.status === "used");

  return (
    <>
      <Card
        title={`${ticket.ticketCode} · ${ticket.movieName}`}
        className="border border-white/10"
        extra={
          <Tag color={ticket.status === "used" ? "blue" : "green"}>
            {ticket.status === "used" ? "Đã check-in" : "Còn hiệu lực"}
          </Tag>
        }
      >
        <Descriptions bordered column={{ xs: 1, md: 2 }} size="small">
          <Descriptions.Item label="Mã đơn hàng">
            <span className="font-mono">{ticket.vnpayOrderCode || "—"}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Mã vé">
            {ticket.ticketCode}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {ticket.customerName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {ticket.customerEmail || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {ticket.customerPhone || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Suất chiếu">
            {dayjs(ticket.startTime).format("HH:mm DD/MM/YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Phòng / Ghế">
            {ticket.roomName} ·{" "}
            {ticket.items.map((item) => item.seatLabel).join(", ")}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {formatCurrency(ticket.totalPrice)}
          </Descriptions.Item>
          <Descriptions.Item label="Thanh toán">
            {ticket.paymentMethod || "—"} · {ticket.paymentStatus}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-5 flex justify-end">
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            disabled={!canPrint}
            onClick={() => window.print()}
          >
            In vé
          </Button>
        </div>
      </Card>

      {createPortal(
        <div className="ticket-recovery-print">
          {(ticket.admissions || []).map((admission) => (
            <div key={admission._id} className="ticket-recovery-print__page">
              <div className="ticket-recovery-print__title">CinemaLM</div>
              <div className="ticket-recovery-print__subtitle">
                VÉ XEM PHIM ·{" "}
                {ticket.status === "used" ? "ĐÃ CHECK-IN" : "CÒN HIỆU LỰC"}
              </div>
              <div className="ticket-recovery-print__qr">
                <QRCodeCanvas value={admission.qrToken} size={110} />
              </div>
              <div className="ticket-recovery-print__subtitle">
                GHẾ {admission.seatLabel || "—"} · {admission.admissionCode}
              </div>
              <PrintRow label="Mã vé" value={ticket.ticketCode} />
              <PrintRow label="Phim" value={ticket.movieName} />
              <PrintRow
                label="Suất chiếu"
                value={dayjs(ticket.startTime).format("HH:mm DD/MM/YYYY")}
              />
              <PrintRow label="Phòng" value={ticket.roomName} />
              <PrintRow label="Ghế" value={admission.seatLabel || "—"} />
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
};

const PrintRow = ({ label, value }: { label: string; value: string }) => (
  <div className="ticket-recovery-print__row">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default AdminTicketRecovery;
