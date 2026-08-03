import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  adminService,
  type PromotionPayload,
} from "../../common/services/admin.service";
import { getProducts } from "../../common/services/booking.service";
import { formatCurrency } from "../../common/utils";

const promotionTypeOptions = [
  { value: "voucher_code", label: "Voucher nhập mã" },
  { value: "automatic", label: "Khuyến mại tự động" },
  { value: "gift_product", label: "Tặng bắp/nước" },
];

const discountTypeOptions = [
  { value: "fixed_amount", label: "Giảm số tiền cố định" },
  { value: "percentage", label: "Giảm theo phần trăm" },
  { value: "free_product", label: "Tặng sản phẩm" },
];

const targetScopeOptions = [
  { value: "order", label: "Toàn đơn" },
  { value: "ticket", label: "Chỉ tiền vé" },
  { value: "product", label: "Chỉ bắp nước/combo" },
];

const conditionOptions = [
  { value: "min_ticket_quantity", label: "Mua tối thiểu bao nhiêu vé" },
  { value: "weekday", label: "Áp dụng theo thứ trong tuần" },
  { value: "movie_id", label: "Áp dụng theo ID phim" },
  { value: "showtime_id", label: "Áp dụng theo ID suất chiếu" },
  { value: "projection_format", label: "Áp dụng theo 2D/3D/IMAX" },
];

const weekdayOptions = [
  { value: 1, label: "Thứ hai" },
  { value: 2, label: "Thứ ba" },
  { value: 3, label: "Thứ tư" },
  { value: 4, label: "Thứ năm" },
  { value: 5, label: "Thứ sáu" },
  { value: 6, label: "Thứ bảy" },
  { value: 7, label: "Chủ nhật" },
];

const projectionFormatOptions = [
  { value: "2D", label: "2D" },
  { value: "3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
];

const getApplyMethod = (promotionType?: string) =>
  promotionType === "voucher_code" ? "manual" : "automatic";

const normalizeListValue = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const AdminPromotions = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showtimeDate, setShowtimeDate] = useState(dayjs());
  const promotionType = Form.useWatch("promotion_type", form);
  const discountType = Form.useWatch("discount_type", form);

  const promotions = useQuery({
    queryKey: ["ADMIN_PROMOTIONS"],
    queryFn: () => adminService.promotions({ per_page: 100 }),
  });

  const products = useQuery({
    queryKey: ["PROMOTION_PRODUCTS"],
    queryFn: getProducts,
    enabled: open,
  });

  const movies = useQuery({
    queryKey: ["PROMOTION_MOVIES"],
    queryFn: () => adminService.movies({ per_page: 200 }),
    enabled: open,
  });

  const showtimes = useQuery({
    queryKey: ["PROMOTION_SHOWTIMES", showtimeDate.format("YYYY-MM-DD")],
    queryFn: () =>
      adminService.showtimes({
        date: showtimeDate.format("YYYY-MM-DD"),
        status: "scheduled",
        per_page: 200,
      }),
    enabled: open,
  });

  const productVariantOptions = useMemo(
    () =>
      (products.data || []).flatMap((product) =>
        product.variants.map((variant) => ({
          value: Number(variant.id),
          label: `${product.name} · ${variant.name} · ${formatCurrency(Number(variant.price || 0))}`,
        })),
      ),
    [products.data],
  );

  const movieOptions = useMemo(
    () =>
      (movies.data?.items || []).map((movie) => ({
        value: Number(movie._id),
        label: movie.name,
      })),
    [movies.data?.items],
  );

  const showtimeOptions = useMemo(
    () =>
      (showtimes.data?.items || [])
        .sort(
          (left, right) =>
            dayjs(left.startTime).valueOf() - dayjs(right.startTime).valueOf(),
        )
        .map((showtime) => ({
          value: Number(showtime._id),
          label: `${showtime.movieId.name} · ${showtime.roomId.name} · ${showtime.projectionFormat} · ${dayjs(showtime.startTime).format("HH:mm DD/MM/YYYY")}`,
        })),
    [showtimes.data?.items],
  );

  const createPromotion = useMutation({
    mutationFn: (payload: PromotionPayload) =>
      adminService.createPromotion(payload),
    onSuccess: async () => {
      message.success("Đã tạo khuyến mại.");
      setOpen(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ["ADMIN_PROMOTIONS"] });
    },
  });

  const disablePromotion = useMutation({
    mutationFn: (id: string) => adminService.disablePromotion(id),
    onSuccess: async () => {
      message.success("Đã tắt khuyến mại.");
      await queryClient.invalidateQueries({ queryKey: ["ADMIN_PROMOTIONS"] });
    },
  });

  const submit = (values: any) => {
    const normalizedPromotionType = values.promotion_type || "voucher_code";
    const normalizedDiscountType =
      normalizedPromotionType === "gift_product"
        ? "free_product"
        : values.discount_type || "fixed_amount";
    const giftProductVariantId = values.gift_product_variant_id
      ? Number(values.gift_product_variant_id)
      : null;
    const giftQuantity = Number(values.gift_quantity || 1);

    const payload: PromotionPayload = {
      name: values.name,
      code:
        normalizedPromotionType === "voucher_code" && values.code
          ? String(values.code).trim().toUpperCase()
          : undefined,
      description: values.description || undefined,
      promotion_type: normalizedPromotionType,
      apply_method: getApplyMethod(normalizedPromotionType),
      discount_type: normalizedDiscountType,
      discount_value:
        normalizedDiscountType === "free_product"
          ? 0
          : Number(values.discount_value || 0),
      maximum_discount: values.maximum_discount
        ? Number(values.maximum_discount)
        : null,
      minimum_order_amount: Number(values.minimum_order_amount || 0),
      target_scope: values.target_scope || "order",
      priority: Number(values.priority || 100),
      stackable: Boolean(values.stackable),
      start_at: values.range?.[0]?.toISOString?.() || null,
      end_at: values.range?.[1]?.toISOString?.() || null,
      usage_limit: values.usage_limit ? Number(values.usage_limit) : null,
      usage_limit_per_user: values.usage_limit_per_user
        ? Number(values.usage_limit_per_user)
        : null,
      is_active: values.is_active !== false,
      conditions: (values.conditions || [])
        .filter((item: any) => item.condition_type)
        .map((item: any) => {
          if (item.condition_type === "min_ticket_quantity") {
            return {
              condition_type: item.condition_type,
              operator: ">=",
              value: [Number(item.value || 1)],
            };
          }

          return {
            condition_type: item.condition_type,
            operator: "in",
            value: normalizeListValue(item.value),
          };
        }),
      rewards:
        normalizedDiscountType === "free_product" && giftProductVariantId
          ? [
              {
                reward_type: "free_product",
                target_scope: "order",
                discount_type: "free_product",
                discount_value: 0,
                product_variant_id: giftProductVariantId,
                quantity: giftQuantity,
              },
            ]
          : [],
    };

    createPromotion.mutate(payload);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Promotions
          </p>
          <Typography.Title level={2} className="!mt-2 !text-white">
            Voucher / Khuyến mại
          </Typography.Title>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => promotions.refetch()}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            Tạo khuyến mại
          </Button>
        </Space>
      </div>

      <div className="mt-6 overflow-hidden border border-white/10 bg-[#141414]">
        <Table
          rowKey="id"
          loading={promotions.isLoading}
          dataSource={promotions.data?.data || []}
          pagination={false}
          scroll={{ x: 1100 }}
          columns={[
            { title: "Tên", dataIndex: "name", width: 260 },
            {
              title: "Mã",
              dataIndex: "code",
              width: 130,
              render: (value) => value || "—",
            },
            {
              title: "Loại",
              dataIndex: "promotion_type",
              width: 170,
              render: (value) => (
                <Tag>
                  {promotionTypeOptions.find((item) => item.value === value)
                    ?.label || value}
                </Tag>
              ),
            },
            {
              title: "Giá trị",
              width: 180,
              render: (_, record) =>
                record.discount_type === "percentage"
                  ? `${record.discount_value}%`
                  : record.discount_type === "free_product"
                    ? "Tặng sản phẩm"
                    : formatCurrency(Number(record.discount_value || 0)),
            },
            {
              title: "Đơn tối thiểu",
              dataIndex: "minimum_order_amount",
              width: 150,
              render: (value) => formatCurrency(Number(value || 0)),
            },
            {
              title: "Trạng thái",
              dataIndex: "is_active",
              width: 120,
              render: (value: boolean) => (
                <Tag color={value ? "green" : "default"}>
                  {value ? "Đang bật" : "Đã tắt"}
                </Tag>
              ),
            },
            {
              title: "Thao tác",
              fixed: "right",
              width: 110,
              render: (_, record) => (
                <Button
                  danger
                  onClick={() => disablePromotion.mutate(String(record.id))}
                >
                  Tắt
                </Button>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="Tạo voucher / khuyến mại"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createPromotion.isPending}
        width={920}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            promotion_type: "voucher_code",
            discount_type: "fixed_amount",
            target_scope: "order",
            discount_value: 0,
            minimum_order_amount: 0,
            priority: 100,
            stackable: false,
            is_active: true,
            gift_quantity: 1,
          }}
          onFinish={submit}
        >
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message="Form này đã bỏ ô nhập toán tử thủ công. Bạn chỉ chọn loại điều kiện, hệ thống tự hiểu cách so sánh phù hợp."
          />

          <Form.Item
            name="name"
            label="Tên chương trình"
            rules={[{ required: true, message: "Nhập tên chương trình." }]}
          >
            <Input placeholder="VD: Thứ tư vui vẻ giảm 20%" />
          </Form.Item>

          <Space className="w-full" align="baseline" wrap>
            <Form.Item
              name="promotion_type"
              label="Loại chương trình"
              rules={[{ required: true }]}
            >
              <Select
                className="min-w-[220px]"
                options={promotionTypeOptions}
                onChange={(value) => {
                  if (value === "gift_product") {
                    form.setFieldsValue({
                      discount_type: "free_product",
                      discount_value: 0,
                    });
                  }
                  if (value !== "voucher_code") {
                    form.setFieldValue("code", undefined);
                  }
                }}
              />
            </Form.Item>

            {promotionType === "voucher_code" ? (
              <Form.Item
                name="code"
                label="Mã voucher khách nhập"
                rules={[{ required: true, message: "Nhập mã voucher." }]}
              >
                <Input placeholder="VD: CINEMA50" />
              </Form.Item>
            ) : null}

            <Form.Item name="target_scope" label="Giảm trên phần nào">
              <Select className="min-w-[180px]" options={targetScopeOptions} />
            </Form.Item>
          </Space>

          {promotionType !== "gift_product" ? (
            <Space className="w-full" align="baseline" wrap>
              <Form.Item name="discount_type" label="Kiểu giảm">
                <Select
                  className="min-w-[220px]"
                  options={discountTypeOptions.filter(
                    (item) => item.value !== "free_product",
                  )}
                />
              </Form.Item>
              <Form.Item
                name="discount_value"
                label={
                  discountType === "percentage"
                    ? "Phần trăm giảm (%)"
                    : "Số tiền giảm (đ)"
                }
                rules={[{ required: true, message: "Nhập giá trị giảm." }]}
              >
                <InputNumber
                  className="w-full min-w-[160px]"
                  min={0}
                  max={discountType === "percentage" ? 100 : undefined}
                  step={discountType === "percentage" ? 1 : 10000}
                  addonAfter={discountType === "percentage" ? "%" : "đ"}
                />
              </Form.Item>
              {discountType === "percentage" ? (
                <Form.Item name="maximum_discount" label="Giảm tối đa (đ)">
                  <InputNumber
                    className="w-full min-w-[160px]"
                    min={0}
                    step={10000}
                    addonAfter="đ"
                    placeholder="VD: 50000"
                  />
                </Form.Item>
              ) : null}
            </Space>
          ) : (
            <Space className="w-full" align="baseline" wrap>
              <Form.Item
                name="gift_product_variant_id"
                label="Sản phẩm được tặng"
                rules={[{ required: true, message: "Chọn sản phẩm tặng." }]}
              >
                <Select
                  showSearch
                  className="min-w-[320px]"
                  loading={products.isLoading}
                  options={productVariantOptions}
                  optionFilterProp="label"
                  placeholder="Chọn bắp/nước/combo"
                />
              </Form.Item>
              <Form.Item name="gift_quantity" label="Số lượng tặng">
                <InputNumber min={1} max={20} />
              </Form.Item>
            </Space>
          )}

          <Space className="w-full" align="baseline" wrap>
            <Form.Item name="minimum_order_amount" label="Đơn tối thiểu (đ)">
              <InputNumber
                className="w-full min-w-[170px]"
                min={0}
                step={10000}
                addonAfter="đ"
              />
            </Form.Item>
            <Form.Item name="range" label="Thời gian hiệu lực">
              <DatePicker.RangePicker showTime />
            </Form.Item>
            <Form.Item name="usage_limit_per_user" label="Mỗi user dùng tối đa">
              <InputNumber min={1} placeholder="Bỏ trống = không giới hạn" />
            </Form.Item>
            <Form.Item
              name="stackable"
              label="Cho cộng dồn với KM khác"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="is_active"
              label="Bật ngay"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>

          <Form.List name="conditions">
            {(fields, { add, remove }) => (
              <div className="mt-2">
                <Typography.Text strong>Điều kiện áp dụng</Typography.Text>
                <p className="mb-3 mt-1 text-xs text-[#9A9A9A]">
                  Không bắt buộc. Nếu không thêm điều kiện, chương trình áp dụng
                  cho mọi đơn hợp lệ.
                </p>

                {fields.map((field) => (
                  <Space
                    key={field.key}
                    className="mt-2 flex"
                    align="baseline"
                    wrap
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "condition_type"]}
                      rules={[{ required: true, message: "Chọn điều kiện." }]}
                    >
                      <Select
                        className="min-w-[240px]"
                        options={conditionOptions}
                        placeholder="Chọn điều kiện"
                        onChange={() => {
                          const current =
                            form.getFieldValue("conditions") || [];
                          current[field.name] = {
                            ...current[field.name],
                            value: undefined,
                          };
                          form.setFieldValue("conditions", current);
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, next) =>
                        prev.conditions?.[field.name]?.condition_type !==
                        next.conditions?.[field.name]?.condition_type
                      }
                    >
                      {({ getFieldValue }) => {
                        const conditionType = getFieldValue([
                          "conditions",
                          field.name,
                          "condition_type",
                        ]);

                        if (conditionType === "min_ticket_quantity") {
                          return (
                            <Form.Item
                              {...field}
                              name={[field.name, "value"]}
                              label="Từ bao nhiêu vé"
                              rules={[{ required: true }]}
                            >
                              <InputNumber min={1} max={50} addonAfter="vé" />
                            </Form.Item>
                          );
                        }

                        if (conditionType === "weekday") {
                          return (
                            <Form.Item
                              {...field}
                              name={[field.name, "value"]}
                              label="Chọn thứ"
                              rules={[{ required: true }]}
                            >
                              <Select
                                mode="multiple"
                                className="min-w-[260px]"
                                options={weekdayOptions}
                                placeholder="VD: Thứ tư, Chủ nhật"
                              />
                            </Form.Item>
                          );
                        }

                        if (conditionType === "projection_format") {
                          return (
                            <Form.Item
                              {...field}
                              name={[field.name, "value"]}
                              label="Định dạng"
                              rules={[{ required: true }]}
                            >
                              <Select
                                mode="multiple"
                                className="min-w-[220px]"
                                options={projectionFormatOptions}
                                placeholder="2D / 3D / IMAX"
                              />
                            </Form.Item>
                          );
                        }

                        if (conditionType === "movie_id") {
                          return (
                            <Form.Item
                              {...field}
                              name={[field.name, "value"]}
                              label="Chọn phim"
                              rules={[{ required: true }]}
                            >
                              <Select
                                showSearch
                                mode="multiple"
                                className="min-w-[320px]"
                                loading={movies.isLoading}
                                options={movieOptions}
                                optionFilterProp="label"
                                placeholder="Gõ tên phim để tìm"
                              />
                            </Form.Item>
                          );
                        }

                        if (conditionType === "showtime_id") {
                          return (
                            <Space align="baseline" wrap>
                              <Form.Item label="Ngày chiếu">
                                <DatePicker
                                  value={showtimeDate}
                                  format="DD/MM/YYYY"
                                  onChange={(value) =>
                                    setShowtimeDate(value || dayjs())
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, "value"]}
                                label="Chọn suất chiếu"
                                rules={[{ required: true }]}
                              >
                                <Select
                                  showSearch
                                  mode="multiple"
                                  className="min-w-[420px]"
                                  loading={showtimes.isLoading}
                                  options={showtimeOptions}
                                  optionFilterProp="label"
                                  placeholder="Chọn ngày rồi chọn suất"
                                />
                              </Form.Item>
                            </Space>
                          );
                        }

                        if (!conditionType) {
                          return null;
                        }

                        return (
                          <Form.Item
                            {...field}
                            name={[field.name, "value"]}
                            label="Giá trị"
                            rules={[{ required: true }]}
                          >
                            <Input placeholder="Nhập giá trị điều kiện" />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>

                    <Button danger onClick={() => remove(field.name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}

                <Button
                  className="mt-2"
                  onClick={() =>
                    add({
                      condition_type: "min_ticket_quantity",
                      value: 2,
                    })
                  }
                >
                  Thêm điều kiện
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPromotions;
