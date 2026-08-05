import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Switch,
  Table,
} from "antd";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router";
import {
  adminService,
  type RoomPayload,
} from "../../common/services/admin.service";
import type { IRoom } from "../../common/types/room";

const projectionFormatOptions = [
  { value: "2D", label: "2D" },
  { value: "3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
];

const AdminRooms = () => {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [editing, setEditing] = useState<IRoom | null>(null);
  const [open, setOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form] = Form.useForm<RoomPayload>();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["ADMIN", "ROOMS", page, keyword],
    queryFn: () =>
      adminService.rooms({ page, per_page: 10, keyword: keyword || undefined }),
  });
  const save = useMutation({
    mutationFn: (payload: RoomPayload) =>
      editing
        ? adminService.updateRoom(editing._id, payload)
        : adminService.createRoom(payload),
    onSuccess: async () => {
      setSaveError("");
      setOpen(false);
      setEditing(null);
      form.resetFields();
      await queryClient.invalidateQueries({ queryKey: ["ADMIN"] });
    },
    onError: (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;

      if (errors?.name?.length) {
        form.setFields([
          {
            name: "name",
            errors: ["Tên phòng đã tồn tại. Vui lòng chọn tên khác."],
          },
        ]);
      }

      setSaveError(
        errors?.name?.length
          ? "Tên phòng đã tồn tại. Vui lòng chọn tên khác."
          : (errors && Object.values(errors).flat()[0]) ||
              response?.message ||
              "Không thể lưu phòng chiếu. Vui lòng kiểm tra lại thông tin.",
      );
    },
  });
  const disable = useMutation({
    mutationFn: adminService.disableRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ADMIN"] }),
  });

  const openForm = (room?: IRoom) => {
    setSaveError("");
    form.resetFields();
    setEditing(room || null);
    form.setFieldsValue(
      room
        ? {
            name: room.name,
            description: room.description,
            supported_projection_formats: room.supportedProjectionFormats || [
              "2D",
            ],
            rows: room.rows,
            cols: room.cols,
            status: room.status,
          }
        : {
            name: "",
            description: "",
            supported_projection_formats: ["2D"],
            rows: 8,
            cols: 12,
            status: true,
          },
    );
    setOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Cinema Rooms
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Phòng chiếu</h1>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openForm()}
        >
          Thêm phòng
        </Button>
      </div>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Tìm phòng..."
        className="mt-6 max-w-md"
        onPressEnter={(event) => {
          setPage(1);
          setKeyword(event.currentTarget.value.trim());
        }}
        onClear={() => setKeyword("")}
      />
      <div className="mt-4 overflow-hidden border border-white/10 bg-[#141414]">
        <Table<IRoom>
          rowKey="_id"
          loading={query.isLoading}
          dataSource={query.data?.items}
          pagination={false}
          scroll={{ x: 850 }}
          columns={[
            { title: "Phòng", dataIndex: "name" },
            { title: "Hàng", dataIndex: "rows", width: 80 },
            { title: "Cột", dataIndex: "cols", width: 80 },
            { title: "Sức chứa", dataIndex: "capacity", width: 110 },
            {
              title: "Định dạng",
              dataIndex: "supportedProjectionFormats",
              width: 150,
              render: (value: string[] = []) => value.join(", "),
            },
            {
              title: "Số ghế",
              dataIndex: "seatCount",
              width: 90,
              render: (value) => value ?? 0,
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (value) => (value ? "Hoạt động" : "Đã tắt"),
            },
            {
              title: "",
              width: 155,
              render: (_, record) => (
                <div className="flex gap-2">
                  <Link to={`/admin/rooms/${record._id}/seats`}>
                    <Button icon={<AppstoreOutlined />} />
                  </Link>
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
                        title: "Tắt phòng chiếu này?",
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
        title={editing ? "Cập nhật phòng" : "Thêm phòng"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setSaveError("");
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={save.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => save.mutate(values)}
        >
          {saveError && (
            <Alert
              className="mb-4"
              type="error"
              showIcon
              closable
              message={saveError}
              onClose={() => setSaveError("")}
            />
          )}
          <Form.Item name="name" label="Tên phòng" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="supported_projection_formats"
            label="Định dạng phòng hỗ trợ"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" options={projectionFormatOptions} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="rows" label="Số hàng" rules={[{ required: true }]}>
              <InputNumber min={1} max={26} className="w-full" />
            </Form.Item>
            <Form.Item name="cols" label="Số cột" rules={[{ required: true }]}>
              <InputNumber min={1} max={50} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="status" label="Hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminRooms;
