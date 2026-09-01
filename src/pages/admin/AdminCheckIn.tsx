import { QrcodeOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Space,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { adminService } from "../../common/services/admin.service";
import type { ITicket } from "../../common/types/ticket";

const AdminCheckIn = () => {
  const [form] = Form.useForm<{ ticketCode: string }>();
  const [lastTicket, setLastTicket] = useState<ITicket | null>(null);
  const [lastProgress, setLastProgress] = useState<{
    checked_in_count: number;
    total_admissions: number;
    remaining_count: number;
  } | null>(null);
  const [lastSeatLabel, setLastSeatLabel] = useState<string>();
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const realtimeHealth = useQuery({
    queryKey: ["ADMIN", "REALTIME_HEALTH"],
    queryFn: adminService.realtimeHealth,
  });

  const checkIn = useMutation({
    mutationFn: (ticketCode: string) => adminService.checkInTicket(ticketCode),
    onSuccess: (result) => {
      setLastTicket(result.ticket);
      setLastProgress(result.progress);
      setLastSeatLabel(result.admission?.seatLabel);
      form.setFieldsValue({ ticketCode: "" });
      message.success(
        `Check-in thành công${result.admission?.seatLabel ? ` ghế ${result.admission.seatLabel}` : ""}`,
      );
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };
      const errors = err.response?.data?.errors;
      message.error(
        (errors && Object.values(errors).flat()[0]) ||
          err.response?.data?.message ||
          "Không thể check-in vé này.",
      );
    },
  });

  const submitCode = (ticketCode?: string) => {
    const code = ticketCode?.trim();
    if (!code || checkIn.isPending) return;
    checkIn.mutate(code);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
          Ticket Operation
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Check-in QR</h1>
        <p className="mt-2 text-sm text-[#9A9A9A]">
          Mỗi ghế có một QR riêng để khách trong cùng nhóm có thể vào độc lập.
          Vé được check-in sớm theo cấu hình và vẫn hợp lệ cho tới khi phim kết
          thúc.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,480px)_1fr]">
        <Card title="Quét QR" className="border border-white/10">
          <div className="overflow-hidden border border-white/10 bg-black">
            {scannerEnabled ? (
              <Scanner
                onScan={(codes) => {
                  const value = codes[0]?.rawValue;
                  if (value) {
                    setScannerError(null);
                    setScannerEnabled(false);
                    submitCode(value);
                    window.setTimeout(() => setScannerEnabled(true), 1600);
                  }
                }}
                onError={(error) => {
                  setScannerError(
                    error instanceof Error
                      ? error.message
                      : "Khong the mo camera de quet QR.",
                  );
                }}
                constraints={{ facingMode: "environment" }}
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm text-[#9A9A9A]">
                Đang xử lý mã vừa quét...
              </div>
            )}
          </div>{" "}
          <Alert
            className="mt-4"
            type={scannerError ? "warning" : "info"}
            showIcon
            message={
              scannerError ||
              "Neu trinh duyet khong mo camera, hay dung o nhap ma ben canh."
            }
          />
          {realtimeHealth.data && (
            <Alert
              className="mt-3"
              type={realtimeHealth.data.is_ready ? "success" : "warning"}
              showIcon
              message={
                realtimeHealth.data.is_ready
                  ? `Realtime san sang (${realtimeHealth.data.broadcast_connection})`
                  : "Realtime chua san sang"
              }
              description={
                realtimeHealth.data.is_ready
                  ? `Kenh ghe: ${realtimeHealth.data.seat_channel_pattern}`
                  : `Thieu cau hinh: ${realtimeHealth.data.missing?.join(", ") || "broadcast disabled"}`
              }
            />
          )}
        </Card>

        <Card title="Nhập mã vé" className="border border-white/10">
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => submitCode(values.ticketCode)}
          >
            <Form.Item
              label="Mã vé / QR payload"
              name="ticketCode"
              rules={[{ required: true, message: "Vui lòng nhập mã vé." }]}
            >
              <Input
                size="large"
                prefix={<QrcodeOutlined />}
                placeholder="VD: CLM20260724ABC123"
                autoComplete="off"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={checkIn.isPending}
              block
            >
              Check-in vé
            </Button>
          </Form>

          {lastTicket && (
            <div className="mt-6 border-t border-white/10 pt-5">
              {lastProgress && (
                <Alert
                  className="mb-4"
                  type={lastProgress.remaining_count ? "info" : "success"}
                  showIcon
                  message={
                    lastProgress.remaining_count
                      ? `Đã vào ${lastProgress.checked_in_count}/${lastProgress.total_admissions} ghế · còn ${lastProgress.remaining_count} khách`
                      : `Đã check-in đủ ${lastProgress.total_admissions} ghế trong đơn`
                  }
                />
              )}
              <Space align="center" className="mb-4">
                <Tag color="green">Đã check-in</Tag>
                <span className="font-bold">{lastTicket.ticketCode}</span>
              </Space>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Phim">
                  {lastTicket.movieName}
                </Descriptions.Item>
                <Descriptions.Item label="Suất chiếu">
                  {dayjs(lastTicket.startTime).format("HH:mm DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng">
                  {lastTicket.roomName}
                </Descriptions.Item>
                <Descriptions.Item label="Ghế">
                  {lastTicket.items.map((seat) => seat.seatLabel).join(", ")}
                </Descriptions.Item>
                {lastSeatLabel && (
                  <Descriptions.Item label="Ghế vừa check-in">
                    <Tag color="green">{lastSeatLabel}</Tag>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Khách hàng">
                  {lastTicket.customerName}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminCheckIn;
