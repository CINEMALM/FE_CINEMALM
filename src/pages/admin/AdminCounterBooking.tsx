import { DollarOutlined, PrinterOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo, useState } from "react";
import { SEAT_STATUS_COLOR } from "../../common/constants/seat";
import { adminService } from "../../common/services/admin.service";
import {
  getProducts,
  getShowtimeSeats,
  previewPromotions,
} from "../../common/services/booking.service";
import type { ISeatStatus } from "../../common/types/seat";
import type { IShowtime } from "../../common/types/showtime";
import type { ITicket } from "../../common/types/ticket";
import { formatCurrency } from "../../common/utils";

const MAX_COUNTER_SEATS = 8;

const AdminCounterBooking = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [createdTicket, setCreatedTicket] = useState<ITicket | null>(null);
  const [lastCashSnapshot, setLastCashSnapshot] = useState<{
    amountReceived: number;
    changeAmount: number;
  } | null>(null);
  const [showtimeDate, setShowtimeDate] = useState(dayjs());
  const amountReceived = Number(Form.useWatch("amount_received", form) || 0);
  const voucherCode = String(Form.useWatch("voucher_code", form) || "");
  const watchedProductItems = Form.useWatch("product_items", form) || [];

  const showtimesQuery = useQuery({
    queryKey: ["ADMIN_COUNTER_SHOWTIMES", showtimeDate.format("YYYY-MM-DD")],
    queryFn: () =>
      adminService.showtimes({
        status: "scheduled",
        date: showtimeDate.format("YYYY-MM-DD"),
        per_page: 100,
      }),
  });

  const seatsQuery = useQuery({
    queryKey: ["ADMIN_COUNTER_SEATS", selectedShowtimeId],
    queryFn: () => getShowtimeSeats(selectedShowtimeId as string),
    enabled: Boolean(selectedShowtimeId),
    refetchInterval: 5000,
  });

  const productsQuery = useQuery({
    queryKey: ["ADMIN_COUNTER_PRODUCTS"],
    queryFn: getProducts,
  });

  const sellableShowtimes = useMemo(
    () =>
      (showtimesQuery.data?.items || [])
        .filter((showtime) => dayjs(showtime.endTime).isAfter(dayjs()))
        .sort(
          (left, right) =>
            dayjs(left.startTime).valueOf() - dayjs(right.startTime).valueOf(),
        ),
    [showtimesQuery.data?.items],
  );

  const selectedShowtime = sellableShowtimes.find(
    (item) => item._id === selectedShowtimeId,
  );

  const priceByType = useMemo(
    () =>
      Object.fromEntries(
        (selectedShowtime?.price || []).map((price) => [
          price.seatType,
          price.value,
        ]),
      ),
    [selectedShowtime?.price],
  );

  const displayLayout = useMemo(
    () =>
      seatsQuery.data?.layout.map((row) => {
        const coveredColumns = new Set<number>();

        return row.filter((seat) => {
          if (coveredColumns.has(seat.col)) return false;
          if (seat.type === "COUPLE" && seat.span === 2) {
            coveredColumns.add(seat.col + 1);
          }
          return true;
        });
      }) || [],
    [seatsQuery.data?.layout],
  );

  const allSeats = useMemo(() => displayLayout.flat(), [displayLayout]);
  const selectedSeats = allSeats.filter((seat) =>
    selectedSeatIds.includes(seat._id),
  );
  const totalPrice = selectedSeats.reduce(
    (total, seat) => total + Number(priceByType[seat.type] || 0),
    0,
  );
  const selectedProductItems = useMemo(
    () =>
      (
        watchedProductItems as {
          product_variant_id?: number;
          quantity?: number;
        }[]
      )
        .filter(
          (item) => item.product_variant_id && Number(item.quantity || 0) > 0,
        )
        .map((item) => ({
          product_variant_id: Number(item.product_variant_id),
          quantity: Number(item.quantity || 1),
        })),
    [watchedProductItems],
  );
  const promotionPreview = useQuery({
    queryKey: [
      "ADMIN_COUNTER_PROMOTION_PREVIEW",
      selectedShowtimeId,
      selectedSeatIds,
      selectedProductItems,
      voucherCode,
    ],
    queryFn: () =>
      previewPromotions({
        showtimeId: selectedShowtimeId as string,
        seatIds: selectedSeatIds,
        productItems: selectedProductItems,
        voucherCode: voucherCode.trim(),
      }),
    enabled: Boolean(selectedShowtimeId && selectedSeatIds.length),
    retry: false,
  });
  const payableAmount = promotionPreview.data?.total_amount ?? totalPrice;
  const issuedAt = createdTicket?.paidAt || createdTicket?.createdAt;
  const ticketQrValue =
    createdTicket?.qrCode || createdTicket?.ticketCode || "";

  const sellTicket = useMutation({
    mutationFn: async () => {
      if (!selectedShowtimeId || selectedSeatIds.length === 0) {
        throw new Error("Vui lòng chọn suất chiếu và ghế.");
      }

      const values = await form.validateFields();

      return adminService.createCounterBooking({
        showtime_id: Number(selectedShowtimeId),
        seat_ids: selectedSeatIds.map(Number),
        customer_name: values.customer_name || undefined,
        customer_email: values.customer_email || undefined,
        customer_phone: values.customer_phone || undefined,
        product_items: selectedProductItems,
        voucher_code: values.voucher_code || undefined,
        payment_method: "CASH",
        amount_received: Number(values.amount_received || 0),
      });
    },
    onSuccess: async (ticket) => {
      setCreatedTicket(ticket);
      const received = Number(form.getFieldValue("amount_received") || 0);
      setLastCashSnapshot({
        amountReceived: received,
        changeAmount: Math.max(0, received - ticket.totalPrice),
      });
      setSelectedSeatIds([]);
      form.resetFields(["amount_received"]);
      message.success("Bán vé tại quầy thành công.");
      await queryClient.invalidateQueries({
        queryKey: ["ADMIN_COUNTER_SEATS", selectedShowtimeId],
      });
    },
    onError: (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      message.error(
        (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          (error instanceof Error ? error.message : "Không thể bán vé."),
      );
    },
  });

  const holdSeats = useMutation({
    mutationFn: (seatIds: string[]) => {
      if (!selectedShowtimeId) throw new Error("Missing showtime");
      return adminService.holdCounterSeats({
        showtime_id: Number(selectedShowtimeId),
        seat_ids: seatIds.map(Number),
      });
    },
    onError: async (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      message.error(
        (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          "Không thể giữ ghế tại quầy.",
      );
      setSelectedSeatIds([]);
      await queryClient.invalidateQueries({
        queryKey: ["ADMIN_COUNTER_SEATS", selectedShowtimeId],
      });
    },
  });

  const releaseSeats = useMutation({
    mutationFn: (seatIds: string[]) => {
      if (!selectedShowtimeId) throw new Error("Missing showtime");
      return adminService.releaseCounterSeats({
        showtime_id: Number(selectedShowtimeId),
        seat_ids: seatIds.map(Number),
      });
    },
    onError: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["ADMIN_COUNTER_SEATS", selectedShowtimeId],
      });
    },
  });

  const toggleSeat = (seat: ISeatStatus) => {
    if (holdSeats.isPending || releaseSeats.isPending) return;
    if (
      !seat.status ||
      (seat.bookingStatus !== "AVAILABLE" &&
        !selectedSeatIds.includes(seat._id))
    ) {
      return;
    }

    if (selectedSeatIds.includes(seat._id)) {
      releaseSeats.mutate([seat._id], {
        onSuccess: () => {
          setSelectedSeatIds((current) =>
            current.filter((seatId) => seatId !== seat._id),
          );
        },
      });
      return;
    }

    if (selectedSeatIds.length >= MAX_COUNTER_SEATS) {
      message.warning(`Chỉ được chọn tối đa ${MAX_COUNTER_SEATS} ghế/lần.`);
      return;
    }

    const nextSeatIds = [...selectedSeatIds, seat._id];
    holdSeats.mutate(nextSeatIds, {
      onSuccess: () => setSelectedSeatIds(nextSeatIds),
    });
  };

  const seatColor = (seat: ISeatStatus) => {
    if (selectedSeatIds.includes(seat._id)) return SEAT_STATUS_COLOR.MYHOLD;
    if (!seat.status || seat.bookingStatus === "BOOKED") {
      return SEAT_STATUS_COLOR.BOOKED;
    }
    if (seat.bookingStatus === "HOLD") return SEAT_STATUS_COLOR.HOLD;
    return seat.type === "VIP" || seat.type === "COUPLE"
      ? "#f59e0b"
      : "#1f2937";
  };

  return (
    <>
      <style>
        {`
          .counter-print-ticket {
            display: none;
          }

          @media print {
            body * {
              visibility: hidden !important;
            }

            .counter-print-ticket,
            .counter-print-ticket * {
              visibility: visible !important;
            }

            .counter-print-ticket {
              display: block !important;
              position: absolute;
              inset: 0;
              margin: 0 auto;
              width: 80mm;
              padding: 12px;
              color: #000;
              background: #fff;
              font-family: Arial, sans-serif;
            }

            .counter-print-ticket__title {
              text-align: center;
              font-size: 18px;
              font-weight: 800;
              margin-bottom: 4px;
            }

            .counter-print-ticket__subtitle {
              text-align: center;
              font-size: 11px;
              margin-bottom: 10px;
            }

            .counter-print-ticket__row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              border-top: 1px dashed #999;
              padding: 6px 0;
              font-size: 12px;
            }

            .counter-print-ticket__row span:first-child {
              color: #555;
            }

            .counter-print-ticket__row strong {
              text-align: right;
            }

            .counter-print-ticket__qr {
              display: flex;
              justify-content: center;
              padding: 12px 0 8px;
            }

            .counter-print-ticket__note {
              border-top: 1px dashed #999;
              padding-top: 8px;
              text-align: center;
              font-size: 10px;
            }
          }
        `}
      </style>

      {createdTicket && (
        <div className="counter-print-ticket">
          <div className="counter-print-ticket__title">CinemaLM</div>
          <div className="counter-print-ticket__subtitle">
            VE XEM PHIM TAI QUAY
          </div>

          <div className="counter-print-ticket__qr">
            <QRCodeCanvas value={ticketQrValue} size={150} />
          </div>

          <div className="counter-print-ticket__row">
            <span>Ma ve</span>
            <strong>{createdTicket.ticketCode}</strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Phim</span>
            <strong>{createdTicket.movieName}</strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Suat chieu</span>
            <strong>
              {dayjs(createdTicket.startTime).format("HH:mm DD/MM/YYYY")}
            </strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Phong</span>
            <strong>{createdTicket.roomName}</strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Dinh dang</span>
            <strong>{createdTicket.projectionFormat}</strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Ghe</span>
            <strong>
              {createdTicket.items.map((item) => item.seatLabel).join(", ")}
            </strong>
          </div>
          {createdTicket.productItems?.length ? (
            <div className="counter-print-ticket__row">
              <span>Combo</span>
              <strong>
                {createdTicket.productItems
                  .map(
                    (item) =>
                      `${item.isGift ? "[TANG] " : ""}${item.productName} ${item.variantName} x${item.quantity}`,
                  )
                  .join(", ")}
              </strong>
            </div>
          ) : null}
          {createdTicket.discountAmount ? (
            <div className="counter-print-ticket__row">
              <span>Giam gia</span>
              <strong>-{formatCurrency(createdTicket.discountAmount)}</strong>
            </div>
          ) : null}
          <div className="counter-print-ticket__row">
            <span>Tong tien</span>
            <strong>{formatCurrency(createdTicket.totalPrice)}</strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Khach dua</span>
            <strong>
              {formatCurrency(
                lastCashSnapshot?.amountReceived || createdTicket.totalPrice,
              )}
            </strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Tien thoi</span>
            <strong>
              {formatCurrency(lastCashSnapshot?.changeAmount || 0)}
            </strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Thanh toan</span>
            <strong>TIEN MAT - DA THANH TOAN</strong>
          </div>
          <div className="counter-print-ticket__row">
            <span>Phat hanh</span>
            <strong>
              {issuedAt ? dayjs(issuedAt).format("HH:mm DD/MM/YYYY") : "-"}
            </strong>
          </div>

          <div className="counter-print-ticket__note">
            Vui long giu ve de nhan vien quet QR check-in truoc khi vao phong
            chieu.
          </div>
        </div>
      )}

      <div className="counter-screen space-y-6">
        <div>
          <Typography.Text className="text-xs font-black uppercase tracking-[0.18em] text-[#DC0000]">
            Box Office
          </Typography.Text>
          <Typography.Title level={2} className="!mt-2 !text-white">
            Bán vé tại quầy
          </Typography.Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card title="1. Chọn suất chiếu và ghế">
              <Space className="mb-4" wrap>
                <DatePicker
                  value={showtimeDate}
                  onChange={(value) => {
                    setShowtimeDate(value || dayjs());
                    setSelectedShowtimeId(undefined);
                    setSelectedSeatIds([]);
                  }}
                  format="DD/MM/YYYY"
                />
                <Select
                  className="min-w-[360px]"
                  placeholder="Chọn suất chiếu"
                  value={selectedShowtimeId}
                  loading={showtimesQuery.isLoading}
                  onChange={(value) => {
                    setSelectedShowtimeId(value);
                    setSelectedSeatIds([]);
                    setCreatedTicket(null);
                  }}
                  options={sellableShowtimes.map((showtime: IShowtime) => ({
                    value: showtime._id,
                    label: `${showtime.movieId.name} · ${showtime.roomId.name} · ${showtime.projectionFormat} · ${dayjs(showtime.startTime).format("HH:mm DD/MM")}`,
                  }))}
                />
              </Space>

              {!selectedShowtimeId ? (
                <Empty description="Chọn suất chiếu để mở sơ đồ ghế." />
              ) : seatsQuery.isLoading ? (
                <Spin />
              ) : (
                <div className="overflow-x-auto rounded border border-white/10 bg-[#101010] p-4">
                  <div className="mx-auto mb-6 flex h-7 w-4/5 max-w-xl items-center justify-center bg-gradient-to-b from-white to-gray-400 text-[10px] font-black uppercase tracking-[0.22em] text-black [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]">
                    Màn hình
                  </div>
                  <div className="mx-auto w-max space-y-1">
                    {displayLayout.map((row) => (
                      <div
                        key={row[0]?._id}
                        className="grid items-center gap-1"
                        style={{
                          gridTemplateColumns: `24px repeat(${seatsQuery.data?.room.cols || 1}, 32px)`,
                        }}
                      >
                        <span className="text-center text-xs text-gray-400">
                          {row[0]?.label.charAt(0)}
                        </span>
                        {row.map((seat) => (
                          <button
                            key={seat._id}
                            type="button"
                            disabled={
                              !seat.status ||
                              (seat.bookingStatus !== "AVAILABLE" &&
                                !selectedSeatIds.includes(seat._id))
                            }
                            onClick={() => toggleSeat(seat)}
                            className="h-8 rounded border border-white/10 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              gridColumn: `${seat.col + 1} / span ${seat.span || 1}`,
                              backgroundColor: seatColor(seat),
                            }}
                          >
                            {seat.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card title="2. Thanh toán tiền mặt">
              <Form form={form} layout="vertical">
                <Form.Item label="Tên khách" name="customer_name">
                  <Input placeholder="Khách vãng lai" />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="customer_phone">
                  <Input placeholder="Không bắt buộc" />
                </Form.Item>
                <Form.Item label="Email" name="customer_email">
                  <Input placeholder="Không bắt buộc" />
                </Form.Item>
                <Descriptions column={1} size="small" className="mb-4">
                  <Descriptions.Item label="Ghế">
                    {selectedSeats.map((seat) => seat.label).join(", ") || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    <b>{formatCurrency(payableAmount)}</b>
                  </Descriptions.Item>
                  <Descriptions.Item label="Khách đưa">
                    {formatCurrency(amountReceived)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền thối">
                    <b
                      className={
                        amountReceived >= payableAmount
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {formatCurrency(
                        Math.max(0, amountReceived - payableAmount),
                      )}
                    </b>
                  </Descriptions.Item>
                </Descriptions>
                <Form.List name="product_items">
                  {(fields, { add, remove }) => (
                    <div className="mb-4">
                      <Typography.Text strong>Bắp nước / Combo</Typography.Text>
                      {fields.map((field) => (
                        <Space
                          key={field.key}
                          className="mt-2 flex"
                          align="baseline"
                        >
                          <Form.Item
                            {...field}
                            name={[field.name, "product_variant_id"]}
                            className="!mb-0"
                          >
                            <Select
                              className="min-w-[180px]"
                              placeholder="Chọn sản phẩm"
                              options={(productsQuery.data || []).flatMap(
                                (product) =>
                                  product.variants.map((variant) => ({
                                    value: Number(variant.id),
                                    label: `${product.name} · ${variant.name} · ${formatCurrency(Number(variant.price || 0))}`,
                                  })),
                              )}
                            />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, "quantity"]}
                            className="!mb-0"
                            initialValue={1}
                          >
                            <InputNumber min={1} max={20} />
                          </Form.Item>
                          <Button danger onClick={() => remove(field.name)}>
                            Xóa
                          </Button>
                        </Space>
                      ))}
                      <Button
                        className="mt-2"
                        onClick={() => add({ quantity: 1 })}
                      >
                        Thêm combo
                      </Button>
                    </div>
                  )}
                </Form.List>
                <Form.Item label="Voucher" name="voucher_code">
                  <Input placeholder="VD: CINEMA50" />
                </Form.Item>
                {promotionPreview.data?.discount_amount ? (
                  <Alert
                    className="mb-4"
                    type="success"
                    showIcon
                    message={`Đã giảm ${formatCurrency(promotionPreview.data.discount_amount)}`}
                  />
                ) : null}
                <Form.Item
                  label="Tiền khách đưa"
                  name="amount_received"
                  rules={[
                    { required: true, message: "Nhập số tiền đã nhận." },
                    {
                      validator: (_, value) =>
                        Number(value || 0) >= payableAmount
                          ? Promise.resolve()
                          : Promise.reject(new Error("Tiền nhận chưa đủ.")),
                    },
                  ]}
                >
                  <InputNumber className="w-full" min={0} step={10000} />
                </Form.Item>
                <Button
                  type="primary"
                  block
                  icon={<DollarOutlined />}
                  loading={sellTicket.isPending}
                  disabled={!selectedShowtimeId || selectedSeatIds.length === 0}
                  onClick={() => sellTicket.mutate()}
                >
                  Xác nhận đã nhận tiền
                </Button>
              </Form>
            </Card>

            {createdTicket && (
              <Card className="mt-4" title="Vé đã phát hành">
                <Alert
                  type="success"
                  showIcon
                  message={`Mã vé: ${createdTicket.ticketCode}`}
                  className="mb-4"
                />
                <div className="flex justify-center rounded bg-white p-4">
                  <QRCodeCanvas
                    value={createdTicket.qrCode || createdTicket.ticketCode}
                    size={180}
                  />
                </div>
                <Descriptions column={1} size="small" className="mt-4">
                  <Descriptions.Item label="Phim">
                    {createdTicket.movieName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghế">
                    {createdTicket.items
                      .map((item) => item.seatLabel)
                      .join(", ")}
                  </Descriptions.Item>
                  {createdTicket.productItems?.length ? (
                    <Descriptions.Item label="Bắp nước / Combo">
                      {createdTicket.productItems
                        .map(
                          (item) =>
                            `${item.isGift ? "[Tặng] " : ""}${item.productName} ${item.variantName} x${item.quantity}`,
                        )
                        .join(", ")}
                    </Descriptions.Item>
                  ) : null}
                  {createdTicket.discountAmount ? (
                    <Descriptions.Item label="Giảm giá">
                      -{formatCurrency(createdTicket.discountAmount)}
                    </Descriptions.Item>
                  ) : null}
                  <Descriptions.Item label="Trạng thái">
                    <Tag color="green">Đã thanh toán</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Khách đưa">
                    {formatCurrency(
                      lastCashSnapshot?.amountReceived ||
                        createdTicket.totalPrice,
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền thối">
                    <b>{formatCurrency(lastCashSnapshot?.changeAmount || 0)}</b>
                  </Descriptions.Item>
                </Descriptions>
                <Button
                  className="mt-3"
                  block
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                >
                  In vé
                </Button>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default AdminCounterBooking;
