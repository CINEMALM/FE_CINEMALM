import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
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
import { useState } from "react";
import {
  adminService,
  type ProductPayload,
} from "../../common/services/admin.service";
import { formatCurrency } from "../../common/utils";

const productTypeOptions = [
  { value: "popcorn", label: "Bắp" },
  { value: "drink", label: "Nước" },
  { value: "combo", label: "Combo" },
  { value: "other", label: "Khác" },
];

const AdminProducts = () => {
  const [form] = Form.useForm<ProductPayload>();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const products = useQuery({
    queryKey: ["ADMIN_PRODUCTS"],
    queryFn: () => adminService.products({ per_page: 100 }),
  });

  const createProduct = useMutation({
    mutationFn: (payload: ProductPayload) =>
      adminService.createProduct(payload),
    onSuccess: async () => {
      message.success("Đã tạo sản phẩm.");
      setOpen(false);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ["ADMIN_PRODUCTS"] });
    },
  });

  const disableProduct = useMutation({
    mutationFn: (id: string) => adminService.disableProduct(id),
    onSuccess: async () => {
      message.success("Đã ngừng bán sản phẩm.");
      await queryClient.invalidateQueries({ queryKey: ["ADMIN_PRODUCTS"] });
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Concession
          </p>
          <Typography.Title level={2} className="!mt-2 !text-white">
            Bắp nước / Combo
          </Typography.Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => products.refetch()}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpen(true)}
          >
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      <div className="mt-6 overflow-hidden border border-white/10 bg-[#141414]">
        <Table
          rowKey="id"
          loading={products.isLoading}
          dataSource={products.data?.data || []}
          pagination={false}
          columns={[
            { title: "Tên", dataIndex: "name" },
            {
              title: "Loại",
              dataIndex: "type",
              render: (value: string) => <Tag>{value}</Tag>,
            },
            {
              title: "Phiên bản",
              render: (_, record) => (
                <Space direction="vertical" size={2}>
                  {(record.variants || []).map((variant) => (
                    <span key={String(variant.id)} className="text-xs">
                      {variant.name} · {variant.sku} ·{" "}
                      {formatCurrency(Number(variant.price || 0))}
                    </span>
                  ))}
                </Space>
              ),
            },
            {
              title: "Trạng thái",
              dataIndex: "is_active",
              render: (value: boolean) => (
                <Tag color={value ? "green" : "default"}>
                  {value ? "Đang bán" : "Ngừng bán"}
                </Tag>
              ),
            },
            {
              title: "Thao tác",
              render: (_, record) => (
                <Button
                  danger
                  onClick={() => disableProduct.mutate(String(record.id))}
                >
                  Ngừng bán
                </Button>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title="Thêm sản phẩm"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createProduct.isPending}
        width={760}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: "combo",
            is_active: true,
            variants: [{ name: "Mặc định", price: 0, is_active: true }],
          }}
          onFinish={(values) => createProduct.mutate(values)}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select options={productTypeOptions} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="is_active" label="Đang bán" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <div>
                <Typography.Text strong>Phiên bản / size</Typography.Text>
                {fields.map((field) => (
                  <Space key={field.key} className="mt-2 flex" align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, "name"]}
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Size M" />
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, "sku"]}>
                      <Input placeholder="SKU tự sinh nếu bỏ trống" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, "price"]}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={0} step={5000} placeholder="Giá" />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>
                      Xóa
                    </Button>
                  </Space>
                ))}
                <Button
                  onClick={() =>
                    add({ name: "Mặc định", price: 0, is_active: true })
                  }
                >
                  Thêm phiên bản
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
