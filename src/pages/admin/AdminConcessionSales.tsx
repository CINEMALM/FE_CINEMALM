import { DollarOutlined, PrinterOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  adminService,
  type ConcessionOrder,
} from "../../common/services/admin.service";
import { getProducts } from "../../common/services/booking.service";
import { formatCurrency } from "../../common/utils";

const AdminConcessionSales = () => {
  const [form] = Form.useForm();
  const [createdOrder, setCreatedOrder] = useState<ConcessionOrder | null>(
    null,
  );
  const queryClient = useQueryClient();
  const watchedItems = Form.useWatch("items", form) || [];
  const received = Number(Form.useWatch("amount_received", form) || 0);
  const products = useQuery({
    queryKey: ["COUNTER_PRODUCTS"],
    queryFn: getProducts,
  });
  const orders = useQuery({
    queryKey: ["CONCESSION_ORDERS"],
    queryFn: () => adminService.concessionOrders({ per_page: 20 }),
  });
  const variants = useMemo(
    () =>
      (products.data || []).flatMap((product) =>
        product.variants.map((variant) => ({
          value: Number(variant.id),
          label: `${product.name} · ${variant.name} · ${formatCurrency(Number(variant.price))}`,
          price: Number(variant.price),
        })),
      ),
    [products.data],
  );
  const total = watchedItems.reduce(
    (sum: number, item: { product_variant_id?: number; quantity?: number }) =>
      sum +
      Number(
        variants.find((v) => v.value === item.product_variant_id)?.price || 0,
      ) *
        Number(item.quantity || 0),
    0,
  );
  const sell = useMutation({
    mutationFn: async () => {
      const values = await form.validateFields();
      return adminService.createConcessionOrder({
        ...values,
        payment_method: "CASH",
        amount_received: Number(values.amount_received),
        items: values.items.map(
          (item: { product_variant_id: number; quantity: number }) => ({
            product_variant_id: Number(item.product_variant_id),
            quantity: Number(item.quantity),
          }),
        ),
      });
    },
    onSuccess: async (order) => {
      message.success(`Đã tạo đơn ${order.order_code}`);
      setCreatedOrder(order);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ["CONCESSION_ORDERS"] });
    },
    onError: (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      message.error(
        (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          "Không thể bán bắp nước.",
      );
    },
  });
  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .concession-order-print, .concession-order-print * { visibility: visible !important; }
          .concession-order-print {
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 80mm !important;
            padding: 8mm !important;
            color: #000 !important;
            background: #fff !important;
          }
        }
      `}</style>
      <Modal
        open={Boolean(createdOrder)}
        title="Đơn bắp nước đã thanh toán"
        onCancel={() => setCreatedOrder(null)}
        footer={[
          <Button key="close" onClick={() => setCreatedOrder(null)}>
            Đóng
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            In phiếu nhận đồ
          </Button>,
        ]}
      >
        {createdOrder ? (
          <div className="concession-order-print text-center text-black">
            <h2 className="text-2xl font-black">CinemaLM</h2>
            <p className="font-bold uppercase">Phiếu nhận bắp nước</p>
            <div className="my-5 flex justify-center">
              <QRCodeCanvas value={createdOrder.order_code} size={190} />
            </div>
            <p className="break-all font-black">{createdOrder.order_code}</p>
            <p className="mt-1 text-xs">
              Xuất trình QR này tại quầy khi nhận hàng
            </p>
            <div className="mt-5 border-t border-dashed border-black pt-3 text-left">
              {createdOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 py-1">
                  <span>
                    {item.product_name} {item.variant_name} × {item.quantity}
                  </span>
                  <b>{formatCurrency(item.total_price)}</b>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-black pt-2 text-base">
                <b>Tổng cộng</b>
                <b>{formatCurrency(createdOrder.total_amount)}</b>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
      <div>
        <Typography.Text className="text-xs font-black uppercase tracking-[0.18em] text-[#DC0000]">
          Walk-in Concession
        </Typography.Text>
        <Typography.Title level={2} className="!mt-2 !text-white">
          Bán bắp nước tại quầy
        </Typography.Title>
        <p className="text-sm text-[#9A9A9A]">
          Bán sản phẩm độc lập, không yêu cầu khách phải có vé xem phim.
        </p>
      </div>
      <Card title="Tạo đơn tại quầy">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ items: [{ quantity: 1 }] }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item label="Tên khách" name="customer_name">
              <Input placeholder="Khách vãng lai" />
            </Form.Item>
            <Form.Item label="Số điện thoại" name="customer_phone">
              <Input />
            </Form.Item>
          </div>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="space-y-2">
                {fields.map((field) => (
                  <Space key={field.key} className="flex" align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, "product_variant_id"]}
                      rules={[{ required: true, message: "Chọn sản phẩm." }]}
                    >
                      <Select
                        className="min-w-[280px]"
                        options={variants}
                        placeholder="Chọn sản phẩm"
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "quantity"]}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1} max={50} />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}
                <Button onClick={() => add({ quantity: 1 })}>
                  Thêm sản phẩm
                </Button>
              </div>
            )}
          </Form.List>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Form.Item label="Thanh toán">
              <Input value="Tiền mặt" disabled />
            </Form.Item>
            <Form.Item
              label="Tiền khách đưa"
              name="amount_received"
              rules={[
                { required: true },
                {
                  validator: (_, value) =>
                    Number(value || 0) >= total
                      ? Promise.resolve()
                      : Promise.reject(new Error("Tiền nhận chưa đủ.")),
                },
              ]}
            >
              <InputNumber className="w-full" min={0} step={10000} />
            </Form.Item>
          </div>
          <Alert
            className="mb-4"
            type={received < total ? "warning" : "info"}
            showIcon
            message={`Tổng cộng: ${formatCurrency(total)} · Tiền thối: ${formatCurrency(Math.max(0, received - total))}`}
          />
          <Button
            type="primary"
            icon={<DollarOutlined />}
            loading={sell.isPending}
            onClick={() => sell.mutate()}
          >
            Xác nhận đã thanh toán
          </Button>
        </Form>
      </Card>
      <Card title="Đơn bán gần đây">
        <Table<ConcessionOrder>
          rowKey="id"
          loading={orders.isLoading}
          dataSource={orders.data?.data || []}
          pagination={false}
          scroll={{ x: 760 }}
          columns={[
            { title: "Mã đơn", dataIndex: "order_code" },
            { title: "Khách", dataIndex: "customer_name" },
            {
              title: "Sản phẩm",
              render: (_, order) =>
                order.items
                  .map(
                    (item) =>
                      `${item.product_name} ${item.variant_name} x${item.quantity}`,
                  )
                  .join(", "),
            },
            {
              title: "Thanh toán",
              render: (_, order) =>
                order.payment_method === "BANK_TRANSFER"
                  ? "Chuyển khoản (dữ liệu cũ)"
                  : "Tiền mặt",
            },
            {
              title: "Tổng",
              render: (_, order) => formatCurrency(order.total_amount),
            },
            {
              title: "Thời gian",
              render: (_, order) =>
                dayjs(order.paid_at).format("HH:mm DD/MM/YYYY"),
            },
            {
              title: "Phiếu nhận",
              width: 120,
              render: (_, order) => (
                <Button
                  size="small"
                  icon={<PrinterOutlined />}
                  onClick={() => setCreatedOrder(order)}
                >
                  In QR
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};
export default AdminConcessionSales;
