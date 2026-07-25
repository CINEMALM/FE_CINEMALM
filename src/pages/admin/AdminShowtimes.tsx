import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Table,
  message,
} from "antd";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import { useState } from "react";
import {
  adminService,
  type ShowtimePayload,
} from "../../common/services/admin.service";
import type { IRoom } from "../../common/types/room";
import type { IShowtime } from "../../common/types/showtime";
import { formatCurrency } from "../../common/utils";

interface ShowtimeFormValues {
  movieId: number;
  roomId: number;
  startTime: dayjs.Dayjs;
  normalPrice: number;
  vipPrice: number;
  couplePrice: number;
}

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[] | string>;
}

const showtimeErrorLabels: Record<string, string> = {
  "Phong da co suat chieu trung khung gio.":
    "Phòng đã có suất chiếu trùng khung giờ.",
  "Khong the tao/cap nhat suat chieu trong qua khu.":
    "Không thể tạo hoặc cập nhật suất chiếu trong quá khứ.",
};

const formatShowtimeError = (error?: string) =>
  error ? showtimeErrorLabels[error] || error : undefined;

const statusLabels: Record<IShowtime["status"], string> = {
  scheduled: "Đã lên lịch",
  in_progress: "Đang chiếu",
  ended: "Đã kết thúc",
  sold_out: "Hết vé",
  cancelled: "Đã hủy",
};

const AdminShowtimes = () => {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IShowtime | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form] = Form.useForm<ShowtimeFormValues>();
  const queryClient = useQueryClient();

  const showtimes = useQuery({
    queryKey: ["ADMIN", "SHOWTIMES", page],
    queryFn: () => adminService.showtimes({ page, per_page: 10 }),
  });
  const movies = useQuery({
    queryKey: ["ADMIN", "SHOWTIME_FORM_MOVIES"],
    queryFn: () => adminService.movies({ per_page: 100, status: true }),
  });
  const rooms = useQuery({
    queryKey: ["ADMIN", "SHOWTIME_FORM_ROOMS"],
    queryFn: () => adminService.rooms({ per_page: 100, status: true }),
  });

  const save = useMutation({
    mutationFn: (payload: ShowtimePayload) =>
      editing
        ? adminService.updateShowtime(editing._id, payload)
        : adminService.createShowtime(payload),
    onSuccess: async () => {
      message.success(
        editing
          ? "Cập nhật suất chiếu thành công."
          : "Thêm suất chiếu thành công.",
      );
      setOpen(false);
      setEditing(null);
      setServerError(null);
      form.resetFields();
      await queryClient.invalidateQueries({
        queryKey: ["ADMIN", "SHOWTIMES"],
      });
    },
    onError: (error: AxiosError<ApiErrorBody>) => {
      const errors = error.response?.data?.errors;
      const firstError = errors
        ? Object.values(errors)
            .flatMap((item) => (Array.isArray(item) ? item : [item]))
            .find(Boolean)
        : undefined;
      const errorMessage = formatShowtimeError(
        firstError ||
          error.response?.data?.message ||
          "Không thể lưu suất chiếu.",
      );

      setServerError(errorMessage || "Không thể lưu suất chiếu.");

      const fieldErrors: {
        name: keyof ShowtimeFormValues;
        errors: string[];
      }[] = [];
      const backendFieldMap: Partial<Record<string, keyof ShowtimeFormValues>> =
        {
          movie_id: "movieId",
          room_id: "roomId",
          start_time: "startTime",
        };

      Object.entries(errors || {}).forEach(([field, fieldMessages]) => {
        const formField = backendFieldMap[field];
        if (!formField) return;

        const messages = Array.isArray(fieldMessages)
          ? fieldMessages
          : [fieldMessages];
        fieldErrors.push({
          name: formField,
          errors: messages.map((item) => formatShowtimeError(item) || item),
        });
      });

      if (fieldErrors.length) {
        form.setFields(fieldErrors);
      }
      message.error(errorMessage);
    },
  });
  const cancel = useMutation({
    mutationFn: (showtime: IShowtime) =>
      adminService.cancelShowtime(showtime._id, "Admin hủy suất chiếu."),
    onSuccess: async () => {
      message.success("Đã hủy suất chiếu.");
      await queryClient.invalidateQueries({ queryKey: ["ADMIN", "SHOWTIMES"] });
    },
    onError: () => message.error("Không thể hủy suất chiếu này."),
  });

  const availableRooms =
    rooms.data?.items.filter(
      (room) => room.status && (room.seatCount || 0) > 0,
    ) || [];

  const openForm = (showtime?: IShowtime) => {
    setEditing(showtime || null);
    setServerError(null);
    form.setFields([
      { name: "movieId", errors: [] },
      { name: "roomId", errors: [] },
      { name: "startTime", errors: [] },
    ]);
    const prices = Object.fromEntries(
      (showtime?.price || []).map((price) => [price.seatType, price.value]),
    );
    form.setFieldsValue({
      movieId: showtime ? Number(showtime.movieId._id) : undefined,
      roomId: showtime ? Number((showtime.roomId as IRoom)._id) : undefined,
      startTime: showtime
        ? dayjs(showtime.startTime)
        : dayjs().add(1, "hour").startOf("hour"),
      normalPrice: Number(prices.NORMAL || 70000),
      vipPrice: Number(prices.VIP || 90000),
      couplePrice: Number(prices.COUPLE || 180000),
    });
    setOpen(true);
  };

  const submit = (values: ShowtimeFormValues) => {
    setServerError(null);
    save.mutate({
      movie_id: values.movieId,
      room_id: values.roomId,
      start_time: values.startTime.format("YYYY-MM-DD HH:mm:ss"),
      prices: {
        NORMAL: values.normalPrice,
        VIP: values.vipPrice,
        COUPLE: values.couplePrice,
      },
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Showtimes
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Quản lý suất chiếu
          </h1>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openForm()}
        >
          Thêm suất chiếu
        </Button>
      </div>

      <div className="mt-6 overflow-hidden border border-white/10 bg-[#141414]">
        <Table<IShowtime>
          rowKey="_id"
          loading={showtimes.isLoading}
          dataSource={showtimes.data?.items}
          pagination={false}
          scroll={{ x: 950 }}
          columns={[
            {
              title: "Phim",
              dataIndex: "movieId",
              width: 260,
              render: (movie: IShowtime["movieId"]) => movie.name,
            },
            {
              title: "Phòng chiếu",
              dataIndex: "roomId",
              width: 160,
              render: (room: IRoom) => room.name,
            },
            {
              title: "Giờ chiếu",
              dataIndex: "startTime",
              width: 180,
              render: (value: string) =>
                dayjs(value).format("HH:mm DD/MM/YYYY"),
            },
            {
              title: "Kết thúc",
              dataIndex: "endTime",
              width: 180,
              render: (value: string) =>
                dayjs(value).format("HH:mm DD/MM/YYYY"),
            },
            {
              title: "Giá vé",
              dataIndex: "price",
              width: 240,
              render: (prices: IShowtime["price"]) =>
                prices
                  .map(
                    (price) =>
                      `${price.seatType}: ${formatCurrency(price.value)}`,
                  )
                  .join(" · "),
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              width: 130,
              render: (status: IShowtime["status"]) => statusLabels[status],
            },
            {
              title: "",
              width: 110,
              fixed: "right",
              render: (_, record) => (
                <div className="flex gap-2">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => openForm(record)}
                  />
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={record.status === "cancelled"}
                    onClick={() =>
                      Modal.confirm({
                        title: "Hủy suất chiếu này?",
                        onOk: () => cancel.mutateAsync(record),
                      })
                    }
                  />
                </div>
              ),
            },
          ]}
          locale={{ emptyText: "Chưa có suất chiếu" }}
        />
      </div>
      <Pagination
        className="mt-5"
        align="end"
        current={page}
        pageSize={showtimes.data?.pageSize || 10}
        total={showtimes.data?.total || 0}
        onChange={setPage}
      />

      <Modal
        title={editing ? "Cập nhật suất chiếu" : "Thêm suất chiếu"}
        open={open}
        width={720}
        onCancel={() => {
          setOpen(false);
          setServerError(null);
        }}
        onOk={() => form.submit()}
        confirmLoading={save.isPending}
        okText={editing ? "Lưu thay đổi" : "Thêm suất chiếu"}
        cancelText="Hủy"
      >
        {serverError && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message="Không thể lưu suất chiếu"
            description={serverError}
          />
        )}
        {!availableRooms.length && !rooms.isLoading && (
          <Alert
            className="mb-4"
            type="warning"
            showIcon
            message="Chưa có phòng hoạt động đã được tạo sơ đồ ghế."
          />
        )}
        <Form form={form} layout="vertical" onFinish={submit}>
          <div className="grid gap-x-4 md:grid-cols-2">
            <Form.Item
              name="movieId"
              label="Phim"
              rules={[{ required: true, message: "Vui lòng chọn phim." }]}
            >
              <Select
                disabled={Boolean(editing)}
                showSearch
                loading={movies.isLoading}
                optionFilterProp="label"
                placeholder="Chọn phim"
                options={movies.data?.items
                  .filter((movie) => movie.status)
                  .map((movie) => ({
                    value: Number(movie._id),
                    label: movie.name,
                  }))}
              />
            </Form.Item>
            <Form.Item
              name="roomId"
              label="Phòng chiếu"
              rules={[{ required: true, message: "Vui lòng chọn phòng." }]}
            >
              <Select
                disabled={Boolean(editing)}
                showSearch
                loading={rooms.isLoading}
                optionFilterProp="label"
                placeholder="Chọn phòng chiếu"
                options={availableRooms.map((room) => ({
                  value: Number(room._id),
                  label: `${room.name} · ${room.seatCount} ghế`,
                }))}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="startTime"
            label="Ngày và giờ chiếu"
            rules={[
              { required: true, message: "Vui lòng chọn giờ chiếu." },
              {
                validator: (_, value: dayjs.Dayjs) =>
                  !value || value.isAfter(dayjs())
                    ? Promise.resolve()
                    : Promise.reject(new Error("Giờ chiếu phải ở tương lai.")),
              },
            ]}
          >
            <DatePicker
              showTime={{ format: "HH:mm", minuteStep: 5 }}
              format="DD/MM/YYYY HH:mm"
              className="w-full"
              disabledDate={(date) => date.endOf("day").isBefore(dayjs())}
              placeholder="Chọn ngày và giờ chiếu"
            />
          </Form.Item>

          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
            Giá vé theo loại ghế
          </p>
          <div className="grid gap-x-4 sm:grid-cols-3">
            {[
              ["normalPrice", "Ghế thường"],
              ["vipPrice", "Ghế VIP"],
              ["couplePrice", "Ghế đôi"],
            ].map(([name, label]) => (
              <Form.Item
                key={name}
                name={name}
                label={label}
                rules={[{ required: true, message: "Vui lòng nhập giá vé." }]}
              >
                <InputNumber
                  min={1000}
                  max={10000000}
                  step={5000}
                  className="w-full"
                  addonAfter="₫"
                />
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminShowtimes;
