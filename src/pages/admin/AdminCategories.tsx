import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Pagination, Switch, Table } from "antd";
import { useState } from "react";
import {
  adminService,
  type CategoryPayload,
} from "../../common/services/admin.service";
import type { ICategory } from "../../common/types/category";

const AdminCategories = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<ICategory | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CategoryPayload>();
  const queryClient = useQueryClient();
  const queryKey = ["ADMIN", "CATEGORIES", page, keyword];
  const query = useQuery({
    queryKey,
    queryFn: () =>
      adminService.categories({
        page,
        per_page: 10,
        keyword: keyword || undefined,
      }),
  });
  const save = useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      if (editing) return adminService.updateCategory(editing._id, payload);
      return adminService.createCategory(payload);
    },
    onSuccess: async () => {
      setOpen(false);
      form.resetFields();
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["ADMIN"] });
    },
  });
  const disable = useMutation({
    mutationFn: adminService.disableCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ADMIN"] }),
  });

  const openForm = (category?: ICategory) => {
    setEditing(category || null);
    form.setFieldsValue(
      category
        ? {
            name: category.name,
            description: category.description,
            status: category.status,
          }
        : { name: "", description: "", status: true },
    );
    setOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Categories
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Thể loại phim
          </h1>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openForm()}
        >
          Thêm thể loại
        </Button>
      </div>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Tìm thể loại..."
        className="mt-6 max-w-md"
        onPressEnter={(event) => {
          setPage(1);
          setKeyword(event.currentTarget.value.trim());
        }}
        onClear={() => setKeyword("")}
      />
      <div className="mt-4 overflow-hidden border border-white/10 bg-[#141414]">
        <Table<ICategory>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={query.data?.items}
          pagination={false}
          scroll={{ x: 700 }}
          columns={[
            { title: "Tên", dataIndex: "name" },
            {
              title: "Mô tả",
              dataIndex: "description",
              render: (value) => value || "—",
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (value) => (value ? "Hoạt động" : "Đã tắt"),
            },
            {
              title: "",
              width: 110,
              render: (_, record) => (
                <div className="flex gap-2">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openForm(record)}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={!record.status}
                    onClick={() =>
                      Modal.confirm({
                        title: "Tắt thể loại này?",
                        onOk: () => disable.mutateAsync(record._id),
                      })
                    }
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
      <Pagination
        className="mt-5"
        align="end"
        current={page}
        pageSize={query.data?.pageSize || 10}
        total={query.data?.total || 0}
        onChange={setPage}
      />
      <Modal
        title={editing ? "Cập nhật thể loại" : "Thêm thể loại"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={save.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => save.mutate(values)}
        >
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="status" label="Hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
