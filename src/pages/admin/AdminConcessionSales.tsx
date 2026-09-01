import { DollarOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useMemo } from "react";
import {
  adminService,
  type ConcessionOrder,
} from "../../common/services/admin.service";
import { getProducts } from "../../common/services/booking.service";
import { formatCurrency } from "../../common/utils";

const AdminConcessionSales = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const method = Form.useWatch("payment_method", form) || "CASH";
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
        amount_received:
          values.payment_method === "CASH"
            ? Number(values.amount_received)
            : undefined,
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
          initialValues={{ payment_method: "CASH", items: [{ quantity: 1 }] }}
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
            <Form.Item label="Thanh toán" name="payment_method">
              <Select
                options={[
                  { value: "CASH", label: "Tiền mặt" },
                  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
                ]}
              />
            </Form.Item>
            {method === "CASH" ? (
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
            ) : (
              <Form.Item
                label="Mã giao dịch"
                name="transfer_reference"
                rules={[{ required: true, message: "Nhập mã giao dịch." }]}
              >
                <Input />
              </Form.Item>
            )}
          </div>
          <Alert
            className="mb-4"
            type={method === "CASH" && received < total ? "warning" : "info"}
            showIcon
            message={`Tổng cộng: ${formatCurrency(total)}${method === "CASH" ? ` · Tiền thối: ${formatCurrency(Math.max(0, received - total))}` : ""}`}
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
                  ? "Chuyển khoản"
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
          ]}
        />
      </Card>
    </div>
  );
};
export default AdminConcessionSales;
