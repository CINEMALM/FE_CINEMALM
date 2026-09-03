import {
  CheckCircleOutlined,
  GiftOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { adminService } from "../../common/services/admin.service";
import type { ITicketProductItem } from "../../common/types/ticket";
import { formatCurrency } from "../../common/utils";

const AdminConcession = () => {
  const [ticketCode, setTicketCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const pickupQuery = useQuery({
    queryKey: ["ADMIN_CONCESSION_TICKET", submittedCode],
    queryFn: () => adminService.concessionTicket(submittedCode),
    enabled: Boolean(submittedCode),
    retry: false,
  });

  const pickup = pickupQuery.data;
  const ticket = pickup?.ticket;
  const order = pickup?.order;
  const productItems = pickup?.items || [];
  const pendingItems = useMemo(
    () => productItems.filter((item) => item.status === "pending"),
    [productItems],
  );

  const search = (rawCode = ticketCode) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      message.warning("Nhập mã nhận bắp nước hoặc quét QR trước.");
      return;
    }
    setTicketCode(code);
    setSubmittedCode(code);
  };

  const fulfill = useMutation({
    mutationFn: (itemIds?: string[]) =>
      adminService.fulfillConcession(submittedCode, itemIds),
    onSuccess: async () => {
      message.success("Đã xác nhận phát bắp nước/combo.");
      await queryClient.invalidateQueries({
        queryKey: ["ADMIN_CONCESSION_TICKET", submittedCode],
      });
    },
    onError: (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      message.error(
        (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          "Không thể xác nhận phát bắp nước/combo.",
      );
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Typography.Text className="text-xs font-black uppercase tracking-[0.18em] text-[#DC0000]">
          Concession Counter
        </Typography.Text>
        <Typography.Title level={2} className="!mt-2 !text-white">
          Quầy bắp nước
        </Typography.Title>
        <p className="max-w-3xl text-sm leading-6 text-[#9A9A9A]">
          Quét QR nhận bắp nước hoặc nhập mã đơn để phát hàng. QR check-in theo
          từng ghế chỉ dùng để vào phòng chiếu và không thể nhận bắp nước.
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
                    search(value);
                    window.setTimeout(() => setScannerEnabled(true), 1600);
                  }
                }}
                onError={(error) => {
                  setScannerError(
                    error instanceof Error
                      ? error.message
                      : "Không thể mở camera để quét QR.",
                  );
                }}
                constraints={{ facingMode: "environment" }}
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm text-[#9A9A9A]">
                Đang xử lý mã vừa quét...
              </div>
            )}
          </div>
          <Alert
            className="mt-4"
            type={scannerError ? "warning" : "info"}
            showIcon
            message={
              scannerError ||
              "Đưa QR nhận bắp nước vào camera. Nếu không mở được camera, nhập mã đơn bên cạnh."
            }
          />
        </Card>

        <Card title="Nhập mã nhận hàng thủ công">
          <Space.Compact className="w-full">
            <Input
              autoFocus
              value={ticketCode}
              onChange={(event) =>
                setTicketCode(event.target.value.toUpperCase())
              }
              onPressEnter={() => search()}
              placeholder="Mã đơn vé CLM... hoặc mã đơn quầy CCN..."
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              loading={pickupQuery.isFetching}
              onClick={() => search()}
            >
              Tra cứu
            </Button>
          </Space.Compact>
        </Card>
      </div>

      {pickupQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="Không tìm thấy đơn đã thanh toán có bắp nước/combo. Hãy dùng QR nhận hàng, không dùng QR ghế."
        />
      ) : null}

      {!submittedCode ? (
        <Empty description="Quét QR hoặc nhập mã nhận hàng để bắt đầu phát bắp nước/combo." />
      ) : null}

      {pickup ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card title={ticket ? "Thông tin vé" : "Thông tin đơn tại quầy"}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mã nhận hàng">
                <b>{pickup.pickupCode}</b>
              </Descriptions.Item>
              {ticket ? (
                <>
                  <Descriptions.Item label="Phim">
                    {ticket.movieName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Suất chiếu">
                    {dayjs(ticket.startTime).format("HH:mm DD/MM/YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phòng">
                    {ticket.roomName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghế">
                    {ticket.items.map((item) => item.seatLabel).join(", ")}
                  </Descriptions.Item>
                </>
              ) : (
                <>
                  <Descriptions.Item label="Khách hàng">
                    {pickup.customerName || "Khách vãng lai"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {pickup.customerPhone || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    {formatCurrency(Number(order?.total_amount || 0))}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thanh toán lúc">
                    {pickup.paidAt
                      ? dayjs(pickup.paidAt).format("HH:mm DD/MM/YYYY")
                      : "-"}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Thanh toán">
                <Tag color="green">Đã thanh toán</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Tổng kết phát hàng"
            extra={<GiftOutlined className="text-[#DC0000]" />}
          >
            {pendingItems.length ? (
              <Alert
                className="mb-4"
                type="warning"
                showIcon
                message={`Còn ${pendingItems.length} món chưa phát.`}
              />
            ) : (
              <Alert
                className="mb-4"
                type="success"
                showIcon
                message="Tất cả bắp nước/combo của đơn này đã được phát."
              />
            )}
            <Button
              block
              type="primary"
              icon={<CheckCircleOutlined />}
              disabled={!pendingItems.length}
              loading={fulfill.isPending}
              onClick={() =>
                fulfill.mutate(
                  pickup.sourceType === "ticket"
                    ? pendingItems.map((item) => item._id)
                    : undefined,
                )
              }
            >
              Xác nhận đã phát tất cả
            </Button>
          </Card>

          <Card className="xl:col-span-2" title="Bắp nước / Combo / Quà tặng">
            <Table<ITicketProductItem>
              rowKey="_id"
              dataSource={productItems}
              pagination={false}
              locale={{ emptyText: "Vé này không có bắp nước/combo." }}
              columns={[
                {
                  title: "Loại",
                  width: 110,
                  render: (_, item) =>
                    item.isGift ? (
                      <Tag color="red">Quà tặng</Tag>
                    ) : (
                      <Tag color="gold">Đã mua</Tag>
                    ),
                },
                {
                  title: "Sản phẩm",
                  render: (_, item) => (
                    <div>
                      <b>{item.productName}</b>
                      <div className="text-xs text-[#9A9A9A]">
                        {item.variantName} · {item.sku || "No SKU"}
                      </div>
                    </div>
                  ),
                },
                { title: "SL", dataIndex: "quantity", width: 80 },
                {
                  title: "Giá",
                  width: 130,
                  render: (_, item) =>
                    item.isGift ? "0 đ" : formatCurrency(item.totalPrice),
                },
                {
                  title: "Trạng thái",
                  width: 130,
                  render: (_, item) =>
                    item.status === "fulfilled" ? (
                      <Tag color="green">Đã phát</Tag>
                    ) : (
                      <Tag color="orange">Chưa phát</Tag>
                    ),
                },
                {
                  title: "Thao tác",
                  width: 150,
                  render: (_, item) => (
                    <Button
                      size="small"
                      type="primary"
                      disabled={item.status === "fulfilled"}
                      loading={fulfill.isPending}
                      onClick={() => fulfill.mutate([item._id])}
                      hidden={pickup.sourceType !== "ticket"}
                    >
                      Đã phát món này
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default AdminConcession;
